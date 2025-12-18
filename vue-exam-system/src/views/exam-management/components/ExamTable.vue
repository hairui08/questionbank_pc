<template>
  <div class="exam-table-wrapper">
    <table class="exam-table">
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
          <th width="15%">试卷名称</th>
          <th width="10%">学习阶段</th>
          <th width="6%">年份</th>
          <th width="6%">总分</th>
          <th width="6%">及格分</th>
          <th width="14%">创建时间</th>
          <th width="7%">创建人</th>
          <th width="7%">状态</th>
          <th width="11%">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="exams.length === 0">
          <td colspan="11" class="empty-state">
            暂无试卷数据
          </td>
        </tr>
        <tr v-for="(exam, index) in exams" :key="exam.id">
          <td>
            <input
              type="checkbox"
              :checked="selectedIds.includes(exam.id)"
              @change="toggleSelect(exam.id)"
            />
          </td>
          <td>{{ index + 1 }}</td>
          <td class="exam-name">{{ exam.name }}</td>
          <td>{{ getStageName(exam.learningStageId) }}</td>
          <td>{{ exam.year || '-' }}</td>
          <td>{{ exam.totalScore }}分</td>
          <td>{{ exam.passingScore }}分</td>
          <td>{{ formatDate(exam.createTime) }}</td>
          <td>{{ exam.creatorName }}</td>
          <td>
            <span class="status-badge" :class="exam.status">
              {{ exam.status === 'active' ? '启用' : '禁用' }}
            </span>
          </td>
          <td>
            <ActionDropdown
              :items="getMenuItems(exam)"
              @select="(key) => handleActionSelect(key, exam.id)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLearningStageStore } from '@/stores/learningStage'
import ActionDropdown from '@/components/ActionDropdown.vue'
import type { MenuItem } from '@/components/ActionDropdown.vue'
import type { Exam } from '../types'

interface Props {
  exams: Exam[]
  selectedIds: string[]
}

interface Emits {
  (e: 'update:selectedIds', value: string[]): void
  (e: 'preview', id: string): void
  (e: 'edit', id: string): void
  (e: 'delete', id: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 初始化stores
const learningStageStore = useLearningStageStore()

// 是否全选
const isAllSelected = computed(() => {
  return props.exams.length > 0 && props.exams.every(exam => props.selectedIds.includes(exam.id))
})

// 切换全选
function toggleSelectAll() {
  if (isAllSelected.value) {
    emit('update:selectedIds', [])
  } else {
    emit('update:selectedIds', props.exams.map(e => e.id))
  }
}

// 切换单选
function toggleSelect(id: string) {
  const newSelectedIds = props.selectedIds.includes(id)
    ? props.selectedIds.filter(selectedId => selectedId !== id)
    : [...props.selectedIds, id]
  emit('update:selectedIds', newSelectedIds)
}

// 格式化日期时间
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 获取付费级别显示文本
function getPaymentLevelText(vipLevel?: number): string {
  if (!vipLevel || vipLevel === 0) return '免费'
  if (vipLevel === 1) return '基础'
  return '高级' // vipLevel >= 2
}

// 获取付费级别样式类名
function getPaymentLevelClass(vipLevel?: number): string {
  if (!vipLevel || vipLevel === 0) return 'payment-free'
  if (vipLevel === 1) return 'payment-basic'
  return 'payment-premium' // vipLevel >= 2
}

// 获取学习阶段名称
function getStageName(stageId?: string): string {
  if (!stageId) return '-'
  const stage = learningStageStore.learningStages.find(s => s.id === stageId)
  return stage?.name || '-'
}

/**
 * 获取操作菜单项
 */
function getMenuItems(exam: Exam): MenuItem[] {
  return [
    { key: 'preview', label: '预览', icon: '👁️' },
    { key: 'edit', label: '编辑', icon: '✏️' },
    { key: 'delete', label: '删除', icon: '🗑️', danger: true }
  ]
}

/**
 * 处理操作选择
 */
function handleActionSelect(key: string, examId: string) {
  switch (key) {
    case 'preview':
      emit('preview', examId)
      break
    case 'edit':
      emit('edit', examId)
      break
    case 'delete':
      emit('delete', examId)
      break
  }
}
</script>

<style scoped>
.exam-table-wrapper {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  overflow: hidden;
}

.exam-table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
}

.exam-table thead {
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 2px solid var(--table-border);
}

.exam-table th {
  padding: 14px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: var(--primary-text);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.exam-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--table-border);
  color: var(--primary-text);
  font-size: 14px;
  vertical-align: middle;
  white-space: nowrap;
}

.exam-table tbody tr:last-child td {
  border-bottom: none;
}

.exam-table tbody tr:hover {
  background: var(--row-hover);
}

.exam-name {
  font-weight: 500;
  color: var(--accent);
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.disabled {
  background: #f8d7da;
  color: #721c24;
}

.payment-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
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

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--secondary-text);
  font-size: 14px;
}

input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}
</style>
