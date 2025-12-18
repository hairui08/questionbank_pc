<!-- src/views/student/practice-analysis.vue -->
<template>
  <div class="analysis-page" :style="{ background: bgColorMap[uiBg] }">
    <!-- 头部 -->
    <div class="exam-header-fixed"><ExamHeader /></div>

    <div class="analysis-container">
      <div class="question-section">
        <div class="exam-info">
            <button class="back-button" @click="handleBack">
              <span class="back-icon">←</span>
              <span>返回</span>
            </button>
            <span class="exam-type">{{ examTypeLabels[currentSession?.examType || 'chapter'] }}</span>
            <span class="separator">·</span>
            <span class="exam-title">{{ currentSession?.examTitle || examTitle }}</span>
        </div>
        <div
          v-for="(q, idx) in questions"
          :key="q.id"
          class="question-item"
          :id="`question-item-${idx}`"
        >
          <QuestionPanel
            :question="q"
            :exam-title="examTitle"
            :exam-type="'chapter'"
            :current-index="idx"
            :total-questions="questions.length"
            :user-answer="answers[q.id]?.answer ?? null"
            :font-size="uiFontSize"
            :readonly="true"
            :is-favorite="favoriteIds.has(q.id)"
            :panel-bg="bgColorMap[uiBg]"
            :stacked="true"
            @toggle-favorite="toggleFavoriteFor(q.id)"
            @open-qa="activeQAQuestionId = q.id"
          />
        </div>
      </div>
      <div class="answer-card-section">
        <AnswerCard
          :questions="questions"
          :answers="answers"
          :statistics="statistics"
          :card-bg="bgColorMap[uiBg]"
          :initial-font-size="uiFontSize"
          :initial-bg-color="uiBg"
          @go-to-question="handleGoToQuestion"
          @open-calculator="showCalculator = true"
          @apply-settings="onApplySettings"
          @back-to-list="backToRecords"
        />
      </div>
    </div>
    <ScientificCalculator :show="showCalculator" @close="showCalculator = false" />
    <!-- 右侧悬浮答疑面板 -->
    <div v-if="showQAPanel" class="qa-panel-floating">
      <QAPanel :font-size="uiFontSize" :question-id="activeQAQuestionId || ''" @close="showQAPanel = false" />
    </div>
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ExamHeader from '@/components/QuestionBank/Common/ExamHeader.vue'
import ScientificCalculator from '@/components/QuestionBank/Common//ScientificCalculator.vue'
import QuestionPanel from '@/components/QuestionBank/ExamResult/Exam/QuestionPanel.vue'
import AnswerCard from '@/components/QuestionBank/ExamResult/Exam/AnswerCard.vue'
import QAPanel from '@/components/QuestionBank/AnswerQuestion/QAPanel.vue'
import Toast from '@/components/Feedback/Toast.vue'
import { useQuestionStore } from '@/stores/question'
import { useExamSessionStore } from '@/stores/examSession'
import type { Question } from '@/views/question-management/types'
import type { UserAnswer } from '@/stores/examSession'

const route = useRoute()
const router = useRouter()
const questionStore = useQuestionStore()
const examSessionStore = useExamSessionStore()
const currentSession = computed(() => examSessionStore.currentSession)

const examTitle = ref('第1章·会计政策变更专项练习')
const questions = ref<Question[]>([])
const answers = ref<Record<string, UserAnswer>>({})

