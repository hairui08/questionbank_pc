<template>
  <div class="wrong-questions-page">
    <!-- 顶部导航条 -->
    <header class="top-navbar">
      <div class="navbar-content">
        <div class="brand-section">
          <div class="brand-logo">领</div>
          <span class="brand-name">领匠教育</span>
        </div>

        <nav class="nav-menu">
          <a href="#" class="nav-link">课程</a>
          <a href="#" class="nav-link">选课中心</a>
          <a href="#" class="nav-link active">学习中心</a>
        </nav>

        <div class="user-section">
          <div class="user-avatar">
            <span>张</span>
          </div>
          <span class="user-name">张同学</span>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <TabNavigation :tabs="tabs" :default-tab="'prototype'">
        <!-- 原型展示标签页 -->
        <template #prototype>
          <div class="tab-content">
            <!-- 页面标题 -->
            <div class="page-header">
              <button class="back-btn" @click="backToLibrary">
                <span class="icon">←</span>
                返回我的题库
              </button>
              <div class="page-title-wrapper">
                <h1 class="page-title">我的错题</h1>
                <p class="page-subtitle">整理错题，巩固知识，提升成绩</p>
              </div>
            </div>

            <!-- 项目和科目筛选 -->
            <section class="filter-section">
              <label class="filter-label">
                项目：
                <select
                  v-model="activeProjectId"
                  class="project-select"
                  @change="handleProjectChange"
                >
                  <option
                    v-for="project in projects"
                    :key="project.id"
                    :value="project.id"
                  >
                    {{ project.name }}
                  </option>
                </select>
              </label>

              <div class="subject-tabs" v-if="subjectOptions.length">
                <button
                  v-for="subject in subjectOptions"
                  :key="subject.id"
                  class="subject-tab"
                  :class="{ 'is-active': subject.id === activeSubjectId }"
                  @click="selectSubject(subject.id)"
                >
                  {{ subject.name }}
                </button>
              </div>
            </section>

            <!-- 章节分类 / 题型分类 -->
            <section class="filter-chips">
              <button
                v-for="filter in filters"
                :key="filter.id"
                type="button"
                class="chip"
                :class="{ active: filter.id === activeFilterId }"
                @click="selectFilter(filter.id)"
              >
                {{ filter.label }}
              </button>
            </section>

            <!-- 列表工具栏 -->
            <section
              v-if="(isChapterFilter && filteredQuestions.length > 0) || (!isChapterFilter && totalTypeCount > 0)"
              class="list-toolbar"
            >
              <button class="practice-all-btn" @click="handlePracticeAll">
                <span class="icon">📝</span>
                全部错题练习
                <span class="count">({{ isChapterFilter ? filteredQuestions.length : totalTypeCount }}题)</span>
              </button>
              <span class="toolbar-hint">将当前筛选的所有错题作为一套试卷进行练习</span>

              <!-- 设置按钮 -->
              <button class="settings-btn" @click="showSettingsModal = true" title="练习设置">
                <span class="icon">⚙️</span>
              </button>
            </section>

            <!-- 章节分类：卡片树形展示 -->
            <template v-if="isChapterFilter">
              <section
                v-for="chapter in chapterSummaries"
                :key="chapter.id"
                class="chapter-card"
              >
                <div class="chapter-main">
                  <button
                    type="button"
                    class="chapter-toggle"
                    :aria-label="isChapterExpanded(chapter.id) ? '收起章节' : '展开章节'"
                    @click="toggleChapter(chapter.id)"
                  >
                    <span class="chapter-toggle-icon" :class="{ expanded: isChapterExpanded(chapter.id) }" />
                  </button>
                  <div class="chapter-title">
                    <span class="chapter-order">{{ chapter.order }}</span>
                    <span class="chapter-name">{{ chapter.title }}</span>
                  </div>
                </div>

                <transition name="chapter-slide">
                  <div v-if="isChapterExpanded(chapter.id)" class="chapter-sections">
                    <div
                      v-for="sec in chapter.sections"
                      :key="sec.id"
                      class="section-item"
                    >
                      <div class="section-info" @click="selectChapterNode({ title: sec.title })">
                        <span class="section-dot" />
                        <span class="section-title">{{ sec.title }}</span>
                      </div>
                      <div class="section-meta">
                        收藏：<span class="section-count">{{ sec.count }}</span>
                      </div>
                      <div class="section-actions">
                        <button class="btn btn-outline" @click="selectChapterNode({ title: sec.title })">查看</button>
                        <button class="btn btn-primary" @click="redoByChapter(sec.title)">重新练习</button>
                      </div>
                    </div>
                  </div>
                </transition>

                <div class="card-footer">
                  <div class="footer-meta">
                    收藏：<span class="footer-count">{{ chapter.total }}</span>
                  </div>
                  <div class="footer-actions">
                    <button class="btn btn-outline" @click="redoByChapter(chapter.title)">重新练习</button>
                    <button class="btn btn-primary" @click="analysisByChapter(chapter.title)">查看解析</button>
                  </div>
                </div>
              </section>
            </template>

            <!-- 题型分类：列表样式 -->
            <template v-else>
              <section class="type-list">
                <article
                  v-for="item in typeSummary"
                  :key="item.id"
                  class="type-item"
                >
                  <div class="type-info">
                    <div class="type-name">{{ item.label }}</div>
                    <div class="type-meta">
                      收藏：
                      <span class="type-count">{{ item.count }}</span>
                    </div>
                  </div>
                  <div class="type-actions">
                    <button class="btn btn-outline" @click="redoByType(item.id)">错题重做</button>
                    <button class="btn btn-primary" @click="analysisByType(item.id)">查看解析</button>
                  </div>
                </article>
              </section>
            </template>

            <!-- 练习设置弹窗 -->
            <BaseModal
              v-model:visible="showSettingsModal"
              title="错题练习设置"
              width="480px"
              @confirm="applySettings"
            >
              <div class="settings-content">
                <!-- 题目数量设置 -->
                <div class="setting-group">
                  <label class="setting-label">练习题目数量</label>
                  <div class="radio-group">
                    <label class="radio-item">
                      <input type="radio" v-model="practiceSettings.count" value="10" name="count" />
                      <span>10题</span>
                    </label>
                    <label class="radio-item">
                      <input type="radio" v-model="practiceSettings.count" value="20" name="count" />
                      <span>20题</span>
                    </label>
                    <label class="radio-item">
                      <input type="radio" v-model="practiceSettings.count" value="50" name="count" />
                      <span>50题</span>
                    </label>
                    <label class="radio-item">
                      <input type="radio" v-model="practiceSettings.count" value="all" name="count" />
                      <span>全部 ({{ filteredQuestions.length }}题)</span>
                    </label>
                  </div>
                </div>

                <!-- 移出规则设置 -->
                <div class="setting-group">
                  <label class="setting-label">答对后自动移出错题本</label>
                  <div class="switch-group">
                    <label class="switch-item">
                      <input type="checkbox" v-model="practiceSettings.autoRemove" />
                      <span class="switch-box"></span>
                      <span class="switch-text">启用自动移出</span>
                    </label>
                  </div>
                  <p class="setting-hint" v-if="practiceSettings.autoRemove">
                    开启后,练习中答对的题目将自动从错题本移除
                  </p>
                </div>

                <!-- 答对次数设置(仅在启用自动移出时显示) -->
                <div class="setting-group" v-if="practiceSettings.autoRemove">
                  <label class="setting-label">答对次数要求</label>
                  <div class="radio-group">
                    <label class="radio-item">
                      <input type="radio" v-model="practiceSettings.removeAfter" value="1" name="removeAfter" />
                      <span>答对 1 次即移出</span>
                    </label>
                    <label class="radio-item">
                      <input type="radio" v-model="practiceSettings.removeAfter" value="2" name="removeAfter" />
                      <span>答对 2 次后移出</span>
                    </label>
                    <label class="radio-item">
                      <input type="radio" v-model="practiceSettings.removeAfter" value="3" name="removeAfter" />
                      <span>答对 3 次后移出</span>
                    </label>
                  </div>
                </div>
              </div>
            </BaseModal>
          </div>
        </template>

        <!-- 需求文档标签页 -->
        <template #requirements>
          <div class="requirements-container">
            <h2 class="requirements-title">功能需求</h2>

            <!-- 1. 功能概述 -->
            <section class="req-section">
              <h3 class="req-section-title">1. 功能概述</h3>
              <div class="table-card">
                <div class="table-header header-primary">项目概述</div>
                <table class="req-table">
                  <tbody>
                    <tr>
                      <td class="col-key">功能名称</td>
                      <td class="col-val">我的错题</td>
                    </tr>
                    <tr>
                      <td class="col-key">页面路径</td>
                      <td class="col-val">/student/wrong-questions</td>
                    </tr>
                    <tr>
                      <td class="col-key">功能描述</td>
                      <td class="col-val">学员查看自己的错题记录，支持按项目、科目、学习阶段筛选，可重新练习错题</td>
                    </tr>
                    <tr>
                      <td class="col-key">用户角色</td>
                      <td class="col-val">学员</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- 2. 核心功能规格 -->
            <section class="req-section">
              <h3 class="req-section-title">2. 核心功能规格</h3>
              <div class="table-card">
                <div class="table-header header-primary">功能规格</div>
                <table class="req-table">
                  <thead>
                    <tr>
                      <th>功能点</th>
                      <th>详细说明</th>
                      <th>优先级</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>筛选器</td>
                      <td>项目下拉选择器、科目横向标签页、学习阶段按钮组（全部、章节练习、历年真题、考前冲刺、入学测试）</td>
                      <td>P0</td>
                    </tr>
                    <tr>
                      <td>错题卡片</td>
                      <td>题目序号（第N题）、题干（≤100字）、答错时间（YYYY-MM-DD HH:mm）、来源（试卷或章节）</td>
                      <td>P0</td>
                    </tr>
                    <tr>
                      <td>全部错题练习</td>
                      <td>列表上方工具栏，显示题目数量；将筛选后的错题作为试卷练习</td>
                      <td>P0</td>
                    </tr>
                    <tr>
                      <td>单题重新练习</td>
                      <td>从该题开始答题，可通过“下一题”继续做后续错题，顺序练习模式</td>
                      <td>P0</td>
                    </tr>
                    <tr>
                      <td>移除错题</td>
                      <td>点击“移除错题”后从错题本中移除该题目</td>
                      <td>P0</td>
                    </tr>
                    <tr>
                      <td>分页</td>
                      <td>每页10条，支持10/20/50条选项</td>
                      <td>P0</td>
                    </tr>
                    <tr>
                      <td>空状态</td>
                      <td>无错题时显示提示“暂无错题，继续加油！”</td>
                      <td>P1</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- 3. 验收标准 -->
            <section class="req-section">
              <h3 class="req-section-title">3. 验收标准</h3>
              <div class="table-card">
                <div class="table-header header-danger">验收标准</div>
                <table class="req-table checklist-table">
                  <thead>
                    <tr>
                      <th>优先级</th>
                      <th>验收标准</th>
                      <th>状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>P0</td>
                      <td>页面布局：顶部导航栏 + 页面标题 + 筛选器 + 错题列表 + 分页</td>
                      <td><span class="status-ok">✔</span></td>
                    </tr>
                    <tr>
                      <td>P0</td>
                      <td>筛选功能：项目、科目、学习阶段三级联动正常工作</td>
                      <td><span class="status-ok">✔</span></td>
                    </tr>
                    <tr>
                      <td>P0</td>
                      <td>卡片展示：题干（≤100字）、时间、来源信息</td>
                      <td><span class="status-ok">✔</span></td>
                    </tr>
                    <tr>
                      <td>P0</td>
                      <td>工具栏：显示“全部错题练习”按钮与数量</td>
                      <td><span class="status-ok">✔</span></td>
                    </tr>
                    <tr>
                      <td>P0</td>
                      <td>单题重做：从该题开始顺序练习后续错题</td>
                      <td><span class="status-ok">✔</span></td>
                    </tr>
                    <tr>
                      <td>P0</td>
                      <td>分页：筛选变更重置第1页，交互正常</td>
                      <td><span class="status-ok">✔</span></td>
                    </tr>
                    <tr>
                      <td>P1</td>
                      <td>空状态：无错题时显示友好提示</td>
                      <td><span class="status-ok">✔</span></td>
                    </tr>
                    <tr>
                      <td>P1</td>
                      <td>响应式：移动端（≤768px）卡片垂直排列</td>
                      <td><span class="status-ok">✔</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </template>

        <!-- 样式指南标签页 -->
        <template #style-guide>
          <div class="style-guide-section">
            <h2 class="sg-title">样式指南</h2>

            <!-- 1. 顶部导航条 -->
            <section class="sg-section">
              <h3 class="sg-section-title">1. 顶部导航条</h3>
              <div class="sg-table-card">
                <div class="sg-table-header header-gradient">属性与规范</div>
                <table class="sg-table">
                  <thead>
                    <tr>
                      <th>属性</th>
                      <th>规范</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>高度</td>
                      <td>60px</td>
                    </tr>
                    <tr>
                      <td>背景色</td>
                      <td>白色 #ffffff</td>
                    </tr>
                    <tr>
                      <td>阴影</td>
                      <td>0 2px 8px rgba(0,0,0,0.1)</td>
                    </tr>
                    <tr>
                      <td>品牌Logo</td>
                      <td>红色渐变背景，40x40px 圆形</td>
                    </tr>
                    <tr>
                      <td>激活链接</td>
                      <td>红色文字 + 下划线</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- 2. 记录卡片（横向布局） -->
            <section class="sg-section">
              <h3 class="sg-section-title">2. 记录卡片（横向布局）</h3>
              <div class="sg-table-card">
                <div class="sg-table-header header-gradient">属性与规范</div>
                <table class="sg-table">
                  <thead>
                    <tr>
                      <th>属性</th>
                      <th>规范</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>布局</td>
                      <td>flex 横向，左侧信息区 + 右侧按钮区</td>
                    </tr>
                    <tr>
                      <td>圆角</td>
                      <td>14px</td>
                    </tr>
                    <tr>
                      <td>边框</td>
                      <td>1px solid rgba(0,0,0,0.08)</td>
                    </tr>
                    <tr>
                      <td>hover 效果</td>
                      <td>边框变红 + 背景 #fafafa + 阴影增强</td>
                    </tr>
                    <tr>
                      <td>主按钮</td>
                      <td>红色渐变胶囊（border-radius: 50px）</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- 3. 分页组件 -->
            <section class="sg-section">
              <h3 class="sg-section-title">3. 分页组件</h3>
              <div class="sg-table-card">
                <div class="sg-table-header header-gradient">属性与规范</div>
                <table class="sg-table">
                  <thead>
                    <tr>
                      <th>属性</th>
                      <th>规范</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>位置</td>
                      <td>列表底部，居中对齐</td>
                    </tr>
                    <tr>
                      <td>按钮间隔</td>
                      <td>8px</td>
                    </tr>
                    <tr>
                      <td>激活项</td>
                      <td>红色渐变边框</td>
                    </tr>
                    <tr>
                      <td>hover 效果</td>
                      <td>红色边框</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </template>
      </TabNavigation>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import TabNavigation from '@/components/Tab/TabNavigation.vue'
