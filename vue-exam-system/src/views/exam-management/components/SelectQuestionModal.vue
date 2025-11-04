<template>
  <BaseModal
    :visible="show"
    title="选择试题"
    width="1200px"
    @update:visible="handleClose"
  >
    <template #body>
      <div class="select-question-content">
        <!-- 筛选器 -->
        <div class="filter-bar">
          <!-- 第一行筛选项 -->
          <div class="filter-row">
            <div class="filter-item">
              <label>章节</label>
              <select v-model="localFilter.chapterId">
                <option value="">全部章节</option>
                <option v-for="chapter in chapters" :key="chapter.id" :value="chapter.id">
                  {{ chapter.name }}
                </option>
              </select>
            </div>

            <div class="filter-item">
              <label>试题来源</label>
              <select v-model="localFilter.source">
                <option value="">全部来源</option>
                <option value="official">历年真题</option>
                <option value="simulation">模拟试题</option>
                <option value="custom">自定义</option>
              </select>
            </div>

            <div class="filter-item">
              <label>所属年份</label>
              <select v-model="localFilter.year">
                <option value="">全部年份</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
              </select>
            </div>

            <div class="filter-item">
              <label>知识点</label>
              <select v-model="localFilter.knowledgePointId">
                <option value="">全部知识点</option>
                <option v-for="kp in knowledgePoints" :key="kp.id" :value="kp.id">
                  {{ kp.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- 第二行筛选项 -->
          <div class="filter-row">
            <div class="filter-item">
              <label>题型</label>
              <select v-model="localFilter.type">
                <option value="">全部题型</option>
                <option value="single">单选题</option>
                <option value="multiple">多选题</option>
                <option value="judgment">判断题</option>
                <option value="uncertain">不定项</option>
                <option value="essay">简答题</option>
                <option value="combination">组合题</option>
              </select>
            </div>

            <div class="filter-item">
              <label>难度</label>
              <select v-model="localFilter.difficulty">
                <option value="">全部难度</option>
                <option value="easy">简单</option>
                <option value="medium">中等</option>
                <option value="hard">困难</option>
              </select>
            </div>

            <div class="filter-actions">
              <button class="btn primary" @click="handleSearch">
                🔍 搜索
              </button>
              <button class="btn secondary" @click="handleReset">
                🔄 重置
              </button>
            </div>
          </div>
        </div>

        <!-- 试题列表 -->
        <div class="question-list">
          <table class="question-table">
            <thead>
              <tr>
                <th width="50">
                  <input
                    type="checkbox"
                    :checked="isAllSelected"
                    @change="toggleSelectAll"
                  />
                </th>
                <th width="60">序号</th>
                <th>题干</th>
                <th width="80">题型</th>
                <th width="80">难度</th>
                <th width="100">章节</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="paginatedQuestions.length === 0">
                <td colspan="6" class="empty-state">
                  暂无试题数据
                </td>
              </tr>
              <tr
                v-for="(question, index) in paginatedQuestions"
                :key="question.id"
                :class="{ selected: selectedQuestionIds.includes(question.id) }"
              >
                <td>
                  <input
                    type="checkbox"
                    :checked="selectedQuestionIds.includes(question.id)"
                    :disabled="isQuestionSelected(question.id)"
                    @change="toggleSelect(question.id)"
                  />
                </td>
                <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
                <td class="question-stem">{{ getQuestionStem(question) }}</td>
                <td>{{ getTypeName(question.type) }}</td>
                <td>{{ getDifficultyName(question.difficulty) }}</td>
                <td>{{ getChapterName(question.chapterId) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页器 -->
        <div v-if="totalPages > 0" class="pagination">
          <div class="pagination-info">
            共 {{ filteredQuestions.length }} 条记录,第 {{ currentPage }} / {{ totalPages }} 页
          </div>
          <div class="pagination-controls">
            <button
              class="pagination-btn"
              :disabled="currentPage === 1"
              @click="prevPage"
            >
              上一页
            </button>
            <div class="page-numbers">
              <button
                v-for="page in visiblePages"
                :key="page"
                class="page-number"
                :class="{ active: page === currentPage }"
                :disabled="page === -1"
                @click="goToPage(page)"
              >
                {{ page === -1 ? '...' : page }}
              </button>
            </div>
            <button
              class="pagination-btn"
              :disabled="currentPage === totalPages"
              @click="nextPage"
            >
              下一页
            </button>
          </div>
          <div class="pagination-size">
            <label>每页显示</label>
            <select v-model.number="pageSize">
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
            <span>条</span>
          </div>
        </div>

        <div class="selected-info">
          已选中 {{ selectedQuestionIds.length }} 道试题
        </div>
      </div>
    </template>
    <template #footer>
      <button class="btn secondary" @click="emit('close')">取消</button>
      <button class="btn primary" @click="handleConfirm">确认选择</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseModal from '@/components/Modal/BaseModal.vue'
import { useQuestionStore } from '@/stores/question'
import { useChapterStore } from '@/stores/chapter'
import { useKnowledgePointStore } from '@/stores/knowledgePoint'
import type { Question } from '@/views/question-management/types'

interface Props {
  show: boolean
  subjectId: string
  excludeIds?: string[] // 已经添加到试卷的试题ID,不允许重复选择
}

interface Emits {
  (e: 'close'): void
  (e: 'confirm', questionIds: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  excludeIds: () => []
})
const emit = defineEmits<Emits>()

const questionStore = useQuestionStore()
const chapterStore = useChapterStore()
const knowledgePointStore = useKnowledgePointStore()

// 本地筛选条件
const localFilter = ref({
  chapterId: '',
  source: '',
  year: '',
  knowledgePointId: '',
  type: '',
  difficulty: ''
})

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)

// 已选中的试题ID
const selectedQuestionIds = ref<string[]>([])

// 获取该科目的所有章节
const chapters = computed(() => {
  return chapterStore.chapters.filter(c => c.subjectId === props.subjectId)
})

// 获取该科目的所有知识点
const knowledgePoints = computed(() => {
  return knowledgePointStore.knowledgePoints.filter(kp => kp.subjectId === props.subjectId)
})

// 获取筛选后的试题
const filteredQuestions = computed(() => {
  const filter = {
    subjectId: props.subjectId,
    chapterId: localFilter.value.chapterId || undefined,
    source: localFilter.value.source as any,
    year: localFilter.value.year || undefined,
    knowledgePointId: localFilter.value.knowledgePointId || undefined,
    type: localFilter.value.type as any,
    difficulty: localFilter.value.difficulty as any
  }
  return questionStore.getFilteredQuestions(filter)
})

// 分页后的试题
const paginatedQuestions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredQuestions.value.slice(start, end)
})

// 总页数
const totalPages = computed(() =>
  Math.ceil(filteredQuestions.value.length / pageSize.value)
)

// 可见页码
const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages: number[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push(-1)
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push(-1)
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push(-1)
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push(-1)
      pages.push(total)
    }
  }

  return pages
})

