<template>
  <div class="result-page">
    <!-- 头部 -->
    <ExamHeader />

    <div class="result-container">
      <!-- 成绩卡片 -->
      <div class="score-card">
        <div class="score-section">
          <div class="score-icon">{{ scoreIcon }}</div>
          <div class="score-value">{{ scoreResult?.score.toFixed(1) }}分</div>
          <div class="score-label">总分</div>
        </div>

        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ scoreResult?.totalQuestions }}</div>
            <div class="stat-label">题目总数</div>
          </div>

          <div class="stat-item stat-correct">
            <div class="stat-value">{{ scoreResult?.correctCount }}</div>
            <div class="stat-label">答对题数</div>
          </div>

          <div class="stat-item stat-incorrect">
            <div class="stat-value">{{ scoreResult?.incorrectCount }}</div>
            <div class="stat-label">答错题数</div>
          </div>

          <div class="stat-item stat-partial">
            <div class="stat-value">{{ scoreResult?.partialCount }}</div>
            <div class="stat-label">部分正确</div>
          </div>

          <div class="stat-item stat-unanswered">
            <div class="stat-value">{{ scoreResult?.unansweredCount }}</div>
            <div class="stat-label">未作题数</div>
          </div>

          <div class="stat-item">
            <div class="stat-value">{{ timeSpent }}</div>
            <div class="stat-label">用时</div>
          </div>
        </div>
      </div>

      <!-- 题目详情 -->
      <div class="questions-detail">
        <div class="detail-header">
          <div class="header-left">
            <h2>题目详情</h2>
            <button class="delete-record-btn" @click="handleDeleteRecord">
              删除记录
              <span class="icon">×</span>
            </button>
          </div>
          <div class="filter-buttons">
            <button
              v-for="filter in filterOptions"
              :key="filter.value"
              class="filter-button"
              :class="{ 'is-active': activeFilter === filter.value }"
              @click="activeFilter = filter.value"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>

        <div class="questions-list">
          <div
            v-for="(q, index) in filteredQuestions"
            :key="q.id"
            class="question-item"
          >
            <div class="question-number-badge" :class="getQuestionStatusClass(q.id)">
              {{ index + 1 }}
            </div>

            <div class="question-content">
              <div class="question-stem">{{ q.stem }}</div>

              <div class="answer-section">
                <div class="answer-row">
                  <span class="answer-label">您的答案：</span>
                  <span class="answer-value">{{ getUserAnswerText(q.id) }}</span>
                  <span class="answer-status" :class="getQuestionStatusClass(q.id)">
                    {{ getAnswerStatusText(q.id) }}
                  </span>
                </div>

                <div class="answer-row">
                  <span class="answer-label">正确答案：</span>
                  <span class="answer-value correct">{{ getCorrectAnswerText(q) }}</span>
                </div>
              </div>

              <div v-if="q.explanation" class="explanation">
                <strong>解析：</strong>{{ q.explanation }}
              </div>
            </div>
          </div>

          <div v-if="filteredQuestions.length === 0" class="empty-state">
            暂无{{ activeFilterLabel }}的题目
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button class="action-btn secondary" @click="backToRecords">
          返回答题记录
        </button>
        <button class="action-btn primary" @click="redoExam">
          重新做题
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useExamSessionStore } from '@/stores/examSession'
import { useQuestionStore } from '@/stores/question'
import ExamHeader from '@/components/Exam/ExamHeader.vue'
import type { Question } from '@/views/question-management/types'
import type { UserAnswer } from '@/stores/examSession'

const router = useRouter()
const route = useRoute()
const examSessionStore = useExamSessionStore()
const questionStore = useQuestionStore()

const activeFilter = ref<'all' | 'correct' | 'incorrect' | 'partial' | 'unanswered'>('all')

// 历史记录数据状态
const historyRecord = ref<{
  examId: string
  examTitle: string
  questions: Question[]
  answers: Record<string, UserAnswer>
  score: number
  totalScore: number
  timeSpent: number
  correctCount: number
  incorrectCount: number
  partialCount: number
  unansweredCount: number
} | null>(null)

// 成绩结果（兼容两种模式）
const scoreResult = computed(() => {
  if (historyRecord.value) {
    // 历史记录模式
    return {
      score: historyRecord.value.score,
      totalQuestions: historyRecord.value.questions.length,
      correctCount: historyRecord.value.correctCount,
      incorrectCount: historyRecord.value.incorrectCount,
      partialCount: historyRecord.value.partialCount,
      unansweredCount: historyRecord.value.unansweredCount,
      timeSpent: historyRecord.value.timeSpent
    }
  }
  // 当前会话模式
  return examSessionStore.calculateScore()
})

// 当前会话
const currentSession = computed(() => examSessionStore.currentSession)

// 题目列表（兼容两种模式）
const questions = computed(() => {
  if (historyRecord.value) {
    return historyRecord.value.questions  // 历史记录模式
  }
  return currentSession.value?.questions || []  // 当前会话模式
})

// 答案记录（兼容两种模式）
const answers = computed(() => {
  if (historyRecord.value) {
    return historyRecord.value.answers  // 历史记录模式
  }
  return examSessionStore.answers  // 当前会话模式
})