import Pagination from '@/components/Pagination/Pagination.vue'
import BaseModal from '@/components/Modal/BaseModal.vue'
import { useProjectStore } from '@/stores/project'
import { useExamSessionStore } from '@/stores/examSession'
import { useToast } from '@/composables/useToast'

// Router
const router = useRouter()

// Stores
const projectStore = useProjectStore()
const examSessionStore = useExamSessionStore()
const { showToast } = useToast()

// Tab 配置
const tabs = [
  { key: 'prototype', label: '原型展示', icon: '🎨' },
  { key: 'requirements', label: '需求文档', icon: '📋' },
  { key: 'style-guide', label: '样式指南', icon: '🎯' }
]

// 顶部切换（章节分类 / 题型分类）
interface FilterChip { id: 'chapter' | 'type'; label: string }
const filters: FilterChip[] = [
  { id: 'chapter', label: '章节分类' },
  { id: 'type', label: '题型分类' },
]
const activeFilterId = ref<FilterChip['id']>('type')
const isChapterFilter = computed(() => activeFilterId.value === 'chapter')
const isTypeFilter = computed(() => activeFilterId.value === 'type')
function selectFilter(id: FilterChip['id']) {
  activeFilterId.value = id
  activeTypeId.value = ''
  activeChapterTitle.value = ''
  expandedChapterIds.value = new Set<string>()
  currentPage.value = 1
}

