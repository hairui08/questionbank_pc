<template>
  <div class="knowledge-point-table">
    <div class="table-header">
      <div class="header-title">
        <h3>{{ projectName }} - {{ subjectName }}</h3>
        <p>共 {{ knowledgePoints.length }} 个知识点 <span v-if="hasSelected">· 已选中 {{ selectedIds.size }} 项</span></p>
      </div>
      <div class="header-actions">
        <div class="filter-group">
          <label for="status-filter">状态：</label>
          <select
            id="status-filter"
            :value="statusFilter"
            @change="$emit('update:status-filter', ($event.target as HTMLSelectElement).value)"
          >
            <option value="all">全部</option>
            <option value="active">启用</option>
            <option value="disabled">禁用</option>
          </select>
        </div>
        <div class="batch-actions">
          <button class="btn-batch btn-enable" :disabled="!hasSelected" @click="handleBatchEnable">
            <span class="icon">✅</span>
            批量启用
          </button>
          <button class="btn-batch btn-disable" :disabled="!hasSelected" @click="handleBatchDisable">
            <span class="icon">🔒</span>
            批量禁用
          </button>
          <button class="btn-batch btn-delete" :disabled="!hasSelected" @click="handleBatchDelete">
            <span class="icon">🗑️</span>
            批量删除
          </button>
        </div>
        <button class="btn-add" @click="$emit('add-knowledge-point')" :disabled="!props.isAddEnabled">
          <span class="icon">+</span>
          添加知识点
        </button>
      </div>
    </div>

    <div class="table-wrapper">
      <table v-if="knowledgePoints.length > 0">
        <thead>
          <tr>
            <th width="50px" style="text-align: center">
              <input
                type="checkbox"
                :checked="isAllSelected"
                @change="handleSelectAll"
                class="checkbox-input"
              />
            </th>
            <th width="20%">名称</th>
            <th width="12%">章</th>
            <th width="12%">节</th>
            <th width="10%">试题数量</th>
            <th width="15%">创建时间</th>
            <th width="10%">创建人</th>
            <th width="10%">状态</th>
            <th width="11%">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(kp, index) in knowledgePoints" :key="kp.id">
            <td style="text-align: center">
              <input
                type="checkbox"
                :checked="selectedIds.has(kp.id)"
                @change="toggleSelect(kp.id)"
                class="checkbox-input"
              />
            </td>
            <td>
              <span class="name-text">{{ kp.name }}</span>
            </td>
            <!-- 章列 -->
            <td>
              <div
                class="compact-list"
                :title="getChapterNamesText(kp.chapterIds)"
              >
                <div
                  v-if="getChapterNames(kp.chapterIds).length === 0"
                  class="empty-text"
                >
                  未关联章节
                </div>
                <template v-else>
                  <div class="first-item">{{ getChapterNames(kp.chapterIds)[0] }}</div>
                  <div
                    v-if="getChapterNames(kp.chapterIds).length > 1"
                    class="more-indicator"
                  >
                    ...
                  </div>
                </template>
              </div>
            </td>
            <!-- 节列 -->
            <td>
              <div
                class="compact-list"
                :title="getSectionNamesText(kp.chapterIds)"
              >
                <div
                  v-if="getSectionNames(kp.chapterIds).length === 0"
                  class="empty-text"
                >
                  无小节
                </div>
                <template v-else>
                  <div class="first-item">{{ getSectionNames(kp.chapterIds)[0] }}</div>
                  <div
                    v-if="getSectionNames(kp.chapterIds).length > 1"
                    class="more-indicator"
                  >
                    ...
                  </div>
                </template>
              </div>
            </td>
            <td>
              <span
                class="question-count"
                :class="{ clickable: getQuestionCount(kp.id) > 0 }"
                @click="handleQuestionCountClick(kp.id)"
              >
                {{ getQuestionCount(kp.id) }}
              </span>
            </td>
            <td>
              <span class="date-text">{{ formatDate(kp.createTime) }}</span>
            </td>
            <td>
              <span class="creator-text">{{ getCreatorName(kp.creatorId) }}</span>
            </td>
            <td>
              <span :class="['status-badge', kp.status === 'active' ? 'active' : 'disabled']">
                {{ kp.status === 'active' ? '启用' : '禁用' }}
              </span>
            </td>
            <td>
              <ActionDropdown
                :items="getActionMenuItems(kp)"
                @select="(key) => handleActionSelect(key, kp)"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="empty-state">
        <div class="empty-icon">📚</div>
        <p class="empty-text">暂无知识点数据</p>
        <p class="empty-hint">点击右上角「添加知识点」创建</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useKnowledgePointStore } from '@/stores/knowledgePoint'