// 用时
const timeSpent = computed(() => {
  if (!scoreResult.value) return '--'
  const ms = scoreResult.value.timeSpent
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}分${seconds}秒`
})

// 分数图标
const scoreIcon = computed(() => {
  const score = scoreResult.value?.score || 0
  if (score >= 90) return '🎉'
  if (score >= 80) return '👍'
  if (score >= 60) return '😊'
  return '💪'
})

// 筛选选项
const filterOptions = [
  { label: '全部', value: 'all' as const },
  { label: '答对', value: 'correct' as const },
  { label: '答错', value: 'incorrect' as const },
  { label: '部分正确', value: 'partial' as const },
  { label: '未作答', value: 'unanswered' as const }
]

const activeFilterLabel = computed(() => {
  return filterOptions.find(f => f.value === activeFilter.value)?.label || ''
})

// 筛选后的题目
const filteredQuestions = computed(() => {
  if (activeFilter.value === 'all') {
    return questions.value
  }

  return questions.value.filter(q => {
    const answer = answers.value[q.id]

    if (activeFilter.value === 'unanswered') {
      return !answer || answer.answer === null
    }

    if (!answer) return false

    if (activeFilter.value === 'correct') {
      return answer.isCorrect
    }

    if (activeFilter.value === 'partial') {
      return answer.isPartial
    }

    if (activeFilter.value === 'incorrect') {
      return !answer.isCorrect && !answer.isPartial
    }

    return true
  })
})

// 获取题目状态类名
function getQuestionStatusClass(questionId: string): string {
  const answer = answers.value[questionId]

  if (!answer || answer.answer === null) {
    return 'status-unanswered'
  }

  if (answer.isCorrect) {
    return 'status-correct'
  }

  if (answer.isPartial) {
    return 'status-partial'
  }

  return 'status-incorrect'
}

// 获取用户答案文本
function getUserAnswerText(questionId: string): string {
  const answer = answers.value[questionId]

  if (!answer || answer.answer === null) {
    return '未作答'
  }

  if (typeof answer.answer === 'boolean') {
    return answer.answer ? '正确' : '错误'
  }

  if (Array.isArray(answer.answer)) {
    return answer.answer.join('、')
  }

  return String(answer.answer)
}

// 获取正确答案文本
function getCorrectAnswerText(question: Question): string {
  const answer = question.answer

  if (question.type === 'judgment') {
    return answer === 'true' ? '正确' : '错误'
  }

  if (Array.isArray(answer)) {
    return answer.join('、')
  }

  return String(answer)
}

// 获取答案状态文本
function getAnswerStatusText(questionId: string): string {
  const answer = answers.value[questionId]

  if (!answer || answer.answer === null) {
    return '未作答'
  }

  if (answer.isCorrect) {
    return '✓ 正确'
  }

  if (answer.isPartial) {
    return '◐ 部分正确'
  }

  return '✗ 错误'
}

// 返回答题记录
function backToRecords() {
  examSessionStore.clearSession()
  router.push('/student/exam-records')
}

// 重新做题
function redoExam() {
  examSessionStore.resetExam()
  router.push({
    name: 'StudentExam',
    params: { id: currentSession.value?.examId }
  })
}

// 删除做题记录
function handleDeleteRecord() {
  const recordId = currentSession.value?.examId
  if (!recordId) return

  if (confirm('确定要删除这条答题记录吗?删除后将无法恢复。')) {
    // TODO: 实际应该从后端删除记录
    // 这里演示清空当前会话并跳转回列表页
    examSessionStore.clearSession()

    // 显示成功提示
    alert('答题记录已删除')

    // 跳转回答题记录列表页,列表会自动刷新
    router.push('/student/exam-records')
  }
}

// 加载历史记录数据
function loadHistoryRecord(examId: string) {
  // TODO: 后续对接后端 API 获取历史记录详情
  // 暂时使用 mock 数据模拟

  // 从 questionStore 获取题目（模拟数据）
  const mockQuestions = questionStore.mockQuestions.slice(0, 10)

  // 模拟答案数据（根据 examId 生成不同的答案）
  const mockAnswers: Record<string, UserAnswer> = {}
  mockQuestions.forEach((q, index) => {
    // 模拟不同的答题情况
    const isAnswered = index < 8  // 前8题作答，后2题未作答

    if (isAnswered) {
      if (q.type === 'single' || q.type === 'multiple') {
        const correctAnswer = q.answer
        const userAnswer = index < 6 ? correctAnswer : (Array.isArray(correctAnswer) ? ['A'] : 'B')

        mockAnswers[q.id] = {
          questionId: q.id,
          answer: userAnswer,
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
      }
    }
  })

  // 计算统计数据
  const correctCount = Object.values(mockAnswers).filter(a => a.isCorrect).length
  const incorrectCount = Object.values(mockAnswers).filter(a => !a.isCorrect && !a.isPartial && a.answer !== null).length
  const partialCount = Object.values(mockAnswers).filter(a => a.isPartial).length
  const unansweredCount = mockQuestions.length - Object.keys(mockAnswers).length
  const score = (correctCount / mockQuestions.length) * 100

  // 设置历史记录数据
  historyRecord.value = {
    examId,
    examTitle: '第1章·会计政策变更专项练习',  // 暂时硬编码，后续从 API 获取
    questions: mockQuestions,
    answers: mockAnswers,
    score,
    totalScore: 100,
    timeSpent: 25 * 60 * 1000,  // 25分钟
    correctCount,
    incorrectCount,
    partialCount,
    unansweredCount
  }
}

// 页面加载时检查是否有成绩
onMounted(() => {
  const examId = route.params.id as string

  // 检查是否是当前答题会话
  if (currentSession.value?.examId === examId && currentSession.value.isCompleted) {
    // 模式1：使用当前会话数据（刚提交试卷后查看）
    return
  }

  // 模式2：加载历史记录（从答题记录列表进入）
  if (examId) {
    loadHistoryRecord(examId)
  } else {
    // 没有 examId，跳转到答题记录页
    router.push('/student/exam-records')
  }
})
</script>

<style scoped>
.result-page {
  min-height: 100vh;
  background: #f4f5f7;
}

.result-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 20px;
}

/* 成绩卡片 */
.score-card {
  background: linear-gradient(135deg, #ff8a3d 0%, #ff5545 100%);
  border-radius: 20px;
  padding: 40px 32px;
  color: #ffffff;
  margin-bottom: 24px;
  box-shadow: 0 12px 24px rgba(255, 111, 60, 0.3);
}

.score-section {
  text-align: center;
  margin-bottom: 32px;
}

.score-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.score-value {
  font-size: 56px;
  font-weight: 700;
  margin-bottom: 8px;
}

.score-label {
  font-size: 16px;
  opacity: 0.9;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.stat-item .stat-value {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 6px;
}

.stat-item .stat-label {
  font-size: 13px;
  opacity: 0.9;
}

/* 题目详情 */
.questions-detail {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(255, 68, 61, 0.2);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.detail-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.delete-record-btn {
  padding: 6px 16px;
  background: white;
  color: var(--secondary-text, #5a6c7d);
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

.delete-record-btn:hover {
  border-color: #f56565;
  color: #f56565;
  transform: translateY(-2px);
}

.delete-record-btn .icon {
  font-size: 16px;
  font-weight: bold;
}

.filter-buttons {
  display: flex;
  gap: 8px;
}

.filter-button {
  padding: 6px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 999px;
  background: #ffffff;
  font-size: 12px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-button:hover {
  border-color: var(--brand-primary, #ff443d);
  color: var(--brand-primary, #ff443d);
}

.filter-button.is-active {
  border-color: var(--brand-primary, #ff443d);
  background: rgba(255, 68, 61, 0.1);
  color: var(--brand-primary, #ff443d);
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.question-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #fafbfc;
  border-radius: 12px;
  border: 1px solid #e4eaf2;
}

.question-number-badge {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
}

.question-number-badge.status-correct {
  background: #52c41a;
}

.question-number-badge.status-incorrect {
  background: #f5222d;
}

.question-number-badge.status-partial {
  background: #fa8c16;
}

.question-number-badge.status-unanswered {
  background: #999;
}

.question-content {
  flex: 1;
}

.question-stem {
  font-size: 15px;
  line-height: 1.7;
  color: #333;
  margin-bottom: 16px;
}

.answer-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.answer-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.answer-label {
  color: #666;
  font-weight: 500;
}

.answer-value {
  color: #333;
  font-weight: 600;
}

.answer-value.correct {
  color: #52c41a;
}

.answer-status {
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.answer-status.status-correct {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.answer-status.status-incorrect {
  background: rgba(245, 34, 45, 0.1);
  color: #f5222d;
}

.answer-status.status-partial {
  background: rgba(250, 140, 22, 0.1);
  color: #fa8c16;
}

.answer-status.status-unanswered {
  background: rgba(0, 0, 0, 0.05);
  color: #999;
}

.explanation {
  padding: 16px;
  background: #fffbf0;
  border-left: 3px solid #fa8c16;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.7;
  color: #666;
}

.explanation strong {
  color: #fa8c16;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 14px;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.action-btn {
  padding: 14px 32px;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.primary {
  border: none;
  background: linear-gradient(135deg, #ff7b50 0%, #ff4d3a 100%);
  color: #ffffff;
  box-shadow: 0 8px 16px rgba(255, 94, 66, 0.25);
}

.action-btn.primary:hover {
  background: linear-gradient(135deg, #ff5722 0%, #e64a19 100%);
  box-shadow: 0 10px 20px rgba(255, 87, 34, 0.35);
  transform: translateY(-1px);
}

.action-btn.secondary {
  border: 1px solid #e0e0e0;
  background: #ffffff;
  color: #666;
}

.action-btn.secondary:hover {
  border-color: var(--brand-primary, #ff6f3c);
  background: rgba(255, 111, 60, 0.03);
  color: var(--brand-primary, #ff6f3c);
}

@media (max-width: 768px) {
  .result-container {
    padding: 20px 16px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .filter-buttons {
    flex-wrap: wrap;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}
</style>
