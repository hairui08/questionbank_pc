<template>
  <div class="test-table-wrapper">
    <table class="test-table">
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
          <th width="18%">考试名称</th>
          <th width="8%">考试类型</th>
          <th width="6%">总分</th>
          <th width="6%">及格分</th>
          <th width="7%">考试时长</th>
          <th width="15%">考试时间</th>
          <th width="14%">创建时间</th>
          <th width="8%">创建人</th>
          <th width="8%">状态</th>
          <th width="14%">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="tests.length === 0">
          <td colspan="12" class="empty-state">
            暂无考试数据
          </td>
        </tr>
        <tr v-for="(test, index) in tests" :key="test.id">
          <td>
            <input
              type="checkbox"
              :checked="selectedIds.includes(test.id)"
              @change="toggleSelect(test.id)"
            />
          </td>
          <td>{{ index + 1 }}</td>
          <td class="test-name">{{ test.name }}</td>
          <td>{{ getExamTypeLabel(test.examType) }}</td>
          <td>{{ test.totalScore }}分</td>
          <td>{{ test.passingScore }}分</td>
          <td>{{ test.duration }}分钟</td>
          <td>{{ formatTime(test.startTime) }}</td>
          <td>{{ formatDateTime(test.createTime) }}</td>
          <td>{{ test.creatorName }}</td>
          <td>
            <span class="status-badge" :class="test.status">
              {{ getReviewStatusLabel(test.status) }}
            </span>
          </td>
          <td>
            <ActionDropdown
              :items="getMenuItems(test)"
              @select="(key) => handleActionSelect(key, test.id)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ActionDropdown from '@/components/ActionDropdown.vue'
import type { MenuItem } from '@/components/ActionDropdown.vue'
import type { Test } from '../types'
import { getExamTypeLabel, getReviewStatusLabel } from '../types'

interface Props {
  tests: Test[]
  selectedIds: string[]
}

interface Emits {
  (e: 'update:selectedIds', value: string[]): void
  (e: 'preview', id: string): void
  (e: 'edit', id: string): void
  (e: 'review', id: string): void
  (e: 'delete', id: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 是否全选
const isAllSelected = computed(() => {
  return props.tests.length > 0 && props.tests.every(test => props.selectedIds.includes(test.id))
})

// 切换全选
function toggleSelectAll() {
  if (isAllSelected.value) {
    emit('update:selectedIds', [])
  } else {
    emit('update:selectedIds', props.tests.map(t => t.id))
  }
}

// 切换单选
function toggleSelect(id: string) {
  const newSelectedIds = props.selectedIds.includes(id)
    ? props.selectedIds.filter(selectedId => selectedId !== id)
    : [...props.selectedIds, id]
  emit('update:selectedIds', newSelectedIds)
}

// 格式化日期时间(完整)
function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 格式化时间(仅时间)
function formatTime(dateString: string): string {
  return dateString // 假设数据已经是格式化的
}

/**
 * 获取操作菜单项
 */
function getMenuItems(test: Test): MenuItem[] {
  return [
    { key: 'preview', label: '预览', icon: '👁️' },
    { key: 'edit', label: '编辑', icon: '✏️' },
    {
      key: 'review',
      label: '审核',
      icon: '✅',
      disabled: test.status !== 'pending'  // 非待审状态禁用
    },
    { key: 'delete', label: '删除', icon: '🗑️', danger: true }
  ]
}

/**
 * 处理操作选择
 */
function handleActionSelect(key: string, testId: string) {
  switch (key) {
    case 'preview':
      emit('preview', testId)
      break
    case 'edit':
      emit('edit', testId)
      break
    case 'review':
      emit('review', testId)
      break
    case 'delete':
      emit('delete', testId)
      break
  }
}
</script>

<style scoped>
.test-table-wrapper {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  overflow: hidden;
}

.test-table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
}

.test-table thead {
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 2px solid var(--table-border);
}

.test-table th {
  padding: 14px 12px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: var(--primary-text);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.test-table td {
  padding: 14px 12px;
  border-bottom: 1px solid var(--table-border);
  color: var(--primary-text);
  font-size: 14px;
  vertical-align: middle;
  white-space: nowrap;
}

.test-table tbody tr:last-child td {
  border-bottom: none;
}

.test-table tbody tr:hover {
  background: var(--row-hover);
}

.test-name {
  font-weight: 500;
  color: var(--accent);
  white-space: normal;
  max-width: 200px;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.pending {
  background: #fff3e0;
  color: #f57c00;
}

.status-badge.approved {
  background: #d4edda;
  color: #155724;
}

.status-badge.rejected {
  background: #f8d7da;
  color: #721c24;
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
