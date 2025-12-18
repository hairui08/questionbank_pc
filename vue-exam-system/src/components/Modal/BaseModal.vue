<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="modal-backdrop"
      :class="{ 'is-open': visible }"
      @click="handleBackdropClick"
    >
      <div class="modal" :style="{ width: width || '460px' }" @click.stop>
        <header v-if="$slots.header || title">
          <slot name="header">
            <h3>{{ title }}</h3>
            <p v-if="description">{{ description }}</p>
          </slot>
        </header>

        <div class="modal-body">
          <slot name="body">
            <slot />
          </slot>
        </div>

        <footer v-if="$slots.footer || showFooter">
          <slot name="footer">
            <button class="btn secondary" @click="handleCancel">取消</button>
            <button class="btn primary" @click="handleConfirm">确认</button>
          </slot>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean
  title?: string
  description?: string
  showFooter?: boolean
  closeOnClickOutside?: boolean
  width?: string
}

const props = withDefaults(defineProps<Props>(), {
  showFooter: true,
  closeOnClickOutside: true
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'confirm': []
  'cancel': []
}>()

const handleBackdropClick = () => {
  if (props.closeOnClickOutside) {
    handleCancel()
  }
}

const handleCancel = () => {
  emit('update:visible', false)
  emit('cancel')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(9, 22, 41, 0.35);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 24px;
}

.modal-backdrop.is-open {
  display: flex;
}

.modal {
  width: 410px;
  max-width: 100%;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.16);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: fade-in 0.3s ease;
}

.modal header {
  padding: 18px 16px;
  border-bottom: 1px solid #e5e8ef;
}

.modal header h3 {
  margin: 0 0 8px;
  font-size: 20px;
}

.modal header p {
  margin: 0;
  color: var(--secondary-text);
  line-height: 1.6;
}

.modal-body {
  overflow:hidden;
}

.modal footer {
  padding: 20px 24px;
  border-top: 1px solid #e5e8ef;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal footer .btn.primary {
  min-width: 96px;
}

@media (max-width: 768px) {
  .modal {
    width: 100%;
    margin: 0 16px;
  }
}
</style>
