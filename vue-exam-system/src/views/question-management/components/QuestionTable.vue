<template>
  <div class="question-table-wrapper">
    <table class="question-table">
      <thead>
        <tr>
          <th width="50">
            <input
              type="checkbox"
              :checked="isAllSelected"
              @change="toggleSelectAll"
            >
          </th>
          <th width="30%">题目内容</th>
          <th width="8%">题型</th>
          <th width="10%">关联章节</th>
          <th width="12%">关联知识点</th>
          <th width="8%">试题难度</th>
          <th width="10%">创建时间</th>
          <th width="6%">创建人</th>
          <th width="10%">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="questions.length === 0">
          <td colspan="9" class="empty-message">
            暂无试题数据
          </td>
        </tr>
        <tr
          v-for="question in questions"
          :key="question.id"
          :class="{ selected: selectedIds.includes(question.id) }"
        >
          <td>
            <input
              type="checkbox"
              :checked="selectedIds.includes(question.id)"
              @change="toggleSelect(question.id)"
            >
          </td>
          <td class="stem-cell">
            <div class="stem-content" :title="question.stem">
              {{ truncateStem(question.stem) }}
            </div>
          </td>
          <td>
            <span class="type-badge" :class="`type-${question.type}`">
              {{ getTypeName(question.type) }}
            </span>
          </td>
          <td>{{ getChapterName(question.chapterId) }}</td>
          <td class="knowledge-points-cell">{{ getKnowledgePointNames(question.knowledgePointIds) }}</td>
          <td>
            <span class="difficulty-badge" :class="`difficulty-${question.difficulty}`">
              {{ getDifficultyName(question.difficulty) }}
            </span>
          </td>
          <td>{{ formatDateTime(question.createTime) }}</td>
          <td>{{ question.creatorId }}</td>
          <td>
            <div class="action-buttons">
              <button class="action-btn edit" @click="handleEdit(question.id)" title="编辑">
                编辑
              </button>
              <button class="action-btn delete" @click="handleDelete(question.id)" title="删除">
                删除
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Question } from '../types'
import { QuestionTypeNames } from '../types'
import { useChapterStore } from '@/stores/chapter'
import { useKnowledgePointStore } from '@/stores/knowledgePoint'

interface Props {
  questions: Question[]
  selectedIds: string[]
}

interface Emits {
  (e: 'update:selectedIds', value: string[]): void
  (e: 'edit', id: string): void
  (e: 'delete', id: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const chapterStore = useChapterStore()
const knowledgePointStore = useKnowledgePointStore()

const isAllSelected = computed(() => {
  return props.questions.length > 0 && props.selectedIds.length === props.questions.length
})

function toggleSelectAll(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.checked) {
    emit('update:selectedIds', props.questions.map(q => q.id))
  } else {
    emit('update:selectedIds', [])
  }
}

function toggleSelect(id: string) {
  const newIds = props.selectedIds.includes(id)
    ? props.selectedIds.filter(selectedId => selectedId !== id)
    : [...props.selectedIds, id]
  emit('update:selectedIds', newIds)
}

function truncateStem(stem: string): string {
  return stem.length > 50 ? stem.substring(0, 50) + '...' : stem
}

function getTypeName(type: string): string {
  return QuestionTypeNames[type as keyof typeof QuestionTypeNames] || type
}

function getChapterName(chapterId: string): string {
  const chapter = chapterStore.chapters.find(c => c.id === chapterId)
  return chapter?.name || '-'
}

function getKnowledgePointNames(knowledgePointIds?: string[]): string {
  if (!knowledgePointIds || knowledgePointIds.length === 0) return '-'
  const names = knowledgePointIds
    .map(id => {
      const kp = knowledgePointStore.getKnowledgePointById(id)
      return kp?.name
    })
    .filter(name => name !== undefined) as string[]
  return names.length > 0 ? names.join('、') : '-'
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

function formatDateTime(dateTime: string): string {
  const date = new Date(dateTime)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
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
.question-table-wrapper {
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

.question-table tbody tr.selected {
  background: #e6f2ff;
}

.question-table td {
  padding: 12px;
  font-size: 14px;
  color: var(--primary-text);
  vertical-align: middle;
}

.empty-message {
  text-align: center;
  padding: 60px 20px !important;
  color: var(--secondary-text);
  font-size: 14px;
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

.type-badge,
.difficulty-badge,
.payment-badge {
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

.action-buttons {
  display: flex;
  gap: 6px;
}

.action-btn {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
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
</style>
