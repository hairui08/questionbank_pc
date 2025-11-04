<template>
  <div
    v-if="modelValue"
    class="drawer-overlay"
    @click="handleClose"
  >
    <div
      class="drawer-container"
      @click.stop
    >
      <!-- 头部 -->
      <div class="drawer-header">
        <h2>试卷预览</h2>
        <button class="close-btn" @click="handleClose">✕</button>
      </div>

      <!-- 内容区 -->
      <div class="drawer-content">
        <!-- 基础信息卡片 -->
        <div class="info-card">
          <h3 class="exam-title">{{ examForm.name || '未命名试卷' }}</h3>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">考试时长</span>
              <span class="info-value">{{ examForm.duration || 0 }} 分钟</span>
            </div>
            <div class="info-item">
              <span class="info-label">试卷总分</span>
              <span class="info-value">{{ totalScore }} 分</span>
            </div>
            <div class="info-item">
              <span class="info-label">及格分数</span>
              <span class="info-value">{{ examForm.passingScore || 0 }} 分</span>
            </div>
            <div class="info-item">
              <span class="info-label">题目统计</span>
              <span class="info-value">
                必答 {{ requiredCount }} 题 / 选答 {{ optionalCount }} 题
              </span>
            </div>
          </div>

          <!-- 题型统计 -->
          <div class="type-stats">
            <span class="stats-label">题型分布:</span>
            <div class="stats-tags">
              <span
                v-for="(count, type) in questionTypeStats"
                :key="type"
                class="type-tag"
                :class="`type-${type}`"
              >
                {{ getQuestionTypeName(type) }} × {{ count }}
              </span>
            </div>
          </div>
        </div>

        <!-- 题目列表 -->
        <div class="questions-list">
          <div
            v-for="(item, index) in sortedQuestions"
            :key="item.questionId"
            class="question-card"
          >
            <!-- 题号和题型 -->
            <div class="question-header">
              <div class="question-number">{{ index + 1 }}</div>
              <span class="question-type-tag" :class="`type-${item.type}`">
                {{ getQuestionTypeName(item.type) }}
              </span>
              <span class="question-score">{{ item.score }} 分</span>
              <span v-if="item.isOptional" class="optional-badge">选答题</span>
            </div>

            <!-- 题干 -->
            <div class="question-stem">
              <div v-if="item.question?.type === 'combination'" class="main-stem">
                <strong>案例背景:</strong>
                <p>{{ item.question.mainStem }}</p>
              </div>
              <div v-else class="stem-content">
                {{ item.question?.stem || '题目加载失败' }}
              </div>
            </div>

            <!-- 组合题小问 -->
            <div v-if="item.question?.type === 'combination'" class="sub-questions">
              <div
                v-for="(subQ, subIndex) in item.question.subQuestions"
                :key="subIndex"
                class="sub-question"
              >
                <div class="sub-question-header">
                  <strong>({{ subIndex + 1 }}) {{ getQuestionTypeName(subQ.type) }}</strong>
                </div>
                <div class="sub-question-stem">{{ subQ.stem }}</div>

                <!-- 小问选项 -->
                <div v-if="subQ.options && subQ.options.length > 0" class="options">
                  <div
                    v-for="option in subQ.options"
                    :key="option.label"
                    class="option"
                  >
                    <span class="option-label">{{ option.label }}.</span>
                    <span class="option-content">{{ option.content }}</span>
                  </div>
                </div>

                <!-- 小问答案 -->
                <div class="answer-section">
                  <strong>答案:</strong>
                  <span class="answer-content">
                    {{ formatAnswer(subQ.answer, subQ.type) }}
                  </span>
                </div>

                <!-- 小问解析 -->
                <div class="explanation-section">
                  <strong>解析:</strong>
                  <p>{{ subQ.explanation }}</p>
                </div>
              </div>
            </div>

            <!-- 普通题选项 -->
            <div
              v-else-if="item.question?.options && item.question.options.length > 0"
              class="options"
            >
              <div
                v-for="option in item.question.options"
                :key="option.label"
                class="option"
              >
                <span class="option-label">{{ option.label }}.</span>
                <span class="option-content">{{ option.content }}</span>
              </div>
            </div>

            <!-- 普通题答案 -->
            <div v-if="item.question?.type !== 'combination'" class="answer-section">
              <strong>答案:</strong>
              <span class="answer-content">
                {{ formatAnswer(item.question?.answer, item.question?.type) }}
              </span>
            </div>

            <!-- 普通题解析 -->
            <div v-if="item.question?.type !== 'combination'" class="explanation-section">
              <strong>解析:</strong>
              <p>{{ item.question?.explanation || '暂无解析' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="drawer-footer">
        <button class="btn primary" @click="handleClose">确定</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useQuestionStore } from '@/stores/question'
import type { ExamForm, ExamQuestion } from '../types'
import type { Question } from '@/views/question-management/types'

interface Props {
  modelValue: boolean
  examForm: ExamForm
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const questionStore = useQuestionStore()

// 题型名称映射
const questionTypeNames: Record<string, string> = {
  single: '单选题',
  multiple: '多选题',
  judgment: '判断题',
  uncertain: '不定项',
  essay: '简答题',
  combination: '组合题'
}

// 获取题型名称
function getQuestionTypeName(type: string): string {
  return questionTypeNames[type] || type
}

// 格式化答案
function formatAnswer(answer: string | string[] | undefined, type?: string): string {
  if (!answer) return '暂无答案'

  if (Array.isArray(answer)) {
    return answer.join(', ')
  }

  if (type === 'single' || type === 'judgment') {
    return answer
  }

  return answer
}

// 获取试题数据（兼容嵌入式和引用式）
function getQuestionData(examQuestion: ExamQuestion) {
  if (examQuestion.embedded) {
    // 嵌入式试题：使用本地数据
    return {
      id: examQuestion.questionId,
      type: examQuestion.type,
      stem: examQuestion.embedded.stem,
      options: examQuestion.embedded.options,
      answer: examQuestion.embedded.answer,
      explanation: examQuestion.embedded.explanation,
      mainStem: examQuestion.embedded.mainStem,
      subQuestions: examQuestion.embedded.subQuestions
    }
  } else {
    // 引用式试题：从题库查询
    return questionStore.getQuestionById(examQuestion.questionId)
  }
}

// 排序后的题目列表(带完整题目信息)
const sortedQuestions = computed(() => {
  return props.examForm.questions
    .map(examQ => ({
      ...examQ,
      question: getQuestionData(examQ)
    }))
    .sort((a, b) => a.order - b.order)
})

// 总分
const totalScore = computed(() => {
  return props.examForm.questions
    .filter(q => !q.isOptional)
    .reduce((sum, q) => sum + q.score, 0)
})

// 必答题数量
const requiredCount = computed(() => {
  return props.examForm.questions.filter(q => !q.isOptional).length
})

// 选答题数量
const optionalCount = computed(() => {
  return props.examForm.questions.filter(q => q.isOptional).length
})

// 题型统计
const questionTypeStats = computed(() => {
  const stats: Record<string, number> = {}
  props.examForm.questions.forEach(q => {
    stats[q.type] = (stats[q.type] || 0) + 1
  })
  return stats
})

// 关闭抽屉
function handleClose() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
  animation: fade-in 0.3s ease;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.drawer-container {
  width: 80%;
  max-width: 1200px;
  height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  animation: slide-in 0.3s ease;
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

/* 头部 */
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid var(--panel-border);
  background: var(--panel-bg);
}

.drawer-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-text);
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--secondary-text);
  font-size: 24px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--primary-text);
}

