<!-- src/views/student/practice-analysis.vue -->
<template>
  <div class="analysis-page" :style="{ background: bgColorMap[uiBg] }">
    <ExamHeader />
    <div class="analysis-container">
      <div class="question-section">
        <QuestionPanel
          v-if="currentQuestion"
          :question="currentQuestion"
          :exam-title="examTitle"
          :exam-type="'chapter'"
          :current-index="currentIndex"
          :total-questions="questions.length"
          :user-answer="answers[currentQuestion.id]?.answer ?? null"
          :font-size="uiFontSize"
          :readonly="true"
          :is-favorite="isFavoriteCurrent"
          :panel-bg="bgColorMap[uiBg]"
          @toggle-favorite="toggleFavorite"
          @previous="prev"
          @next="next"
          @open-qa="showQAPanel = true"
        />
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
    <!-- 右侧悬浮答疑面板 -->
    <div v-if="showQAPanel" class="qa-panel-floating">
      <QAPanel :font-size="uiFontSize" :question-id="currentQuestion?.id" @close="showQAPanel = false" />
    </div>
    <ScientificCalculator :show="showCalculator" @close="showCalculator = false" />
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QuestionPanel from '@/components/QuestionBank/ExamResult/Practice/QuestionPanel.vue'
import AnswerCard from '@/components/QuestionBank/ExamResult/Practice/AnswerCard.vue'
import ExamHeader from '@/components/QuestionBank/Common/ExamHeader.vue'
import ScientificCalculator from '@/components/QuestionBank/Common//ScientificCalculator.vue'
import Toast from '@/components/Feedback/Toast.vue'
import QAPanel from '@/components/QuestionBank/AnswerQuestion/QAPanel.vue'
import { useQuestionStore } from '@/stores/question'
import type { Question } from '@/views/question-management/types'
import type { UserAnswer } from '@/stores/examSession'

const route = useRoute()
const router = useRouter()
const questionStore = useQuestionStore()

const examTitle = ref('第1章·会计政策变更专项练习')
const questions = ref<Question[]>([])
const answers = ref<Record<string, UserAnswer>>({})
const currentIndex = ref(0)

const currentQuestion = computed(() => questions.value[currentIndex.value])
const favoriteIds = ref<Set<string>>(new Set())
const isFavoriteCurrent = computed(() => !!(currentQuestion.value && favoriteIds.value.has(currentQuestion.value.id)))
function toggleFavorite() {
  const q = currentQuestion.value
  if (!q) return
  const next = new Set(favoriteIds.value)
  if (next.has(q.id)) next.delete(q.id)
  else next.add(q.id)
  favoriteIds.value = next
}

const showCalculator = ref(false)
const showQAPanel = ref(false)
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
  if (i >= 0 && i < questions.value.length) currentIndex.value = i
}

function prev() {
  if (currentIndex.value > 0) currentIndex.value--
}

function next() {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
    showQAPanel.value = false
  }
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
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: rgb(244, 245, 247) !important
}
.analysis-container {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
  padding: 20px 32px;
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
  top: 20px;
  height: fit-content;
  max-height: calc(100vh - 100px);
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
  .analysis-container {
    grid-template-columns: 1fr 320px;
    gap: 16px;
    padding: 16px;
  }
  .qa-panel-floating {
    display: none;
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