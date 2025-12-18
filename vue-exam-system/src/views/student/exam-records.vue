<template>
  <div class="exam-records-page">
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
                <h1 class="page-title">答题记录</h1>
                <p class="page-subtitle">查看您的做题历史和学习轨迹</p>
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

            <!-- 答题记录列表 -->
            <section class="records-section">
              <div v-if="paginatedRecords.length === 0" class="empty-state">
                <div class="empty-icon">📭</div>
                <p class="empty-text">暂无答题记录</p>
                <p class="empty-hint">选择不同的筛选条件或开始新的练习吧!</p>
              </div>

              <div v-else class="records-list">
                <article
                  v-for="record in paginatedRecords"
                  :key="record.id"
                  class="record-item"
                  @click="viewRecordDetail(record.id)"
                >
                  <div class="record-main">
                    <div class="record-title">
                      <span class="record-icon">{{ getStageIcon(record.examType) }}</span>
                      {{ record.examTitle }}
                    </div>
                    <div class="record-subtitle">
                      <span>{{ record.subjectName }}</span>
                      <span class="divider">·</span>
                      <span>{{ record.totalQuestions }} 道题</span>
                      <span class="divider">·</span>
                      <span>得分 {{ record.score }}/{{ record.totalScore }}</span>
                      <span class="divider">·</span>
                      <span>{{ formatDate(record.completedAt) }}</span>
                    </div>
                  </div>
                  <div class="record-actions">
                    <button class="primary-link" @click.stop="viewRecordDetail(record.id)">
                      查看详情
                      <span class="arrow">→</span>
                    </button>
                  </div>
                </article>
              </div>
            </section>

            <!-- 分页组件 -->
            <Pagination
              v-if="totalRecords > 0"
              :current-page="currentPage"
              :total="totalRecords"
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
                  <td>答题记录</td>
                </tr>
                <tr>
                  <td>页面路由</td>
                  <td>/student/exam-records</td>
                </tr>
                <tr>
                  <td>功能定位</td>
                  <td>为学生提供答题历史记录查询功能,支持按项目/科目筛选,分页展示所有做题记录</td>
                </tr>
                <tr>
                  <td>用户角色</td>
                  <td>学生端用户</td>
                </tr>
              </tbody>
            </table>

            <h3>2. 核心功能规格</h3>
            <table class="spec-table">
              <thead>
                <tr>
                  <th width="25%">功能模块</th>
                  <th width="75%">功能描述</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>顶部导航条</strong></td>
                  <td>
                    <ul>
                      <li>显示品牌Logo和名称</li>
                      <li>导航菜单:课程、选课中心、学习中心</li>
                      <li>用户头像和姓名</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td><strong>项目/科目筛选</strong></td>
                  <td>
                    <ul>
                      <li>项目下拉选择器</li>
                      <li>科目横向标签页(与"我的题库"样式一致)</li>
                      <li>选择项目后,科目标签自动过滤</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td><strong>答题记录列表</strong></td>
                  <td>
                    <ul>
                      <li>横向卡片布局(左侧信息+右侧按钮)</li>
                      <li>显示:试卷名称、科目、题数、得分、做题时间</li>
                      <li>点击卡片或"查看详情"跳转到结果页</li>
                      <li>记录按完成时间倒序排列</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td><strong>分页功能</strong></td>
                  <td>
                    <ul>
                      <li>支持上一页/下一页</li>
                      <li>显示页码(智能省略)</li>
                      <li>每页显示数量可选(10/20/50条)</li>
                      <li>显示总记录数</li>
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>

            <h3>3. 验收标准</h3>
            <table class="acceptance-criteria">
              <thead>
                <tr>
                  <th width="10%">优先级</th>
                  <th width="90%">验收标准</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>P0</td>
                  <td>✅ 顶部导航条正确显示,包含Logo、菜单、用户信息</td>
                </tr>
                <tr>
                  <td>P0</td>
                  <td>✅ 项目/科目筛选采用下拉+标签页布局,与"我的题库"一致</td>
                </tr>
                <tr>
                  <td>P0</td>
                  <td>✅ 记录卡片采用横向布局,样式与"我的题库"试卷卡片一致</td>
                </tr>
                <tr>
                  <td>P0</td>
                  <td>✅ 分页组件正常工作(切换页码、每页数量)</td>
                </tr>
                <tr>
                  <td>P1</td>
                  <td>✅ 筛选后自动重置到第1页</td>
                </tr>
                <tr>
                  <td>P1</td>
                  <td>✅ 点击记录能正确跳转到详情页</td>
                </tr>
                <tr>
                  <td>P1</td>
                  <td>✅ 空状态提示显示正确,UI友好</td>
                </tr>
                <tr>
                  <td>P2</td>
                  <td>✅ 红色主题色统一应用到所有交互元素</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <!-- 样式指南标签页 -->
        <template #style-guide>
          <div class="style-guide-section">
            <h2>样式指南</h2>

            <h3>1. 顶部导航条</h3>
            <table class="spec-table">
              <thead>
                <tr>
                  <th width="20%">属性</th>
                  <th width="80%">规范</th>
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
                  <td>红色渐变背景,40x40px圆形</td>
                </tr>
                <tr>
                  <td>激活菜单</td>
                  <td>红色文字 + 下划线</td>
                </tr>
              </tbody>
            </table>

            <h3>2. 记录卡片(横向布局)</h3>
            <table class="spec-table">
              <thead>
                <tr>
                  <th width="20%">属性</th>
                  <th width="80%">规范</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>布局</td>
                  <td>flex横向,左侧信息区 + 右侧按钮区</td>
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
                  <td>hover效果</td>
                  <td>边框变深 + 背景#fafafa + 阴影增强</td>
                </tr>
                <tr>
                  <td>主按钮</td>
                  <td>红色胶囊按钮(border-radius: 50px)</td>
                </tr>
              </tbody>
            </table>

            <h3>3. 分页组件</h3>
            <table class="spec-table">
              <thead>
                <tr>
                  <th width="20%">属性</th>
                  <th width="80%">规范</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>位置</td>
                  <td>列表底部,居中对齐</td>
                </tr>
                <tr>
                  <td>按钮圆角</td>
                  <td>8px</td>
                </tr>
                <tr>
                  <td>激活页码</td>
                  <td>红色渐变背景</td>
                </tr>
                <tr>
                  <td>hover效果</td>
                  <td>红色边框</td>
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
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import TabNavigation from '@/components/Tab/TabNavigation.vue'
import Pagination from '@/components/Pagination/Pagination.vue'
import { useProjectStore } from '@/stores/project'

