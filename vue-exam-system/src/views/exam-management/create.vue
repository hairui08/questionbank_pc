<template>
  <AppLayout :title="`题库系统 - ${isEditMode ? '编辑试卷' : '创建试卷'}`">
    <div class="create-exam-page">
      <!-- 顶部操作栏 -->
      <div class="top-bar">
        <button class="btn secondary" @click="handleBack">
          ← 返回列表
        </button>
        <div class="top-actions">
          <button class="btn accent" @click="handleRandomSelect">
            🎲 随机组卷
          </button>
          <button
            class="btn info"
            :disabled="!canPreview"
            @click="handlePreview"
          >
            👁️ 预览试卷
          </button>
          <button class="btn primary" @click="handleSave">
            💾 保存试卷
          </button>
        </div>
      </div>

      <!-- 基础信息面板 (顶部横向展示) -->
      <BasicInfoForm
        ref="basicInfoFormRef"
        v-model="examForm"
        :total-score="totalScore"
        :required-count="requiredCount"
        :optional-count="optionalCount"
      />

      <!-- 主内容区 -->
      <div class="content-grid">
        <!-- 左侧: 题型导航 -->
        <div class="left-panel">
          <QuestionNavigator
            :questions="examForm.questions"
            :active-question-id="activeQuestionId"
            @scroll-to-type="scrollToType"
            @scroll-to-question="scrollToQuestion"
            @batch-update-score="handleBatchUpdateScore"
            @move-type-up="handleMoveTypeUp"
            @move-type-down="handleMoveTypeDown"
          />
        </div>

        <!-- 右侧: 题目列表面板 -->
        <div class="center-panel">
          <QuestionListPanel
            :questions="examForm.questions"
            @create-question="handleCreateQuestion"
            @select-from-bank="handleSelectFromBank"
            @remove-question="handleRemoveQuestion"
            @update-score="handleUpdateScore"
            @toggle-optional="handleToggleOptional"
            @move-up="handleMoveUp"
            @move-down="handleMoveDown"
          />
        </div>
      </div>
    </div>

    <!-- 选题弹窗 -->
    <SelectQuestionModal
      :show="showSelectModal"
      :subject-id="subjectId"
      :exclude-ids="excludeQuestionIds"
      @close="showSelectModal = false"
      @confirm="handleConfirmSelect"
    />

    <!-- 随机组卷弹窗 -->
    <RandomSelectModal
      :show="showRandomModal"
      :subject-id="subjectId"
      :exclude-ids="excludeQuestionIds"
      @close="showRandomModal = false"
      @confirm="handleConfirmRandom"
    />

    <!-- 预览试卷抽屉 -->
    <ExamPreviewDrawer
      v-model="showPreviewDrawer"
      :exam-form="examForm"
    />

    <!-- 创建试题抽屉 -->
    <CreateQuestionDrawer
      v-model="showCreateDrawer"
      :subject-id="examForm.subjectId"
      :project-id="examForm.projectId"
      @confirm="handleConfirmCreate"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppLayout from '@/components/Layout/AppLayout.vue'
import QuestionNavigator from './components/QuestionNavigator.vue'
import QuestionListPanel from './components/QuestionListPanel.vue'
import BasicInfoForm from './components/BasicInfoForm.vue'
import SelectQuestionModal from './components/SelectQuestionModal.vue'
import RandomSelectModal from './components/RandomSelectModal.vue'
import ExamPreviewDrawer from './components/ExamPreviewDrawer.vue'
import CreateQuestionDrawer from './components/CreateQuestionDrawer.vue'
import { useExamStore } from '@/stores/exam'
import { useProjectStore } from '@/stores/project'
import { useQuestionStore } from '@/stores/question'
import { useToast } from '@/composables/useToast'
import type { ExamForm, ExamQuestion } from './types'

const router = useRouter()
const route = useRoute()
const examStore = useExamStore()
const projectStore = useProjectStore()
const questionStore = useQuestionStore()
const { showToast } = useToast()

// 是否为编辑模式
const isEditMode = computed(() => !!route.params.id)

// 基础信息表单ref
const basicInfoFormRef = ref<InstanceType<typeof BasicInfoForm> | null>(null)

