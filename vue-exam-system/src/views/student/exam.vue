<template>
  <div class="exam-page" :class="'theme-' + uiBg" :style="{ background: bgColorMap[uiBg] }">
    <!-- 头部 -->
    <div class="exam-header-fixed"><ExamHeader /></div>

    <!-- 主体内容 -->
    <div class="exam-container">
      <!-- 左侧：试题区 -->
      <div class="question-section">
        <template v-if="currentSession">
          <div class="exam-info">
            <button class="back-button" @click="handleBack">
              <span class="back-icon">←</span>
              <span>返回</span>
            </button>
            <span class="exam-type">{{ examTypeLabels[currentSession.examType]}}</span>
            <span class="separator">·</span>
            <span class="exam-title">{{ currentSession.examTitle || '' }}</span>
          </div>
          <div
            v-for="(q, idx) in orderedQuestions"
            :key="q.id"
            class="question-item"
            :id="`question-item-${idx}`"
          >
            <QuestionPanel
              :question="q"
              :exam-type="currentSession.examType || ''"
              :current-index="idx"
              :total-questions="orderedQuestions.length"
              :user-answer="(answers[q.id] && answers[q.id].answer) || null"
              :font-size="uiFontSize"
              @answer-change="(ans) => handleAnswerChangeFor(q.id, ans)"
            />
          </div>
        </template>
        <div v-else class="loading-state">
          <p>加载中...</p>
        </div>
      </div>

      <!-- 右侧：答题卡 -->
      <div class="answer-card-section">
        <AnswerCard
          v-if="currentSession"
          :questions="orderedQuestions"
          :answers="answers"
          :statistics="statistics"
          @go-to-question="handleGoToQuestion"
          @open-calculator="showCalculator = true"
          @open-settings="showSettings = true"
          @reset="handleReset"
          @submit="handleSubmit"
          @save-and-exit="handleSaveAndExit"
          @apply-settings="handleUiApply"
        />
      </div>
    </div>

    <!-- 科学计算器弹窗 -->
    <ScientificCalculator
      :show="showCalculator"
      @close="showCalculator = false"
    />

    <!-- 设置面板弹窗 -->
    <ExamSettings
      v-if="currentSession"
      :show="showSettings"
      :settings="currentSession.settings"
      @close="showSettings = false"
      @update="handleSettingsUpdate"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useExamSessionStore } from '@/stores/examSession'
import { useQuestionStore } from '@/stores/question'
import QuestionPanel from '@/components/QuestionBank/DoQuestion/Exam/QuestionPanel.vue'
import AnswerCard from '@/components/QuestionBank/DoQuestion/Exam/AnswerCard.vue'
import ExamHeader from '@/components/QuestionBank/Common/ExamHeader.vue'
import ScientificCalculator from '@/components/QuestionBank/Common/ScientificCalculator.vue'
import ExamSettings from '@/components/QuestionBank/Common/ExamSettings.vue'
import type { ExamSettings as ExamSettingsType } from '@/stores/examSession'

const route = useRoute()
const router = useRouter()
const examSessionStore = useExamSessionStore()
const questionStore = useQuestionStore()

// 弹窗状态
const showCalculator = ref(false)
const showSettings = ref(false)

const uiBg = ref<'white'|'mint'|'sand'>(loadBg())
const uiFontSize = ref<'small'|'medium'|'large'>(loadFontSize())
const bgColorMap: Record<'white'|'mint'|'sand', string> = { white: '#f4f5f7', mint: '#e9f7ef', sand: '#efefea' }
function loadBg(): 'white'|'mint'|'sand' {
  const b = localStorage.getItem('analysis.bgColor')
  return b === 'mint' || b === 'sand' || b === 'white' ? b : 'white'
}
function loadFontSize(): 'small'|'medium'|'large' {
  const f = localStorage.getItem('analysis.fontSize')
  return f === 'small' || f === 'medium' || f === 'large' ? f : 'medium'
}

// 从 store 获取状态
const currentSession = computed(() => examSessionStore.currentSession)
const answers = computed(() => examSessionStore.answers)
const statistics = computed(() => examSessionStore.statistics)
const orderedQuestions = computed(() => {
  const qs = currentSession.value?.questions || []
  const groups: Record<string, any[]> = {}
  const order: string[] = []
  qs.forEach((q: any) => {
    const t = q.type
    if (!groups[t]) { groups[t] = []; order.push(t) }
    groups[t].push(q)
  })
  return order.flatMap(t => groups[t])
})