// 筛选状态
const activeProjectId = ref(projectStore.projects[0]?.id || '')
const activeSubjectId = ref('')

// 分页状态
const currentPage = ref(1)
const pageSize = ref(10)

// 设置弹窗状态
const showSettingsModal = ref(false)

// 练习设置
interface PracticeSettings {
  count: '10' | '20' | '50' | 'all'
  autoRemove: boolean
  removeAfter: '1' | '2' | '3'
}

const practiceSettings = ref<PracticeSettings>({
  count: 'all',
  autoRemove: false,
  removeAfter: '1'
})

// 项目和科目选项
const projects = computed(() => projectStore.projects)

const subjectOptions = computed(() => {
  if (!activeProjectId.value) return []
  return projectStore.subjects.filter(s => s.projectId === activeProjectId.value)
})

// 初始化科目
watch(
  () => projects.value,
  () => {
    if (subjectOptions.value.length > 0 && !activeSubjectId.value) {
      // 修复：subjectOptions[0] 可能为未定义
      activeSubjectId.value = subjectOptions.value[0]?.id ?? ''
    }
  },
  { immediate: true }
)

// Mock 错题数据
const allQuestions = ref([
  {
    id: 'wq-001',
    questionId: 'q-001',
    stem: '在JavaScript中，以下哪个方法用于将数组中的所有元素连接成一个字符串？',
    type: 'single' as const,
    wrongTime: Date.now() - 1000 * 60 * 60 * 2, // 2小时前
    sourceType: 'exam' as const,
    sourceName: '2024年JavaScript基础测试',
    projectId: 'p1',
    subjectId: 's1',
    examType: 'chapter' as const
  },
  {
    id: 'wq-002',
    questionId: 'q-002',
    stem: 'CSS中，position: absolute; 的元素是相对于哪个元素进行定位的？请详细说明定位规则和常见应用场景。',
    type: 'essay' as const,
    wrongTime: Date.now() - 1000 * 60 * 60 * 5, // 5小时前
    sourceType: 'chapter' as const,
    sourceName: '第3章 CSS定位与布局',
    projectId: 'p1',
    subjectId: 's1',
    examType: 'chapter' as const
  },
  {
    id: 'wq-003',
    questionId: 'q-003',
    stem: 'Vue 3中，以下哪些是Composition API的核心函数？（多选）',
    type: 'multiple' as const,
    wrongTime: Date.now() - 1000 * 60 * 60 * 24, // 1天前
    sourceType: 'exam' as const,
    sourceName: '2023年Vue前端开发真题',
    projectId: 'p1',
    subjectId: 's1',
    examType: 'realExam' as const
  },
  {
    id: 'wq-004',
    questionId: 'q-004',
    stem: 'TypeScript中的interface和type关键字有什么区别？在实际开发中应该如何选择使用？',
    type: 'essay' as const,
    wrongTime: Date.now() - 1000 * 60 * 60 * 36, // 1.5天前
    sourceType: 'exam' as const,
    sourceName: 'TypeScript进阶考试',
    projectId: 'p1',
    subjectId: 's1',
    examType: 'sprint' as const
  },
  {
    id: 'wq-005',
    questionId: 'q-005',
    stem: 'HTTP协议中，以下哪个状态码表示"资源未找到"？',
    type: 'single' as const,
    wrongTime: Date.now() - 1000 * 60 * 60 * 48, // 2天前
    sourceType: 'chapter' as const,
    sourceName: '第5章 HTTP协议基础',
    projectId: 'p1',
    subjectId: 's2',
    examType: 'chapter' as const
  },
  {
    id: 'wq-006',
    questionId: 'q-006',
    stem: 'React中，useState Hook的返回值是什么？',
    type: 'single' as const,
    wrongTime: Date.now() - 1000 * 60 * 60 * 72, // 3天前
    sourceType: 'exam' as const,
    sourceName: 'React入学测试',
    projectId: 'p1',
    subjectId: 's2',
    examType: 'entrance' as const
  },
  {
    id: 'wq-007',
    questionId: 'q-007',
    stem: '以下关于Promise的说法，哪些是正确的？（多选）Promise是异步编程的一种解决方案；Promise有三种状态：pending、fulfilled、rejected',
    type: 'multiple' as const,
    wrongTime: Date.now() - 1000 * 60 * 60 * 96, // 4天前
    sourceType: 'exam' as const,
    sourceName: '2024年前端综合测试',
    projectId: 'p1',
    subjectId: 's2',
    examType: 'realExam' as const
  },
  {
    id: 'wq-008',
    questionId: 'q-008',
    stem: 'Git中的rebase和merge命令有什么区别？在团队协作中应该如何选择使用？请结合实际场景说明。',
    type: 'essay' as const,
    wrongTime: Date.now() - 1000 * 60 * 60 * 120, // 5天前
    sourceType: 'chapter' as const,
    sourceName: '第8章 Git版本控制',
    projectId: 'p2',
    subjectId: 's3',
    examType: 'chapter' as const
  }
])

