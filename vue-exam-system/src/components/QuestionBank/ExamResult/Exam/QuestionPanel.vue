<template>
  <div class="question-panel" :class="{ 'is-readonly': readonly }" :style="{ background: panelBgColor }">
    <!-- 顶部信息栏 -->
    <div v-if="!stackedMode" class="panel-header">
      <button class="back-button" @click="handleBack">
        <span class="back-icon">←</span>
        <span>返回</span>
      </button>

      <div class="exam-info">
        <span class="exam-type">{{ subjectName }}</span>
        <span class="separator">·</span>
        <span class="exam-title">{{ examTitle }}</span>
      </div>

      <div class="progress-info">
        <span class="progress-text">{{ currentIndex + 1 }}/{{ totalQuestions }}</span>
      </div>
    </div>

    <!-- 试题内容区 -->
    <div class="question-content" :style="{ fontSize: fontSizeMap[fontSize] }">
      <div class="question-header">
        <span class="question-number">第 {{ currentIndex + 1 }} 题</span>
        <span class="question-type-badge">{{ questionTypeLabel }}</span>
      </div>

      <div class="question-stem" v-html="question.stem"></div>

      <!-- 选项区域（单选、多选、不定项） -->
      <div v-if="isObjectiveQuestion" class="options-area">
        <div
          v-for="option in question.options"
          :key="option.label"
          class="option-item"
          :class="{
            'is-selected': isSelected(option.label),
            'is-correct': isCorrectOption(option.label),
            'is-incorrect': isSelected(option.label) && !isCorrectOption(option.label)
          }"
          @click="handleSelectOption(option.label)"
        >
          <span class="option-label">{{ option.label }}</span>
          <span class="option-content">{{ option.content }}</span>
        </div>
      </div>

      <!-- 判断题 -->
      <div v-if="question.type === 'judgment'" class="judgment-area">
        <button
          class="judgment-button"
          :class="{
            'is-selected': userAnswer === 'true',
            'is-correct': isCorrectJudgment('true'),
            'is-incorrect': userAnswer === 'true' && !isCorrectJudgment('true')
          }"
          @click="handleSelectJudgment('true')"
        >
          正确
        </button>
        <button
          class="judgment-button"
          :class="{
            'is-selected': userAnswer === 'false',
            'is-correct': isCorrectJudgment('false'),
            'is-incorrect': userAnswer === 'false' && !isCorrectJudgment('false')
          }"
          @click="handleSelectJudgment('false')"
        >
          错误
        </button>
      </div>

      <!-- 简答题 -->
      <div v-if="question.type === 'essay'" class="essay-area">
        <textarea
          v-model="essayAnswer"
          class="essay-textarea"
          placeholder="请输入你的答案..."
          @input="handleEssayInput"
        ></textarea>
      </div>
    </div>

    <div v-if="isObjectiveQuestion || question.type === 'judgment'" class="answer-summary" :style="{ fontSize: fontSizeMap[fontSize] }">
      <div class="summary-left">
        <span class="status-pill" :class="`status-${answerStatus}`">{{ statusLabel }}</span>
        <div class="summary-answers">
          <span class="label">正确答案：</span>
          <span class="value correct">{{ correctAnswerText }}</span>
          <span class="label">我的答案：</span>
          <span class="value" :class="answerStatus === 'correct' ? 'correct' : (answerStatus === 'unanswered' ? 'unanswered' : 'incorrect')">
            {{ userAnswerText }}
          </span>
        </div>
      </div>
      <div class="summary-actions">
        <button class="action-link qa-link" title="答疑" @click="handleOpenQA">
          <span class="qa-icon">💬</span>
          <span>答疑</span>
        </button>
        <button class="action-link favorite" :title="favoriteState ? '取消收藏' : '收藏试题'" @click="handleToggleFavorite">
          <span class="star-icon" :class="favoriteState ? 'filled' : 'empty'">{{ favoriteState ? '★' : '☆' }}</span>
          <span>{{ favoriteState ? '取消收藏' : '收藏试题' }}</span>
        </button>
        <button class="action-link" :title="showAnalysis ? '收起解析' : '展开解析'" @click="toggleAnalysis">
          <span class="toggle-icon">{{ showAnalysis ? '🔼' : '🔽' }}</span>
          <span>{{ showAnalysis ? '收起解析' : '展开解析' }}</span>
        </button>
      </div>
    </div>

    <div v-if="showAnalysis" class="analysis-section" :style="{ fontSize: fontSizeMap[fontSize] }">
      <div class="analysis-header">
        <span class="analysis-icon">💡</span>
        <span class="analysis-title">答案解析</span>
      </div>
      <div v-if="chapterSectionPath || knowledgePointNames.length" class="knowledge-line">
        <strong class="kl-label">知识点：</strong>
        <span class="kl-text">
          {{ [chapterSectionPath, knowledgePointNames.join('、')].filter(Boolean).join(' > ') }}
        </span>
      </div>

      <div class="ref-header"><span class="ref-label">参考解析</span></div>
      <div class="explanation-text" v-html="question.explanation"></div>
    </div>

    <div v-if="!stackedMode" class="panel-footer">
      <button
        class="action-button secondary"
        :disabled="isFirstQuestion"
        @click="handlePrevious"
      >
        上一题
      </button>

      <button v-if="!readonly" class="action-button primary" @click="toggleAnalysis">
        {{ showAnalysis ? '隐藏答案' : '查看答案' }}
      </button>

      <button
        class="action-button secondary"
        :disabled="isLastQuestion"
        @click="handleNext"
      >
        下一题
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useKnowledgePointStore } from '@/stores/knowledgePoint'
import { useChapterStore } from '@/stores/chapter'
import { useProjectStore } from '@/stores/project'
import type { Question } from '@/views/question-management/types'