// 是否全选(当前页)
const isAllSelected = computed(() => {
  const selectableQuestions = paginatedQuestions.value.filter(q => !isQuestionSelected(q.id))
  return selectableQuestions.length > 0 && selectableQuestions.every(q => selectedQuestionIds.value.includes(q.id))
})

// 检查试题是否已被添加到试卷
function isQuestionSelected(questionId: string): boolean {
  return props.excludeIds.includes(questionId)
}

// 切换全选(当前页)
function toggleSelectAll() {
  const selectableQuestions = paginatedQuestions.value.filter(q => !isQuestionSelected(q.id))

  if (isAllSelected.value) {
    // 取消全选当前页
    selectedQuestionIds.value = selectedQuestionIds.value.filter(id =>
      !selectableQuestions.some(q => q.id === id)
    )
  } else {
    // 全选当前页
    const newIds = selectableQuestions.map(q => q.id)
    selectedQuestionIds.value = [...new Set([...selectedQuestionIds.value, ...newIds])]
  }
}

// 切换单选
function toggleSelect(id: string) {
  if (selectedQuestionIds.value.includes(id)) {
    selectedQuestionIds.value = selectedQuestionIds.value.filter(selectedId => selectedId !== id)
  } else {
    selectedQuestionIds.value.push(id)
  }
}

// 搜索
function handleSearch() {
  currentPage.value = 1
}

// 重置
function handleReset() {
  localFilter.value = {
    chapterId: '',
    source: '',
    year: '',
    knowledgePointId: '',
    type: '',
    difficulty: ''
  }
  currentPage.value = 1
}