// 初始化答题会话
onMounted(async () => {
  const examId = route.params.id as string

  if (examId.startsWith('wrong-')) {
    return
  }

  const cs = examSessionStore.currentSession
  if (cs && cs.examId === examId) {
    examSessionStore.continueExam()
    const t = route.query.title as string | undefined
    const o = route.query.order as string | undefined
    if (o || t) {
      const composed = o && t ? `${o}·${t}` : (t || examSessionStore.currentSession!.examTitle)
      examSessionStore.currentSession!.examTitle = composed
    }
  } else {
    examSessionStore.clearSession()
    startNewExam(examId)
  }
})

// 开始新的答题会话
function startNewExam(examId: string) {
  const questions = questionStore.mockQuestions.slice(0, 10)
  const rawTitle = route.query.title as string | undefined
  const order = route.query.order as string | undefined
  const typeQ = route.query.type as string | undefined
  const examType = (typeQ === 'chapter' || typeQ === 'realExam' || typeQ === 'sprint' || typeQ === 'entrance') ? typeQ : 'chapter'
  const title = order && rawTitle ? `${order}·${rawTitle}` : (rawTitle || '第1章·会计政策变更专项练习')

  examSessionStore.startExam(
    examId,
    examType,
    title,
    's1',
    '会计',
    questions
  )
}

// 离开页面前提示
onBeforeUnmount(() => {
  // 这里可以添加离开提示逻辑
})

// 处理答案变化
function handleAnswerChangeFor(questionId: string, answer: string | string[] | boolean | null) {
  examSessionStore.saveAnswer(questionId, answer)
}

// 跳转到指定题目
function handleGoToQuestion(index: number) {
  examSessionStore.goToQuestion(index)
  const el = document.getElementById(`question-item-${index}`)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// 重做
function handleReset() {
  examSessionStore.resetExam()
}

// 提交试卷
function handleSubmit() {
  const result = examSessionStore.submitExam()
  if (result) {
    // 跳转到成绩页面
    router.push({
      name: 'StudentResult',
      params: { id: currentSession.value?.examId }
    })
  }
}

// 暂存并退出
function handleSaveAndExit() {
  router.push('/student')
}

// 更新设置（弹窗）
function handleSettingsUpdate(newSettings: Partial<ExamSettingsType>) {
  examSessionStore.updateSettings(newSettings)
}

// 来自答题卡的即时设置联动（背景）
function handleUiApply(payload: { fontSize: 'small'|'medium'|'large'; bgColor: 'white'|'mint'|'sand' }) {
  uiFontSize.value = payload.fontSize
  uiBg.value = payload.bgColor
  localStorage.setItem('analysis.fontSize', payload.fontSize)
  localStorage.setItem('analysis.bgColor', payload.bgColor)
}

// 试卷类型标签映射
const examTypeLabels: Record<string, string> = {
  chapter: '章节练习',
  realExam: '历年真题',
  sprint: '考前冲刺',
  entrance: '入学测试'
}

// 返回题库
function handleBack() {
  router.push('/student')
}
</script>

<style scoped>
.exam-page {
  --header-height: 72px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f4f5f7;
}

.exam-header-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.exam-container {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
  padding: 20px 32px;
  padding-top: calc(var(--header-height) + 20px);
  flex: 1;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

.question-section {
  min-height: 600px;
}

.answer-card-section {
  position: sticky;
  top: calc(var(--header-height) + 20px);
  height: fit-content;
  max-height: calc(100vh - var(--header-height) - 60px);
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.loading-state p {
  font-size: 16px;
  color: #999;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .exam-container {
    grid-template-columns: 1fr 320px;
    gap: 16px;
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .exam-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .answer-card-section {
    position: static;
    max-height: none;
  }
}

.theme-mint{ --brand-primary:#52c41a; --brand-tint: rgba(82,196,26,0.12); --panel-border:#cfe8d8; --panel-bg:#e9f7ef; --analysis-bg:#f3fff6; --analysis-border:#cfe8d8; --analysis-title:#43a047 }
.theme-sand{ --brand-primary:#d48806; --brand-tint: rgba(212,136,6,0.12); --panel-border:#eadfcd; --panel-bg:#efefea; --analysis-bg:#fff9f0; --analysis-border:#ffe0a6; --analysis-title:#d48806 }

.exam-info {
  position: sticky;
  top: var(--header-height);
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  border-radius: 16px 16px 0 0;
  background: white;
}

.exam-type {
  margin-left: 20px;
  color: var(--brand-primary, #ff6f3c);
}

.separator {
  color: #ccc;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #ffffff;
  font-size: 13px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
}
</style>