interface Props {
  question: Question
  examTitle: string
  examType: string
  currentIndex: number
  totalQuestions: number
  userAnswer: string | string[] | boolean | null
  fontSize: 'small' | 'medium' | 'large' | 'xlarge'
  readonly?: boolean
  isFavorite?: boolean
  panelBg?: string
  stacked?: boolean
}

const props = defineProps<Props>()

const readonly = computed(() => !!props.readonly)
const favoriteState = ref(!!props.isFavorite)
const panelBgColor = computed(() => props.panelBg || '#ffffff')
const stackedMode = computed(() => !!props.stacked)

const emit = defineEmits<{
  (e: 'answer-change', answer: string | string[] | boolean | null): void
  (e: 'previous'): void
  (e: 'next'): void
  (e: 'toggle-favorite'): void
  (e: 'open-qa'): void
}>()

const router = useRouter()
const knowledgePointStore = useKnowledgePointStore()
const chapterStore = useChapterStore()
const projectStore = useProjectStore()

// 本地状态
const showAnalysis = ref(!!props.readonly)
const essayAnswer = ref('')
const selectedOptions = ref<string[]>([])

// 字体大小映射
const fontSizeMap = {
  small: '13px',
  medium: '14px',
  large: '16px',
  xlarge: '18px'
}

// 试卷类型标签映射
const examTypeLabels: Record<string, string> = {
  chapter: '章节练习',
  realExam: '历年真题',
  sprint: '考前冲刺',
  entrance: '入学测试'
}

const examTypeLabel = computed(() => examTypeLabels[props.examType] || props.examType)
const subjectName = computed(() => projectStore.subjects.find(s => s.id === props.question.subjectId)?.name || '')

// 题型标签映射
const questionTypeLabels: Record<string, string> = {
  single: '单选题',
  multiple: '多选题',
  judgment: '判断题',
  uncertain: '不定项选择题',
  essay: '简答题',
  combination: '组合题'
}

const questionTypeLabel = computed(() => questionTypeLabels[props.question.type] || '未知题型')

// 是否为客观题
const isObjectiveQuestion = computed(() => {
  return ['single', 'multiple', 'uncertain'].includes(props.question.type)
})

// 是否为第一题/最后一题
const isFirstQuestion = computed(() => props.currentIndex === 0)
const isLastQuestion = computed(() => props.currentIndex === props.totalQuestions - 1)

