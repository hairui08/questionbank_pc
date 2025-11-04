<template>
  <div class="pagination-container">
    <div class="pagination-info">
      共 <span class="total-count">{{ total }}</span> 条记录
    </div>

    <div class="pagination-controls">
      <button
        class="page-btn prev-btn"
        :disabled="currentPage === 1"
        @click="handlePrevPage"
      >
        <span class="arrow">‹</span>
        上一页
      </button>

      <div class="page-numbers">
        <button
          v-for="page in displayPages"
          :key="page"
          :class="['page-number', { active: page === currentPage, ellipsis: page === '...' }]"
          :disabled="page === '...'"
          @click="handlePageClick(page)"
        >
          {{ page }}
        </button>
      </div>

      <button
        class="page-btn next-btn"
        :disabled="currentPage === totalPages"
        @click="handleNextPage"
      >
        下一页
        <span class="arrow">›</span>
      </button>
    </div>

    <div class="page-size-selector">
      <label>每页显示</label>
      <select v-model="localPageSize" @change="handlePageSizeChange" class="page-size-select">
        <option :value="10">10 条</option>
        <option :value="20">20 条</option>
        <option :value="50">50 条</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Props {
  currentPage: number
  total: number
  pageSize: number
}

interface Emits {
  (e: 'page-change', page: number): void
  (e: 'size-change', size: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 本地页大小状态
const localPageSize = ref(props.pageSize)

// 总页数
const totalPages = computed(() => {
  return Math.ceil(props.total / props.pageSize) || 1
})

// 显示的页码数组
const displayPages = computed(() => {
  const pages: (number | string)[] = []
  const current = props.currentPage
  const total = totalPages.value

  if (total <= 7) {
    // 总页数小于等于7,全部显示
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // 总是显示第一页
    pages.push(1)

    if (current <= 3) {
      // 当前页靠前
      for (let i = 2; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 2) {
      // 当前页靠后
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // 当前页在中间
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }

  return pages
})

// 监听外部pageSize变化
watch(() => props.pageSize, (newSize) => {
  localPageSize.value = newSize
})

// 上一页
function handlePrevPage() {
  if (props.currentPage > 1) {
    emit('page-change', props.currentPage - 1)
  }
}

// 下一页
function handleNextPage() {
  if (props.currentPage < totalPages.value) {
    emit('page-change', props.currentPage + 1)
  }
}

// 点击页码
function handlePageClick(page: number | string) {
  if (typeof page === 'number' && page !== props.currentPage) {
    emit('page-change', page)
  }
}

// 每页数量变化
function handlePageSizeChange() {
  emit('size-change', localPageSize.value)
}
</script>

<style scoped>
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 20px;
  background: var(--panel-bg);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-top: 24px;
}

.pagination-info {
  font-size: 14px;
  color: var(--secondary-text);
}

.total-count {
  font-weight: 600;
  color: var(--student-primary);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #e4eaf2;
  border-radius: 8px;
  font-size: 14px;
  color: var(--primary-text);
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--student-primary);
  color: var(--student-primary);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn .arrow {
  font-size: 18px;
  font-weight: bold;
}

.page-numbers {
  display: flex;
  gap: 6px;
}

.page-number {
  min-width: 40px;
  height: 40px;
  padding: 0 8px;
  background: white;
  border: 1px solid #e4eaf2;
  border-radius: 8px;
  font-size: 14px;
  color: var(--primary-text);
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-number:hover:not(.active):not(.ellipsis):not(:disabled) {
  border-color: var(--student-primary);
  color: var(--student-primary);
}

.page-number.active {
  background: linear-gradient(135deg, #ff6f3c 0%, #ff9966 100%);
  border-color: var(--student-primary-dark);
  color: white;
  font-weight: 600;
}

.page-number.ellipsis {
  border: none;
  cursor: default;
  background: transparent;
}

.page-number:disabled {
  cursor: default;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--secondary-text);
}

.page-size-select {
  padding: 8px 12px;
  border: 1px solid #e4eaf2;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  color: var(--primary-text);
  cursor: pointer;
  transition: all 0.3s;
}

.page-size-select:hover {
  border-color: var(--student-primary);
}

.page-size-select:focus {
  border-color: var(--student-primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 111, 60, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .pagination-container {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .pagination-info {
    text-align: center;
  }

  .pagination-controls {
    justify-content: center;
  }

  .page-size-selector {
    justify-content: center;
  }

  .page-numbers {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
