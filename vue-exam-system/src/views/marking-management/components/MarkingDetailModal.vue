<template>
  <BaseModal
    v-if="isOpen"
    title="批阅详情"
    :width="800"
    @close="emit('close')"
  >
    <div class="marking-detail-modal">
      <div class="placeholder-content">
        <div class="icon">📝</div>
        <h3>批阅功能开发中</h3>
        <p>此功能将包含:</p>
        <ul>
          <li>显示试卷题目列表</li>
          <li>客观题自动评分</li>
          <li>主观题人工打分输入</li>
          <li>评分标准参考</li>
          <li>总分自动计算</li>
        </ul>
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
import BaseModal from '@/components/Modal/BaseModal.vue'

// Props
interface Props {
  isOpen: boolean
  examId: string | null
}

defineProps<Props>()

// Emits
interface Emits {
  (e: 'close'): void
}

const emit = defineEmits<Emits>()
</script>

<style scoped>
.marking-detail-modal {
  padding: 40px 20px;
}

.placeholder-content {
  text-align: center;
}

.icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.placeholder-content h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-text);
}

.placeholder-content p {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--secondary-text);
}

.placeholder-content ul {
  margin: 0;
  padding: 0;
  list-style: none;
  text-align: left;
  display: inline-block;
}

.placeholder-content li {
  margin-bottom: 8px;
  padding-left: 24px;
  font-size: 13px;
  color: var(--secondary-text);
  position: relative;
}

.placeholder-content li::before {
  content: '•';
  position: absolute;
  left: 8px;
  color: var(--accent);
}

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
