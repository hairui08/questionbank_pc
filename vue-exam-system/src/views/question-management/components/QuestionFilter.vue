<template>
  <div class="question-filter">
    <div class="filter-row">
      <div class="filter-group">
        <label>所属项目</label>
        <select v-model="localFilter.projectId" @change="onProjectChange">
          <option value="">全部项目</option>
          <option v-for="project in projects" :key="project.id" :value="project.id">
            {{ project.name }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>所属科目</label>
        <select v-model="localFilter.subjectId" :disabled="!localFilter.projectId">
          <option value="">{{ localFilter.projectId ? '全部科目' : '请先选择项目' }}</option>
          <option v-for="subject in filteredSubjects" :key="subject.id" :value="subject.id">
            {{ subject.name }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>试题来源</label>
        <select v-model="localFilter.source">
          <option value="">全部来源</option>
          <option value="official">历年真题</option>
          <option value="simulation">模拟试题</option>
          <option value="custom">自定义</option>
        </select>
      </div>

      <div class="filter-group">
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

      <div class="filter-group">
        <label>知识点</label>
        <select v-model="localFilter.knowledgePointId" :disabled="!activeSubjectId">
          <option value="">{{ activeSubjectId ? '全部知识点' : '请先选择科目' }}</option>
          <option
            v-for="kp in filteredKnowledgePoints"
            :key="kp.id"
            :value="kp.id"
          >
            {{ kp.name }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>题型</label>
        <select v-model="localFilter.type">
          <option value="">全部题型</option>
          <option value="single">单选题</option>
          <option value="multiple">多选题</option>
          <option value="judgment">判断题</option>
          <option value="essay">简答题</option>
          <option value="combination">组合题</option>
        </select>
      </div>

      <div class="filter-group">
        <label>试题难度</label>
        <select v-model="localFilter.difficulty">
          <option value="">全部难度</option>
          <option value="easy">简单</option>
          <option value="medium">中等</option>
          <option value="hard">困难</option>
        </select>
      </div>

    </div>

    <div class="filter-actions">
      <button class="btn primary" @click="handleSearch">
        搜索
      </button>
      <button class="btn secondary" @click="handleReset">
        重置
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useProjectStore } from '@/stores/project'
import { useKnowledgePointStore } from '@/stores/knowledgePoint'
import type { QuestionFilter } from '../types'

interface Props {
  modelValue: QuestionFilter
}

interface Emits {
  (e: 'update:modelValue', value: QuestionFilter): void
  (e: 'search'): void
  (e: 'reset'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const projectStore = useProjectStore()
const knowledgePointStore = useKnowledgePointStore()

const localFilter = ref<QuestionFilter>({ ...props.modelValue })

// 项目列表
const projects = computed(() => {
  return projectStore.projects
})

// 过滤的科目列表
const filteredSubjects = computed(() => {
  if (!localFilter.value.projectId) return []
  return projectStore.subjects.filter(s => s.projectId === localFilter.value.projectId)
})

// 当前选中的科目ID（用于启用/禁用知识点筛选）
const activeSubjectId = computed(() => localFilter.value.subjectId || '')

// 过滤的知识点列表
const filteredKnowledgePoints = computed(() => {
  if (!activeSubjectId.value) return []
  return knowledgePointStore.knowledgePoints.filter(kp => kp.subjectId === activeSubjectId.value)
})

// 监听 props 变化同步到本地
watch(() => props.modelValue, (newVal) => {
  localFilter.value = { ...newVal }
}, { deep: true })

// 监听本地变化同步到父组件
watch(localFilter, (newVal) => {
  emit('update:modelValue', newVal)
}, { deep: true })

/**
 * 项目切换事件
 */
function onProjectChange() {
  localFilter.value.subjectId = ''
}

function handleSearch() {
  emit('search')
}

function handleReset() {
  localFilter.value = {}
  emit('reset')
}
</script>

<style scoped>
.question-filter {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.filter-group {
  flex: 1;
  min-width: 150px;
  max-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 13px;
  font-weight: 600;
  color: var(--primary-text);
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid #cdd5e0;
  border-radius: 6px;
  font-size: 14px;
  background: #ffffff;
  transition: border-color 0.2s ease;
}

.filter-group select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}

.filter-group select:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.filter-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid var(--panel-border);
}

.btn {
  padding: 8px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
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
  color: var(--secondary-text);
  border-color: #d8d8d8;
}

.btn.secondary:hover {
  background: #f5f5f5;
}
</style>
