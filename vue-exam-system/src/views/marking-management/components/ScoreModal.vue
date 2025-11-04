<template>
  <BaseModal
    v-if="isOpen"
    title="考试成绩"
    :width="900"
    @close="emit('close')"
  >
    <div class="score-modal">
      <div
        v-if="statistics"
        class="score-content"
      >
        <!-- 统计概览 -->
        <div class="statistics-overview">
          <div class="stat-card">
            <div class="stat-label">平均分</div>
            <div class="stat-value">{{ statistics.averageScore }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">最高分</div>
            <div class="stat-value highest">{{ statistics.highestScore }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">最低分</div>
            <div class="stat-value lowest">{{ statistics.lowestScore }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">及格率</div>
            <div class="stat-value pass-rate">{{ statistics.passRate }}%</div>
          </div>
        </div>

        <!-- 成绩列表 -->
        <div class="score-table-container">
          <table class="score-table">
            <thead>
              <tr>
                <th width="60">排名</th>
                <th width="25%">学生姓名</th>
                <th width="15%">客观题得分</th>
                <th width="15%">主观题得分</th>
                <th width="15%">总分</th>
                <th width="10%">是否及格</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="score in statistics.scores"
                :key="score.studentId"
              >
                <td class="text-center">{{ score.rank }}</td>
                <td>{{ score.studentName }}</td>
                <td class="text-center">{{ score.objectiveScore }}</td>
                <td class="text-center">{{ score.subjectiveScore }}</td>
                <td class="text-center score-value">{{ score.totalScore }}</td>
                <td class="text-center">
                  <span
                    class="pass-badge"
                    :class="score.isPassed ? 'passed' : 'failed'"
                  >
                    {{ score.isPassed ? '及格' : '不及格' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div
        v-else
        class="no-data"
      >
        暂无成绩数据
      </div>
    </div>

    <template #footer>
      <button
        class="btn secondary"
        @click="emit('close')"
      >
        关闭
      </button>
      <button
        v-if="statistics"
        class="btn primary"
        @click="handleExport"
      >
        导出成绩
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseModal from '@/components/Modal/BaseModal.vue'
import { useMarkingStore } from '@/stores/marking'
import type { ScoreStatistics } from '../types'

// Props
interface Props {
  isOpen: boolean
  examId: string | null
}

const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'close'): void
}

const emit = defineEmits<Emits>()

// Store
const markingStore = useMarkingStore()

// 成绩统计数据
const statistics = ref<ScoreStatistics | null>(null)

// 监听 examId 变化,加载成绩数据
watch(
  () => props.examId,
  (newExamId) => {
    if (newExamId) {
      statistics.value = markingStore.getScoreStatistics(newExamId)
    } else {
      statistics.value = null
    }
  },
  { immediate: true }
)

/**
 * 导出成绩
 */
const handleExport = () => {
  // TODO: 实现成绩导出功能
  alert('导出成绩功能待实现')
}
</script>

<style scoped>
.score-modal {
  padding: 0;
}

.score-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 统计概览 */
.statistics-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 20px;
  background: var(--row-hover);
}

.stat-card {
  text-align: center;
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-label {
  font-size: 12px;
  color: var(--secondary-text);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: var(--primary-text);
}

.stat-value.highest {
  color: #67c23a;
}

.stat-value.lowest {
  color: #f56c6c;
}

.stat-value.pass-rate {
  color: #409eff;
}

/* 成绩表格 */
.score-table-container {
  max-height: 400px;
  overflow-y: auto;
}

.score-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.score-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: sticky;
  top: 0;
  z-index: 1;
}

.score-table thead th {
  padding: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  text-align: left;
}

.score-table tbody tr {
  border-bottom: 1px solid var(--table-border);
  transition: background-color 0.2s;
}

.score-table tbody tr:hover {
  background-color: var(--row-hover);
}

.score-table tbody td {
  padding: 12px;
  color: var(--primary-text);
}

.text-center {
  text-align: center;
}

.score-value {
  font-weight: 600;
  font-size: 14px;
}

/* 及格徽章 */
.pass-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.pass-badge.passed {
  background-color: #67c23a;
  color: #ffffff;
}

.pass-badge.failed {
  background-color: #f56c6c;
  color: #ffffff;
}

/* 无数据 */
.no-data {
  padding: 60px 20px;
  text-align: center;
  color: var(--secondary-text);
  font-size: 14px;
}

/* 按钮 */
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

/* 滚动条样式 */
.score-table-container::-webkit-scrollbar {
  width: 6px;
}

.score-table-container::-webkit-scrollbar-track {
  background: transparent;
}

.score-table-container::-webkit-scrollbar-thumb {
  background: #d0d0d0;
  border-radius: 3px;
}

.score-table-container::-webkit-scrollbar-thumb:hover {
  background: #b0b0b0;
}
</style>
