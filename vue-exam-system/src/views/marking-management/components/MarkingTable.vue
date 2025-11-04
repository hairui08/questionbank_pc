<template>
  <div class="marking-table-container">
    <table class="marking-table">
      <thead>
        <tr>
          <th width="60">序号</th>
          <th width="18%">考试名称</th>
          <th width="10%">考试类型</th>
          <th width="10%">组卷方式</th>
          <th width="10%">考试时长</th>
          <th width="10%">试卷总分</th>
          <th width="10%">及格分数</th>
          <th width="10%">参与人数</th>
          <th width="10%">考试状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-if="records.length === 0"
          class="empty-row"
        >
          <td colspan="10">暂无数据</td>
        </tr>
        <tr
          v-for="(record, index) in records"
          :key="record.id"
        >
          <!-- 序号 -->
          <td class="text-center">{{ (page - 1) * pageSize + index + 1 }}</td>

          <!-- 考试名称 -->
          <td class="exam-name">{{ record.examName }}</td>

          <!-- 考试类型 -->
          <td class="text-center">
            <span class="type-badge" :class="`type-${record.examType}`">
              {{ getExamTypeLabel(record.examType) }}
            </span>
          </td>

          <!-- 组卷方式 -->
          <td class="text-center">{{ getPaperGenerationLabel(record.paperGenerationType) }}</td>

          <!-- 考试时长 -->
          <td class="text-center">{{ record.duration }}分钟</td>

          <!-- 试卷总分 -->
          <td class="text-center">{{ record.totalScore }}分</td>

          <!-- 及格分数 -->
          <td class="text-center">{{ record.passingScore }}分</td>

          <!-- 参与人数 -->
          <td class="text-center">{{ record.participantCount }}人</td>

          <!-- 考试状态 -->
          <td class="text-center">
            <span class="status-badge" :class="`status-${record.status}`">
              {{ getStatusLabel(record.status) }}
            </span>
          </td>

          <!-- 操作 -->
          <td>
            <div class="action-buttons">
              <!-- 草稿状态: 无操作 -->
              <template v-if="record.status === 'draft'">
                <span class="no-action">暂无操作</span>
              </template>

              <!-- 待批阅状态: 分配任务 -->
              <template v-else-if="record.status === 'pending'">
                <button
                  class="action-btn assign"
                  @click="emit('assign', record.id)"
                >
                  分配任务
                </button>
              </template>

              <!-- 批阅中状态: 进入批阅 + 查看进度 -->
              <template v-else-if="record.status === 'marking'">
                <button
                  class="action-btn mark"
                  @click="emit('mark', record.id)"
                >
                  进入批阅
                </button>
                <button
                  class="action-btn progress"
                  @click="emit('progress', record.id)"
                >
                  查看进度
                </button>
              </template>

              <!-- 已完成状态: 查看成绩 -->
              <template v-else-if="record.status === 'completed'">
                <button
                  class="action-btn score"
                  @click="emit('score', record.id)"
                >
                  查看成绩
                </button>
              </template>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { MarkingRecord, ExamType, PaperGenerationType, ExamStatus } from '../types'

// Props
interface Props {
  records: MarkingRecord[]
  page: number
  pageSize: number
}

defineProps<Props>()

// Emits
interface Emits {
  (e: 'assign', examId: string): void // 分配任务
  (e: 'mark', examId: string): void // 进入批阅
  (e: 'progress', examId: string): void // 查看进度
  (e: 'score', examId: string): void // 查看成绩
}

const emit = defineEmits<Emits>()

/**
 * 获取考试类型标签
 */
const getExamTypeLabel = (type: ExamType): string => {
  const labels: Record<ExamType, string> = {
    formal: '正式考试',
    practice: '练习',
    mock: '模拟考'
  }
  return labels[type] || type
}

/**
 * 获取组卷方式标签
 */
const getPaperGenerationLabel = (type: PaperGenerationType): string => {
  const labels: Record<PaperGenerationType, string> = {
    manual: '手动组卷',
    random: '随机组卷',
    template: '模板组卷'
  }
  return labels[type] || type
}

/**
 * 获取状态标签
 */
const getStatusLabel = (status: ExamStatus): string => {
  const labels: Record<ExamStatus, string> = {
    draft: '草稿',
    pending: '待批阅',
    marking: '批阅中',
    completed: '已完成'
  }
  return labels[status] || status
}
</script>

<style scoped>
.marking-table-container {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  overflow: hidden;
}

.marking-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

/* 表头 */
.marking-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.marking-table thead th {
  padding: 14px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  text-align: left;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
}

/* 表体 */
.marking-table tbody tr {
  border-bottom: 1px solid var(--table-border);
  transition: background-color 0.2s;
}

.marking-table tbody tr:hover {
  background-color: var(--row-hover);
}

.marking-table tbody tr:last-child {
  border-bottom: none;
}

.marking-table tbody td {
  padding: 12px;
  color: var(--primary-text);
}

.text-center {
  text-align: center;
}

.exam-name {
  font-weight: 500;
  color: var(--primary-text);
}

/* 空数据行 */
.empty-row td {
  padding: 60px 12px;
  text-align: center;
  color: var(--secondary-text);
  font-size: 14px;
}

/* 类型徽章 */
.type-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.type-badge.type-formal {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.type-badge.type-practice {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #ffffff;
}

.type-badge.type-mock {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #ffffff;
}

/* 状态徽章 */
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.status-draft {
  background-color: #909399;
  color: #ffffff;
}

.status-badge.status-pending {
  background-color: #e6a23c;
  color: #ffffff;
}

.status-badge.status-marking {
  background-color: #409eff;
  color: #ffffff;
}

.status-badge.status-completed {
  background-color: #67c23a;
  color: #ffffff;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.no-action {
  color: var(--secondary-text);
  font-size: 12px;
}

.action-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s;
}

/* 分配任务按钮 - 紫色 */
.action-btn.assign {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
}

.action-btn.assign:hover {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transform: translateY(-1px);
}

/* 进入批阅按钮 - 蓝色 */
.action-btn.mark {
  background: linear-gradient(180deg, #4f77ff 0%, #2f57e3 100%);
  box-shadow: 0 2px 6px rgba(79, 119, 255, 0.3);
}

.action-btn.mark:hover {
  box-shadow: 0 4px 12px rgba(79, 119, 255, 0.4);
  transform: translateY(-1px);
}

/* 查看进度按钮 - 橙色 */
.action-btn.progress {
  background: linear-gradient(135deg, #ffa726 0%, #fb8c00 100%);
  box-shadow: 0 2px 6px rgba(255, 167, 38, 0.3);
}

.action-btn.progress:hover {
  box-shadow: 0 4px 12px rgba(255, 167, 38, 0.4);
  transform: translateY(-1px);
}

/* 查看成绩按钮 - 绿色 */
.action-btn.score {
  background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
  box-shadow: 0 2px 6px rgba(102, 187, 106, 0.3);
}

.action-btn.score:hover {
  box-shadow: 0 4px 12px rgba(102, 187, 106, 0.4);
  transform: translateY(-1px);
}
</style>
