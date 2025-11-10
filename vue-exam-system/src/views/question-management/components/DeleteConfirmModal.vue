<template>
  <BaseModal v-if="show" :visible="show" @update:visible="handleCancel">
    <template #header>
      <h3>{{ isBatch ? '批量删除确认' : '删除确认' }}</h3>
    </template>

    <template #body>
      <div class="delete-confirm-content">
        <p v-if="isBatch" class="warning-message">
          确认要删除选中的 <strong>{{ count }}</strong> 道试题吗?
        </p>
        <p v-else class="warning-message">
          确认要删除该试题吗?
        </p>
        <p class="warning-hint">
          此操作不可撤销,删除后数据将无法恢复!
        </p>
      </div>
    </template>

    <template #footer>
      <div class="modal-actions">
        <button class="btn secondary" @click="handleCancel">
          取消
        </button>
        <button class="btn danger" @click="handleConfirm">
          确认删除
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '@/components/Modal/BaseModal.vue'

interface Props {
  show: boolean
  isBatch?: boolean
  count?: number
}

interface Emits {
  (e: 'confirm'): void
  (e: 'cancel'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('cancel')
}
</script>

<style scoped>
.delete-confirm-content {
  text-align: center;
  padding: 12px 20px;
}

.warning-message {
  font-size: 16px;
  color: var(--primary-text);
  margin: 0 0 12px;
  line-height: 1.6;
}

.warning-message strong {
  color: #d32f2f;
  font-weight: 600;
}

.warning-hint {
  font-size: 14px;
  color: var(--secondary-text);
  margin: 0;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
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
  color: var(--secondary-text);
  border-color: #d8d8d8;
}

.btn.secondary:hover {
  background: #f5f5f5;
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
