<template>
  <BaseModal
    :visible="isVisible"
    :title="`知识点「${knowledgePointName}」关联的试题`"
    width="1000px"
    @update:visible="isVisible = $event"
    @close="handleClose"
  >
    <div class="question-list-wrapper">
      <!-- 已关联试题列表 -->
      <div class="question-list-container">
        <div v-if="questions.length > 0" class="preview-list">
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
                  {{ getQuestionTypeName(question.type) }}
                </span>
                <span class="chapter-badge">
                  {{ getChapterName(question.chapterId) }}
                </span>
              </div>
              <div class="header-right">
                <button class="action-btn delete" @click="handleRemoveQuestion(question.id)" title="移除">
                  🗑️ 移除
                </button>
              </div>
            </div>

            <!-- 题干部分 -->
            <div class="question-stem">
              <div class="stem-text">{{ question.stem }}</div>
            </div>

            <!-- 选项部分 -->
            <div v-if="question.options && question.options.length > 0" class="question-options">
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

            <!-- 答案与解析 -->
            <div class="question-answer-section">
              <div class="answer-row">
                <span class="answer-label">正确答案:</span>
                <span class="answer-value">{{ formatAnswer(question.answer) }}</span>
              </div>
              <div class="explanation-row">
                <span class="explanation-label">试题解析:</span>
                <div class="explanation-text">{{ question.explanation }}</div>
              </div>
            </div>

            <!-- 卡片底部元数据 -->
            <div class="card-footer">
              <span class="meta-item">
                <span class="meta-label">难度:</span>
                {{ getDifficultyName(question.difficulty) }}
              </span>
              <span class="meta-item">
                <span class="meta-label">来源:</span>
                {{ getSourceName(question.source) }}
              </span>
              <span class="meta-item">
                <span class="meta-label">年份:</span>
                {{ question.year }}
              </span>
              <span class="meta-item">
                <span class="meta-label">创建人:</span>
                {{ getCreatorName(question.creatorId) }}
              </span>
              <span class="meta-item">
                <span class="meta-label">创建时间:</span>
                {{ formatDateTime(question.createTime) }}
              </span>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">📝</div>
          <p class="empty-text">暂无关联试题</p>
        </div>
      </div>

      <!-- 分页器 -->
      <div v-if="paginatedData.total > 0" class="pagination">
        <div class="pagination-info">
          共 {{ paginatedData.total }} 条记录，第 {{ currentPage }} / {{ paginatedData.totalPages }} 页
        </div>
        <div class="pagination-controls">
          <button
            class="page-btn"
            :disabled="currentPage === 1"
            @click="handlePageChange(currentPage - 1)"
          >
            上一页
          </button>
          <div class="page-numbers">
            <template v-for="page in visiblePages" :key="page">
              <button
                v-if="page === -1"
                class="page-number ellipsis"
                disabled
              >
                ...
              </button>
              <button
                v-else
                class="page-number"
                :class="{ active: page === currentPage }"
                @click="handlePageChange(page)"
              >
                {{ page }}
              </button>
            </template>
          </div>
          <button
            class="page-btn"
            :disabled="currentPage === paginatedData.totalPages"
            @click="handlePageChange(currentPage + 1)"
          >
            下一页
          </button>
        </div>
        <div class="pagination-size">
          <select :value="pageSize" @change="handlePageSizeChange(Number(($event.target as HTMLSelectElement).value))">
            <option :value="10">10 条/页</option>
            <option :value="20">20 条/页</option>
            <option :value="50">50 条/页</option>
          </select>
        </div>
      </div>
    </div>

    <template #footer>
      <button class="btn primary" @click="handleClose">关闭</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useKnowledgePointStore } from '@/stores/knowledgePoint'
import { useChapterStore } from '@/stores/chapter'
import { useToast } from '@/composables/useToast'
import BaseModal from '@/components/Modal/BaseModal.vue'
import type { Question, QuestionType, QuestionSource, QuestionDifficulty } from '@/views/question-management/types'

