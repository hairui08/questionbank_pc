<template>
  <div class="type-list-panel">
    <div class="panel-header">
      <div class="breadcrumb">{{ projectName }} / {{ subjectName }} / 题型列表</div>
      <button class="btn primary" @click="emit('add-type')">+ 新增题型</button>
    </div>

    <table class="type-table">
      <thead>
        <tr>
          <th style="width: 60px">序号</th>
          <th>内部题型名称</th>
          <th>外部显示名称</th>
          <th>题型描述</th>
          <th style="width: 80px">排序</th>
          <th style="width: 100px">状态</th>
          <th style="width: 240px">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(type, index) in paginatedData" :key="type.id" class="type-row">
          <td style="text-align: center">{{ (currentPage - 1) * 10 + index + 1 }}</td>
          <td>{{ type.internalName }}</td>
          <td>{{ type.displayName }}</td>
          <td>{{ type.description || '-' }}</td>
          <td>{{ type.order }}</td>
          <td>
            <span :class="['status', type.status === 'active' ? 'is-active' : 'is-disabled']">
              {{ type.status === 'active' ? '启用' : '禁用' }}
            </span>
          </td>
          <td>
            <div class="action-group">
              <button class="btn secondary" @click="emit('edit-type', type)">编辑</button>
              <button
                class="btn secondary"
                @click="emit('toggle-status', type)"
              >
                {{ type.status === 'active' ? '禁用' : '启用' }}
              </button>
              <button class="btn secondary" @click="emit('delete-type', type)">删除</button>
            </div>
          </td>
        </tr>
        <tr v-if="paginatedData.length === 0">
          <td colspan="7" style="text-align: center; padding: 40px; color: var(--secondary-text)">
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
import type { QuestionType } from '../types'

// Props
interface Props {
  types: QuestionType[]
  projectName: string
  subjectName: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'add-type': []
  'edit-type': [type: QuestionType]
  'delete-type': [type: QuestionType]
  'toggle-status': [type: QuestionType]
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

.btn.secondary {
  background-color: #ffffff;
  color: var(--accent);
  border-color: rgba(0, 102, 204, 0.4);
}

.btn.secondary:hover {
  background-color: rgba(0, 102, 204, 0.08);
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

.action-group {
  display: flex;
  gap: 6px;
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
