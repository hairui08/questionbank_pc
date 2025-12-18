<template>
  <div class="type-list-panel">
    <div class="panel-header">
      <div class="breadcrumb">题型列表</div>
      <button class="btn primary" @click="emit('add-type')">+ 新增题型</button>
    </div>

    <table class="type-table">
      <thead>
        <tr>
          <th style="width: 10%">排序</th>
          <th style="width: 20%">内部题型名称</th>
          <th style="width: 20%">外部显示名称</th>
          <th style="width: 15%">排序操作</th>
          <th style="width: 12%">状态</th>
          <th style="width: 23%">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="type in paginatedData" :key="type.id" class="type-row">
          <td>{{ type.order }}</td>
          <td>{{ type.internalName }}</td>
          <td>{{ type.displayName }}</td>
          <td style="text-align: center">
            <div class="sort-buttons">
              <button
                class="sort-btn"
                :disabled="isFirstInSubject(type)"
                @click="emit('move-up', type)"
                title="上移"
              >
                ↑
              </button>
              <button
                class="sort-btn"
                :disabled="isLastInSubject(type)"
                @click="emit('move-down', type)"
                title="下移"
              >
                ↓
              </button>
            </div>
          </td>
          <td>
            <span :class="['status', type.status === 'active' ? 'is-active' : 'is-disabled']">
              {{ type.status === 'active' ? '启用' : '禁用' }}
            </span>
          </td>
          <td>
            <ActionDropdown
              :items="getActionMenuItems(type)"
              @select="(key) => handleActionSelect(key, type)"
            />
          </td>
        </tr>
        <tr v-if="paginatedData.length === 0">
          <td colspan="6" style="text-align: center; padding: 40px; color: var(--secondary-text)">
            暂无题型配置，点击「新增题型」开始添加
          </td>
        </tr>
      </tbody>
    </table>

    <div class="pagination" v-if="types.length > 0">
      <div class="pagination-info">共 {{ totalCount }} 条，每页 10 条</div>
      <div class="pagination-controls">
        <button class="page-btn" :disabled="!hasPrev" @click="prevPage">上一页</button>
        <template v-for="(page, index) in pageNumbers" :key="index">
          <span v-if="page === '...'" class="page-ellipsis">...</span>
          <button
            v-else
            :class="['page-btn', { active: page === currentPage }]"
            @click="goToPage(page as number)"
          >
            {{ page }}
          </button>
        </template>
        <button class="page-btn" :disabled="!hasNext" @click="nextPage">下一页</button>
        <div class="page-jump">
          跳转到
          <input
            v-model.number="jumpPageInput"
            type="number"
            :min="1"
            :max="totalPages"
            @keyup.enter="handleJump"
          />
          页
          <button class="page-btn" @click="handleJump">跳转</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePagination } from '@/composables/usePagination'
import ActionDropdown from '@/components/ActionDropdown.vue'
import type { MenuItem } from '@/components/ActionDropdown.vue'
import type { QuestionType } from '../types'