// ============================================================================
// Store 和 Router
// ============================================================================
const router = useRouter()
const projectStore = useProjectStore()

// ============================================================================
// 标签页配置
// ============================================================================
const tabs = [
  { key: 'prototype', label: '原型展示', icon: '🎨' },
  { key: 'requirements', label: '需求文档', icon: '📋' },
  { key: 'style-guide', label: '样式指南', icon: '🎯' }
]

// ============================================================================
// 项目和科目数据
// ============================================================================
const projects = computed(() => projectStore.projects)
const activeProjectId = ref(projects.value[0]?.id || '')
const activeSubjectId = ref('')

// 科目选项(基于选中的项目)
const subjectOptions = computed(() => {
  if (!activeProjectId.value) return []
  return projectStore.subjects.filter(s => s.projectId === activeProjectId.value)
})

// 监听项目变化
watch(activeProjectId, () => {
  // 切换项目时,选择第一个科目
  activeSubjectId.value = subjectOptions.value[0]?.id || ''
  // 重置学习阶段为"全部"
  activeStage.value = 'all'
  // 重置到第一页
  currentPage.value = 1
})

// 监听科目变化
watch(activeSubjectId, () => {
  // 切换科目时,重置学习阶段为"全部"
  activeStage.value = 'all'
  // 重置到第一页
  currentPage.value = 1
})

function handleProjectChange() {
  // v-model已自动更新activeProjectId
}

function selectSubject(subjectId: string) {
  activeSubjectId.value = subjectId
}

// ============================================================================
// 学习阶段筛选
// ============================================================================
const learningStages = [
  { key: 'all', label: '全部' },
  { key: 'chapter', label: '章节练习' },
  { key: 'realExam', label: '历年真题' },
  { key: 'sprint', label: '考前冲刺' },
  { key: 'entrance', label: '入学测试' }
]

const activeStage = ref('all')

function selectStage(stage: string) {
  activeStage.value = stage
  currentPage.value = 1  // 重置到第1页
}

