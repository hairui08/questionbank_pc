<template>
  <BaseModal
    :show="show"
    title="确认删除"
    @close="emit('cancel')"
  >
    <template #body>
      <div class="confirm-content">
        <div class="icon-warning">⚠️</div>
        <p v-if="isBatch">
          确定要删除选中的 <strong>{{ count }}</strong> 份试卷吗?
        </p>
        <p v-else>
          确定要删除这份试卷吗?
        </p>
        <p class="warning-text">此操作不可撤销!</p>
      </div>
    </template>
    <template #footer>
      <button class="btn secondary" @click="emit('cancel')">取消</button>
      <button class="btn danger" @click="emit('confirm')">确认删除</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '@/components/Modal/BaseModal.vue'

interface Props {
  show: boolean
  isBatch: boolean
  count: number
}

interface Emits {
  (e: 'confirm'): void
  (e: 'cancel'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<style scoped>
.confirm-content {
  text-align: center;
  padding: 20px 0;
}

.icon-warning {
  font-size: 48px;
  margin-bottom: 16px;
}

.confirm-content p {
  margin: 8px 0;
  font-size: 16px;
  color: var(--primary-text);
}

.confirm-content strong {
  color: var(--accent);
  font-weight: 600;
}

.warning-text {
  color: #ef5350;
  font-size: 14px;
  margin-top: 12px;
}

.btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.btn.secondary {
  background: #ffffff;
  color: var(--primary-text);
  border-color: var(--panel-border);
}

.btn.secondary:hover {
  background: #f8fafc;
}

.btn.danger {
  background: linear-gradient(180deg, #ef5350 0%, #d32f2f 100%);
  color: #ffffff;
  border-color: #c62828;
}

.btn.danger:hover {
  background: linear-gradient(180deg, #e53935 0%, #c62828 100%);
}
</style>
