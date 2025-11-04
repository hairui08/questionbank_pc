<template>
  <div class="question-preview-wrapper">
    <div v-if="questions.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <p>暂无试题数据</p>
    </div>

    <div v-else class="preview-list">
      <div
        v-for="(question, index) in questions"
        :key="question.id"
        class="question-card"
      >
        <!-- 卡片头部 -->
        <div class="card-header">
          <div class="header-left">
            <span class="question-number">第 {{ index + 1 }} 题</span>
            <span class="type-badge" :class="`type-${question.type}`">
              {{ getTypeName(question.type) }}
            </span>
          </div>
          <div class="header-right">
            <button class="action-btn edit" @click="handleEdit(question.id)" title="编辑">
              ✏️ 编辑
            </button>
            <button class="action-btn delete" @click="handleDelete(question.id)" title="删除">
              🗑️ 删除
            </button>
          </div>
        </div>

        <!-- 知识点标签 -->
        <div v-if="question.knowledgePointIds && question.knowledgePointIds.length > 0" class="knowledge-points-section">
          <span class="kp-label">关联知识点:</span>
          <div class="kp-tags">
            <span
              v-for="kpId in question.knowledgePointIds"
              :key="kpId"
              class="kp-tag"
            >
              {{ getKnowledgePointName(kpId) }}
            </span>
          </div>
        </div>

        <!-- 组合题案例背景 -->
        <div v-if="question.type === 'combination' && question.mainStem" class="question-main-stem">
          <div class="section-title">【案例背景】</div>
          <div class="content-text">{{ question.mainStem }}</div>
        </div>

        <!-- 常规题型题干 -->
        <div v-if="question.type !== 'combination'" class="question-stem">
          <div class="stem-text">{{ question.stem }}</div>
        </div>

        <!-- 客观题选项 -->
        <div v-if="isObjectiveQuestion(question) && question.options" class="question-options">
          <div
            v-for="option in question.options"
            :key="option.label"
            class="option-item"
            :class="{ 'is-correct': isCorrectOption(question.answer, option.label) }"
          >
            <span class="option-label">{{ option.label }}</span>
            <span class="option-content">{{ option.content }}</span>
            <span v-if="isCorrectOption(question.answer, option.label)" class="correct-tag">✓ 正确答案</span>
          </div>
        </div>

        <!-- 组合题小问 -->
        <div v-if="question.type === 'combination' && question.subQuestions" class="sub-questions">
          <div
            v-for="(subQ, subIndex) in question.subQuestions"
            :key="subQ.id"
            class="sub-question-item"
          >
            <div class="sub-question-header">
              <span class="sub-number">小问 {{ subIndex + 1 }}</span>
              <span class="type-badge small" :class="`type-${subQ.type}`">
                {{ getTypeName(subQ.type) }}
              </span>
            </div>
            <div class="sub-question-stem">{{ subQ.stem }}</div>
            <div v-if="subQ.options" class="sub-question-options">
              <div
                v-for="opt in subQ.options"
                :key="opt.label"
                class="option-item small"
                :class="{ 'is-correct': isCorrectOption(subQ.answer, opt.label) }"
              >
                <span class="option-label">{{ opt.label }}</span>
                <span class="option-content">{{ opt.content }}</span>
                <span v-if="isCorrectOption(subQ.answer, opt.label)" class="correct-tag">✓</span>
              </div>
            </div>
            <div class="sub-question-answer">
              <span class="answer-label">答案:</span>
              <span class="answer-value">{{ formatAnswer(subQ.answer) }}</span>
            </div>
            <div class="sub-question-explanation">
              <span class="explanation-label">解析:</span>
              <span class="explanation-text">{{ subQ.explanation }}</span>
            </div>
          </div>
        </div>

        <!-- 常规题型答案与解析 -->
        <div v-if="question.type !== 'combination'" class="question-answer-section">
          <div class="answer-row">
            <span class="answer-label">正确答案:</span>
            <span class="answer-value">{{ formatAnswer(question.answer) }}</span>
          </div>
          <div class="explanation-row">
            <span class="explanation-label">试题解析:</span>
            <div class="explanation-text">{{ question.explanation }}</div>
          </div>
        </div>

        <!-- 卡片元数据 -->
        <div class="card-footer">
          <span class="meta-item">
            <span class="meta-label">创建人:</span>
            {{ question.creatorId }}
          </span>
          <span class="meta-item">
            <span class="meta-label">创建时间:</span>
            {{ formatDateTime(question.createTime) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Question } from '../types'
import { QuestionTypeNames } from '../types'
import { useKnowledgePointStore } from '@/stores/knowledgePoint'

interface Props {
  questions: Question[]
}

interface Emits {
  (e: 'edit', id: string): void
  (e: 'delete', id: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const knowledgePointStore = useKnowledgePointStore()

function getTypeName(type: string): string {
  return QuestionTypeNames[type as keyof typeof QuestionTypeNames] || type
}

function getKnowledgePointName(kpId: string): string {
  const kp = knowledgePointStore.getKnowledgePointById(kpId)
  return kp?.name || kpId
}

function isObjectiveQuestion(question: Question): boolean {
  return ['single', 'multiple', 'uncertain'].includes(question.type)
}

function isCorrectOption(answer: string | string[], label: string): boolean {
  if (Array.isArray(answer)) {
    return answer.includes(label)
  }
  return answer === label
}

function formatAnswer(answer: string | string[]): string {
  if (Array.isArray(answer)) {
    return answer.join(', ')
  }
  if (answer === 'true') return '正确'
  if (answer === 'false') return '错误'
  return answer
}

function formatDateTime(dateTime: string): string {
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function handleEdit(id: string) {
  emit('edit', id)
}

function handleDelete(id: string) {
  emit('delete', id)
}
</script>

<style scoped>
.question-preview-wrapper {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  padding: 20px;
  min-height: 400px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: var(--secondary-text);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.preview-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.question-card {
  background: #ffffff;
  border: 2px solid var(--panel-border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.question-card:hover {
  border-color: var(--accent);
  box-shadow: 0 4px 16px rgba(0, 102, 204, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f5f8fc 0%, #e6f2ff 100%);
  border-bottom: 1px solid var(--panel-border);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.question-number {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent);
}

.header-right {
  display: flex;
  gap: 8px;
}

/* 知识点标签区域 */
.knowledge-points-section {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 20px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f2ff 100%);
  border-bottom: 1px solid #e4eaf2;
}

.kp-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--secondary-text);
  flex-shrink: 0;
  padding-top: 4px;
}

.kp-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.kp-tag {
  display: inline-block;
  padding: 5px 12px;
  background: linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%);
  border: 1px solid var(--accent);
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
  transition: all 0.2s ease;
}

.kp-tag:hover {
  background: var(--accent);
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 102, 204, 0.2);
}

.action-btn {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.action-btn.edit {
  background: #fff3e0;
  color: #ef6c00;
  border-color: #ffb74d;
}

.action-btn.edit:hover {
  background: #ffe0b2;
}

.action-btn.delete {
  background: #ffebee;
  color: #c62828;
  border-color: #ef9a9a;
}

.action-btn.delete:hover {
  background: #ffcdd2;
}

/* 题干部分 */
.question-main-stem,
.question-stem {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.content-text,
.stem-text {
  font-size: 15px;
  line-height: 1.8;
  color: var(--primary-text);
  white-space: pre-wrap;
}

/* 选项部分 */
.question-options {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 10px;
  background: #fafcfe;
  border: 1px solid #e4eaf2;
  border-radius: 8px;
  transition: all 0.2s ease;
  position: relative;
}

.option-item:last-child {
  margin-bottom: 0;
}

.option-item.is-correct {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%);
  border-color: #66bb6a;
}

.option-item.small {
  padding: 8px 12px;
  margin-bottom: 8px;
}

.option-label {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: linear-gradient(180deg, #4f77ff 0%, #2f57e3 100%);
  color: #ffffff;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 14px;
}

.option-item.is-correct .option-label {
  background: linear-gradient(180deg, #66bb6a 0%, #43a047 100%);
}

.option-content {
  flex: 1;
  font-size: 14px;
  line-height: 1.6;
  color: var(--primary-text);
}

.correct-tag {
  color: #2e7d32;
  font-weight: 600;
  font-size: 13px;
}

/* 组合题小问 */
.sub-questions {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.sub-question-item {
  background: #fafcfe;
  border: 1px solid #e4eaf2;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;
}

.sub-question-item:last-child {
  margin-bottom: 0;
}

.sub-question-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4eaf2;
}

.sub-number {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent);
}

.sub-question-stem {
  font-size: 14px;
  line-height: 1.7;
  color: var(--primary-text);
  margin-bottom: 12px;
}

.sub-question-options {
  margin-bottom: 12px;
}

.sub-question-answer,
.sub-question-explanation {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  font-size: 14px;
}

.answer-label,
.explanation-label {
  font-weight: 600;
  color: var(--secondary-text);
  flex-shrink: 0;
}

.answer-value {
  color: var(--accent);
  font-weight: 600;
}

.explanation-text {
  flex: 1;
  color: var(--primary-text);
  line-height: 1.6;
}

/* 答案与解析 */
.question-answer-section {
  padding: 20px 24px;
  background: linear-gradient(135deg, #fafcfe 0%, #f0f7ff 100%);
  border-bottom: 1px solid #f0f0f0;
}

.answer-row,
.explanation-row {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
}

.explanation-row {
  margin-bottom: 0;
  flex-direction: column;
  gap: 8px;
}

.answer-row .answer-label,
.explanation-row .explanation-label {
  font-weight: 600;
  color: var(--secondary-text);
  font-size: 14px;
}

.answer-row .answer-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent);
}

.explanation-row .explanation-text {
  font-size: 14px;
  line-height: 1.8;
  color: var(--primary-text);
  white-space: pre-wrap;
}

/* 卡片底部元数据 */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: #f5f8fc;
  font-size: 13px;
  color: var(--secondary-text);
}

.meta-item {
  display: flex;
  gap: 6px;
}

.meta-label {
  font-weight: 600;
}

/* 徽章 */
.type-badge,
.payment-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.type-badge.small {
  padding: 3px 8px;
  font-size: 11px;
}

.type-badge.type-single {
  background: #e3f2fd;
  color: #1976d2;
}

.type-badge.type-multiple {
  background: #f3e5f5;
  color: #7b1fa2;
}

.type-badge.type-judgment {
  background: #e8f5e9;
  color: #388e3c;
}

.type-badge.type-uncertain {
  background: #fff3e0;
  color: #f57c00;
}

.type-badge.type-essay {
  background: #fce4ec;
  color: #c2185b;
}

.type-badge.type-combination {
  background: #e0f2f1;
  color: #00695c;
}

.payment-badge.payment-free {
  background: #f5f5f5;
  color: #616161;
}

.payment-badge.payment-basic {
  background: #e3f2fd;
  color: #1565c0;
}

.payment-badge.payment-premium {
  background: #fff8e1;
  color: #f57f17;
}

@media (max-width: 768px) {
  .question-preview-wrapper {
    padding: 12px;
  }

  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .header-right {
    width: 100%;
    justify-content: flex-end;
  }

  .card-footer {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}
</style>