import ActionDropdown from '@/components/ActionDropdown.vue'
import type { MenuItem } from '@/components/ActionDropdown.vue'
import type { KnowledgePoint } from '../types'

interface Props {
  subjectId: string
  subjectName: string
  projectName: string
  knowledgePoints: KnowledgePoint[]
  statusFilter: string
  isAddEnabled: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'add-knowledge-point': []
  'edit-knowledge-point': [kp: KnowledgePoint]
  'delete-knowledge-point': [kp: KnowledgePoint]
  'toggle-status': [kp: KnowledgePoint]
  'show-questions': [knowledgePointId: string]
  'update:status-filter': [value: string]
  'batch-enable': [ids: string[]]
  'batch-disable': [ids: string[]]
  'batch-delete': [ids: string[]]
}>()

// 批量选择状态
const selectedIds = ref<Set<string>>(new Set())

const knowledgePointStore = useKnowledgePointStore()

/**
 * 获取章节名称数组
 */
const getChapterNames = (chapterIds: string[]): string[] => {
  return knowledgePointStore.getChapterNamesOnly(chapterIds)
}

/**
 * 获取小节名称数组
 */
const getSectionNames = (chapterIds: string[]): string[] => {
  return knowledgePointStore.getAllSectionNames(chapterIds)
}

/**
 * 获取章节名称文本（用换行符分隔，用于悬浮提示）
 */
const getChapterNamesText = (chapterIds: string[]): string => {
  const names = knowledgePointStore.getChapterNamesOnly(chapterIds)
  return names.length > 0 ? names.join('\n') : '未关联章节'
}

/**
 * 获取小节名称文本（用换行符分隔，用于悬浮提示）
 */
const getSectionNamesText = (chapterIds: string[]): string => {
  const names = knowledgePointStore.getAllSectionNames(chapterIds)
  return names.length > 0 ? names.join('\n') : '无小节'
}

/**
 * 获取试题数量
 */
const getQuestionCount = (knowledgePointId: string): number => {
  return knowledgePointStore.getQuestionCountByKnowledgePoint(knowledgePointId)
}

/**
 * 处理试题数量点击事件
 */
const handleQuestionCountClick = (knowledgePointId: string) => {
  const count = getQuestionCount(knowledgePointId)
  if (count > 0) {
    emit('show-questions', knowledgePointId)
  }
}

/**
 * 格式化日期
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 获取创建人名称
 */
const getCreatorName = (creatorId: string): string => {
  const creatorMap: Record<string, string> = {
    'admin': '管理员',
    'editor': '编辑员',
    'user-001': '当前用户'
  }
  return creatorMap[creatorId] || creatorId
}

/**
 * 获取操作菜单项
 */
const getActionMenuItems = (kp: KnowledgePoint): MenuItem[] => {
  return [
    { key: 'edit', label: '编辑', icon: '✏️' },
    {
      key: 'toggle',
      label: kp.status === 'active' ? '禁用' : '启用',
      icon: kp.status === 'active' ? '🔒' : '✅'
    },
    { key: 'delete', label: '删除', icon: '🗑️', danger: true }
  ]
}

/**
 * 处理操作选择
 */
const handleActionSelect = (key: string, kp: KnowledgePoint) => {
  switch (key) {
    case 'edit':
      emit('edit-knowledge-point', kp)
      break
    case 'toggle':
      emit('toggle-status', kp)
      break
    case 'delete':
      emit('delete-knowledge-point', kp)
      break
  }
}

/**
 * 全选/反选逻辑
 */
const isAllSelected = computed(() => {
  if (props.knowledgePoints.length === 0) return false
  return props.knowledgePoints.every(kp => selectedIds.value.has(kp.id))
})

const handleSelectAll = () => {
  if (isAllSelected.value) {
    // 反选：清空所有选中项
    selectedIds.value.clear()
  } else {
    // 全选：选中当前页所有知识点
    props.knowledgePoints.forEach(kp => selectedIds.value.add(kp.id))
  }
}

/**
 * 单选逻辑
 */
const toggleSelect = (kpId: string) => {
  if (selectedIds.value.has(kpId)) {
    selectedIds.value.delete(kpId)
  } else {
    selectedIds.value.add(kpId)
  }
}

/**
 * 批量操作按钮启用状态
 */
const hasSelected = computed(() => selectedIds.value.size > 0)

/**
 * 批量启用
 */
const handleBatchEnable = () => {
  if (selectedIds.value.size === 0) return
  emit('batch-enable', Array.from(selectedIds.value))
  selectedIds.value.clear()
}

/**
 * 批量禁用
 */
