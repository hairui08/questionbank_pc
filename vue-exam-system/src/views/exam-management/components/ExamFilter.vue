<template>
  <div class="exam-filter-panel">
    <div class="filter-row">
      <!-- 1. 试卷状态 -->
      <div class="filter-item">
        <label>试卷状态</label>
        <select v-model="filterData.status">
          <option value="">全部</option>
          <option value="active">启用</option>
          <option value="disabled">禁用</option>
        </select>
      </div>

      <!-- 2. 试卷名称 -->
      <div class="filter-item filter-item-search">
        <label>试卷名称</label>
        <input
          v-model="filterData.examName"
          type="text"
          placeholder="请输入试卷名称"
          @keyup.enter="handleSearch"
        />
      </div>

      <!-- 3. 创建时间 -->
      <div class="filter-item">
        <label>创建时间</label>
        <div class="date-range-wrapper">
          <input
            v-model="filterData.startTime"
            type="date"
            placeholder="开始日期"
          />
          <span class="date-separator">至</span>
          <input
            v-model="filterData.endTime"
            type="date"
            placeholder="结束日期"
          />
        </div>
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
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { ExamFilter } from '../types'

interface Props {
  modelValue: ExamFilter
}

interface Emits {
  (e: 'update:modelValue', value: ExamFilter): void
  (e: 'search'): void
  (e: 'reset'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const filterData = reactive<ExamFilter>({ ...props.modelValue })

// 监听父组件传入的筛选条件变化
watch(() => props.modelValue, (newVal) => {
  Object.assign(filterData, newVal)
}, { deep: true })

// 监听本地筛选条件变化,同步到父组件
watch(filterData, () => {
  emit('update:modelValue', { ...filterData })
}, { deep: true })

// 搜索
function handleSearch() {
  emit('search')
}

// 重置
function handleReset() {
  emit('reset')
}
</script>

<style scoped>
.exam-filter-panel {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  padding: 20px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-item label {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-text);
}

.filter-item select,
.filter-item input[type="text"],
.filter-item input[type="date"] {
  padding: 8px 12px;
  border: 1px solid var(--panel-border);
  border-radius: 6px;
  font-size: 14px;
  background: #ffffff;
  min-width: 150px;
}

.filter-item input[type="date"] {
  min-width: 140px;
}

.filter-item select:focus,
.filter-item input:focus {
  outline: none;
  border-color: var(--accent);
}

.filter-item-search input {
  min-width: 240px;
}

.date-range-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-separator {
  font-size: 14px;
  color: var(--secondary-text);
  padding: 0;
}

.filter-actions {
  display: flex;
  gap: 12px;
  margin-left: auto;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.btn.primary {
  background: linear-gradient(180deg, #4f77ff 0%, #2f57e3 100%);
  color: #ffffff;
  border-color: #375edf;
  box-shadow: 0 2px 6px rgba(79, 119, 255, 0.3);
}

.btn.primary:hover {
  background: linear-gradient(180deg, #4b6ee6 0%, #264acc 100%);
}

.btn.secondary {
  background: #ffffff;
  color: var(--accent);
  border-color: rgba(0, 102, 204, 0.4);
}

.btn.secondary:hover {
  background: rgba(0, 102, 204, 0.08);
}
</style>