// 题型枚举与汇总
type QuestionTypeId = 'single' | 'multiple' | 'judge' | 'fill' | 'essay'
const questionTypes = [
  { id: 'single' as QuestionTypeId, label: '单选题' },
  { id: 'multiple' as QuestionTypeId, label: '多选题' },
  { id: 'judge' as QuestionTypeId, label: '判断题' },
  { id: 'fill' as QuestionTypeId, label: '填空题' },
  { id: 'essay' as QuestionTypeId, label: '简答题' },
]
const activeTypeId = ref<QuestionTypeId | ''>('')

const typeSummary = computed(() => {
  const base = allQuestions.value.filter(q => {
    if (activeProjectId.value && q.projectId !== activeProjectId.value) return false
    if (activeSubjectId.value && q.subjectId !== activeSubjectId.value) return false
    return true
  })
  const counts: Record<QuestionTypeId, number> = { single: 0, multiple: 0, judge: 0, fill: 0, essay: 0 }
  base.forEach(q => {
    const t = q.type as QuestionTypeId
    if (t in counts) counts[t] += 1
  })
  return questionTypes.map(t => ({ ...t, count: counts[t.id] }))
})

function redoByType(typeId: QuestionTypeId) {
  activeFilterId.value = 'type'
  activeTypeId.value = typeId
  currentPage.value = 1
  router.push('/student/exam/senior-acc-practice-real-2024')
}