// 试卷表单数据
const examForm = ref<ExamForm>({
  name: '',
  subjectId: '',
  projectId: '',
  learningStageId: '',
  passingScore: 60,
  questions: [],
  year: new Date().getFullYear(),
  validFrom: '',
  validTo: ''
})

// 选题弹窗显示状态
const showSelectModal = ref(false)

// 随机组卷弹窗显示状态
const showRandomModal = ref(false)

// 预览抽屉显示状态
const showPreviewDrawer = ref(false)

// 创建试题抽屉显示状态
const showCreateDrawer = ref(false)

// 当前激活的题目ID
const activeQuestionId = ref<string>('')

// 当前科目ID
const subjectId = computed(() => examForm.value.subjectId)

// 已添加的试题ID列表
const excludeQuestionIds = computed(() => examForm.value.questions.map(q => q.questionId))

// 计算总分(仅必答题)
const totalScore = computed(() =>
  examForm.value.questions.filter(q => !q.isOptional).reduce((sum, q) => sum + q.score, 0)
)

// 必答题数量
const requiredCount = computed(() =>
  examForm.value.questions.filter(q => !q.isOptional).length
)

// 选答题数量
const optionalCount = computed(() =>
  examForm.value.questions.filter(q => q.isOptional).length
)

// 是否可以预览
const canPreview = computed(() => {
  return examForm.value.questions.length > 0 &&
    examForm.value.name.trim() !== ''
})

// 初始化
onMounted(() => {
  if (isEditMode.value) {
    loadExamData()
  } else {
    initNewExam()
  }
})

// 初始化新试卷
function initNewExam() {
  // 从路由状态获取科目信息
  const state = window.history.state
  console.log('[创建试卷] 路由state:', state)

  if (state && state.subjectId && state.projectId) {
    examForm.value.subjectId = state.subjectId
    examForm.value.projectId = state.projectId
    console.log('[创建试卷] 科目信息已设置:', { subjectId: state.subjectId, projectId: state.projectId })
  } else {
    // 容错: 使用第一个可用科目
    const firstSubject = projectStore.subjects[0]
    if (firstSubject) {
      examForm.value.subjectId = firstSubject.id
      examForm.value.projectId = firstSubject.projectId
      showToast('已自动选择默认科目', { type: 'success' })
      console.log('[创建试卷] 使用默认科目:', firstSubject)
    } else {
      showToast('请先选择科目', { type: 'error' })
      router.back()
    }
  }
}

// 加载试卷数据(编辑模式)
function loadExamData() {
  const examId = route.params.id as string
  const exam = examStore.getExamById(examId)

  if (!exam) {
    showToast('试卷不存在', { type: 'error' })
    router.back()
    return
  }

  examForm.value = {
    name: exam.name,
    subjectId: exam.subjectId,
    projectId: exam.projectId,
    duration: exam.duration,
    passingScore: exam.passingScore,
    questions: [...exam.questions]
  }
}

// 确认选择试题
function handleConfirmSelect(questionIds: string[]) {
  questionIds.forEach(questionId => {
    const question = questionStore.getQuestionById(questionId)
    if (!question) return

    // 获取下一个排序序号
    const nextOrder = examForm.value.questions.length > 0
      ? Math.max(...examForm.value.questions.map(q => q.order)) + 1
      : 1

    const examQuestion: ExamQuestion = {
      questionId,
      type: question.type,
      score: getDefaultScore(question.type),
      order: nextOrder,
      isOptional: false
    }

    examForm.value.questions.push(examQuestion)
  })

  showSelectModal.value = false
  showToast(`成功添加 ${questionIds.length} 道试题`, { type: 'success' })
}

// 获取默认分值
function getDefaultScore(type: string): number {
  const defaultScores: Record<string, number> = {
    single: 5,
    multiple: 10,
    judgment: 5,
    uncertain: 10,
    essay: 20,
    combination: 50
  }
  return defaultScores[type] || 10
}

// 移除试题
function handleRemoveQuestion(questionId: string) {
  const index = examForm.value.questions.findIndex(q => q.questionId === questionId)
  if (index > -1) {
    examForm.value.questions.splice(index, 1)
    // 重新排序
    examForm.value.questions.forEach((q, i) => {
      q.order = i + 1
    })
    showToast('试题已移除', { type: 'success' })
  }
}

