<template>
  <BaseModal
    :visible="isVisible"
    :title="title"
    width="360px"
    @update:visible="isVisible = $event"
    @close="handleClose"
  >
    <div class="confirm-content">
      <p class="warning-text">{{ message }}</p>
    </div>

    <template #footer>
      <button class="btn secondary" @click="handleClose">取消</button>
      <button class="btn" :class="confirmButtonClass" @click="handleConfirm">
        {{ confirmButtonText }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import BaseModal from '@/components/Modal/BaseModal.vue'

// Props
interface Props {
  visible: boolean
  title?: string
  message: string
  actionType: 'enable' | 'disable'
  entityName?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  entityName: ''
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
 * 根据操作类型计算弹窗标题
 */
const title = computed(() => {
  if (props.title) return props.title
  return props.actionType === 'enable' ? '确认启用' : '确认禁用'
})

/**
 * 确认按钮文字
 */
const confirmButtonText = computed(() => {
  return props.actionType === 'enable' ? '启用' : '禁用'
})

/**
 * 确认按钮样式类
 */
const confirmButtonClass = computed(() => {
  return props.actionType === 'enable' ? 'success' : 'warning'
})

/**
 * 确认操作
 */
const handleConfirm = () => {
  emit('confirm')
  // 不自动关闭，让父组件在操作成功后关闭
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
  white-space: pre-line;
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

.btn.success {
  background: linear-gradient(180deg, #27ae60 0%, #229954 100%);
  color: #ffffff;
  border-color: #229954;
}

.btn.success:hover {
  background: linear-gradient(180deg, #1e8e4e 0%, #1a7a3f 100%);
}

.btn.warning {
  background: linear-gradient(180deg, #f39c12 0%, #e67e22 100%);
  color: #ffffff;
  border-color: #e67e22;
}

.btn.warning:hover {
  background: linear-gradient(180deg, #d68910 0%, #ca6f1e 100%);
}
</style>