function analysisByType(typeId: QuestionTypeId) {
  // 设置筛选状态，显示该题型的错题列表
  activeFilterId.value = 'type'
  activeTypeId.value = typeId
  currentPage.value = 1
  router.push('/student/exam/senior-acc-practice-real-2024')
}

// 章节树（章、节）
interface ChapterSection { id: string; title: string; count?: number }
interface ChapterNode { id: string; order: string; title: string; sections?: ChapterSection[] }
const chapters = ref<ChapterNode[]>([
  { id: 'c-1', order: '第一章', title: '职业理念', sections: [
    { id: 'c-1-1', title: '第一节 社会工作的内涵' },
    { id: 'c-1-2', title: '第二节 社会工作的基本原则' },
    { id: 'c-1-3', title: '第三节 社会工作的主要领域' },
  ]},
  { id: 'c-2', order: '第二章', title: '教育心理', sections: [
    { id: 'c-2-1', title: '第一节 学习动机' },
    { id: 'c-2-2', title: '第二节 记忆与认知' },
  ]},
  { id: 'c-3', order: '第三章', title: 'CSS定位与布局', sections: [
    { id: 'c-3-1', title: '第一节 CSS定位基础' },
    { id: 'c-3-2', title: '第二节 布局与应用' },
  ]},
])

const expandedChapterIds = ref(new Set<string>())
const isChapterExpanded = (id: string) => expandedChapterIds.value.has(id)
function toggleChapter(id: string) {
  const next = new Set(expandedChapterIds.value)
  next.has(id) ? next.delete(id) : next.add(id)
  expandedChapterIds.value = next
}
const activeChapterTitle = ref('')
function selectChapterNode(node: { title?: string }) {
  if (!node?.title) return
  activeChapterTitle.value = node.title
  currentPage.value = 1
}

function redoByChapter(title: string) {
  activeFilterId.value = 'chapter'
  activeChapterTitle.value = title
  currentPage.value = 1
  router.push('/student/exam/senior-acc-practice-real-2024')
}

function analysisByChapter(title: string) {
  // 设置筛选状态，显示该章节的错题列表
  activeFilterId.value = 'chapter'
  activeChapterTitle.value = title
  currentPage.value = 1
  router.push('/student/exam/senior-acc-practice-real-2024')
}

// 章节汇总（统计当前项目/科目下各节的收藏/错题数量）
const chapterSummaries = computed(() => {
  const base = allQuestions.value.filter(q => {
    if (activeProjectId.value && q.projectId !== activeProjectId.value) return false
    if (activeSubjectId.value && q.subjectId !== activeSubjectId.value) return false
    return q.sourceType === 'chapter'
  })
  return chapters.value.map(ch => {
    const sections = (ch.sections ?? []).map(sec => {
      const count = base.filter(q => String(q.sourceName).includes(sec.title)).length
      return { ...sec, count }
    })
    const total = sections.reduce((sum, s) => sum + (s.count ?? 0), 0)
    return { ...ch, sections, total }
  })
})

// 筛选后的错题（加入题型/章节过滤）
const filteredQuestions = computed(() => {
  let result = allQuestions.value

  if (activeProjectId.value) {
    result = result.filter(q => q.projectId === activeProjectId.value)
  }

  if (activeSubjectId.value) {
    result = result.filter(q => q.subjectId === activeSubjectId.value)
  }

  if (isTypeFilter.value && activeTypeId.value) {
    result = result.filter(q => q.type === activeTypeId.value)
  }

  if (isChapterFilter.value) {
    result = result.filter(q => q.sourceType === 'chapter')
    if (activeChapterTitle.value) {
      result = result.filter(q => String(q.sourceName).includes(activeChapterTitle.value))
    }
  }

  return result
})

// 分页后的错题
const paginatedQuestions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredQuestions.value.slice(start, end)
})

// 题型分类总数（用于工具栏显示）
const totalTypeCount = computed(() => {
  try {
    return (Array.isArray(typeSummary.value) ? typeSummary.value : []).reduce((sum, item: any) => {
      const c = typeof item?.count === 'number' ? item.count : 0
      return sum + c
    }, 0)
  } catch {
    return 0
  }
})

// 总错题数
const totalQuestions = computed(() => filteredQuestions.value.length)

// 项目变更处理
function handleProjectChange() {
  activeSubjectId.value = subjectOptions.value[0]?.id || ''
  activeTypeId.value = ''
  activeChapterTitle.value = ''
  expandedChapterIds.value = new Set<string>()
  currentPage.value = 1
}

// 科目选择
function selectSubject(subjectId: string) {
  activeSubjectId.value = subjectId
  activeTypeId.value = ''
  activeChapterTitle.value = ''
  expandedChapterIds.value = new Set<string>()
  currentPage.value = 1
}

// 分页处理
function handlePageChange(page: number) {
  currentPage.value = page
}

function handlePageSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
}

// 设置管理函数
function loadPracticeSettings() {
  const saved = localStorage.getItem('wrongQuestionPracticeSettings')
  if (saved) {
    try {
      practiceSettings.value = JSON.parse(saved)
    } catch (e) {
      console.error('加载练习设置失败:', e)
    }
  }
}

function applySettings() {
  localStorage.setItem('wrongQuestionPracticeSettings', JSON.stringify(practiceSettings.value))
  showSettingsModal.value = false
  showToast('设置已保存')
}

function handleWrongQuestionRemoved(event: Event) {
  const customEvent = event as CustomEvent
  const { questionId } = customEvent.detail

  const index = allQuestions.value.findIndex(q => q.questionId === questionId)
  if (index > -1) {
    allQuestions.value.splice(index, 1)
    console.log(`错题 ${questionId} 已移出错题本`)

    if (paginatedQuestions.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
    }
  }
}