// 更新分值
function handleUpdateScore(questionId: string, score: number) {
  const question = examForm.value.questions.find(q => q.questionId === questionId)
  if (question) {
    question.score = score
  }
}

// 切换选答状态
function handleToggleOptional(questionId: string) {
  const question = examForm.value.questions.find(q => q.questionId === questionId)
  if (question) {
    question.isOptional = !question.isOptional
  }
}

// 上移
function handleMoveUp(questionId: string) {
  const index = examForm.value.questions.findIndex(q => q.questionId === questionId)
  if (index > 0) {
    const temp = examForm.value.questions[index]
    examForm.value.questions[index] = examForm.value.questions[index - 1]
    examForm.value.questions[index - 1] = temp
    // 重新排序
    examForm.value.questions.forEach((q, i) => {
      q.order = i + 1
    })
  }
}

// 下移
function handleMoveDown(questionId: string) {
  const index = examForm.value.questions.findIndex(q => q.questionId === questionId)
  if (index < examForm.value.questions.length - 1) {
    const temp = examForm.value.questions[index]
    examForm.value.questions[index] = examForm.value.questions[index + 1]
    examForm.value.questions[index + 1] = temp
    // 重新排序
    examForm.value.questions.forEach((q, i) => {
      q.order = i + 1
    })
  }
}

// 批量更新某一题型的分值
function handleBatchUpdateScore(type: string, score: number) {
  let updatedCount = 0
  examForm.value.questions.forEach(question => {
    if (question.type === type) {
      question.score = score
      updatedCount++
    }
  })

  if (updatedCount > 0) {
    showToast(`成功设置 ${updatedCount} 道${getTypeName(type)}的分值为 ${score} 分`, { type: 'success' })
  }
}

// 题型上移
function handleMoveTypeUp(type: string) {
  // 找出该题型的所有试题
  const typeQuestions = examForm.value.questions.filter(q => q.type === type)
  if (typeQuestions.length === 0) return

  // 找到该题型第一题的索引
  const firstIndex = examForm.value.questions.indexOf(typeQuestions[0])

  // 如果已经是第一题,不能上移
  if (firstIndex === 0) return

  // 移除该题型的所有试题
  examForm.value.questions = examForm.value.questions.filter(q => q.type !== type)

  // 在前一题的位置插入
  examForm.value.questions.splice(firstIndex - 1, 0, ...typeQuestions)

  // 重新排序
  examForm.value.questions.forEach((q, i) => {
    q.order = i + 1
  })

  showToast(`${getTypeName(type)}已上移`, { type: 'success' })
}

// 题型下移
function handleMoveTypeDown(type: string) {
  // 找出该题型的所有试题
  const typeQuestions = examForm.value.questions.filter(q => q.type === type)
  if (typeQuestions.length === 0) return

  // 找到该题型最后一题的索引
  const lastIndex = examForm.value.questions.indexOf(typeQuestions[typeQuestions.length - 1])

  // 如果已经是最后一题,不能下移
  if (lastIndex === examForm.value.questions.length - 1) return

  // 移除该题型的所有试题
  examForm.value.questions = examForm.value.questions.filter(q => q.type !== type)

  // 在后一题的位置插入
  examForm.value.questions.splice(lastIndex - typeQuestions.length + 2, 0, ...typeQuestions)

  // 重新排序
  examForm.value.questions.forEach((q, i) => {
    q.order = i + 1
  })

  showToast(`${getTypeName(type)}已下移`, { type: 'success' })
}

// 获取题型名称
function getTypeName(type: string): string {
  const typeNames: Record<string, string> = {
    single: '单选题',
    multiple: '多选题',
    judgment: '判断题',
    uncertain: '不定项',
    essay: '简答题',
    combination: '组合题'
  }
  return typeNames[type] || type
}

// 创建试题
function handleCreateQuestion() {
  if (!examForm.value.subjectId) {
    showToast('请先填写试卷的科目信息', { type: 'error' })
    return
  }
  showCreateDrawer.value = true
}

// 从题库选择试题
function handleSelectFromBank() {
  if (!examForm.value.subjectId) {
    showToast('请先填写试卷的科目信息', { type: 'error' })
    return
  }
  showSelectModal.value = true
}