// ============================================================================
// 模拟答题记录数据
// ============================================================================
const allRecords = ref([
  {
    id: 'record-001',
    examId: 'exam-001',
    examTitle: '第1章·会计政策变更专项练习',
    examType: 'chapter',
    projectId: 'p1',
    projectName: '会计从业资格考试',
    subjectId: 's1',
    subjectName: '会计基础',
    totalQuestions: 20,
    score: 85,
    totalScore: 100,
    completedAt: 1735459200000 // 2025-10-29 14:30
  },
  {
    id: 'record-002',
    examId: 'exam-002',
    examTitle: '2024年会计从业资格考试真题',
    examType: 'realExam',
    projectId: 'p1',
    projectName: '会计从业资格考试',
    subjectId: 's1',
    subjectName: '会计基础',
    totalQuestions: 50,
    score: 72,
    totalScore: 100,
    completedAt: 1735372800000
  },
  {
    id: 'record-003',
    examId: 'exam-003',
    examTitle: '考前冲刺模拟试卷(一)',
    examType: 'sprint',
    projectId: 'p1',
    projectName: '会计从业资格考试',
    subjectId: 's2',
    subjectName: '财经法规',
    totalQuestions: 40,
    score: 90,
    totalScore: 100,
    completedAt: 1735286400000
  },
  {
    id: 'record-004',
    examId: 'exam-004',
    examTitle: '入学测试·会计基础摸底',
    examType: 'entrance',
    projectId: 'p1',
    projectName: '会计从业资格考试',
    subjectId: 's1',
    subjectName: '会计基础',
    totalQuestions: 30,
    score: 68,
    totalScore: 100,
    completedAt: 1735200000000
  },
  {
    id: 'record-005',
    examId: 'exam-005',
    examTitle: '第2章·会计要素与会计等式',
    examType: 'chapter',
    projectId: 'p1',
    projectName: '会计从业资格考试',
    subjectId: 's1',
    subjectName: '会计基础',
    totalQuestions: 25,
    score: 92,
    totalScore: 100,
    completedAt: 1735113600000
  },
  {
    id: 'record-006',
    examId: 'exam-006',
    examTitle: '2023年注会《会计》真题精选',
    examType: 'realExam',
    projectId: 'p2',
    projectName: '注册会计师考试',
    subjectId: 's3',
    subjectName: '会计',
    totalQuestions: 60,
    score: 78,
    totalScore: 100,
    completedAt: 1735027200000
  },
  {
    id: 'record-007',
    examId: 'exam-007',
    examTitle: '第3章·账户与复式记账',
    examType: 'chapter',
    projectId: 'p1',
    projectName: '会计从业资格考试',
    subjectId: 's1',
    subjectName: '会计基础',
    totalQuestions: 30,
    score: 88,
    totalScore: 100,
    completedAt: 1734940800000
  }
])

// ============================================================================
// 筛选和分页
// ============================================================================
const currentPage = ref(1)
const pageSize = ref(20)

// 筛选后的记录
const filteredRecords = computed(() => {
  let result = allRecords.value

  // 按项目过滤
  if (activeProjectId.value) {
    result = result.filter(r => r.projectId === activeProjectId.value)
  }

  // 按科目过滤
  if (activeSubjectId.value) {
    result = result.filter(r => r.subjectId === activeSubjectId.value)
  }

  // 按学习阶段过滤
  if (activeStage.value !== 'all') {
    result = result.filter(r => r.examType === activeStage.value)
  }

  return result
})

// 总记录数
const totalRecords = computed(() => filteredRecords.value.length)

// 分页后的记录
const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredRecords.value.slice(start, end)
})

// 分页处理
function handlePageChange(page: number) {
  currentPage.value = page
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handlePageSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
}

// ============================================================================
// 工具函数
// ============================================================================
function getStageIcon(type: string): string {
  const map: Record<string, string> = {
    chapter: '📖',
    realExam: '📜',
    sprint: '🚀',
    entrance: '🎯'
  }
  return map[type] || '📝'
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function viewRecordDetail(recordId: string) {
  const record = filteredRecords.value.find(r => r.id === recordId)

  if (!record) {
    console.error('未找到答题记录:', recordId)
    return
  }

  router.push({
    name: record.examType === 'chapter' ? 'StudentPracticeAnalysis' : 'StudentExamAnalysis',
    params: { id: record?.examId ?? '' }
  })
}

// 返回我的题库
function backToLibrary() {
  router.push({ name: 'StudentPortal' })
}

// 初始化:选择第一个科目（安全写法）
const firstSubject = subjectOptions.value?.[0]
if (firstSubject) {
  activeSubjectId.value = firstSubject.id ?? ''
}
</script>

<style scoped>
/* ============================================================================
   页面容器
   ============================================================================ */
.exam-records-page {
  min-height: 100vh;
  background: #f5f7fa;
  --student-primary: #ff443d;
  --student-primary-dark: #e63a33;
  --primary-text: #2c3e50;
  --secondary-text: #5a6c7d;
  --card-border: #e4eaf2;
}

/* ============================================================================
   顶部导航条
   ============================================================================ */
.top-navbar {
  height: 60px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-content {
  max-width: 1200px;
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;
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
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: 700;
}

.brand-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-text);
}

.nav-menu {
  display: flex;
  gap: 32px;
}

.nav-link {
  font-size: 15px;
  color: var(--secondary-text);
  text-decoration: none;
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.nav-link:hover {
  color: var(--student-primary);
}

.nav-link.active {
  color: var(--student-primary);
  border-bottom-color: var(--student-primary);
  font-weight: 600;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.user-name {
  font-size: 14px;
  color: var(--primary-text);
}

/* ============================================================================
   主内容区
   ============================================================================ */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.tab-content {
  padding: 32px 0;
}

/* 页面头部 */
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
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: var(--secondary-text);
  margin: 0;
}

/* ============================================================================
   筛选器区域(复用"我的题库"样式)
   ============================================================================ */
.filter-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 12px 24px rgba(17, 36, 80, 0.06);
  border: 1px solid #e4eaf2;
  display: flex;
  align-items: center;
  gap: 20px;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-text);
  flex-shrink: 0;
}