// 工具函数
function getTruncatedStem(stem: string): string {
  if (stem.length <= 100) return stem
  return stem.substring(0, 100) + '...'
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

function getSourceIcon(sourceType: string): string {
  return sourceType === 'exam' ? '📝' : '📖'
}

function getQuestionNumber(index: number): string {
  const globalIndex = (currentPage.value - 1) * pageSize.value + index + 1
  return `第${globalIndex}题`
}

// 全部错题练习
function handlePracticeAll() {
  if (filteredQuestions.value.length === 0) {
    showToast('当前筛选条件下没有错题', { type: 'warning' })
    return
  }

  // 获取所有错题的 questionId
  let questionIds = filteredQuestions.value.map(q => q.questionId)

  // 应用题目数量限制
  if (practiceSettings.value.count !== 'all') {
    const count = parseInt(practiceSettings.value.count)
    if (questionIds.length > count) {
      questionIds = questionIds.slice(0, count)
    }
  }

  // 获取科目名称
  const subjectName = subjectOptions.value.find(s => s.id === activeSubjectId.value)?.name || '未知科目'

  // 创建错题练习会话
  const success = examSessionStore.startWrongQuestionsPractice(
    questionIds,
    activeSubjectId.value,
    subjectName,
    `${subjectName} - 错题专项练习 (${questionIds.length}题)`
  )

  if (success) {
    // 保存练习设置到 sessionStorage(供答题页面使用)
    if (practiceSettings.value.autoRemove) {
      sessionStorage.setItem('wrongQuestionAutoRemove', JSON.stringify({
        enabled: true,
        removeAfter: parseInt(practiceSettings.value.removeAfter)
      }))
    } else {
      sessionStorage.removeItem('wrongQuestionAutoRemove')
    }

    router.push({ name: 'StudentExam', params: { id: 'wrong-practice' } })
  } else {
    showToast('错题数据加载失败，请重试', { type: 'error' })
  }
}

// 单个错题练习（从该题开始）
function handlePractice(questionId: string) {
  // 找到该题在筛选列表中的索引
  const startIndex = filteredQuestions.value.findIndex(q => q.questionId === questionId)

  if (startIndex === -1) {
    showToast('该错题不存在，请刷新页面', { type: 'error' })
    return
  }

  // 获取所有错题的 questionId（从当前题开始）
  const questionIds = filteredQuestions.value.map(q => q.questionId)

  // 获取科目名称
  const subjectName = subjectOptions.value.find(s => s.id === activeSubjectId.value)?.name || '未知科目'

  // 创建从该题开始的错题练习会话
  const success = examSessionStore.startWrongQuestionsPractice(
    questionIds,
    activeSubjectId.value,
    subjectName,
    `${subjectName} - 错题练习 (从第${startIndex + 1}题开始)`,
    startIndex
  )

  if (success) {
    router.push({ name: 'StudentExam', params: { id: 'wrong-single' } })
  } else {
    showToast('该错题已不存在，请刷新页面', { type: 'error' })
  }
}

function handleRemove(id: string) {
  const index = allQuestions.value.findIndex(q => q.id === id)
  if (index > -1) {
    const question = allQuestions.value[index]
    // 修复：question 可能为未定义
    if (!question) return
    if (confirm(`确定要移除错题"${getTruncatedStem(question.stem)}"吗？`)) {
      allQuestions.value.splice(index, 1)
      console.log(`已移除错题 ${id}`)

      // 如果当前页没有数据了，回到上一页
      if (paginatedQuestions.value.length === 0 && currentPage.value > 1) {
        currentPage.value--
      }
    }
  }
}

// 返回我的题库
function backToLibrary() {
  router.push({ name: 'StudentPortal' })
}

// 监听筛选变化，重置分页
watch(activeProjectId, () => {
  activeSubjectId.value = subjectOptions.value[0]?.id || ''
  activeTypeId.value = ''
  activeChapterTitle.value = ''
  expandedChapterIds.value = new Set<string>()
  currentPage.value = 1
})

watch(activeSubjectId, () => {
  activeTypeId.value = ''
  activeChapterTitle.value = ''
  expandedChapterIds.value = new Set<string>()
  currentPage.value = 1
})

// 生命周期钩子
onMounted(() => {
  loadPracticeSettings()
  window.addEventListener('wrongQuestionRemoved', handleWrongQuestionRemoved as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('wrongQuestionRemoved', handleWrongQuestionRemoved as EventListener)
})
</script>

<style scoped>
.wrong-questions-page {
  min-height: 100vh;
  background: #f5f7fa;
  --student-primary: #ff443d;
  --student-primary-dark: #e63a33;
  --primary-text: #2c3e50;
  --secondary-text: #5a6c7d;
  --card-border: #e4eaf2;
}

/* 顶部导航条 */
.top-navbar {
  background: #ffffff;
  border-bottom: 1px solid #e4eaf2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.navbar-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ff443d 0%, #ff6659 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: 700;
  font-size: 20px;
}

.brand-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary-text);
}

.nav-menu {
  display: flex;
  gap: 32px;
}

.nav-link {
  text-decoration: none;
  color: var(--secondary-text);
  font-size: 16px;
  font-weight: 500;
  transition: color 0.3s;
  position: relative;
  padding: 8px 0;
}

.nav-link:hover {
  color: var(--student-primary);
}

.nav-link.active {
  color: var(--student-primary);
  font-weight: 600;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--student-primary);
  border-radius: 2px;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 600;
  font-size: 14px;
}

.user-name {
  font-size: 14px;
  color: var(--primary-text);
  font-weight: 500;
}

/* 主内容区 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 20px;
}

.tab-content {
  padding: 32px 0 0;
}

/* 页面标题 */
.page-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}