// Props
interface Props {
  visible: boolean
  knowledgePointId: string
  knowledgePointName: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const knowledgePointStore = useKnowledgePointStore()
const chapterStore = useChapterStore()
const { showToast } = useToast()

// 本地visible状态
const isVisible = ref(props.visible)

// 分页状态
const currentPage = ref(1)
const pageSize = ref(10)

// 获取关联的试题列表（分页）
const paginatedData = computed(() => {
  if (!props.knowledgePointId) return { list: [], total: 0, totalPages: 0, currentPage: 1, pageSize: 10 }
  return knowledgePointStore.getPaginatedQuestionsByKnowledgePoint(
    props.knowledgePointId,
    currentPage.value,
    pageSize.value
  )
})

const questions = computed<Question[]>(() => paginatedData.value.list)

// 可见页码列表（最多显示7个页码）
const visiblePages = computed(() => {
  const total = paginatedData.value.totalPages
  const current = currentPage.value

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  // 智能省略号逻辑
  if (current <= 4) {
    return [1, 2, 3, 4, 5, -1, total]
  } else if (current >= total - 3) {
    return [1, -1, total - 4, total - 3, total - 2, total - 1, total]
  } else {
    return [1, -1, current - 1, current, current + 1, -1, total]
  }
})

// 监听visible变化
watch(
  () => props.visible,
  (newVal) => {
    isVisible.value = newVal
  }
)

watch(isVisible, (newVal) => {
  emit('update:visible', newVal)
})

/**
 * 从知识点移除试题
 */
const handleRemoveQuestion = (questionId: string) => {
  try {
    knowledgePointStore.unlinkQuestionFromKnowledgePoint(questionId)
    showToast('试题已从知识点中移除')
  } catch (error) {
    showToast(error instanceof Error ? error.message : '移除失败', { type: 'error' })
  }
}

/**
 * 获取题型中文名称
 */
const getQuestionTypeName = (type: QuestionType): string => {
  const typeNames: Record<QuestionType, string> = {
    single: '单选题',
    multiple: '多选题',
    judgment: '判断题',
    uncertain: '不定项',
    essay: '简答题',
    combination: '组合题'
  }
  return typeNames[type] || type
}

/**
 * 获取章节名称
 */
const getChapterName = (chapterId: string): string => {
  const chapter = chapterStore.chapters.find(c => c.id === chapterId)
  return chapter ? chapter.name : '未知章节'
}

/**
 * 获取难度中文名称
 */
const getDifficultyName = (difficulty?: QuestionDifficulty): string => {
  if (!difficulty) return '未设置'
  const difficultyNames: Record<QuestionDifficulty, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return difficultyNames[difficulty] || difficulty
}

/**
 * 获取来源中文名称
 */
const getSourceName = (source?: QuestionSource): string => {
  if (!source) return '未设置'
  const sourceNames: Record<QuestionSource, string> = {
    official: '真题',
    simulation: '模拟',
    custom: '自定义'
  }
  return sourceNames[source] || source
}

/**
 * 判断选项是否为正确答案
 */
const isCorrectOption = (answer: string | string[], label: string): boolean => {
  if (Array.isArray(answer)) {
    return answer.includes(label)
  }
  return answer === label
}

/**
 * 格式化答案显示
 */
const formatAnswer = (answer: string | string[]): string => {
  if (Array.isArray(answer)) {
    return answer.join(', ')
  }
  if (answer === 'true') return '正确'
  if (answer === 'false') return '错误'
  return answer
}

/**
 * 获取创建人名称
 */
const getCreatorName = (creatorId: string): string => {
  const creatorMap: Record<string, string> = {
    'admin': '管理员',
    'editor': '编辑员',
    'user-001': '当前用户'
  }
  return creatorMap[creatorId] || creatorId
}

/**
 * 格式化日期时间
 */
const formatDateTime = (dateTime: string): string => {
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 切换页码
 */
const handlePageChange = (page: number) => {
  if (page < 1 || page > paginatedData.value.totalPages) return
  currentPage.value = page
}

/**
 * 切换每页条数
 */
const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1 // 重置到第一页
}

/**
 * 关闭弹窗
 */
const handleClose = () => {
  isVisible.value = false
  currentPage.value = 1 // 重置分页
}
</script>

<style scoped>
.question-list-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-list-container {
  /* 移除内部滚动，依赖 BaseModal 的滚动机制 */
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

.action-btn {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
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
.question-stem {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

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

.answer-label,
.explanation-label {
  font-weight: 600;
  color: var(--secondary-text);
  font-size: 14px;
}

.answer-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent);
}

.explanation-text {
  font-size: 14px;
  line-height: 1.8;
  color: var(--primary-text);
  white-space: pre-wrap;
}

/* 卡片底部元数据 */
.card-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  padding: 14px 20px;
  background: #f5f8fc;
  font-size: 13px;
  color: var(--secondary-text);
}

.meta-item {
  display: flex;
  gap: 6px;
  align-items: center;
}

.meta-label {
  font-weight: 600;
  color: var(--primary-text);
}

/* 徽章 */
.type-badge,
.chapter-badge {
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

.chapter-badge {
  background: #f0f0f0;
  color: var(--secondary-text);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  margin: 0 0 8px;
  font-size: 16px;
  color: var(--secondary-text);
}

.empty-hint {
  margin: 0;
  font-size: 14px;
  color: #999;
}

.btn.primary {
  padding: 8px 20px;
  border-radius: 6px;
  background: linear-gradient(180deg, #4f77ff 0%, #2f57e3 100%);
  color: #ffffff;
  border: 1px solid #375edf;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn.primary:hover {
  background: linear-gradient(180deg, #4b6ee6 0%, #264acc 100%);
}

/* 分页器样式 */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-top: 1px solid var(--panel-border);
  margin-top: 24px;
}

.pagination-info {
  font-size: 14px;
  color: var(--secondary-text);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid var(--panel-border);
  background: white;
  color: var(--primary-text);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-number {
  min-width: 36px;
  height: 36px;
  border: 1px solid var(--panel-border);
  background: white;
  color: var(--primary-text);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.page-number:hover:not(.ellipsis):not(.active) {
  border-color: var(--accent);
  color: var(--accent);
}

.page-number.active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.page-number.ellipsis {
  border: none;
  cursor: default;
  color: var(--secondary-text);
}

.pagination-size select {
  padding: 8px 12px;
  border: 1px solid var(--panel-border);
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  background: white;
  color: var(--primary-text);
  transition: all 0.2s;
}

.pagination-size select:hover {
  border-color: var(--accent);
}

.pagination-size select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}
</style>