// Props
interface Props {
  types: QuestionType[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'add-type': []
  'edit-type': [type: QuestionType]
  'delete-type': [type: QuestionType]
  'toggle-status': [type: QuestionType]
  'move-up': [type: QuestionType]
  'move-down': [type: QuestionType]
}>()

// 分页逻辑
const {
  currentPage,
  totalPages,
  totalCount,
  paginatedData,
  hasPrev,
  hasNext,
  pageNumbers,
  goToPage,
  prevPage,
  nextPage
} = usePagination(props.types, 10)

// 跳转页码输入
const jumpPageInput = ref<number | ''>('')

/**
 * 处理页码跳转
 */
const handleJump = () => {
  if (jumpPageInput.value && jumpPageInput.value >= 1 && jumpPageInput.value <= totalPages.value) {
    goToPage(jumpPageInput.value)
    jumpPageInput.value = ''
  }
}

/**
 * 获取操作菜单项
 */
const getActionMenuItems = (type: QuestionType): MenuItem[] => {
  return [
    { key: 'edit', label: '编辑', icon: '✏️' },
    {
      key: 'toggle',
      label: type.status === 'active' ? '禁用' : '启用',
      icon: type.status === 'active' ? '🔒' : '✅'
    },
    { key: 'delete', label: '删除', icon: '🗑️', danger: true }
  ]
}

/**
 * 处理操作选择
 */
const handleActionSelect = (key: string, type: QuestionType) => {
  switch (key) {
    case 'edit':
      emit('edit-type', type)
      break
    case 'toggle':
      emit('toggle-status', type)
      break
    case 'delete':
      emit('delete-type', type)
      break
  }
}

/**
 * 判断是否是第一个题型
 */
const isFirstInSubject = (type: QuestionType): boolean => {
  const sortedTypes = [...props.types].sort((a, b) => a.order - b.order)
  return sortedTypes.length > 0 && sortedTypes[0].id === type.id
}

/**
 * 判断是否是最后一个题型
 */
const isLastInSubject = (type: QuestionType): boolean => {
  const sortedTypes = [...props.types].sort((a, b) => a.order - b.order)
  return sortedTypes.length > 0 && sortedTypes[sortedTypes.length - 1].id === type.id
}
</script>

<style scoped>
.type-list-panel {
  flex: 1;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--panel-border);
  background: linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.breadcrumb {
  font-size: 13px;
  color: var(--secondary-text);
}

.btn {
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid transparent;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn.primary {
  background: linear-gradient(180deg, #4f77ff 0%, #2f57e3 100%);
  color: #ffffff;
  border-color: #375edf;
  box-shadow: 0 4px 8px rgba(79, 119, 255, 0.3);
}

.btn.primary:hover {
  background: linear-gradient(180deg, #4b6ee6 0%, #264acc 100%);
}

.type-table {
  width: 100%;
  border-collapse: collapse;
}

.type-table th {
  padding: 12px 20px;
  text-align: left;
  background: #fafafa;
  border-bottom: 1px solid var(--panel-border);
  font-weight: 600;
  color: var(--secondary-text);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.type-table td {
  padding: 14px 20px;
  border-bottom: 1px solid var(--panel-border);
  font-size: 14px;
  color: var(--primary-text);
}

.type-row {
  transition: all 0.2s ease;
}

.type-row:hover {
  background-color: #f9fbff;
}

.status {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
}

.status.is-active {
  background-color: #ecfff2;
  color: #2e8b57;
  border: 1px solid rgba(46, 139, 87, 0.4);
}

.status.is-disabled {
  background-color: #fff3f0;
  color: #cf4a30;
  border: 1px solid rgba(207, 74, 48, 0.3);
}

/* 排序按钮 */
.sort-buttons {
  display: flex;
  gap: 8px;
}

.sort-btn {
  width: 32px;
  height: 28px;
  border: 1px solid var(--panel-border);
  border-radius: 4px;
  background: #ffffff;
  color: var(--accent);
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sort-btn:hover:not(:disabled) {
  background: var(--row-hover);
  border-color: var(--accent);
  transform: scale(1.05);
}

.sort-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  color: var(--secondary-text);
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid var(--panel-border);
  background: #fafafa;
}

.pagination-info {
  font-size: 13px;
  color: var(--secondary-text);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-btn {
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px solid var(--panel-border);
  background: #ffffff;
  color: var(--primary-text);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: var(--row-hover);
  border-color: var(--accent);
  color: var(--accent);
}

.page-btn.active {
  background: var(--accent);
  color: #ffffff;
  border-color: var(--accent);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-ellipsis {
  padding: 4px 10px;
  color: var(--secondary-text);
  font-size: 12px;
}

.page-jump {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 8px;
  font-size: 12px;
  color: var(--secondary-text);
}

.page-jump input {
  width: 50px;
  padding: 4px 8px;
  border: 1px solid var(--panel-border);
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
}
</style>
