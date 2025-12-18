<template>
  <BaseModal
    :visible="isVisible"
    :title="`知识点「${knowledgePointName}」关联的试题`"
    width="1200px"
    @update:visible="isVisible = $event"
    @close="handleClose"
  >
    <div class="question-list-wrapper">
      <!-- 试题列表表格 -->
      <div class="question-table-container">
        <table class="question-table">
          <thead>
            <tr>
              <th width="30%">题目内容</th>
              <th width="8%">题型</th>
              <th width="15%">关联章节</th>
              <th width="18%">关联知识点</th>
              <th width="8%">试题难度</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="questions.length === 0">
              <td colspan="5" class="empty-message">
                <div class="empty-state">
                  <div class="empty-icon">📝</div>
                  <p class="empty-text">暂无关联试题</p>
                </div>
              </td>
            </tr>
            <tr v-for="question in questions" :key="question.id">
              <td class="stem-cell">
                <div class="stem-content" :title="question.stem">
                  {{ truncateStem(question.stem) }}
                </div>
              </td>
              <td>
                <span class="type-badge" :class="`type-${question.type}`">
                  {{ getQuestionTypeName(question.type) }}
                </span>
              </td>
              <td>{{ getChapterName(question.chapterId) }}</td>
              <td class="knowledge-points-cell">
                {{ getKnowledgePointNames(question.knowledgePointIds) }}
              </td>
              <td>
                <span class="difficulty-badge" :class="`difficulty-${question.difficulty}`">
                  {{ getDifficultyName(question.difficulty) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
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
 * 截断题干内容
 */
const truncateStem = (stem: string): string => {
  return stem.length > 50 ? stem.substring(0, 50) + '...' : stem
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
  return chapter ? chapter.name : '-'
}

/**
 * 获取知识点名称列表
 */
const getKnowledgePointNames = (knowledgePointIds?: string[]): string => {
  if (!knowledgePointIds || knowledgePointIds.length === 0) return '-'
  const names = knowledgePointIds
    .map(id => {
      const kp = knowledgePointStore.getKnowledgePointById(id)
      return kp?.name
    })
    .filter(name => name !== undefined) as string[]
  return names.length > 0 ? names.join('、') : '-'
}

/**
 * 获取难度中文名称
 */
const getDifficultyName = (difficulty?: QuestionDifficulty): string => {
  if (!difficulty) return '-'
  const difficultyNames: Record<QuestionDifficulty, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return difficultyNames[difficulty] || difficulty
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

.question-table-container {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  overflow: hidden;
}

.question-table {
  width: 100%;
  border-collapse: collapse;
}

.question-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.question-table th {
  padding: 14px 12px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.question-table tbody tr {
  border-bottom: 1px solid var(--table-border);
  transition: background-color 0.2s ease;
}

.question-table tbody tr:last-child {
  border-bottom: none;
}

.question-table tbody tr:hover {
  background: var(--row-hover);
}

.question-table td {
  padding: 12px;
  font-size: 14px;
  color: var(--primary-text);
  vertical-align: middle;
}

.empty-message {
  text-align: center;
  padding: 0 !important;
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
  margin: 0;
  font-size: 16px;
  color: var(--secondary-text);
}

.stem-cell {
  max-width: 400px;
}

.stem-content {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.knowledge-points-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--accent);
  font-size: 13px;
}

/* 徽章 */
.type-badge,
.difficulty-badge {
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

.difficulty-badge.difficulty-easy {
  background: #e8f5e9;
  color: #2e7d32;
}

.difficulty-badge.difficulty-medium {
  background: #fff3e0;
  color: #ef6c00;
}

.difficulty-badge.difficulty-hard {
  background: #ffebee;
  color: #c62828;
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
