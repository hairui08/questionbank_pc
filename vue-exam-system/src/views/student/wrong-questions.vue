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
              <h1 class="page-title">我的错题</h1>
              <p class="page-subtitle">整理错题，巩固知识，提升成绩</p>
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

            <!-- 学习阶段筛选 -->
            <section class="stage-filter">
              <div class="stage-label">学习阶段：</div>
              <button
                v-for="stage in learningStages"
                :key="stage.key"
                :class="['stage-button', { 'is-active': activeStage === stage.key }]"
                @click="selectStage(stage.key)"
              >
                {{ stage.label }}
              </button>
            </section>

            <!-- 列表工具栏 -->
            <section v-if="filteredQuestions.length > 0" class="list-toolbar">
              <button class="practice-all-btn" @click="handlePracticeAll">
                <span class="icon">📝</span>
                全部错题练习
                <span class="count">({{ filteredQuestions.length }}题)</span>
              </button>
              <span class="toolbar-hint">将当前筛选的所有错题作为一套试卷进行练习</span>

              <!-- 设置按钮 -->
              <button class="settings-btn" @click="showSettingsModal = true" title="练习设置">
                <span class="icon">⚙️</span>
              </button>
            </section>

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

            <!-- 错题列表 -->
            <section class="questions-section">
              <div v-if="paginatedQuestions.length === 0" class="empty-state">
                <div class="empty-icon">🎉</div>
                <p class="empty-text">暂无错题</p>
                <p class="empty-hint">继续加油，保持优秀！</p>
              </div>

              <div v-else class="questions-list">
                <article
                  v-for="(question, index) in paginatedQuestions"
                  :key="question.id"
                  class="question-item"
                >
                  <div class="question-main">
                    <div class="question-number">{{ getQuestionNumber(index) }}</div>
                    <div class="question-content">
                      <div class="question-stem">{{ getTruncatedStem(question.stem) }}</div>
                      <div class="question-meta">
                        <span class="meta-item">
                          <span class="meta-icon">📅</span>
                          {{ formatDate(question.wrongTime) }}
                        </span>
                        <span class="divider">·</span>
                        <span class="meta-item">
                          <span class="meta-icon">{{ getSourceIcon(question.sourceType) }}</span>
                          {{ question.sourceName }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="question-actions">
                    <button class="practice-btn" @click="handlePractice(question.questionId)">
                      重新练习
                      <span class="arrow">→</span>
                    </button>
                    <button class="remove-btn" @click="handleRemove(question.id)">
                      移除错题
                      <span class="icon">×</span>
                    </button>
                  </div>
                </article>
              </div>
            </section>

            <!-- 分页组件 -->
            <Pagination
              v-if="totalQuestions > 0"
              :current-page="currentPage"
              :total="totalQuestions"
              :page-size="pageSize"
              @page-change="handlePageChange"
              @size-change="handlePageSizeChange"
            />
          </div>
        </template>

        <!-- 需求文档标签页 -->
        <template #requirements>
          <div class="requirements-section">
            <h2>功能需求</h2>

            <h3>1. 功能概述</h3>
            <table class="spec-table">
              <thead>
                <tr>
                  <th>项目</th>
                  <th>说明</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>功能名称</td>
                  <td>我的错题</td>
                </tr>
                <tr>
                  <td>功能描述</td>
                  <td>学员查看自己的错题记录，支持按项目、科目、学习阶段筛选，可重新练习错题</td>
                </tr>
                <tr>
                  <td>用户角色</td>
                  <td>学员</td>
                </tr>
                <tr>
                  <td>访问路径</td>
                  <td>学习中心 → 我的题库 → 点击"我的错题"统计卡片</td>
                </tr>
              </tbody>
            </table>

            <h3>2. 功能规格</h3>
            <table class="spec-table">
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
                  <td>
                    - 项目下拉选择器<br>
                    - 科目横向标签页<br>
                    - 学习阶段按钮组（全部、章节练习、历年真题、考前冲刺、入学测试）
                  </td>
                  <td>P0</td>
                </tr>
                <tr>
                  <td>错题卡片</td>
                  <td>
                    - 题目序号（第N题）<br>
                    - 题干内容（最多100字）<br>
                    - 答错时间（YYYY-MM-DD HH:mm）<br>
                    - 来源信息（试卷名称或章节名称）
                  </td>
                  <td>P0</td>
                </tr>
                <tr>
                  <td>全部错题练习</td>
                  <td>
                    - 位置：错题列表上方的工具栏<br>
                    - 功能：将当前筛选的所有错题作为一套试卷进行练习<br>
                    - 显示题目数量：(X题)<br>
                    - 跳转到答题页面 (/student/exam/:id)
                  </td>
                  <td>P0</td>
                </tr>
                <tr>
                  <td>单题重新练习</td>
                  <td>
                    - 点击"重新练习"按钮，跳转到答题页面<br>
                    - 从该题开始，可通过"下一题"继续做后续错题<br>
                    - 实现顺序练习模式
                  </td>
                  <td>P0</td>
                </tr>
                <tr>
                  <td>移除错题</td>
                  <td>点击"移除错题"按钮，从错题本中移除该题目</td>
                  <td>P0</td>
                </tr>
                <tr>
                  <td>分页</td>
                  <td>支持分页显示，默认每页10条，可选10/20/50条</td>
                  <td>P0</td>
                </tr>
                <tr>
                  <td>空状态</td>
                  <td>无错题时显示友好提示"暂无错题，继续加油！"</td>
                  <td>P1</td>
                </tr>
              </tbody>
            </table>

            <h3>3. 数据约束</h3>
            <table class="constraint-table">
              <thead>
                <tr>
                  <th>字段</th>
                  <th>约束</th>
                  <th>说明</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>题干显示</td>
                  <td>≤ 100 字符</td>
                  <td>超出部分显示省略号（...）</td>
                </tr>
                <tr>
                  <td>日期格式</td>
                  <td>YYYY-MM-DD HH:mm</td>
                  <td>如：2024-10-30 14:30</td>
                </tr>
                <tr>
                  <td>来源类型</td>
                  <td>exam（试卷）或 chapter（章节）</td>
                  <td>显示对应图标和名称</td>
                </tr>
              </tbody>
            </table>

            <h3>4. 验收标准</h3>
            <table class="acceptance-criteria">
              <thead>
                <tr>
                  <th>验收项</th>
                  <th>标准</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>页面布局</td>
                  <td>顶部导航栏 + 页面标题 + 筛选器 + 错题列表 + 分页</td>
                </tr>
                <tr>
                  <td>筛选功能</td>
                  <td>项目、科目、学习阶段三级联动筛选正常工作</td>
                </tr>
                <tr>
                  <td>卡片展示</td>
                  <td>每个错题卡片显示序号、题干（≤100字）、时间、来源</td>
                </tr>
                <tr>
                  <td>列表工具栏</td>
                  <td>"全部错题练习"按钮显示在错题列表上方，显示题目数量</td>
                </tr>
                <tr>
                  <td>全部错题练习</td>
                  <td>点击后跳转到答题页面，可顺序练习所有筛选后的错题</td>
                </tr>
                <tr>
                  <td>单题重新练习</td>
                  <td>点击"重新练习"后，从该题开始答题，可通过"下一题"继续做后续错题</td>
                </tr>
                <tr>
                  <td>按钮样式</td>
                  <td>"重新练习"和"全部错题练习"按钮均为红色渐变胶囊按钮</td>
                </tr>
                <tr>
                  <td>分页功能</td>
                  <td>分页组件正常工作，筛选变更时重置到第1页</td>
                </tr>
                <tr>
                  <td>空状态</td>
                  <td>无错题时显示友好的空状态提示</td>
                </tr>
                <tr>
                  <td>响应式设计</td>
                  <td>移动端（≤768px）布局调整，卡片垂直排列</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <!-- 样式指南标签页 -->
        <template #style-guide>
          <div class="style-guide-section">
            <h2>样式规范</h2>

            <h3>1. 颜色系统</h3>
            <div class="color-palette">
              <div class="color-item">
                <div class="color-swatch" style="background: #ff443d"></div>
                <div class="color-info">
                  <div class="color-name">主色</div>
                  <div class="color-value">#ff443d</div>
                  <div class="color-usage">按钮、链接、强调元素</div>
                </div>
              </div>
              <div class="color-item">
                <div class="color-swatch" style="background: linear-gradient(135deg, #ff443d 0%, #ff6659 100%)"></div>
                <div class="color-info">
                  <div class="color-name">主色渐变</div>
                  <div class="color-value">#ff443d → #ff6659</div>
                  <div class="color-usage">按钮背景、卡片高亮</div>
                </div>
              </div>
              <div class="color-item">
                <div class="color-swatch" style="background: #2c3e50"></div>
                <div class="color-info">
                  <div class="color-name">主文本</div>
                  <div class="color-value">#2c3e50</div>
                  <div class="color-usage">标题、正文</div>
                </div>
              </div>
              <div class="color-item">
                <div class="color-swatch" style="background: #5a6c7d"></div>
                <div class="color-info">
                  <div class="color-name">辅助文本</div>
                  <div class="color-value">#5a6c7d</div>
                  <div class="color-usage">说明文字、元信息</div>
                </div>
              </div>
            </div>

            <h3>2. 组件样式</h3>
            <table class="style-table">
              <thead>
                <tr>
                  <th>组件</th>
                  <th>样式规范</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>列表工具栏</td>
                  <td>
                    - 背景：淡红色渐变 (linear-gradient(135deg, #fff5f5 0%, #ffe9e9 100%))<br>
                    - 边框：1px solid #ffcccb<br>
                    - 圆角：16px<br>
                    - 内边距：16px 20px<br>
                    - 按钮：红色渐变胶囊按钮，显示题目数量
                  </td>
                </tr>
                <tr>
                  <td>错题卡片</td>
                  <td>
                    - 白色背景，圆角16px<br>
                    - 边框：1px solid #e4eaf2<br>
                    - 阴影：0 12px 24px rgba(17, 36, 80, 0.06)<br>
                    - 悬停：边框色变为 #ff443d
                  </td>
                </tr>
                <tr>
                  <td>重新练习按钮</td>
                  <td>
                    - 红色渐变背景（#ff443d → #ff6659）<br>
                    - 白色文字，圆角50px（胶囊形）<br>
                    - 内边距：6px 16px<br>
                    - 悬停：transform: translateY(-2px)
                  </td>
                </tr>
                <tr>
                  <td>筛选器</td>
                  <td>
                    - 项目选择器：白色背景，圆角8px<br>
                    - 科目标签：横向排列，圆角8px<br>
                    - 学习阶段：按钮组，圆角8px
                  </td>
                </tr>
              </tbody>
            </table>

            <h3>3. 间距规范</h3>
            <table class="style-table">
              <thead>
                <tr>
                  <th>元素</th>
                  <th>间距值</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>页面标题与筛选器</td>
                  <td>32px</td>
                </tr>
                <tr>
                  <td>筛选器与错题列表</td>
                  <td>24px</td>
                </tr>
                <tr>
                  <td>错题卡片之间</td>
                  <td>16px</td>
                </tr>
                <tr>
                  <td>卡片内边距</td>
                  <td>18px</td>
                </tr>
              </tbody>
            </table>
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

// 学习阶段
const learningStages = [
  { key: 'all', label: '全部' },
  { key: 'chapter', label: '章节练习' },
  { key: 'realExam', label: '历年真题' },
  { key: 'sprint', label: '考前冲刺' },
  { key: 'entrance', label: '入学测试' }
]

// 筛选状态
const activeProjectId = ref(projectStore.projects[0]?.id || '')
const activeSubjectId = ref('')
const activeStage = ref('all')

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
      activeSubjectId.value = subjectOptions.value[0].id
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

// 筛选后的错题
const filteredQuestions = computed(() => {
  let result = allQuestions.value

  if (activeProjectId.value) {
    result = result.filter(q => q.projectId === activeProjectId.value)
  }

  if (activeSubjectId.value) {
    result = result.filter(q => q.subjectId === activeSubjectId.value)
  }

  if (activeStage.value !== 'all') {
    result = result.filter(q => q.examType === activeStage.value)
  }

  return result
})

// 分页后的错题
const paginatedQuestions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredQuestions.value.slice(start, end)
})

// 总错题数
const totalQuestions = computed(() => filteredQuestions.value.length)

// 项目变更处理
function handleProjectChange() {
  activeSubjectId.value = subjectOptions.value[0]?.id || ''
  activeStage.value = 'all'
  currentPage.value = 1
}

// 科目选择
function selectSubject(subjectId: string) {
  activeSubjectId.value = subjectId
  activeStage.value = 'all'
  currentPage.value = 1
}

// 学习阶段选择
function selectStage(stage: string) {
  activeStage.value = stage
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

// 监听筛选变化，重置分页
watch(activeProjectId, () => {
  activeSubjectId.value = subjectOptions.value[0]?.id || ''
  activeStage.value = 'all'
  currentPage.value = 1
})

watch(activeSubjectId, () => {
  activeStage.value = 'all'
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
  padding: 32px 0;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 24px;
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

/* 学习阶段筛选 */
.stage-filter {
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

.question-main {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.question-number {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ff443d 0%, #ff6659 100%);
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
}

.question-content {
  flex: 1;
}

.question-stem {
  font-size: 15px;
  line-height: 1.5;
  color: var(--primary-text);
  margin-bottom: 8px;
  font-weight: 500;
}

.question-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--secondary-text);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-icon {
  font-size: 16px;
}

.divider {
  color: #d0d5dd;
}

.question-actions {
  flex-shrink: 0;
  display: flex;
  gap: 12px;
}

.practice-btn {
  padding: 6px 16px;
  background: linear-gradient(135deg, #ff443d 0%, #ff6659 100%);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 12px rgba(255, 68, 61, 0.2);
}

.practice-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 68, 61, 0.3);
}

.practice-btn .arrow {
  font-size: 13px;
  font-weight: bold;
}

.remove-btn {
  padding: 6px 16px;
  background: white;
  color: var(--secondary-text);
  border: 1px solid #d0d5dd;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.remove-btn:hover {
  border-color: #f56565;
  color: #f56565;
  transform: translateY(-2px);
}

.remove-btn .icon {
  font-size: 18px;
  font-weight: bold;
}

/* 需求文档样式 */
.requirements-section,
.style-guide-section {
  padding: 40px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 12px 24px rgba(17, 36, 80, 0.06);
}

.requirements-section h2,
.style-guide-section h2 {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary-text);
  margin: 0 0 24px 0;
  border-bottom: 3px solid var(--student-primary);
  padding-bottom: 12px;
}

.requirements-section h3,
.style-guide-section h3 {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary-text);
  margin: 32px 0 16px 0;
}

.requirements-section table,
.style-guide-section table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.spec-table thead,
.constraint-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.spec-table th,
.constraint-table th {
  padding: 16px;
  text-align: left;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 14px;
}

.acceptance-criteria thead {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.acceptance-criteria th {
  padding: 16px;
  text-align: left;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 14px;
}

.requirements-section td,
.style-guide-section td {
  padding: 14px 16px;
  border-bottom: 1px solid #e4eaf2;
  color: var(--primary-text);
  line-height: 1.6;
}

.requirements-section tbody tr:last-child td,
.style-guide-section tbody tr:last-child td {
  border-bottom: none;
}

.requirements-section tbody tr:hover,
.style-guide-section tbody tr:hover {
  background: #f8f9fb;
}

/* 颜色样板 */
.color-palette {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.color-item {
  border: 1px solid var(--card-border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.color-swatch {
  height: 120px;
}

.color-info {
  padding: 16px;
  background: #ffffff;
}

.color-name {
  font-weight: 700;
  color: var(--primary-text);
  margin-bottom: 4px;
}

.color-value {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: var(--secondary-text);
  margin-bottom: 8px;
}

.color-usage {
  font-size: 13px;
  color: var(--secondary-text);
  font-style: italic;
}

.style-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.style-table th {
  padding: 16px;
  text-align: left;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar-content {
    padding: 0 16px;
  }

  .nav-menu {
    display: none;
  }

  .main-content {
    padding: 20px 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .page-subtitle {
    font-size: 14px;
  }

  .filter-section {
    padding: 16px;
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-label {
    width: 100%;
  }

  .project-select {
    width: 100%;
    min-width: auto;
  }

  .subject-tabs {
    width: 100%;
  }

  .stage-filter {
    flex-wrap: wrap;
  }

  .question-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .question-actions {
    width: 100%;
    flex-direction: column;
  }

  .practice-btn,
  .remove-btn {
    width: 100%;
    justify-content: center;
  }

  .requirements-section,
  .style-guide-section {
    padding: 20px;
  }
}

/* 设置弹窗样式 */
.settings-content {
  padding: 24px 0;
}

.setting-group {
  margin-bottom: 28px;
}

.setting-group:last-child {
  margin-bottom: 0;
}

.setting-label {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: var(--primary-text);
  margin-bottom: 12px;
}

/* 单选按钮组 */
.radio-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.radio-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 10px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s;
  background: white;
}

.radio-item:hover {
  border-color: var(--student-primary);
  background: rgba(255, 68, 61, 0.05);
}

.radio-item input[type="radio"] {
  margin: 0 8px 0 0;
  cursor: pointer;
  accent-color: var(--student-primary);
  width: 18px;
  height: 18px;
}

.radio-item input[type="radio"]:checked + span {
  color: var(--student-primary);
  font-weight: 600;
}

.radio-item span {
  font-size: 14px;
  color: var(--secondary-text);
  transition: all 0.2s;
}

/* 开关组 */
.switch-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.switch-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s;
  background: white;
}

.switch-item:hover {
  border-color: var(--student-primary);
  background: rgba(255, 68, 61, 0.05);
}

.switch-item input[type="checkbox"] {
  display: none;
}

.switch-box {
  position: relative;
  width: 44px;
  height: 24px;
  background: #ccc;
  border-radius: 12px;
  margin-right: 12px;
  transition: background 0.3s;
}

.switch-box::after {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  top: 3px;
  left: 3px;
  transition: transform 0.3s;
}

.switch-item input[type="checkbox"]:checked + .switch-box {
  background: var(--student-primary);
}

.switch-item input[type="checkbox"]:checked + .switch-box::after {
  transform: translateX(20px);
}

.switch-text {
  font-size: 14px;
  color: var(--primary-text);
  font-weight: 500;
}
</style>