/* 内容区 */
.drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  background: #f5f5f5;
}

/* 基础信息卡片 */
.info-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.exam-title {
  margin: 0 0 20px;
  font-size: 24px;
  font-weight: 600;
  color: var(--primary-text);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-label {
  font-size: 14px;
  color: var(--secondary-text);
}

.info-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-text);
}

.type-stats {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--panel-border);
}

.stats-label {
  font-size: 14px;
  color: var(--secondary-text);
  font-weight: 600;
}

.stats-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.type-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.type-tag.type-single {
  background: #e3f2fd;
  color: #1976d2;
}

.type-tag.type-multiple {
  background: #f3e5f5;
  color: #7b1fa2;
}

.type-tag.type-judgment {
  background: #e8f5e9;
  color: #388e3c;
}

.type-tag.type-uncertain {
  background: #fff3e0;
  color: #f57c00;
}

.type-tag.type-essay {
  background: #fce4ec;
  color: #c2185b;
}

.type-tag.type-combination {
  background: #e0f2f1;
  color: #00796b;
}

/* 题目列表 */
.questions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.question-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.question-number {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.question-type-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.question-type-tag.type-single {
  background: #e3f2fd;
  color: #1976d2;
}

.question-type-tag.type-multiple {
  background: #f3e5f5;
  color: #7b1fa2;
}

.question-type-tag.type-judgment {
  background: #e8f5e9;
  color: #388e3c;
}

.question-type-tag.type-uncertain {
  background: #fff3e0;
  color: #f57c00;
}

.question-type-tag.type-essay {
  background: #fce4ec;
  color: #c2185b;
}

.question-type-tag.type-combination {
  background: #e0f2f1;
  color: #00796b;
}

.question-score {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent);
}

