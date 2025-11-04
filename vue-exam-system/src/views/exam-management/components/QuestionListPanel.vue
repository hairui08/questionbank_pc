<template>
  <div class="question-list-panel">
    <div v-if="questions.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <p>还没有添加试题</p>
      <div class="empty-actions">
        <button class="btn primary" @click="emit('create-question')">
          ➕ 创建试题
        </button>
        <button class="btn primary" @click="emit('select-from-bank')">
          📚 从题库选择
        </button>
      </div>
    </div>

    <div v-else class="questions-content">
      <div class="question-list">
        <div
          v-for="(examQuestion, index) in props.questions"
          :key="examQuestion.questionId"
          class="question-card"
          :data-question-id="examQuestion.questionId"
          :class="{ optional: examQuestion.isOptional }"
        >
          <div class="question-header">
            <div class="question-number">
              {{ index + 1 }}
            </div>
            <div class="question-type-badge">
              {{ getQuestionTypeName(examQuestion.questionId) }}
            </div>
            <div class="question-content-section">
              <div class="question-title">
                {{ getQuestionStem(examQuestion.questionId) }}
              </div>
              <!-- 显示试题选项 (客观题) -->
              <div v-if="isObjectiveQuestion(examQuestion.questionId)" class="question-options">
                <div
                  v-for="option in getQuestionOptions(examQuestion.questionId)"
                  :key="option.label"
                  class="option-item"
                >
                  <span class="option-label">{{ option.label }}.</span>
                  <span class="option-content">{{ option.content }}</span>
                </div>
              </div>
            </div>
            <div class="question-actions">
              <button
                class="action-icon-btn"
                :title="examQuestion.isOptional ? '设为必答' : '设为选答'"
                @click="emit('toggle-optional', examQuestion.questionId)"
              >
                {{ examQuestion.isOptional ? '⭐' : '☆' }}
              </button>
              <button
                class="action-icon-btn"
                title="上移"
                :disabled="index === 0"
                @click="emit('move-up', examQuestion.questionId)"
              >
                ⬆️
              </button>
              <button
                class="action-icon-btn"
                title="下移"
                :disabled="index === props.questions.length - 1"
                @click="emit('move-down', examQuestion.questionId)"
              >
                ⬇️
              </button>
              <button
                class="action-icon-btn delete"
                title="删除"
                @click="emit('remove-question', examQuestion.questionId)"
              >
                🗑️
              </button>
            </div>
          </div>

          <div class="question-meta">
            <div class="score-input">
              <label>分值:</label>
              <input
                type="number"
                :value="examQuestion.score"
                min="1"
                @input="handleScoreChange(examQuestion.questionId, $event)"
              />
              <span>分</span>
            </div>
            <div v-if="examQuestion.isOptional" class="optional-tag">
              选答题
            </div>
            <button
              class="toggle-answer-btn"
              @click="toggleAnswer(examQuestion.questionId)"
            >
              {{ isExpanded(examQuestion.questionId) ? '收起答案' : '查看答案' }}
              <span class="toggle-icon">
                {{ isExpanded(examQuestion.questionId) ? '▲' : '▼' }}
              </span>
            </button>
          </div>

          <!-- 答案和解析区域 -->
          <div
            v-if="isExpanded(examQuestion.questionId)"
            class="answer-section"
          >
            <div class="answer-item">
              <div class="answer-label">参考答案:</div>
              <div class="answer-content">
                {{ formatAnswer(examQuestion.questionId) }}
              </div>
            </div>
            <div class="answer-item">
              <div class="answer-label">试题解析:</div>
              <div class="answer-content">
                {{ getQuestionData(examQuestion.questionId)?.explanation || '暂无解析' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useQuestionStore } from '@/stores/question'
import type { ExamQuestion } from '../types'

interface Props {
  questions: ExamQuestion[]
}

interface Emits {
  (e: 'create-question'): void
  (e: 'select-from-bank'): void
  (e: 'remove-question', questionId: string): void
  (e: 'update-score', questionId: string, score: number): void
  (e: 'toggle-optional', questionId: string): void
  (e: 'move-up', questionId: string): void
  (e: 'move-down', questionId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const questionStore = useQuestionStore()

// 展开的题目ID集合
const expandedQuestions = ref<Set<string>>(new Set())

// 切换答案展开状态
function toggleAnswer(questionId: string) {
  if (expandedQuestions.value.has(questionId)) {
    expandedQuestions.value.delete(questionId)
  } else {
    expandedQuestions.value.add(questionId)
  }
}

// 检查是否展开
function isExpanded(questionId: string): boolean {
  return expandedQuestions.value.has(questionId)
}

// 判断是否为客观题
function isObjectiveQuestion(questionId: string): boolean {
  const question = getQuestionData(questionId)
  if (!question) return false
  return ['single', 'multiple', 'judgment', 'uncertain'].includes(question.type)
}

// 获取试题选项
function getQuestionOptions(questionId: string) {
  const question = getQuestionData(questionId)
  return question?.options || []
}

// 获取题型名称
function getQuestionTypeName(questionId: string): string {
  const question = getQuestionData(questionId)
  if (!question) return ''

  const typeNames: Record<string, string> = {
    single: '单选题',
    multiple: '多选题',
    judgment: '判断题',
    uncertain: '不定项',
    essay: '简答题',
    combination: '组合题'
  }

  return typeNames[question.type] || question.type
}

// 获取试题题干（兼容嵌入式和引用式）
function getQuestionStem(questionId: string): string {
  const question = getQuestionData(questionId)
  if (!question) return '未知试题'

  const stem = question.mainStem || question.stem
  return stem && stem.length > 80 ? stem.substring(0, 80) + '...' : stem || ''
}

// 获取完整题目数据（兼容嵌入式和引用式）
function getQuestionData(questionId: string) {
  // 先从当前试卷的题目列表中查找
  const examQuestion = props.questions.find(q => q.questionId === questionId)

  if (examQuestion && examQuestion.embedded) {
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
    return questionStore.getQuestionById(questionId)
  }
}

// 格式化答案显示
function formatAnswer(questionId: string): string {
  const question = getQuestionData(questionId)
  if (!question) return ''

  if (question.type === 'combination') {
    return '组合题答案请查看小问详情'
  }

  if (['single', 'multiple', 'judgment', 'uncertain'].includes(question.type)) {
    // 客观题：显示选项
    const answer = Array.isArray(question.answer) ? question.answer : [question.answer]
    return answer.join(', ')
  }

  // 简答题
  return question.answer as string
}

// 处理分值变化
function handleScoreChange(questionId: string, event: Event) {
  const target = event.target as HTMLInputElement
  const score = parseInt(target.value) || 1
  if (score > 0) {
    emit('update-score', questionId, score)
  }
}
</script>

<style scoped>
.question-list-panel {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  padding: 24px;
  min-height: 400px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--secondary-text);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state p {
  margin: 0 0 24px;
  font-size: 16px;
}

.empty-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.questions-content {
  display: flex;
  flex-direction: column;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-card {
  background: #ffffff;
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s ease;
  scroll-margin-top: 80px;
}

.question-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: var(--accent);
}

.question-card.optional {
  border-style: dashed;
  background: #fff9e6;
}

.question-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.question-number {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 600;
  align-self: flex-start;
}

.question-type-badge {
  flex-shrink: 0;
  padding: 4px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  align-self: flex-start;
  height: fit-content;
}

.question-content-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.question-title {
  color: var(--primary-text);
  font-size: 14px;
  line-height: 1.6;
  font-weight: 500;
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-left: 8px;
}

.option-item {
  display: flex;
  gap: 8px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--primary-text);
}

.option-label {
  flex-shrink: 0;
  font-weight: 600;
  color: var(--accent);
  min-width: 20px;
}

.option-content {
  flex: 1;
}

.question-actions {
  display: flex;
  gap: 4px;
}

.action-icon-btn {
  padding: 4px 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.action-icon-btn:hover:not(:disabled) {
  background: rgba(0, 102, 204, 0.1);
  transform: scale(1.1);
}

.action-icon-btn.delete:hover {
  background: rgba(239, 83, 80, 0.1);
}

.action-icon-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.question-meta {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.score-input {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.score-input label {
  font-weight: 600;
  color: var(--primary-text);
}

.score-input input {
  width: 80px;
  padding: 6px 10px;
  border: 1px solid var(--panel-border);
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
}

.score-input input:focus {
  outline: none;
  border-color: var(--accent);
}

.optional-tag {
  padding: 4px 12px;
  background: #ff9800;
  color: #ffffff;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.toggle-answer-btn {
  padding: 6px 16px;
  border: 1px solid var(--accent);
  background: #ffffff;
  color: var(--accent);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}

.toggle-answer-btn:hover {
  background: rgba(0, 102, 204, 0.08);
}

.toggle-icon {
  font-size: 10px;
}

.answer-section {
  margin-top: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e4eaf2;
}

.answer-item {
  margin-bottom: 12px;
}

.answer-item:last-child {
  margin-bottom: 0;
}

.answer-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 6px;
}

.answer-content {
  font-size: 14px;
  color: var(--primary-text);
  line-height: 1.6;
  padding: 8px 12px;
  background: #ffffff;
  border-radius: 6px;
  border: 1px solid #e4eaf2;
  white-space: pre-wrap;
}

.btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn.primary {
  background: linear-gradient(180deg, #4f77ff 0%, #2f57e3 100%);
  color: #ffffff;
  border-color: #375edf;
}

.btn.primary:hover {
  background: linear-gradient(180deg, #4b6ee6 0%, #264acc 100%);
}
</style>