// 上一页
function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// 下一页
function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

// 跳转到指定页
function goToPage(page: number) {
  if (page === -1 || page < 1 || page > totalPages.value) return
  currentPage.value = page
}

// 监听筛选条件变化,重置到第一页
watch(localFilter, () => {
  currentPage.value = 1
}, { deep: true })

// 监听pageSize变化,重置到第一页
watch(pageSize, () => {
  currentPage.value = 1
})

// 关闭弹窗
function handleClose() {
  emit('close')
}

// 确认选择
function handleConfirm() {
  emit('confirm', selectedQuestionIds.value)
  selectedQuestionIds.value = []
}

// 获取试题题干(处理组合题特殊情况)
function getQuestionStem(question: Question): string {
  const stem = question.type === 'combination' ? question.mainStem : question.stem
  return truncateStem(stem || '')
}

// 截取题干
function truncateStem(stem: string): string {
  return stem.length > 60 ? stem.substring(0, 60) + '...' : stem
}

// 获取题型名称
function getTypeName(type: string): string {
  const typeNames: Record<string, string> = {
    single: '单选题',
    multiple: '多选题',
    judgment: '判断题',
    uncertain: '不定项',
    essay: '简答题',
    combination: '组合题'
  }
  return typeNames[type] || type
}

// 获取难度名称
function getDifficultyName(difficulty?: string): string {
  if (!difficulty) return '-'
  const difficultyNames: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return difficultyNames[difficulty] || difficulty
}

// 获取章节名称
function getChapterName(chapterId: string): string {
  const chapter = chapterStore.chapters.find(c => c.id === chapterId)
  return chapter?.name || '-'
}
</script>

<style scoped>
.select-question-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 80vh;
}

.filter-bar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--panel-border);
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  align-items: flex-end;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-item label {
  font-size: 13px;
  font-weight: 600;
  color: var(--primary-text);
}

.filter-item select {
  padding: 8px 12px;
  border: 1px solid var(--panel-border);
  border-radius: 6px;
  font-size: 14px;
  background: #ffffff;
  transition: border-color 0.2s ease;
}

.filter-item select:focus {
  outline: none;
  border-color: var(--accent);
}

.filter-actions {
  display: flex;
  gap: 12px;
  align-self: flex-end;
}

.question-list {
  flex: 1;
  overflow-y: auto;
  border: 1px solid var(--panel-border);
  border-radius: 8px;
}

.question-table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
}

.question-table thead {
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  position: sticky;
  top: 0;
  z-index: 1;
}

.question-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: var(--primary-text);
  border-bottom: 2px solid var(--table-border);
}

.question-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--table-border);
  color: var(--primary-text);
  font-size: 14px;
}

.question-table tbody tr:hover {
  background: var(--row-hover);
}

.question-table tbody tr.selected {
  background: #e3f2fd;
}

.question-stem {
  color: var(--accent);
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--secondary-text);
  font-size: 14px;
}

.selected-info {
  padding: 12px;
  background: #e3f2fd;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--accent);
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

.btn.secondary {
  background: #ffffff;
  color: var(--primary-text);
  border-color: var(--panel-border);
}

.btn.secondary:hover {
  background: #f8fafc;
}

input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

input[type="checkbox"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 分页器 */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  padding: 16px 20px;
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

.pagination-btn {
  padding: 6px 16px;
  border-radius: 6px;
  border: 1px solid var(--panel-border);
  background: #ffffff;
  color: var(--primary-text);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--row-hover);
  border-color: var(--accent);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-number {
  min-width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid var(--panel-border);
  background: #ffffff;
  color: var(--primary-text);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-number:hover:not(:disabled) {
  background: var(--row-hover);
  border-color: var(--accent);
}

.page-number:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.page-number.active {
  background: linear-gradient(180deg, #4f77ff 0%, #2f57e3 100%);
  color: #ffffff;
  border-color: #375edf;
}

.pagination-size {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--primary-text);
}

.pagination-size label {
  font-weight: normal;
}

.pagination-size select {
  padding: 6px 12px;
  border: 1px solid var(--panel-border);
  border-radius: 6px;
  font-size: 14px;
  background: #ffffff;
  cursor: pointer;
}

.pagination-size select:focus {
  outline: none;
  border-color: var(--accent);
}
</style>
