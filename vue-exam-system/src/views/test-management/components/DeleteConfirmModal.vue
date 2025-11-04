<template>
  <div v-if="show" class="modal-overlay" @click="handleCancel">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>确认删除</h3>
      </div>
      <div class="modal-body">
        <p v-if="isBatch">
          确定要删除选中的 <strong>{{ count }}</strong> 个考试吗?
        </p>
        <p v-else>
          确定要删除该考试吗?
        </p>
        <p class="warning-text">⚠️ 已审核的考试不能删除</p>
      </div>
      <div class="modal-footer">
        <button class="btn secondary" @click="handleCancel">取消</button>
        <button class="btn danger" @click="handleConfirm">删除</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('cancel')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #ffffff;
  border-radius: 12px;
  width: 90%;
  max-width: 480px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: modal-appear 0.3s ease;
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--panel-border);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-text);
}

.modal-body {
  padding: 24px;
}

.modal-body p {
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--primary-text);
  line-height: 1.6;
}

.modal-body p:last-child {
  margin-bottom: 0;
}

.warning-text {
  color: #f57c00;
  font-weight: 600;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--panel-border);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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
  color: var(--accent);
  border-color: rgba(0, 102, 204, 0.4);
}

.btn.secondary:hover {
  background: rgba(0, 102, 204, 0.08);
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
