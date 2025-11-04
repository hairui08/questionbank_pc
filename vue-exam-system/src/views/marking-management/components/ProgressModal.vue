<template>
  <BaseModal
    v-if="isOpen"
    title="批阅进度"
    :width="500"
    @close="emit('close')"
  >
    <div class="progress-modal">
      <div
        v-if="progress"
        class="progress-content"
      >
        <!-- 进度条 -->
        <div class="progress-bar-container">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: `${progress.progress}%` }"
            >
              <span class="progress-text">{{ progress.progress }}%</span>
            </div>
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">总份数</div>
            <div class="stat-value total">{{ progress.totalCount }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">已批阅</div>
            <div class="stat-value marked">{{ progress.markedCount }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">未批阅</div>
            <div class="stat-value unmarked">{{ progress.unmarkedCount }}</div>
          </div>
        </div>

        <!-- 进度状态 -->
        <div class="progress-status">
          <template v-if="progress.progress === 100">
            <span class="status-icon">✓</span>
            <span class="status-text completed">批阅已完成</span>
          </template>
          <template v-else>
            <span class="status-icon">⏱</span>
            <span class="status-text in-progress">批阅进行中...</span>
          </template>
        </div>
      </div>

      <div
        v-else
        class="no-data"
      >
        暂无进度数据
      </div>
    </div>

    <template #footer>
      <button
        class="btn secondary"
        @click="emit('close')"
      >
        关闭
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseModal from '@/components/Modal/BaseModal.vue'
import { useMarkingStore } from '@/stores/marking'
import type { MarkingProgress } from '../types'

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

// 进度数据
const progress = ref<MarkingProgress | null>(null)

// 监听 examId 变化,加载进度数据
watch(
  () => props.examId,
  (newExamId) => {
    if (newExamId) {
      progress.value = markingStore.getMarkingProgress(newExamId)
    } else {
      progress.value = null
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.progress-modal {
  padding: 20px 0;
}

.progress-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 进度条 */
.progress-bar-container {
  padding: 0 20px;
}

.progress-bar {
  height: 40px;
  background: #f0f0f0;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: width 0.3s ease;
  position: relative;
}

.progress-text {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
}

/* 统计网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 0 20px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: var(--row-hover);
  border-radius: 8px;
}

.stat-label {
  font-size: 12px;
  color: var(--secondary-text);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
}

.stat-value.total {
  color: #909399;
}

.stat-value.marked {
  color: #67c23a;
}

.stat-value.unmarked {
  color: #e6a23c;
}

/* 进度状态 */
.progress-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 20px;
  background: var(--row-hover);
  border-radius: 8px;
  margin: 0 20px;
}

.status-icon {
  font-size: 20px;
}

.status-text {
  font-size: 14px;
  font-weight: 500;
}

.status-text.completed {
  color: #67c23a;
}

.status-text.in-progress {
  color: #409eff;
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