// 确认创建试题
function handleConfirmCreate(examQuestion: ExamQuestion) {
  // 设置排序序号
  examQuestion.order = examForm.value.questions.length + 1

  // 直接添加到试卷（包含嵌入数据）
  examForm.value.questions.push(examQuestion)

  showToast('试题已添加到试卷', { type: 'success' })
}

// 选择试题
function handleSelectQuestion() {
  if (!examForm.value.subjectId) {
    showToast('请先选择科目', { type: 'error' })
    return
  }
  showSelectModal.value = true
}

// 随机组卷
function handleRandomSelect() {
  if (!examForm.value.subjectId) {
    showToast('请先选择科目', { type: 'error' })
    return
  }
  showRandomModal.value = true
}

// 确认随机组卷
function handleConfirmRandom(questionIds: string[]) {
  handleConfirmSelect(questionIds)
  showRandomModal.value = false
}

// 滚动到题型
function scrollToType(type: string) {
  const element = document.querySelector(`[data-type="${type}"]`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// 滚动到题目
function scrollToQuestion(questionId: string) {
  activeQuestionId.value = questionId
  const element = document.querySelector(`[data-question-id="${questionId}"]`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

// 预览试卷
function handlePreview() {
  if (!canPreview.value) {
    if (examForm.value.questions.length === 0) {
      showToast('请先添加试题', { type: 'error' })
    } else if (examForm.value.name.trim() === '') {
      showToast('请先填写试卷名称', { type: 'error' })
    }
    return
  }
  showPreviewDrawer.value = true
}

// 保存试卷
function handleSave() {
  // 验证基础信息
  if (!basicInfoFormRef.value?.validate()) {
    showToast('请检查基础信息', { type: 'error' })
    return
  }

  // 验证试题列表
  if (examForm.value.questions.length === 0) {
    showToast('请至少添加一道试题', { type: 'error' })
    return
  }

  // 验证及格分
  if (examForm.value.passingScore > totalScore.value) {
    showToast(`及格分不能超过总分(${totalScore.value}分)`, { type: 'error' })
    return
  }

  try {
    if (isEditMode.value) {
      examStore.updateExam(route.params.id as string, examForm.value)
      showToast('试卷更新成功', { type: 'success' })
    } else {
      examStore.addExam(examForm.value)
      showToast('试卷创建成功', { type: 'success' })
    }
    router.push('/exam-management')
  } catch (error) {
    showToast('保存失败,请重试', { type: 'error' })
  }
}

// 返回列表
function handleBack() {
  router.push('/exam-management')
}
</script>

<style scoped>
.create-exam-page {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
}

.top-actions {
  display: flex;
  gap: 12px;
}

.content-grid {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 24px;
  min-height: calc(100vh - 340px);
}

.left-panel {
  align-self: start;
  position: sticky;
  top: 20px;
}

.center-panel {
  /* 使用网页滚动条,不设置独立滚动 */
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.btn.primary {
  background: linear-gradient(180deg, #4f77ff 0%, #2f57e3 100%);
  color: #ffffff;
  border-color: #375edf;
  box-shadow: 0 2px 6px rgba(79, 119, 255, 0.3);
}

.btn.primary:hover {
  background: linear-gradient(180deg, #4b6ee6 0%, #264acc 100%);
}

.btn.secondary {
  background: #ffffff;
  color: var(--accent);
  border-color: rgba(0, 102, 204, 0.4);
}

.btn.secondary:hover {
  background: rgba(0, 102, 204, 0.08);
}

.btn.accent {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
  color: #ffffff;
  border-color: #ff6b6b;
  box-shadow: 0 2px 6px rgba(255, 107, 107, 0.3);
}

.btn.accent:hover {
  background: linear-gradient(135deg, #ff5252 0%, #ff7043 100%);
}

.btn.info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border-color: #667eea;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
}

.btn.info:hover:not(:disabled) {
  background: linear-gradient(135deg, #5568d3 0%, #6a3f91 100%);
}

.btn.info:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 1440px) {
  .content-grid {
    grid-template-columns: 220px 1fr;
  }
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .left-panel {
    position: static;
  }
}
</style>
