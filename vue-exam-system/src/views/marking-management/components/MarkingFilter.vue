<template>
  <div class="marking-filter">
    <div class="filter-row">
      <!-- 考试状态 -->
      <div class="filter-item">
        <label class="filter-label">考试状态</label>
        <select
          v-model="localFilter.status"
          class="filter-select"
        >
          <option value="">全部</option>
          <option value="draft">草稿</option>
          <option value="pending">待批阅</option>
          <option value="marking">批阅中</option>
          <option value="completed">已完成</option>
        </select>
      </div>

      <!-- 考试类型 -->
      <div class="filter-item">
        <label class="filter-label">考试类型</label>
        <select
          v-model="localFilter.examType"
          class="filter-select"
        >
          <option value="">全部</option>
          <option value="formal">正式考试</option>
          <option value="practice">练习</option>
          <option value="mock">模拟考</option>
        </select>
      </div>

      <!-- 考试名称 -->
      <div class="filter-item">
        <label class="filter-label">考试名称</label>
        <input
          v-model="localFilter.examName"
          type="text"
          class="filter-input"
          placeholder="请输入考试名称"
        />
      </div>

      <!-- 操作按钮 -->
      <div class="filter-buttons">
        <button
          class="btn primary"
          @click="handleSearch"
        >
          搜索
        </button>
        <button
          class="btn secondary"
          @click="handleReset"
        >
          重置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { MarkingFilter } from '../types'

// Props
interface Props {
  filter: MarkingFilter
}

const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'update:filter', value: MarkingFilter): void
  (e: 'search'): void
}

const emit = defineEmits<Emits>()

// 本地筛选条件
const localFilter = ref<MarkingFilter>({ ...props.filter })

// 监听外部 filter 变化
watch(
  () => props.filter,
  (newFilter) => {
    localFilter.value = { ...newFilter }
  },
  { deep: true }
)

/**
 * 搜索
 */
const handleSearch = () => {
  emit('update:filter', { ...localFilter.value })
  emit('search')
}

/**
 * 重置
 */
const handleReset = () => {
  localFilter.value = {
    projectId: localFilter.value.projectId, // 保留项目筛选
    subjectId: localFilter.value.subjectId, // 保留科目筛选
    status: undefined,
    examType: undefined,
    examName: ''
  }
  emit('update:filter', { ...localFilter.value })
  emit('search')
}
</script>

<style scoped>
.marking-filter {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 200px;
}

.filter-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--primary-text);
}

.filter-select,
.filter-input {
  height: 36px;
  padding: 0 12px;
  border: 1px solid var(--panel-border);
  border-radius: 4px;
  font-size: 13px;
  color: var(--primary-text);
  background: var(--panel-bg);
  transition: all 0.2s;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(79, 119, 255, 0.1);
}

.filter-select:hover,
.filter-input:hover {
  border-color: var(--accent);
}

.filter-input::placeholder {
  color: #c0c0c0;
}

.filter-buttons {
  display: flex;
  gap: 12px;
  margin-left: auto;
}

.btn {
  height: 36px;
  padding: 0 24px;
  border: 1px solid transparent;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn.primary {
  background: linear-gradient(180deg, #4f77ff 0%, #2f57e3 100%);
  color: #ffffff;
  border-color: #375edf;
  box-shadow: 0 2px 6px rgba(79, 119, 255, 0.3);
}

.btn.primary:hover {
  background: linear-gradient(180deg, #5f87ff 0%, #3f67f3 100%);
  box-shadow: 0 4px 12px rgba(79, 119, 255, 0.4);
  transform: translateY(-1px);
}

.btn.secondary {
  background: #ffffff;
  color: var(--secondary-text);
  border-color: var(--panel-border);
}

.btn.secondary:hover {
  background: var(--row-hover);
  border-color: var(--accent);
  color: var(--primary-text);
}
</style>