// 正确答案文本
const correctAnswerText = computed(() => {
  const answer = props.question.answer
  if (props.question.type === 'judgment') {
    return answer === 'true' ? '正确' : '错误'
  }
  if (Array.isArray(answer)) {
    return answer.join('、')
  }
  return String(answer)
})

const userAnswerText = computed(() => {
  const ua = props.userAnswer
  if (ua === null) return '未作答'
  if (typeof ua === 'string') {
    const s = ua.trim()
    if (s === '') return '未作答'
    if (props.question.type === 'judgment') return s === 'true' ? '正确' : '错误'
    return s
  }
  if (typeof ua === 'boolean') return ua ? '正确' : '错误'
  if (Array.isArray(ua)) return ua.join('、')
  return String(ua)
})

const answerStatus = computed(() => {
  const ua = props.userAnswer as any
  const a = props.question.answer as any
  if (ua === null || (typeof ua === 'string' && ua.trim() === '')) return 'unanswered'
  if (props.question.type === 'judgment' || props.question.type === 'single') {
    return ua === a ? 'correct' : 'incorrect'
  }
  if (props.question.type === 'multiple' || props.question.type === 'uncertain') {
    const correct = Array.isArray(a) ? a : [String(a)]
    const user = Array.isArray(ua) ? ua : [String(ua)]
    const hasWrong = user.some(x => !correct.includes(x))
    if (hasWrong) return 'incorrect'
    const equal = correct.length === user.length && correct.every(x => user.includes(x))
    return equal ? 'correct' : 'partial'
  }
  return 'unanswered'
})

const statusLabel = computed(() => {
  const map: Record<string, string> = {
    correct: '回答正确',
    incorrect: '回答错误',
    partial: '不全对',
    unanswered: '未作答'
  }
  return map[answerStatus.value] || ''
})

const knowledgePointNames = computed(() => {
  const ids = props.question.knowledgePointIds || []
  return ids.map(id => knowledgePointStore.getKnowledgePointById(id)?.name).filter(Boolean) as string[]
})

const chapterSectionPath = computed(() => {
  const ch = chapterStore.chapters.find(c => c.id === props.question.chapterId)
  const chName = ch?.name || ''
  const secs = chapterStore.getSectionsByChapter(props.question.chapterId).value
  const secName = secs[0]?.name || ''
  return [chName, secName].filter(Boolean).join(' > ')
})

// 初始化用户答案
watch(
  () => props.userAnswer,
  (newAnswer) => {
    if (newAnswer === null) {
      selectedOptions.value = []
      essayAnswer.value = ''
    } else if (Array.isArray(newAnswer)) {
      selectedOptions.value = [...newAnswer]
    } else if (typeof newAnswer === 'string' && props.question.type === 'essay') {
      essayAnswer.value = newAnswer
    }
  },
  { immediate: true }
)

watch(
  () => props.question.id,
  () => {
    showAnalysis.value = !!props.readonly
  }
)

watch(
  () => props.isFavorite,
  (val) => {
    favoriteState.value = !!val
  }
)

// 判断选项是否被选中
function isSelected(optionLabel: string): boolean {
  if (props.question.type === 'single') {
    return props.userAnswer === optionLabel
  }
  return selectedOptions.value.includes(optionLabel)
}

// 判断选项是否正确
function isCorrectOption(optionLabel: string): boolean {
  const correctAnswer = props.question.answer
  if (Array.isArray(correctAnswer)) {
    return correctAnswer.includes(optionLabel)
  }
  return correctAnswer === optionLabel
}

function isCorrectJudgment(value: string): boolean {
  return props.question.type === 'judgment' && props.question.answer === value
}

// 处理选项选择
function handleSelectOption(optionLabel: string) {
  if (props.readonly) return
  if (props.question.type === 'single') {
    // 单选题：直接设置答案
    emit('answer-change', optionLabel)
  } else {
    // 多选题/不定项：切换选中状态
    const index = selectedOptions.value.indexOf(optionLabel)
    if (index > -1) {
      selectedOptions.value.splice(index, 1)
    } else {
      selectedOptions.value.push(optionLabel)
    }
    emit('answer-change', [...selectedOptions.value])
  }
}