.back-btn {
  flex-shrink: 0;
  padding: 8px 16px;
  background: rgba(255, 68, 61, 0.1);
  border: 1px solid rgba(255, 68, 61, 0.3);
  border-radius: 8px;
  color: var(--student-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  height: fit-content;
  margin-top: 2px;
}

.back-btn:hover {
  background: rgba(255, 68, 61, 0.15);
  border-color: var(--student-primary);
  transform: translateX(-2px);
}

.back-btn .icon {
  font-size: 16px;
  font-weight: bold;
}

.page-title-wrapper {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-text);
  margin: 0 0 6px 0;
}

.page-subtitle {
  font-size: 14px;
  color: var(--secondary-text);
  margin: 0;
}

/* 筛选器区域 */
.filter-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 12px 24px rgba(17, 36, 80, 0.06);
  border: 1px solid var(--card-border);
  display: flex;
  align-items: center;
  gap: 20px;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: var(--primary-text);
  font-weight: 600;
  flex-shrink: 0;
}

.project-select {
  padding: 10px 16px;
  border: 1px solid var(--card-border);
  border-radius: 8px;
  font-size: 14px;
  background: #ffffff;
  color: var(--primary-text);
  cursor: pointer;
  transition: all 0.3s;
  min-width: 200px;
}

.project-select:hover {
  border-color: var(--student-primary);
}

.project-select:focus {
  border-color: var(--student-primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 68, 61, 0.1);
}

.subject-tabs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  flex: 1;
}

.subject-tab {
  padding: 10px 24px;
  background: #ffffff;
  border: 1px solid var(--card-border);
  border-radius: 8px;
  font-size: 14px;
  color: var(--primary-text);
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  position: relative;
}

.subject-tab:hover:not(.is-active) {
  background: #f8f9fb;
  border-color: #d0d5dd;
}

.subject-tab.is-active {
  background: rgba(255, 68, 61, 0.12);
  border-color: var(--student-primary);
  color: var(--student-primary);
  font-weight: 600;
}

.subject-tab.is-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 16px;
  right: 16px;
  height: 3px;
  background: var(--student-primary);
  border-radius: 2px 2px 0 0;
}

/* 学习阶段筛选 已替换为 chips + 章节/题型视图 */
.stage-filter {
  display: none;
}

/* 列表工具栏 */
.list-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #fff5f5 0%, #ffe9e9 100%);
  border: 1px solid #ffcccb;
  border-radius: 16px;
  margin-bottom: 24px;
}

.practice-all-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, var(--student-primary) 0%, #ff6659 100%);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 8px 16px rgba(255, 68, 61, 0.3);
  transition: all 0.3s;
}

.practice-all-btn .icon {
  font-size: 16px;
}

.practice-all-btn .count {
  font-size: 12px;
  opacity: 0.9;
}

.practice-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(255, 68, 61, 0.4);
}

/* 设置按钮 */
.settings-btn {
  padding: 10px;
  background: white;
  color: var(--student-primary);
  border: 2px solid var(--student-primary);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 18px;
  margin-left: auto;
}

.settings-btn:hover {
  background: var(--student-primary);
  color: white;
  transform: rotate(45deg);
  box-shadow: 0 4px 12px rgba(255, 68, 61, 0.25);
}

.toolbar-hint {
  font-size: 13px;
  color: #d63031;
}

.stage-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-text);
  white-space: nowrap;
}

.stage-button {
  padding: 8px 20px;
  background: #ffffff;
  border: 1px solid var(--card-border);
  border-radius: 8px;
  font-size: 14px;
  color: var(--primary-text);
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  position: relative;
}

.stage-button:hover:not(.is-active) {
  background: #f8f9fb;
  border-color: #d0d5dd;
}

.stage-button.is-active {
  background: rgba(255, 68, 61, 0.12);
  color: #ff443d;
  font-weight: 600;
}

.stage-button.is-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 16px;
  right: 16px;
  height: 3px;
  background: #ff443d;
  border-radius: 2px 2px 0 0;
}

/* 错题列表区域 */
.questions-section {
  margin-bottom: 24px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 12px 24px rgba(17, 36, 80, 0.06);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-text);
  margin: 0 0 8px 0;
}

