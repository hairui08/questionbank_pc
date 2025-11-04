<template>
  <BaseModal v-if="show && question" :visible="show" @update:visible="handleClose">
    <template #header>
      <h3>试题详情</h3>
    </template>

    <template #body>
      <div class="question-detail">
        <!-- 基本信息 -->
        <section class="detail-section">
          <h4 class="section-title">基本信息</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">题型:</span>
              <span class="info-value">
                <span class="type-badge" :class="`type-${question.type}`">
                  {{ getTypeName(question.type) }}
                </span>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">试题来源:</span>
              <span class="info-value">{{ getSourceName(question.source) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">所属年份:</span>
              <span class="info-value">{{ question.year || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">试题难度:</span>
              <span class="info-value">{{ getDifficultyName(question.difficulty) }}</span>
            </div>
          </div>
        </section>

        <!-- 组合题显示案例背景 -->
        <section v-if="question.type === 'combination' && question.mainStem" class="detail-section">
          <h4 class="section-title">案例背景</h4>
          <div class="content-box">{{ question.mainStem }}</div>
        </section>

        <!-- 常规题型题干 -->
        <section v-if="question.type !== 'combination'" class="detail-section">
          <h4 class="section-title">题干内容</h4>
          <div class="content-box">{{ question.stem }}</div>
        </section>

        <!-- 客观题选项 -->
        <section v-if="isObjectiveQuestion && question.options" class="detail-section">
          <h4 class="section-title">选项</h4>
          <div class="options-list">
            <div v-for="option in question.options" :key="option.label" class="option-item">
              <span class="option-label">{{ option.label }}</span>
              <span class="option-content">{{ option.content }}</span>
            </div>
          </div>
        </section>

        <!-- 组合题小问 -->
        <section v-if="question.type === 'combination' && question.subQuestions" class="detail-section">
          <h4 class="section-title">小问列表</h4>
          <div v-for="(subQ, index) in question.subQuestions" :key="subQ.id" class="sub-question-detail">
            <div class="sub-question-header">
              <span class="sub-question-number">小问 {{ index + 1 }}</span>
              <span class="type-badge" :class="`type-${subQ.type}`">
                {{ getTypeName(subQ.type) }}
              </span>
            </div>
            <div class="sub-question-body">
              <div class="sub-info-item">
                <span class="info-label">题干:</span>
                <div class="content-box">{{ subQ.stem }}</div>
              </div>
              <div v-if="subQ.options" class="sub-info-item">
                <span class="info-label">选项:</span>
                <div class="options-list">
                  <div v-for="opt in subQ.options" :key="opt.label" class="option-item">
                    <span class="option-label">{{ opt.label }}</span>
                    <span class="option-content">{{ opt.content }}</span>
                  </div>
                </div>
              </div>
              <div class="sub-info-item">
                <span class="info-label">答案:</span>
                <span class="info-value answer-value">{{ formatAnswer(subQ.answer) }}</span>
              </div>
              <div class="sub-info-item">
                <span class="info-label">解析:</span>
                <div class="content-box">{{ subQ.explanation }}</div>
              </div>
            </div>
          </div>
        </section>

        <!-- 常规题型答案与解析 -->
        <section v-if="question.type !== 'combination'" class="detail-section">
          <h4 class="section-title">答案与解析</h4>
          <div class="info-item">
            <span class="info-label">正确答案:</span>
            <span class="info-value answer-value">{{ formatAnswer(question.answer) }}</span>
          </div>
          <div class="info-item" style="margin-top: 12px;">
            <span class="info-label">试题解析:</span>
            <div class="content-box">{{ question.explanation }}</div>
          </div>
        </section>

        <!-- 元数据 -->
        <section class="detail-section">
          <h4 class="section-title">元数据</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">创建时间:</span>
              <span class="info-value">{{ formatDateTime(question.createTime) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">更新时间:</span>
              <span class="info-value">{{ formatDateTime(question.updateTime) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">创建人:</span>
              <span class="info-value">{{ question.creatorId }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">状态:</span>
              <span class="info-value">
                <span :class="['status-badge', question.status]">
                  {{ question.status === 'active' ? '启用' : '禁用' }}
                </span>
              </span>
            </div>
          </div>
        </section>
      </div>
    </template>

    <template #footer>
      <div class="modal-actions">
        <button class="btn primary" @click="handleClose">
          关闭
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseModal from '@/components/Modal/BaseModal.vue'
import type { Question } from '../types'
import { QuestionTypeNames } from '../types'

interface Props {
  show: boolean
  question: Question | null
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isObjectiveQuestion = computed(() => {
  return props.question && ['single', 'multiple', 'uncertain'].includes(props.question.type)
})

function getTypeName(type: string): string {
  return QuestionTypeNames[type as keyof typeof QuestionTypeNames] || type
}

function getSourceName(source: string): string {
  const sourceNames: Record<string, string> = {
    official: '历年真题',
    simulation: '模拟试题',
    custom: '自定义'
  }
  return sourceNames[source] || source
}

function getDifficultyName(difficulty?: string): string {
  if (!difficulty) return '-'
  const difficultyNames: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return difficultyNames[difficulty] || difficulty
}

function formatAnswer(answer: string | string[]): string {
  if (Array.isArray(answer)) {
    return answer.join(', ')
  }
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

function handleClose() {
  emit('close')
}
</script>

<style scoped>
.question-detail {
  max-height: 70vh;
  overflow-y: auto;
  padding: 4px;
}

.detail-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--panel-border);
}

.detail-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.section-title {
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 600;
  color: var(--accent);
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title::before {
  content: "";
  width: 4px;
  height: 16px;
  background: linear-gradient(180deg, #4f77ff 0%, #2f57e3 100%);
  border-radius: 2px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--secondary-text);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 14px;
  color: var(--primary-text);
}

.answer-value {
  font-weight: 600;
  color: var(--accent);
}

.content-box {
  background: #fafcfe;
  border: 1px solid var(--panel-border);
  border-radius: 6px;
  padding: 12px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--primary-text);
  white-space: pre-wrap;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #fafcfe;
  border: 1px solid var(--panel-border);
  border-radius: 6px;
}

.option-label {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background: linear-gradient(180deg, #4f77ff 0%, #2f57e3 100%);
  color: #ffffff;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 13px;
}

.option-content {
  flex: 1;
  font-size: 14px;
  color: var(--primary-text);
}

.sub-question-detail {
  background: #fafcfe;
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}

.sub-question-detail:last-child {
  margin-bottom: 0;
}

.sub-question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(180deg, #e6f2ff 0%, #d9ebff 100%);
  border-bottom: 1px solid var(--panel-border);
}

.sub-question-number {
  font-weight: 600;
  font-size: 14px;
  color: var(--accent);
}

.sub-question-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sub-info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.type-badge,
.payment-badge,
.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
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

.status-badge.active {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.disabled {
  background: #ffebee;
  color: #c62828;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
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
