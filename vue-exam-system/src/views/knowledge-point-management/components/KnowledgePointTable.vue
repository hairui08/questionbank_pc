<template>
  <div class="knowledge-point-table">
    <div class="table-header">
      <div class="header-title">
        <h3>{{ projectName }} - {{ subjectName }}</h3>
        <p>共 {{ knowledgePoints.length }} 个知识点</p>
      </div>
      <div class="header-actions">
        <div class="filter-group">
          <label for="status-filter">启用状态：</label>
          <select
            id="status-filter"
            :value="statusFilter"
            @change="$emit('update:status-filter', ($event.target as HTMLSelectElement).value)"
          >
            <option value="active">启用</option>
            <option value="disabled">禁用</option>
            <option value="all">全部</option>
          </select>
        </div>
        <button class="btn-add" @click="$emit('add-knowledge-point')">
          <span class="icon">+</span>
          添加知识点
        </button>
      </div>
    </div>

    <div class="table-wrapper">
      <table v-if="knowledgePoints.length > 0">
        <thead>
          <tr>
            <th width="60px">序号</th>
            <th width="18%">知识点名称</th>
            <th width="14%">章</th>
            <th width="14%">节</th>
            <th width="10%">试题数量</th>
            <th width="15%">创建时间</th>
            <th width="10%">创建人</th>
            <th width="15%">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(kp, index) in knowledgePoints" :key="kp.id">
            <td style="text-align: center">{{ index + 1 }}</td>
            <td>
              <div class="knowledge-point-name">
                <span class="name-text">{{ kp.name }}</span>
                <span
                  v-if="kp.status === 'disabled'"
                  class="status-badge disabled"
                >
                  已禁用
                </span>
              </div>
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
              <div class="action-buttons">
                <button
                  class="btn-action btn-edit"
                  @click="$emit('edit-knowledge-point', kp)"
                >
                  编辑
                </button>
                <button
                  class="btn-action btn-delete"
                  @click="$emit('delete-knowledge-point', kp)"
                >
                  删除
                </button>
                <button
                  class="btn-action btn-toggle"
                  :class="{ 'btn-toggle-enable': kp.status === 'disabled', 'btn-toggle-disable': kp.status === 'active' }"
                  @click="$emit('toggle-status', kp)"
                >
                  {{ kp.status === 'active' ? '禁用' : '启用' }}
                </button>
              </div>
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
import { useKnowledgePointStore } from '@/stores/knowledgePoint'
import type { KnowledgePoint } from '../types'

interface Props {
  subjectId: string
  subjectName: string
  projectName: string
  knowledgePoints: KnowledgePoint[]
  statusFilter: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'add-knowledge-point': []
  'edit-knowledge-point': [kp: KnowledgePoint]
  'delete-knowledge-point': [kp: KnowledgePoint]
  'toggle-status': [kp: KnowledgePoint]
  'show-questions': [knowledgePointId: string]
  'update:status-filter': [value: string]
}>()

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

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-action {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit {
  background: #e8f4fd;
  color: #0066cc;
}

.btn-edit:hover {
  background: #0066cc;
  color: white;
}

.btn-delete {
  background: #fee;
  color: #c33;
}

.btn-delete:hover {
  background: #c33;
  color: white;
}

.btn-toggle {
  min-width: 60px;
}

.btn-toggle-disable {
  background: #f5f7fa;
  color: #5a6c7d;
  border: 1px solid #dfe3eb;
}

.btn-toggle-disable:hover {
  background: #e4eaf2;
  color: #2c3e50;
}

.btn-toggle-enable {
  background: #e8f4fd;
  color: #0066cc;
  border: 1px solid #0066cc;
}

.btn-toggle-enable:hover {
  background: #0066cc;
  color: white;
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
</style>
