<template>
  <BaseModal
    :visible="isVisible"
    :title="title"
    @update:visible="isVisible = $event"
    @close="handleClose"
  >
    <div class="confirm-content">
      <p class="warning-text">{{ message }}</p>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>

    <template #footer>
      <button class="btn secondary" @click="handleClose">取消</button>
      <button class="btn danger" @click="handleConfirm">确认删除</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseModal from '@/components/Modal/BaseModal.vue'

// Props
interface Props {
  visible: boolean
  title?: string
  message: string
  errorMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '确认删除',
  errorMessage: ''
})

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: []
}>()

// 本地visible状态
const isVisible = ref(props.visible)

// 监听visible变化
watch(
  () => props.visible,
  (newVal) => {
    isVisible.value = newVal
  }
)

watch(isVisible, (newVal) => {
  emit('update:visible', newVal)
})

/**
 * 确认删除
 */
const handleConfirm = () => {
  emit('confirm')
  // 不自动关闭，让父组件在删除成功后关闭
}

/**
 * 关闭弹窗
 */
const handleClose = () => {
  isVisible.value = false
}
</script>

<style scoped>
.confirm-content {
  text-align: center;
  padding: 12px 0;
}

.warning-text {
  font-size: 16px;
  color: var(--primary-text);
  margin: 0 0 12px;
  line-height: 1.6;
}

.error-message {
  font-size: 14px;
  color: #e74c3c;
  margin: 12px 0 0;
  padding: 12px;
  background-color: #fff3f0;
  border: 1px solid #e74c3c;
  border-radius: 6px;
}

.btn {
  padding: 8px 20px;
  border-radius: 6px;
  border: 1px solid transparent;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn.secondary {
  background-color: #ffffff;
  color: var(--accent);
  border-color: rgba(0, 102, 204, 0.4);
}

.btn.secondary:hover {
  background-color: rgba(0, 102, 204, 0.08);
}

.btn.danger {
  background: linear-gradient(180deg, #e74c3c 0%, #c0392b 100%);
  color: #ffffff;
  border-color: #c0392b;
}

.btn.danger:hover {
  background: linear-gradient(180deg, #d62c1a 0%, #a93226 100%);
}
</style>
