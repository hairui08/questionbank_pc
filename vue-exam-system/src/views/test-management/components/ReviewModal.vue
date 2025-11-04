<template>
  <div v-if="show" class="modal-overlay" @click="handleCancel">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>审核考试</h3>
      </div>
      <div class="modal-body">
        <div class="review-actions">
          <label class="review-option">
            <input
              type="radio"
              v-model="reviewAction"
              value="approve"
              name="review"
            />
            <span class="option-text">✅ 审核通过</span>
          </label>
          <label class="review-option">
            <input
              type="radio"
              v-model="reviewAction"
              value="reject"
              name="review"
            />
            <span class="option-text">❌ 驳回</span>
          </label>
        </div>

        <div v-if="reviewAction === 'reject'" class="reject-reason">
          <label>驳回原因</label>
          <textarea
            v-model="rejectReason"
            placeholder="请填写驳回原因..."
            rows="4"
          ></textarea>
          <p v-if="showReasonError" class="error-text">请填写驳回原因</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn secondary" @click="handleCancel">取消</button>
        <button class="btn primary" @click="handleConfirm">确定</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  show: boolean
}

interface Emits {
  (e: 'approve'): void
  (e: 'reject', reason: string): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const reviewAction = ref<'approve' | 'reject'>('approve')
const rejectReason = ref('')
const showReasonError = ref(false)

// 重置表单
watch(() => props.show, (newVal) => {
  if (newVal) {
    reviewAction.value = 'approve'
    rejectReason.value = ''
    showReasonError.value = false
  }
})

function handleConfirm() {
  if (reviewAction.value === 'reject') {
    if (!rejectReason.value.trim()) {
      showReasonError.value = true
      return
    }
    emit('reject', rejectReason.value)
  } else {
    emit('approve')
  }
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
  max-width: 520px;
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

.review-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.review-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 2px solid var(--panel-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.review-option:hover {
  border-color: var(--accent);
  background: var(--row-hover);
}

.review-option input[type="radio"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.option-text {
  font-size: 15px;
  font-weight: 500;
  color: var(--primary-text);
}

.reject-reason {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reject-reason label {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-text);
}

.reject-reason textarea {
  padding: 12px;
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
}

.reject-reason textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.error-text {
  margin: 0;
  font-size: 13px;
  color: #cf4a30;
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

.btn.primary {
  background: linear-gradient(180deg, #4f77ff 0%, #2f57e3 100%);
  color: #ffffff;
  border-color: #375edf;
  box-shadow: 0 2px 6px rgba(79, 119, 255, 0.3);
}

.btn.primary:hover {
  background: linear-gradient(180deg, #4b6ee6 0%, #264acc 100%);
}
</style>
