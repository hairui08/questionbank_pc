<template>
  <div class="learning-stage-panel">
    <!-- 头部工具栏 -->
    <div class="panel-header">
      <div class="breadcrumb">{{ breadcrumb }}</div>
      <div style="display: flex; align-items: center; gap: 16px">
        <div class="filter-group">
          <label
            for="status-filter"
            style="margin-right: 8px; font-weight: 600; font-size: 13px"
            >启用状态：</label
          >
          <select
            id="status-filter"
            v-model="statusFilter"
            class="status-filter-select"
            style="
              padding: 6px 12px;
              border-radius: 6px;
              border: 1px solid #cdd5e0;
              font-size: 13px;
              cursor: pointer;
            "
          >
            <option value="all">全部</option>
            <option value="active">启用</option>
            <option value="disabled">禁用</option>
          </select>
        </div>
        <button class="btn primary" @click="handleAdd" :disabled="!activeSubject">
          + 添加学习阶段
        </button>
      </div>
    </div>

    <!-- 表格 -->
    <table class="learning-stage-table">
      <thead>
        <tr>
          <th>序号</th>
          <th>阶段名称</th>
          <th>状态</th>
          <th>排序</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="filteredStages.length === 0">
          <tr>
            <td colspan="5" style="text-align: center; padding: 40px; color: var(--secondary-text)">
              {{ !activeSubject ? '请先从左侧选择一个科目' : '暂无学习阶段数据，点击右上角【添加学习阶段】创建' }}
            </td>
          </tr>
        </template>
        <template v-else>
          <tr v-for="(stage, index) in filteredStages" :key="stage.id">
            <td>{{ index + 1 }}</td>
            <td>{{ stage.name }}</td>
            <td>
              <span class="status" :class="stage.status === 'active' ? 'is-active' : 'is-disabled'">
                {{ stage.status === 'active' ? '启用' : '禁用' }}
              </span>
            </td>
            <td>{{ stage.sortOrder }}</td>
            <td>
              <div class="action-group">
                <button class="btn secondary" @click="handleEdit(stage)">编辑</button>
                <button class="btn secondary" @click="handleToggleStatus(stage)">
                  {{ stage.status === 'active' ? '禁用' : '启用' }}
                </button>
                <button class="btn secondary" @click="handleDelete(stage)">删除</button>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLearningStageStore } from '@/stores/learningStage'
import { useToast } from '@/composables/useToast'
import type { LearningStage } from '../types'

const learningStageStore = useLearningStageStore()
const { showToast } = useToast()

// Props
interface Props {
  activeSubject: {
    id: string
    name: string
    projectName: string
  } | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  add: []
  edit: [stage: LearningStage]
  delete: [stage: LearningStage]
  'toggle-status': [stage: LearningStage]
}>()

// 状态筛选
const statusFilter = ref<'all' | 'active' | 'disabled'>('active')

// 面包屑
const breadcrumb = computed(() => {
  if (!props.activeSubject) return '请选择科目'
  return `${props.activeSubject.projectName} / ${props.activeSubject.name} / 学习阶段列表`
})

// 当前科目的学习阶段列表
const stages = computed(() => {
  if (!props.activeSubject) return []
  return learningStageStore.getLearningStagesBySubject(props.activeSubject.id).value
})

// 筛选后的学习阶段列表
const filteredStages = computed(() => {
  if (statusFilter.value === 'all') return stages.value
  return stages.value.filter((stage) => stage.status === statusFilter.value)
})

/**
 * 添加学习阶段
 */
const handleAdd = () => {
  emit('add')
}

/**
 * 编辑学习阶段
 */
const handleEdit = (stage: LearningStage) => {
  emit('edit', stage)
}

/**
 * 删除学习阶段
 */
const handleDelete = (stage: LearningStage) => {
  emit('delete', stage)
}

/**
 * 切换启用/禁用状态
 */
const handleToggleStatus = (stage: LearningStage) => {
  emit('toggle-status', stage)
}
</script>

<style scoped>
.learning-stage-panel {
  flex: 1;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  overflow: hidden;
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

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
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

.btn.primary:hover:not(:disabled) {
  background: linear-gradient(180deg, #4b6ee6 0%, #264acc 100%);
}

.btn.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.btn.secondary {
  background-color: #ffffff;
  color: var(--accent);
  border-color: rgba(0, 102, 204, 0.4);
}

.btn.secondary:hover {
  background-color: rgba(0, 102, 204, 0.08);
}

.learning-stage-table {
  width: 100%;
  border-collapse: collapse;
}

.learning-stage-table th {
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

.learning-stage-table td {
  padding: 14px 20px;
  border-bottom: 1px solid var(--panel-border);
}

.learning-stage-table tbody tr {
  transition: all 0.2s ease;
}

.learning-stage-table tbody tr:hover {
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
</style>