const handleBatchDisable = () => {
  if (selectedIds.value.size === 0) return
  emit('batch-disable', Array.from(selectedIds.value))
  selectedIds.value.clear()
}

/**
 * 批量删除
 */
const handleBatchDelete = () => {
  if (selectedIds.value.size === 0) return
  emit('batch-delete', Array.from(selectedIds.value))
  selectedIds.value.clear()
}

/**
 * 监听知识点列表变化，清空选中项（筛选器改变时）
 */
watch(() => props.statusFilter, () => {
  selectedIds.value.clear()
})
</script>

<style scoped>
.knowledge-point-table {
  flex: 1;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  padding: 24px;
  min-height: 600px;
  display: flex;
  flex-direction: column;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--panel-border);
}

.header-title h3 {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-text);
}

.header-title p {
  margin: 0;
  font-size: 14px;
  color: var(--secondary-text);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-batch {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-batch .icon {
  font-size: 14px;
}

.btn-batch.btn-enable {
  background: #ecfff2;
  color: #2e8b57;
  border: 1px solid rgba(46, 139, 87, 0.3);
}

.btn-batch.btn-enable:hover {
  background: #d4f5e0;
  border-color: #2e8b57;
}

.btn-batch.btn-disable {
  background: #fff4e6;
  color: #d97706;
  border: 1px solid rgba(217, 119, 6, 0.3);
}

.btn-batch.btn-disable:hover {
  background: #ffe4c4;
  border-color: #d97706;
}

.btn-batch.btn-delete {
  background: #fee;
  color: #c33;
  border: 1px solid rgba(204, 51, 51, 0.3);
}

.btn-batch.btn-delete:hover {
  background: #fdd;
  border-color: #c33;
}

/* 批量按钮禁用状态 */
.btn-batch:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #e0e0e0 !important;
  color: #999 !important;
  border-color: #ccc !important;
}

.btn-batch:disabled:hover {
  background: #e0e0e0 !important;
  border-color: #ccc !important;
  transform: none;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-size: 14px;
  color: var(--secondary-text);
  font-weight: 500;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid var(--panel-border);
  border-radius: 6px;
  font-size: 14px;
  color: var(--primary-text);
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-group select:hover {
  border-color: var(--accent);
}

.filter-group select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
}

.btn-add:disabled {
  background: #e0e0e0;
  color: #999;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  opacity: 0.6;
}

.btn-add:disabled:hover {
  background: #e0e0e0;
  transform: none;
  box-shadow: none;
}

.btn-add .icon {
  font-size: 18px;
  font-weight: 300;
}

.table-wrapper {
  flex: 1;
  overflow: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

thead {
  position: sticky;
  top: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: 10;
}

th {
  padding: 14px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

tbody tr {
  border-bottom: 1px solid var(--table-border);
  transition: background-color 0.2s;
}

tbody tr:hover {
  background: var(--row-hover);
}

tbody tr:last-child {
  border-bottom: none;
}

td {
  padding: 16px;
  color: var(--primary-text);
  font-size: 14px;
  vertical-align: middle;
}

.knowledge-point-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.name-text {
  font-weight: 500;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 12px;
  font-weight: 500;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.status-badge.disabled {
  background: #fee;
  color: #c33;
}

.status-badge.active {
  background: #ecfff2;
  color: #2e8b57;
  border: 1px solid rgba(46, 139, 87, 0.4);
}

/* 紧凑列表容器 */
.compact-list {
  cursor: help;
  line-height: 1.5;
}

.compact-list:hover {
  color: var(--accent);
}

/* 第一项 */
.first-item {
  color: var(--primary-text);
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s;
}

/* 更多指示器（省略号） */
.more-indicator {
  color: var(--secondary-text);
  font-size: 14px;
  margin-top: 2px;
  font-weight: 600;
  letter-spacing: 1px;
}

/* 空状态文本 */
.compact-list .empty-text {
  color: #999;
  font-style: italic;
  font-size: 13px;
}

.question-count {
  display: inline-block;
  padding: 4px 12px;
  background: #f0f7ff;
  color: var(--accent);
  border-radius: 12px;
  font-weight: 600;
}

.question-count.clickable {
  cursor: pointer;
  transition: all 0.2s;
}

.question-count.clickable:hover {
  background: var(--accent);
  color: white;
  transform: scale(1.05);
}

.date-text,
.creator-text {
  color: var(--secondary-text);
  font-size: 13px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state .empty-text {
  margin: 0 0 8px;
  font-size: 16px;
  color: var(--secondary-text);
}

.empty-hint {
  margin: 0;
  font-size: 14px;
  color: #999;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--accent);
}

.checkbox-input:hover {
  transform: scale(1.1);
}
</style>
