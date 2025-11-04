import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Question } from '@/views/question-management/types'
import { useQuestionStore } from './question'

// 答题设置接口
export interface ExamSettings {
  fontSize: 'small' | 'medium' | 'large' | 'xlarge'  // 字体大小
  showAnalysis: boolean     // 是否显示解析
  mode: 'practice' | 'exam' // 答题模式：练习模式、考试模式
}

// 用户答案接口
export interface UserAnswer {
  questionId: string
  answer: string | string[] | boolean | null
  isCorrect?: boolean      // 是否正确（实时判断）
  isPartial?: boolean      // 是否部分正确（多选题）
  answeredAt?: number      // 答题时间戳
}

// 答题会话接口
export interface ExamSession {
  examId: string           // 试卷ID
  examType: 'chapter' | 'realExam' | 'sprint' | 'entrance' | 'wrongQuestions'  // 试卷类型
  examTitle: string        // 试卷名称
  subjectId: string        // 科目ID
  subjectName: string      // 科目名称
  questions: Question[]    // 试题列表
  currentIndex: number     // 当前题号（从0开始）
  startTime: number        // 开始时间戳
  endTime?: number         // 结束时间戳
  isCompleted: boolean     // 是否已完成
  settings: ExamSettings   // 答题设置
}

export const useExamSessionStore = defineStore('examSession', () => {
  // 当前答题会话
  const currentSession = ref<ExamSession | null>(null)

  // 用户答案记录 (key: questionId, value: UserAnswer)
  const answers = ref<Record<string, UserAnswer>>({})

  // 默认设置
  const defaultSettings: ExamSettings = {
    fontSize: 'medium',
    showAnalysis: false,
    mode: 'practice'
  }

  // 计算属性：当前题目
  const currentQuestion = computed(() => {
    if (!currentSession.value) return null
    return currentSession.value.questions[currentSession.value.currentIndex]
  })

  // 计算属性：答题统计
  const statistics = computed(() => {
    if (!currentSession.value) {
      return {
        total: 0,
        answered: 0,
        correct: 0,
        incorrect: 0,
        partial: 0,
        unanswered: 0
      }
    }

    const total = currentSession.value.questions.length
    let answered = 0
    let correct = 0
    let incorrect = 0
    let partial = 0

    currentSession.value.questions.forEach(q => {
      const userAnswer = answers.value[q.id]
      if (userAnswer && userAnswer.answer !== null) {
        answered++
        if (userAnswer.isCorrect) {
          correct++
        } else if (userAnswer.isPartial) {
          partial++
        } else {
          incorrect++
        }
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

  // 计算属性：是否有未完成的答题记录
  const hasUnfinishedSession = computed(() => {
    return currentSession.value !== null && !currentSession.value.isCompleted
  })

  /**
   * 开始新的答题会话
   */
  function startExam(
    examId: string,
    examType: 'chapter' | 'realExam' | 'sprint' | 'entrance' | 'wrongQuestions',
    examTitle: string,
    subjectId: string,
    subjectName: string,
    questions: Question[],
    startIndex: number = 0
  ) {
    currentSession.value = {
      examId,
      examType,
      examTitle,
      subjectId,
      subjectName,
      questions,
      currentIndex: startIndex,
      startTime: Date.now(),
      isCompleted: false,
      settings: { ...defaultSettings }
    }

    // 清空答案记录
    answers.value = {}

    // 持久化到 localStorage
    saveToLocalStorage()
  }

  /**
   * 继续未完成的答题会话
   */
  function continueExam() {
    // 从 localStorage 恢复
    loadFromLocalStorage()
  }

  /**
   * 重新开始答题（清空答案记录）
   */
  function resetExam() {
    if (!currentSession.value) return

    // 重置答案
    answers.value = {}

    // 重置当前题号和时间
    currentSession.value.currentIndex = 0
    currentSession.value.startTime = Date.now()
    currentSession.value.endTime = undefined
    currentSession.value.isCompleted = false

    // 持久化
    saveToLocalStorage()
  }

  /**
   * 保存用户答案
   */
  function saveAnswer(questionId: string, answer: string | string[] | boolean | null) {
    const question = currentSession.value?.questions.find(q => q.id === questionId)
    if (!question) return

    // 判断答案正确性
    const { isCorrect, isPartial } = checkAnswer(question, answer)

    answers.value[questionId] = {
      questionId,
      answer,
      isCorrect,
      isPartial,
      answeredAt: Date.now()
    }

    // 持久化
    saveToLocalStorage()

    // 错题自动移出逻辑
    handleWrongQuestionAutoRemove(questionId, isCorrect)
  }

  /**
   * 检查答案正确性
   */
  function checkAnswer(question: Question, answer: string | string[] | boolean | null): { isCorrect: boolean; isPartial: boolean } {
    if (answer === null) {
      return { isCorrect: false, isPartial: false }
    }

    const correctAnswer = question.answer

    // 判断题
    if (question.type === 'judgment') {
      const userAnswer = answer === 'true' || answer === true
      const correct = correctAnswer === 'true' || correctAnswer === true
      return { isCorrect: userAnswer === correct, isPartial: false }
    }

    // 多选题
    if (question.type === 'multiple' || question.type === 'uncertain') {
      const userAnswers = Array.isArray(answer) ? answer.sort() : [answer].sort()
      const correctAnswers = Array.isArray(correctAnswer) ? correctAnswer.sort() : [correctAnswer].sort()

      const isFullyCorrect = JSON.stringify(userAnswers) === JSON.stringify(correctAnswers)

      if (isFullyCorrect) {
        return { isCorrect: true, isPartial: false }
      }

      // 检查是否部分正确
      const hasCorrectOptions = userAnswers.some(a => correctAnswers.includes(a))
      const hasIncorrectOptions = userAnswers.some(a => !correctAnswers.includes(a))
      const isPartial = hasCorrectOptions && !hasIncorrectOptions && userAnswers.length < correctAnswers.length

      return { isCorrect: false, isPartial }
    }

    // 单选题、简答题等
    return { isCorrect: answer === correctAnswer, isPartial: false }
  }

  /**
   * 切换到指定题目
   */
  function goToQuestion(index: number) {
    if (!currentSession.value) return
    if (index < 0 || index >= currentSession.value.questions.length) return
    currentSession.value.currentIndex = index
    saveToLocalStorage()
  }

  /**
   * 上一题
   */
  function previousQuestion() {
    if (!currentSession.value) return
    if (currentSession.value.currentIndex > 0) {
      currentSession.value.currentIndex--
      saveToLocalStorage()
    }
  }

  /**
   * 下一题
   */
  function nextQuestion() {
    if (!currentSession.value) return
    if (currentSession.value.currentIndex < currentSession.value.questions.length - 1) {
      currentSession.value.currentIndex++
      saveToLocalStorage()
    }
  }

  /**
   * 提交试卷
   */
  function submitExam() {
    if (!currentSession.value) return

    currentSession.value.endTime = Date.now()
    currentSession.value.isCompleted = true

    // 持久化
    saveToLocalStorage()

    // 返回成绩统计
    return calculateScore()
  }

  /**
   * 计算成绩
   */
  function calculateScore() {
    if (!currentSession.value) return null

    const stats = statistics.value
    const totalQuestions = stats.total
    const correctCount = stats.correct
    const partialCount = stats.partial

    // 简单计分规则：
    // - 完全正确得满分
    // - 部分正确得一半分
    // - 错误或未答得0分
    const scorePerQuestion = 100 / totalQuestions
    const score = (correctCount * scorePerQuestion) + (partialCount * scorePerQuestion * 0.5)

    return {
      score: Math.round(score * 100) / 100,
      totalQuestions,
      correctCount,
      incorrectCount: stats.incorrect,
      partialCount,
      unansweredCount: stats.unanswered,
      timeSpent: currentSession.value.endTime
        ? currentSession.value.endTime - currentSession.value.startTime
        : Date.now() - currentSession.value.startTime
    }
  }

  /**
   * 更新设置
   */
  function updateSettings(newSettings: Partial<ExamSettings>) {
    if (!currentSession.value) return
    currentSession.value.settings = {
      ...currentSession.value.settings,
      ...newSettings
    }
    saveToLocalStorage()
  }

  /**
   * 开始错题练习会话
   * @param questionIds - 错题ID列表
   * @param subjectId - 科目ID
   * @param subjectName - 科目名称
   * @param title - 练习标题
   * @param startIndex - 起始题目索引（用于从某题开始练习）
   * @returns 是否成功创建会话
   */
  function startWrongQuestionsPractice(
    questionIds: string[],
    subjectId: string,
    subjectName: string,
    title?: string,
    startIndex: number = 0
  ): boolean {
    const questionStore = useQuestionStore()

    // 从题库中获取完整题目数据
    const questions = questionStore.mockQuestions.filter(q => questionIds.includes(q.id))

    if (questions.length === 0) {
      console.error('错题练习：未找到任何题目数据')
      return false
    }

    // 按照questionIds的顺序排列题目
    const sortedQuestions = questionIds
      .map(id => questions.find(q => q.id === id))
      .filter((q): q is Question => q !== undefined)

    // 生成练习会话ID
    const examId = startIndex > 0
      ? `wrong-from-${questionIds[startIndex]}-${Date.now()}`
      : `wrong-all-${Date.now()}`

    // 创建错题练习会话
    startExam(
      examId,
      'wrongQuestions',
      title || `错题专项练习 (${sortedQuestions.length}题)`,
      subjectId,
      subjectName,
      sortedQuestions,
      startIndex
    )

    return true
  }

  /**
   * 处理错题自动移出逻辑
   * @param questionId - 题目ID
   * @param isCorrect - 是否答对
   */
  function handleWrongQuestionAutoRemove(questionId: string, isCorrect: boolean) {
    // 检查是否启用自动移出
    const autoRemoveConfig = sessionStorage.getItem('wrongQuestionAutoRemove')
    if (!autoRemoveConfig) return

    try {
      const config = JSON.parse(autoRemoveConfig)
      if (!config.enabled) return

      const requiredCorrectCount = config.removeAfter || 1

      // 获取该题的答对记录
      const storageKey = `wrongQuestion_${questionId}_correctCount`
      const currentCount = parseInt(localStorage.getItem(storageKey) || '0')

      if (isCorrect) {
        const newCount = currentCount + 1

        if (newCount >= requiredCorrectCount) {
          // 达到要求,触发移出事件
          console.log(`题目 ${questionId} 已连续答对 ${newCount} 次,触发自动移出`)

          // 清除计数
          localStorage.removeItem(storageKey)

          // 触发自定义事件通知错题列表页面
          window.dispatchEvent(new CustomEvent('wrongQuestionRemoved', {
            detail: { questionId }
          }))
        } else {
          // 未达到要求,更新计数
          localStorage.setItem(storageKey, newCount.toString())
          console.log(`题目 ${questionId} 答对次数: ${newCount}/${requiredCorrectCount}`)
        }
      } else {
        // 答错了,重置计数
        if (currentCount > 0) {
          localStorage.removeItem(storageKey)
          console.log(`题目 ${questionId} 答错,重置计数`)
        }
      }
    } catch (e) {
      console.error('处理错题自动移出失败:', e)
    }
  }

  /**
   * 清除当前会话
   */
  function clearSession() {
    currentSession.value = null
    answers.value = {}
    localStorage.removeItem('examSession')
    localStorage.removeItem('examAnswers')
  }

  /**
   * 持久化到 localStorage
   */
  function saveToLocalStorage() {
    if (currentSession.value) {
      localStorage.setItem('examSession', JSON.stringify(currentSession.value))
      localStorage.setItem('examAnswers', JSON.stringify(answers.value))
    }
  }

  /**
   * 从 localStorage 恢复
   */
  function loadFromLocalStorage() {
    const sessionData = localStorage.getItem('examSession')
    const answersData = localStorage.getItem('examAnswers')

    if (sessionData) {
      currentSession.value = JSON.parse(sessionData)
    }

    if (answersData) {
      answers.value = JSON.parse(answersData)
    }
  }

  // 初始化时尝试恢复会话
  loadFromLocalStorage()

  return {
    // 状态
    currentSession,
    answers,

    // 计算属性
    currentQuestion,
    statistics,
    hasUnfinishedSession,

    // 方法
    startExam,
    continueExam,
    resetExam,
    saveAnswer,
    goToQuestion,
    previousQuestion,
    nextQuestion,
    submitExam,
    calculateScore,
    updateSettings,
    clearSession,
    startWrongQuestionsPractice
  }
})