const favoriteIds = ref<Set<string>>(new Set())
function toggleFavoriteFor(id: string) {
  const next = new Set(favoriteIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  favoriteIds.value = next
}

const activeQAQuestionId = ref<string | null>(null)
const showQAPanel = computed({
  get: () => !!activeQAQuestionId.value,
  set: (val) => { if (!val) activeQAQuestionId.value = null }
})

const showCalculator = ref(false)
const uiFontSize = ref<'small'|'medium'|'large'>('medium')
const uiBg = ref<'white'|'mint'|'sand'>('white')
const bgColorMap: Record<'white'|'mint'|'sand', string> = { white: '#ffffff', mint: '#e9f7ef', sand: '#efefea' }
function onApplySettings(payload: { fontSize: 'small'|'medium'|'large'; bgColor: 'white'|'mint'|'sand' }) {
  uiFontSize.value = payload.fontSize
  uiBg.value = payload.bgColor
  localStorage.setItem('analysis.fontSize', payload.fontSize)
  localStorage.setItem('analysis.bgColor', payload.bgColor)
}
function loadUiSettings() {
  const f = localStorage.getItem('analysis.fontSize') as 'small'|'medium'|'large' | null
  if (f === 'small' || f === 'medium' || f === 'large') uiFontSize.value = f
  const b = localStorage.getItem('analysis.bgColor') as 'white'|'mint'|'sand' | null
  if (b === 'white' || b === 'mint' || b === 'sand') uiBg.value = b
}

const statistics = computed(() => {
  const total = questions.value.length
  let answered = 0
  let correct = 0
  let incorrect = 0
  let partial = 0
  questions.value.forEach(q => {
    const a = answers.value[q.id]
    if (a && a.answer !== null) {
      answered++
      if (a.isCorrect) correct++
      else if (a.isPartial) partial++
      else incorrect++
    }
  })
  return {
    total,
    answered,
    correct,
    incorrect,
    partial,
    unanswered: total - answered
  }
})

const examTypeLabels: Record<string, string> = {
  chapter: '章节练习',
  realExam: '历年真题',
  sprint: '考前冲刺',
  entrance: '入学测试'
}

function loadData(examId: string) {
  const mock = questionStore.mockQuestions.slice(0, 10)
  questions.value = mock
  const mockAnswers: Record<string, UserAnswer> = {}
  mock.forEach((q, index) => {
    const isAnswered = index < 8
    if (isAnswered) {
      if (q.type === 'single' || q.type === 'multiple' || q.type === 'uncertain') {
        const correct = q.answer
        const user = index < 6 ? correct : (Array.isArray(correct) ? ['A'] : 'B')
        mockAnswers[q.id] = {
          questionId: q.id,
          answer: user,
          isCorrect: index < 6,
          isPartial: false,
          answeredAt: Date.now() - (10 - index) * 60000
        }
      } else if (q.type === 'judgment') {
        const isCorrect = index < 6
        mockAnswers[q.id] = {
          questionId: q.id,
          answer: isCorrect ? q.answer : (q.answer === 'true' ? 'false' : 'true'),
          isCorrect,
          isPartial: false,
          answeredAt: Date.now() - (10 - index) * 60000
        }
      } else if (q.type === 'essay') {
        mockAnswers[q.id] = {
          questionId: q.id,
          answer: '',
          isCorrect: false,
          isPartial: false,
          answeredAt: Date.now() - (10 - index) * 60000
        }
      }
    }
  })
  answers.value = mockAnswers
}

function handleGoToQuestion(i: number) {
  const el = document.getElementById(`question-item-${i}`)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function handleBack() {
  router.push('/student/exam-records')
}

function backToRecords() {
  router.push('/student/exam-records')
}

onMounted(() => {
  const examId = route.params.id as string
  loadUiSettings()
  loadData(examId)
})
</script>

<style scoped>
.analysis-page {
  --header-height: 72px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: rgb(244, 245, 247) !important;
}

.exam-header-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.analysis-container {
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

/* 右侧悬浮答疑面板 */
.qa-panel-floating {
  position: fixed;
  right: 20px;
  top: 80px;
  bottom: 20px;
  width: 558px;
  z-index: 100;
  border-radius: 12px;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
}

@media (max-width: 1600px) {
  .qa-panel-floating {
    width: 350px;
  }
}

@media (max-width: 1400px) {
  .qa-panel-floating {
    width: 320px;
    right: 10px;
  }
}

@media (max-width: 1200px) {
  .qa-panel-floating {
    display: none;
  }
}

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

.exam-type { color: var(--brand-primary, #ff6f3c); }
.separator { color: #ccc; }
.back-button { display:flex; align-items:center; gap:6px; padding:8px 16px; border:1px solid #e0e0e0; border-radius:8px; background:#ffffff; font-size:13px; font-weight:500; color:#333; cursor:pointer; transition: all 0.2s ease; }
@media (max-width: 1200px) {
  .analysis-container {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
  }
}
@media (max-width: 768px) {
  .analysis-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .answer-card-section {
    position: static;
    max-height: none;
  }
}
</style>
