<template>
  <div class="exam-page">
    <!-- 头部 -->
    <ExamHeader />

    <!-- 主体内容 -->
    <div class="exam-container">
      <!-- 左侧：试题区 -->
      <div class="question-section">
        <QuestionPanel
          v-if="currentQuestion"
          :question="currentQuestion"
          :exam-title="currentSession?.examTitle || ''"
          :exam-type="currentSession?.examType || ''"
          :current-index="currentSession?.currentIndex || 0"
          :total-questions="currentSession?.questions.length || 0"
          :user-answer="currentUserAnswer"
          :font-size="currentSession?.settings.fontSize || 'medium'"
          @answer-change="handleAnswerChange"
          @previous="handlePrevious"
          @next="handleNext"
        />

        <div v-else class="loading-state">
          <p>加载中...</p>
        </div>
      </div>

      <!-- 右侧：答题卡 -->
      <div class="answer-card-section">
        <AnswerCard
          v-if="currentSession"
          :questions="currentSession.questions"
          :answers="answers"
          :statistics="statistics"
          @go-to-question="handleGoToQuestion"
          @open-calculator="showCalculator = true"
          @open-settings="showSettings = true"
          @reset="handleReset"
          @submit="handleSubmit"
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

    <!-- 继续/重做对话框 -->
    <BaseModal
      :visible="showContinueDialog"
      @update:visible="() => {}"
      title="发现未完成的答题记录"
      :close-on-click-outside="false"
      :show-footer="false"
    >
      <div class="continue-dialog">
        <p class="dialog-message">
          检测到您之前有未完成的答题记录，您希望如何继续？
        </p>

        <div class="dialog-actions">
          <button class="dialog-btn secondary" @click="handleRestart">
            重新做题
          </button>
          <button class="dialog-btn primary" @click="handleContinue">
            继续答题
          </button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useExamSessionStore } from '@/stores/examSession'
import { useQuestionStore } from '@/stores/question'
import ExamHeader from '@/components/Exam/ExamHeader.vue'
import QuestionPanel from '@/components/Exam/QuestionPanel.vue'
import AnswerCard from '@/components/Exam/AnswerCard.vue'
import ScientificCalculator from '@/components/Exam/ScientificCalculator.vue'
import ExamSettings from '@/components/Exam/ExamSettings.vue'
import BaseModal from '@/components/Modal/BaseModal.vue'
import type { ExamSettings as ExamSettingsType } from '@/stores/examSession'

const route = useRoute()
const router = useRouter()
const examSessionStore = useExamSessionStore()
const questionStore = useQuestionStore()

// 弹窗状态
const showCalculator = ref(false)
const showSettings = ref(false)
const showContinueDialog = ref(false)

// 从 store 获取状态
const currentSession = computed(() => examSessionStore.currentSession)
const currentQuestion = computed(() => examSessionStore.currentQuestion)
const answers = computed(() => examSessionStore.answers)
const statistics = computed(() => examSessionStore.statistics)

// 当前题目的用户答案
const currentUserAnswer = computed(() => {
  if (!currentQuestion.value) return null
  const answer = answers.value[currentQuestion.value.id]
  return answer ? answer.answer : null
})

// 初始化答题会话
onMounted(async () => {
  const examId = route.params.id as string

  // 检查是否是错题练习（会话已在 wrong-questions.vue 中创建）
  if (examId.startsWith('wrong-')) {
    // 显示继续/重做对话框（如有未完成会话）
    if (examSessionStore.hasUnfinishedSession) {
      showContinueDialog.value = true
    }
    // 不需要执行 startNewExam，会话已由错题页面创建
    return
  }

  // 普通考试：检查是否有未完成的会话
  if (examSessionStore.hasUnfinishedSession) {
    // 显示继续/重新做题的对话框
    showContinueDialog.value = true
  } else {
    // 开始新的答题会话
    startNewExam(examId)
  }
})

// 开始新的答题会话
function startNewExam(examId: string) {
  // 这里简化处理，从 questionStore 获取题目
  const questions = questionStore.mockQuestions.slice(0, 10) // 取前10道题作为示例

  examSessionStore.startExam(
    examId,
    'chapter', // 暂时固定为章节练习
    '第1章·会计政策变更专项练习',
    's1',
    '会计',
    questions
  )
}

// 处理继续答题
function handleContinue() {
  showContinueDialog.value = false
  examSessionStore.continueExam()
}

// 处理重新做题
function handleRestart() {
  showContinueDialog.value = false
  examSessionStore.resetExam()
}

// 离开页面前提示
onBeforeUnmount(() => {
  // 这里可以添加离开提示逻辑
})

// 处理答案变化
function handleAnswerChange(answer: string | string[] | boolean | null) {
  if (!currentQuestion.value) return
  examSessionStore.saveAnswer(currentQuestion.value.id, answer)
}

// 上一题
function handlePrevious() {
  examSessionStore.previousQuestion()
}

// 下一题
function handleNext() {
  examSessionStore.nextQuestion()
}

// 跳转到指定题目
function handleGoToQuestion(index: number) {
  examSessionStore.goToQuestion(index)
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

// 更新设置
function handleSettingsUpdate(newSettings: Partial<ExamSettingsType>) {
  examSessionStore.updateSettings(newSettings)
}
</script>

<style scoped>
.exam-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f4f5f7;
}

.exam-container {
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

/* 继续/重做对话框样式 */
.continue-dialog {
  padding: 20px 0;
}

.dialog-message {
  font-size: 15px;
  line-height: 1.7;
  color: #333;
  margin: 0 0 24px 0;
  text-align: center;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.dialog-btn {
  min-width: 120px;
  padding: 12px 24px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dialog-btn.primary {
  border: none;
  background: linear-gradient(135deg, #ff7b50 0%, #ff4d3a 100%);
  color: #ffffff;
  box-shadow: 0 8px 16px rgba(255, 94, 66, 0.25);
}

.dialog-btn.primary:hover {
  background: linear-gradient(135deg, #ff5722 0%, #e64a19 100%);
  box-shadow: 0 10px 20px rgba(255, 87, 34, 0.35);
  transform: translateY(-1px);
}

.dialog-btn.secondary {
  border: 1px solid #e0e0e0;
  background: #ffffff;
  color: #666;
}

.dialog-btn.secondary:hover {
  border-color: var(--brand-primary, #ff6f3c);
  background: rgba(255, 111, 60, 0.03);
  color: var(--brand-primary, #ff6f3c);
}
</style>
