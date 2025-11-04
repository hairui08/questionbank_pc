<template>
  <div v-if="visible" class="modal-overlay" @click.self="handleClose">
    <div class="modal-container">
      <!-- 模态框头部 -->
      <div class="modal-header">
        <h3>📋 试卷预览</h3>
        <button class="close-btn" @click="handleClose">✕</button>
      </div>

      <!-- 模态框内容 -->
      <div class="modal-body">
        <!-- 基础信息 -->
        <div class="info-section">
          <h4 class="section-title">基础信息</h4>
          <div class="info-grid">
            <div class="info-item">
              <label>试卷名称：</label>
              <span>{{ examInfo?.name || '-' }}</span>
            </div>
            <div class="info-item">
              <label>年份：</label>
              <span>{{ examInfo?.year || '-' }}</span>
            </div>
            <div class="info-item">
              <label>有效期：</label>
              <span>
                {{ examInfo?.validFrom || '不限' }} 至 {{ examInfo?.validTo || '不限' }}
              </span>
            </div>
            <div class="info-item">
              <label>总分：</label>
              <span class="highlight">{{ examInfo?.totalScore || 0 }}分</span>
            </div>
            <div class="info-item">
              <label>及格分：</label>
              <span class="highlight">{{ examInfo?.passingScore || 0 }}分</span>
            </div>
          </div>
        </div>

        <!-- 题目列表 -->
        <div class="questions-section">
          <h4 class="section-title">题目列表</h4>
          <div v-if="questions.length > 0" class="questions-list">
            <div
              v-for="(item, index) in questions"
              :key="item.questionId"
              class="question-card"
            >
              <div class="question-header">
                <span class="question-number">{{ index + 1 }}</span>
                <span class="question-type">{{ getQuestionTypeText(item.type) }}</span>
                <span class="question-score">{{ item.score }}分</span>
                <span v-if="item.isOptional" class="optional-tag">选答</span>
              </div>
              <div class="question-content">
                <div class="question-stem">
                  {{ item.question?.stem || '题目内容加载中...' }}
                </div>
                <div v-if="item.question?.options && item.question.options.length > 0" class="question-options">
                  <div
                    v-for="option in item.question.options"
                    :key="option.label"
                    class="option-item"
                  >
                    {{ option.label }}. {{ option.content }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-message">
            暂无题目信息
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="stats-section">
          <h4 class="section-title">统计信息</h4>
          <div class="stats-grid">
            <div class="stats-item">
              <label>总题数：</label>
              <span>{{ questions.length }}题</span>
            </div>
            <div class="stats-item">
              <label>必答题：</label>
              <span>{{ requiredCount }}题（{{ requiredScore }}分）</span>
            </div>
            <div class="stats-item">
              <label>选答题：</label>
              <span>{{ optionalCount }}题（{{ optionalScore }}分）</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 模态框底部 -->
      <div class="modal-footer">
        <button class="btn secondary" @click="handleClose">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useExamStore } from '@/stores/exam'
import { useQuestionStore } from '@/stores/question'
import type { Exam, ExamQuestion } from '@/views/exam-management/types'
import type { Question } from '@/views/question-management/types'

interface Props {
  modelValue: boolean
  examId: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const examStore = useExamStore()
const questionStore = useQuestionStore()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const examInfo = ref<Exam | undefined>()
const questions = ref<Array<ExamQuestion & { question?: Question }>>([])

// 加载试卷和题目信息
watch(() => props.examId, (newId) => {
  if (newId) {
    loadExamData(newId)
  }
}, { immediate: true })

function loadExamData(examId: string) {
  // 获取试卷信息
  examInfo.value = examStore.getExamById(examId)

  // 获取题目详情
  if (examInfo.value?.questions) {
    questions.value = examInfo.value.questions.map(q => {
      const question = questionStore.getQuestionById(q.questionId)
      return {
        ...q,
        question
      }
    })
  }
}

// 计算统计信息
const requiredCount = computed(() =>
  questions.value.filter(q => !q.isOptional).length
)

const optionalCount = computed(() =>
  questions.value.filter(q => q.isOptional).length
)

const requiredScore = computed(() =>
  questions.value
    .filter(q => !q.isOptional)
    .reduce((sum, q) => sum + q.score, 0)
)

const optionalScore = computed(() =>
  questions.value
    .filter(q => q.isOptional)
    .reduce((sum, q) => sum + q.score, 0)
)

// 获取VIP等级文本
function getVipLevelText(level?: number): string {
  if (level === undefined) return '普通'
  const levels = ['普通', 'VIP1', 'VIP2', 'VIP3', 'VIP4', 'VIP5']
  return levels[level] || '普通'
}

// 获取题型文本
function getQuestionTypeText(type: string): string {
  const typeMap: Record<string, string> = {
    single: '单选题',
    multiple: '多选题',
    judgment: '判断题',
    uncertain: '不定项',
    essay: '简答题',
    combination: '组合题'
  }
  return typeMap[type] || type
}

// 关闭模态框
function handleClose() {
  visible.value = false
}
</script>

<style scoped>
/* 模态框遮罩 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/* 模态框容器 */
.modal-container {
  background: #ffffff;
  border-radius: 12px;
  width: 90%;
  max-width: 900px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

/* 模态框头部 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--panel-border);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-text);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--secondary-text);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: #f5f5f5;
}

/* 模态框内容 */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* 信息区块 */
.info-section,
.questions-section,
.stats-section {
  margin-bottom: 24px;
}

.section-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-text);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--panel-border);
}

/* 基础信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-item label {
  font-size: 14px;
  color: var(--secondary-text);
  margin-right: 8px;
  font-weight: 500;
}

.info-item span {
  font-size: 14px;
  color: var(--primary-text);
}

.info-item .highlight {
  color: var(--accent);
  font-weight: 600;
}

/* 题目列表 */
.questions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.question-card {
  background: #f8f9fa;
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 12px 16px;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.question-number {
  width: 28px;
  height: 28px;
  background: var(--accent);
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.question-type {
  padding: 4px 8px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.question-score {
  font-size: 14px;
  color: var(--secondary-text);
  font-weight: 600;
}

.optional-tag {
  padding: 4px 8px;
  background: #fff3e0;
  color: #f57c00;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.question-content {
  padding-left: 40px;
}

.question-stem {
  font-size: 14px;
  color: var(--primary-text);
  line-height: 1.6;
  margin-bottom: 8px;
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.option-item {
  font-size: 13px;
  color: var(--secondary-text);
  padding-left: 20px;
}

/* 空状态 */
.empty-message {
  text-align: center;
  padding: 40px;
  color: var(--secondary-text);
  font-size: 14px;
}

/* 统计信息 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stats-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f0f7ff;
  border-radius: 8px;
}

.stats-item label {
  font-size: 14px;
  color: var(--secondary-text);
  margin-right: 8px;
}

.stats-item span {
  font-size: 14px;
  color: var(--accent);
  font-weight: 600;
}

/* 模态框底部 */
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--panel-border);
  display: flex;
  justify-content: flex-end;
}

/* 按钮样式 */
.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.btn.secondary {
  background: #ffffff;
  color: var(--accent);
  border-color: var(--accent);
}

.btn.secondary:hover {
  background: var(--accent);
  color: #ffffff;
}

/* 响应式 */
@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    max-height: 90vh;
  }

  .info-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>