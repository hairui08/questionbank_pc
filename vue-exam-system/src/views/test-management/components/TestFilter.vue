<template>
  <div class="test-filter-panel">
    <div class="filter-row">
      <div class="filter-item">
        <label>项目</label>
        <select v-model="filterData.projectId" @change="handleProjectChange">
          <option value="">全部</option>
          <option
            v-for="project in projects"
            :key="project.id"
            :value="project.id"
          >
            {{ project.name }}
          </option>
        </select>
      </div>

      <div class="filter-item">
        <label>科目</label>
        <select v-model="filterData.subjectId">
          <option value="">全部</option>
          <option
            v-for="subject in filteredSubjects"
            :key="subject.id"
            :value="subject.id"
          >
            {{ subject.name }}
          </option>
        </select>
      </div>

      <div class="filter-item">
        <label>审核状态</label>
        <select v-model="filterData.status">
          <option value="">全部</option>
          <option value="pending">待审核</option>
          <option value="approved">已审核</option>
          <option value="rejected">已驳回</option>
        </select>
      </div>

      <div class="filter-item">
        <label>考试类型</label>
        <select v-model="filterData.examType">
          <option value="">全部</option>
          <option value="formal">正式考试</option>
          <option value="mock">模拟考试</option>
          <option value="practice">练习测试</option>
          <option value="quiz">随堂测验</option>
        </select>
      </div>

      <div class="filter-item filter-item-search">
        <label>考试名称</label>
        <input
          v-model="filterData.testName"
          type="text"
          placeholder="请输入考试名称"
          @keyup.enter="handleSearch"
        />
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
import { reactive, computed, watch } from 'vue'
import { useProjectStore } from '@/stores/project'
import type { TestFilter } from '../types'

interface Props {
  modelValue: TestFilter
}

interface Emits {
  (e: 'update:modelValue', value: TestFilter): void
  (e: 'search'): void
  (e: 'reset'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const projectStore = useProjectStore()

const filterData = reactive<TestFilter>({ ...props.modelValue })

// 获取所有项目
const projects = computed(() => projectStore.projects)

// 根据选中的项目筛选科目
const filteredSubjects = computed(() => {
  if (!filterData.projectId) {
    return projectStore.subjects
  }
  return projectStore.subjects.filter(s => s.projectId === filterData.projectId)
})

// 监听父组件传入的筛选条件变化
watch(() => props.modelValue, (newVal) => {
  Object.assign(filterData, newVal)
}, { deep: true })

// 监听本地筛选条件变化,同步到父组件
watch(filterData, () => {
  emit('update:modelValue', { ...filterData })
}, { deep: true })

// 项目变化时清空科目选择
function handleProjectChange() {
  filterData.subjectId = ''
}

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
.test-filter-panel {
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
.filter-item input[type="text"] {
  padding: 8px 12px;
  border: 1px solid var(--panel-border);
  border-radius: 6px;
  font-size: 14px;
  background: #ffffff;
  min-width: 150px;
}

.filter-item select:focus,
.filter-item input:focus {
  outline: none;
  border-color: var(--accent);
}

.filter-item-search input {
  min-width: 240px;
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