.project-select {
  min-width: 220px;
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  background: #ffffff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.project-select:hover {
  border-color: rgba(0, 0, 0, 0.2);
}

.project-select:focus {
  outline: none;
  border-color: var(--student-primary);
  box-shadow: 0 0 0 3px rgba(255, 68, 61, 0.1);
}

.subject-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
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

.subject-tab:hover {
  background: rgba(255, 68, 61, 0.08);
  color: var(--student-primary);
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

/* ============================================================================
   学习阶段筛选器
   ============================================================================ */
.stage-filter {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e4eaf2;
  box-shadow: 0 12px 24px rgba(17, 36, 80, 0.06);
  margin-bottom: 24px;
}

.stage-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-text);
}

.stage-button {
  position: relative;
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  background: transparent;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.stage-button:hover {
  background: rgba(255, 68, 61, 0.08);
  color: #ff443d;
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

/* ============================================================================
   答题记录列表(复用"我的题库"试卷卡片样式)
   ============================================================================ */
.records-section {
  min-height: 400px;
}

.empty-state {
  padding: 80px 20px;
  text-align: center;
  background: var(--panel-bg);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-text);
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 14px;
  color: var(--secondary-text);
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.record-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px;
  border-radius: 16px;
  border: 1px solid #e4eaf2;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.record-item:hover {
  border-color: rgba(0, 0, 0, 0.12);
  background: #fafafa;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
}

.record-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.record-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-text);
  display: flex;
  align-items: center;
  gap: 6px;
}

.record-icon {
  font-size: 16px;
}

.record-subtitle {
  font-size: 13px;
  color: var(--secondary-text);
  display: flex;
  align-items: center;
  gap: 6px;
}

.divider {
  color: #ddd;
}

.record-actions {
  display: flex;
  gap: 10px;
}

.primary-link {
  padding: 6px 16px;
  background: linear-gradient(135deg, var(--student-primary) 0%, #ff6659 100%);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(255, 68, 61, 0.2);
  display: flex;
  align-items: center;
  gap: 4px;
}

.primary-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 68, 61, 0.3);
}

.primary-link .arrow {
  font-size: 13px;
  font-weight: bold;
  transition: transform 0.2s;
}

.primary-link:hover .arrow {
  transform: translateX(3px);
}

/* ============================================================================
   需求文档区域
   ============================================================================ */
.requirements-section {
  padding: 40px;
  max-width: 1000px;
  margin: 0 auto;
  background: var(--panel-bg);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.requirements-section h2 {
  font-size: 28px;
  color: var(--primary-text);
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 3px solid var(--student-primary);
}

.requirements-section h3 {
  font-size: 20px;
  color: var(--primary-text);
  margin-top: 32px;
  margin-bottom: 16px;
}

.requirements-section ul {
  margin-left: 24px;
  line-height: 1.8;
}

.requirements-section li {
  margin-bottom: 8px;
}

/* 表格样式 */
.spec-table,
.acceptance-criteria {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  overflow: hidden;
}

.spec-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.acceptance-criteria thead {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.spec-table th,
.acceptance-criteria th {
  color: #ffffff;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 13px;
}

.spec-table td,
.acceptance-criteria td {
  padding: 12px 16px;
  border-bottom: 1px solid #e4eaf2;
  color: var(--primary-text);
  font-size: 14px;
  line-height: 1.6;
}

.spec-table tbody tr:hover,
.acceptance-criteria tbody tr:hover {
  background: #f8f9fa;
}

/* ============================================================================
   样式指南区域
   ============================================================================ */
.style-guide-section {
  padding: 40px;
  max-width: 1000px;
  margin: 0 auto;
  background: var(--panel-bg);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.style-guide-section h2 {
  font-size: 28px;
  color: var(--primary-text);
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 3px solid var(--student-primary);
}

.style-guide-section h3 {
  font-size: 20px;
  color: var(--primary-text);
  margin-top: 32px;
  margin-bottom: 16px;
}

/* ============================================================================
   响应式设计
   ============================================================================ */
@media (max-width: 768px) {
  .navbar-content {
    padding: 0 16px;
  }

  .nav-menu {
    display: none;
  }

  .main-content {
    padding: 16px;
  }

  .filter-section {
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

  .record-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .record-actions {
    width: 100%;
  }

  .primary-link {
    width: 100%;
    justify-content: center;
  }

  .requirements-section,
  .style-guide-section {
    padding: 20px;
  }
}
</style>