.optional-badge {
  margin-left: auto;
  padding: 4px 12px;
  background: #fff3e0;
  color: #f57c00;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.question-stem {
  margin-bottom: 16px;
}

.main-stem {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.main-stem strong {
  display: block;
  margin-bottom: 8px;
  color: var(--primary-text);
}

.main-stem p {
  margin: 0;
  color: var(--primary-text);
  line-height: 1.6;
}

.stem-content {
  color: var(--primary-text);
  line-height: 1.6;
  font-size: 15px;
}

/* 选项 */
.options {
  margin-bottom: 16px;
}

.option {
  display: flex;
  gap: 8px;
  padding: 8px 0;
  color: var(--primary-text);
  line-height: 1.6;
}

.option-label {
  font-weight: 600;
  color: var(--accent);
  min-width: 24px;
}

.option-content {
  flex: 1;
}

/* 组合题小问 */
.sub-questions {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sub-question {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border-left: 3px solid var(--accent);
}

.sub-question-header {
  margin-bottom: 12px;
}

.sub-question-header strong {
  color: var(--primary-text);
  font-size: 15px;
}

.sub-question-stem {
  margin-bottom: 12px;
  color: var(--primary-text);
  line-height: 1.6;
}

/* 答案区域 */
.answer-section {
  padding: 12px;
  background: #e8f5e9;
  border-radius: 8px;
  margin-bottom: 12px;
}

.answer-section strong {
  color: #2e7d32;
  margin-right: 8px;
}

.answer-content {
  color: #1b5e20;
  font-weight: 500;
}

/* 解析区域 */
.explanation-section {
  padding: 12px;
  background: #e3f2fd;
  border-radius: 8px;
}

.explanation-section strong {
  color: #1565c0;
  margin-right: 8px;
  display: inline-block;
  margin-bottom: 4px;
}

.explanation-section p {
  margin: 0;
  color: #0d47a1;
  line-height: 1.6;
}

/* 底部操作栏 */
.drawer-footer {
  padding: 16px 32px;
  border-top: 1px solid var(--panel-border);
  background: var(--panel-bg);
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn.primary {
  background: linear-gradient(180deg, #4f77ff 0%, #2f57e3 100%);
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(79, 119, 255, 0.3);
}

.btn.primary:hover {
  background: linear-gradient(180deg, #4b6ee6 0%, #264acc 100%);
}

@media (max-width: 1024px) {
  .drawer-container {
    width: 90%;
  }

  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .drawer-container {
    width: 100%;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