// 处理判断题选择
function handleSelectJudgment(value: string) {
  if (props.readonly) return
  emit('answer-change', value)
}

// 处理简答题输入
function handleEssayInput() {
  if (props.readonly) return
  emit('answer-change', essayAnswer.value)
}

function toggleAnalysis() {
  showAnalysis.value = !showAnalysis.value
}


function handleToggleFavorite() {
  favoriteState.value = !favoriteState.value
  emit('toggle-favorite')
}

function handleOpenQA() {
  emit('open-qa')
}

function handlePrevious() {
  emit('previous')
}

function handleNext() {
  emit('next')
}

// 返回题库
function handleBack() {
  router.push({ name: 'StudentExamRecords' })
}
</script>

<style scoped>
.question-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

/* 顶部信息栏 */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #e4eaf2;
  background: transparent;
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

.back-button:hover {
  background: #f5f5f5;
  border-color: var(--brand-primary, #ff6f3c);
  color: var(--brand-primary, #ff6f3c);
}

.back-icon {
  font-size: 16px;
}

.exam-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.exam-type {
  color: var(--brand-primary, #ff6f3c);
}

.separator {
  color: #ccc;
}

.progress-info {
  font-size: 14px;
  font-weight: 600;
  color: var(--brand-primary, #ff6f3c);
}

/* 试题内容区 */
.question-content {
  padding: 24px;
  overflow-y: auto;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.question-number {
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

.question-type-badge {
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(255, 111, 60, 0.1);
  color: var(--brand-primary, #ff6f3c);
  font-size: 12px;
  font-weight: 600;
}

.question-stem {
  font-size: inherit;
  line-height: 1.8;
  color: #333;
  margin-bottom: 24px;
}

/* 选项区域 */
.options-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 18px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-item:hover {
  border-color: var(--brand-primary, #ff6f3c);
  background: rgba(255, 111, 60, 0.03);
}

.option-item.is-selected {
  border-color: var(--brand-primary, #ff6f3c);
  background: rgba(255, 111, 60, 0.08);
}

.option-item.is-correct {
  border-color: #52c41a;
  background: rgba(82, 196, 26, 0.08);
}

.option-item.is-incorrect {
  border-color: #f5222d;
  background: rgba(245, 34, 45, 0.08);
}

.option-label {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--brand-primary, #ff6f3c);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.option-content {
  flex: 1;
  line-height: 1.6;
  color: #333;
}

/* 判断题 */
.judgment-area {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 32px;
}

.judgment-button {
  min-width: 120px;
  padding: 16px 32px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  background: #ffffff;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
}

.judgment-button:hover {
  border-color: var(--brand-primary, #ff6f3c);
  background: rgba(255, 111, 60, 0.03);
}

.judgment-button.is-selected {
  border-color: var(--brand-primary, #ff6f3c);
  background: rgba(255, 111, 60, 0.08);
  color: var(--brand-primary, #ff6f3c);
}

.judgment-button.is-correct {
  border-color: #52c41a;
  background: rgba(82, 196, 26, 0.08);
  color: #52c41a;
}

.judgment-button.is-incorrect {
  border-color: #f5222d;
  background: rgba(245, 34, 45, 0.08);
  color: #f5222d;
}

/* 简答题 */
.essay-area {
  margin-top: 16px;
}

.essay-textarea {
  width: 100%;
  min-height: 200px;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: inherit;
  line-height: 1.6;
  resize: vertical;
  transition: all 0.2s ease;
}

.essay-textarea:focus {
  outline: none;
  border-color: var(--brand-primary, #ff6f3c);
  box-shadow: 0 0 0 3px rgba(255, 111, 60, 0.1);
}

/* 答案解析区 */
.analysis-section {
  padding: 26px 16px 10px;
  background: transparent;
  border-top: 1px solid #f0f0f0;
} 

.analysis-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 30px;
}

.analysis-icon {
  font-size: 20px;
}

.analysis-title {
  font-size: inherit;
  font-weight: 700;
  color: #333;
}

.correct-answer {
  margin-bottom: 12px;
  font-size: inherit;
  color: #333;
}

.correct-answer strong {
  color: #fa8c16;
}

.correct-answer span {
  color: #52c41a;
  font-weight: 600;
}

.explanation-text {
  font-size: inherit;
  line-height: 1.8;
  color: #666;
  margin-top: 12px;
}

.ref-header { margin-top: 2px; margin-bottom: -12px; }
.ref-label { display: inline-block; font-size: 14px; font-weight: 700; color: #333; }

.knowledge-line {
  margin: 10px 0 12px;
}
.kl-label { color: #333; }
.kl-text { color: #333; }


.answer-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  background: transparent;
}

.summary-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-pill {
  padding: 6px 10px;
  border-radius: 6px;
  font-size: inherit;
  font-weight: 700;
}
.status-correct { background: rgba(82,196,26,0.12); color: #52c41a; }
.status-incorrect { background: rgba(245,34,45,0.12); color: #f5222d; }
.status-partial { background: #fae4e3; color: #e13b29; font-size: inherit; }
.status-unanswered { background: #f5f5f5; color: #999; }

.summary-answers {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.summary-answers .label { font-size: inherit; color: #666; }
.summary-answers .value { font-size: inherit; font-weight: 600; }
.summary-answers .value.correct { color: #52c41a; }
.summary-answers .value.incorrect { color: #f5222d; }
.summary-answers .value.unanswered { color: #999; }

.summary-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-link {
  padding: 6px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 999px;
  background: #fff;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
}
.action-link:hover { border-color: var(--brand-primary, #ff6f3c); color: var(--brand-primary, #ff6f3c); }
.action-link.ai { color: #3b82f6; border-color: #bfdbfe; }
.action-link.ai:hover { color: #1d4ed8; border-color: #93c5fd; }
.action-link.qa-link { color: #4a90e2; border-color: #4a90e2; }
.action-link.qa-link:hover { color: #357abd; border-color: #357abd; background: rgba(74, 144, 226, 0.05); }
.qa-icon { font-size: 14px; line-height: 1; }
.star-icon { font-size: 14px; line-height: 1; }
.star-icon.filled { color: #ff4d3a; }
.star-icon.empty { color: #999; }
.action-link.favorite { display: inline-flex; align-items: center; gap: 6px; }

.my-answer {
  margin-bottom: 12px;
  font-size: 14px;
  color: #333;
}

.knowledge-points {
  margin-bottom: 12px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
}

.tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(255, 111, 60, 0.1);
  color: var(--brand-primary, #ff6f3c);
  font-size: 12px;
  font-weight: 600;
}

/* 底部操作栏 */
.panel-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px 24px;
  border-top: 1px solid #e4eaf2;
  background: transparent;
}

.action-button {
  min-width: 120px;
  padding: 12px 24px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button.primary {
  border: none;
  background: linear-gradient(135deg, #ff7b50 0%, #ff4d3a 100%);
  color: #ffffff;
  box-shadow: 0 8px 16px rgba(255, 94, 66, 0.25);
}

.action-button.primary:hover {
  background: linear-gradient(135deg, #ff5722 0%, #e64a19 100%);
  box-shadow: 0 10px 20px rgba(255, 87, 34, 0.35);
  transform: translateY(-1px);
}

.action-button.secondary {
  border: 1px solid #e0e0e0;
  background: #ffffff;
  color: #333;
}

.action-button.secondary:hover:not(:disabled) {
  border-color: var(--brand-primary, #ff6f3c);
  background: rgba(255, 111, 60, 0.03);
  color: var(--brand-primary, #ff6f3c);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.question-panel.is-readonly .option-item,
.question-panel.is-readonly .judgment-button,
.question-panel.is-readonly .essay-textarea {
  pointer-events: none;
  cursor: default;
}

.panel-footer.floating {
  position: fixed;
  bottom: 20px;
  z-index: 5;
  background: transparent;
  backdrop-filter: none;
  border-top: 1px solid #e4eaf2;
  padding: 14px 50px;
  width: 1136px;
  border-radius: 0 0 16px 16px;
  display: flex;
  justify-content: center;
}

.toggle-icon { font-size: 14px; color: #666; }
</style>