.empty-hint {
  font-size: 14px;
  color: var(--secondary-text);
  margin: 0;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-item {
  background: #ffffff;
  border: 1px solid var(--card-border);
  border-radius: 16px;
  padding: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  transition: all 0.3s;
  box-shadow: 0 12px 24px rgba(17, 36, 80, 0.06);
}

.question-item:hover {
  border-color: var(--student-primary);
  transform: translateY(-2px);
  box-shadow: 0 16px 32px rgba(17, 36, 80, 0.08);
}

/* 筛选 chips */
.filter-chips {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid var(--card-border);
  box-shadow: 0 12px 24px rgba(17, 36, 80, 0.06);
  margin-bottom: 24px;
}
.chip {
  padding: 8px 16px;
  border: 1px solid var(--card-border);
  background: #fff;
  border-radius: 20px;
  font-size: 14px;
  color: var(--primary-text);
  cursor: pointer;
  transition: all 0.3s;
}
.chip:hover:not(.active) {
  background: #f8f9fb;
  border-color: #d0d5dd;
}
.chip.active {
  background: rgba(255, 68, 61, 0.12);
  border-color: var(--student-primary);
  color: var(--student-primary);
  font-weight: 600;
}

/* 章节卡片（用于“章节分类”） */
.chapter-card {
  background: #ffffff;
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 12px;
  box-shadow: 0 12px 24px rgba(17, 36, 80, 0.06);
}
.chapter-main {
  display: flex;
  align-items: center;
  gap: 12px;
}
.chapter-toggle {
  width: 28px;
  height: 28px;
  border-radius: 14px;
  border: 1px solid rgba(255, 68, 61, 0.3);
  background: rgba(255, 68, 61, 0.08);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.chapter-toggle-icon {
  width: 12px;
  height: 12px;
  border-radius: 6px;
  position: relative;
  background: var(--student-primary);
}
.chapter-toggle-icon::before,
.chapter-toggle-icon::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 8px;
  height: 2px;
  background: #fff;
  transform: translate(-50%, -50%);
}
.chapter-toggle-icon::after {
  transform: translate(-50%, -50%) rotate(90deg);
}
.chapter-toggle-icon.expanded::after {
  display: none;
}
.chapter-title {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.chapter-order {
  font-size: 13px;
  color: var(--student-primary);
  font-weight: 700;
}
.chapter-name {
  font-size: 16px;
  color: var(--primary-text);
  font-weight: 600;
}
/* 按你的要求修改间距 */
.chapter-sections {
  margin: 12px 0 24px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.section-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #f0f2f7;
  background: #fff;
}
.section-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.section-dot {
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background: var(--student-primary);
}
.section-title {
  color: var(--primary-text);
  font-weight: 600;
  font-size: 14px;
}
.section-meta {
  font-size: 12px;
  color: var(--secondary-text);
}
.section-count {
  color: var(--student-primary);
  font-weight: 700;
}
.section-actions {
  display: flex;
  gap: 8px;
}
.card-footer {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.footer-meta { color: var(--secondary-text); }
.footer-count { color: var(--student-primary); font-weight: 700; }

.footer-actions{
  display: flex;
  gap: 12px;
}

.chapter-slide-enter-active,
.chapter-slide-leave-active { transition: all 0.2s ease; }
.chapter-slide-enter-from,
.chapter-slide-leave-to { opacity: 0; transform: translateY(-6px); }

/* 题型分类：列表样式 */
.type-list {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid var(--card-border);
  box-shadow: 0 12px 24px rgba(17, 36, 80, 0.06);
  margin-bottom: 24px;
  overflow: hidden;
}
.type-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #e4eaf2;
}
.type-item:last-child { border-bottom: none; }
.type-info { display: flex; flex-direction: column; gap: 6px; }
.type-name { font-size: 15px; color: var(--primary-text); font-weight: 600; }
.type-meta { font-size: 13px; color: var(--secondary-text); }
.type-count { color: var(--student-primary); font-weight: 700; }
.type-actions { display: flex; gap: 12px; }

/* 通用按钮（用于查看/收藏重做） */
.btn {
  padding: 6px 16px;
  border-radius: 22px;
  font-size: 13px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.btn:hover { transform: translateY(-1px); }
.btn-outline {
  background: #fff;
  color: var(--student-primary);
  border: 1px solid var(--student-primary);
}
.btn-primary {
  background: linear-gradient(135deg, #ff443d 0%, #ff6659 100%);
  color: #fff;
  border: 1px solid #ff6659;
  box-shadow: 0 4px 12px rgba(255, 68, 61, 0.2);
}

/* 需求文档样式（与截图同款风格） */
.requirements-container {
  padding: 16px 20px;
}
.requirements-title {
  font-size: 22px;
  font-weight: 700;
  color: #2c3e50;
  border-bottom: 3px solid #ff443d;
  padding-bottom: 8px;
  margin-bottom: 20px;
}
.req-section {
  margin-bottom: 24px;
}
.req-section-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
}
.table-card {
  background: #fff;
  border: 1px solid #e4eaf2;
  border-radius: 16px;
  box-shadow: 0 12px 24px rgba(17, 36, 80, 0.06);
  overflow: hidden;
}
.table-header {
  color: #fff;
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 600;
}
.header-primary {
  background: linear-gradient(135deg, #5b4dbb 0%, #7c5cff 100%);
}
.header-danger {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
}
.req-table {
  width: 100%;
  border-collapse: collapse;
}
.req-table th,
.req-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #eef2f7;
  color: #2c3e50;
  text-align: left;
  vertical-align: top;
}
.req-table thead th {
  background: #f8fafc;
  font-weight: 600;
}
.req-table tbody tr:last-child td {
  border-bottom: none;
}
.col-key {
  width: 160px;
  color: #5a6c7d;
}
.col-val {
  color: #2c3e50;
}
.checklist-table .status-ok {
  display: inline-block;
  color: #10b981;
  font-weight: 700;
}
@media (max-width: 768px) {
  .requirements-container {
    padding: 12px 14px;
  }
  .requirements-title {
    font-size: 20px;
  }
  .req-section-title {
    font-size: 16px;
  }
}
  .style-guide-section { padding: 16px 0 32px; }
  .sg-title {
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 12px;
    padding-bottom: 6px;
    border-bottom: 2px solid #ff443d;
  }
  .sg-section { margin-top: 12px; }
  .sg-section-title {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    margin: 12px 0 8px;
  }

  /* 表格卡片统一样式 */
  .sg-table-card {
    background: #fff;
    border: 1px solid #e4eaf2;
    border-radius: 12px;
    box-shadow: 0 12px 24px rgba(17, 36, 80, 0.06);
    overflow: hidden;
  }
  .sg-table-header {
    color: #fff;
    font-weight: 600;
    padding: 10px 14px;
  }
  .sg-table-header.header-gradient {
    background: linear-gradient(135deg, #6f66ff 0%, #8a4bff 100%);
  }

  .sg-table { width: 100%; border-collapse: collapse; }
  .sg-table th {
    text-align: left;
    font-weight: 600;
    color: #5a6c7d;
    background: #f9fafb;
  }
  .sg-table th,
  .sg-table td {
    padding: 12px 16px;
    border-bottom: 1px solid #eef2f7;
    font-size: 14px;
  }
  .sg-table tbody tr:hover td { background: #fafafa; }
  .sg-table tbody tr:last-child td { border-bottom: none; }
</style>