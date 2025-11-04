<template>
  <Teleport to="body">
    <div
      v-if="toastVisible"
      class="toast"
      :class="{ 'is-error': toastType === 'error' }"
    >
      {{ toastMessage }}
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toastVisible, toastMessage, toastType } = useToast()
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 32px;
  right: 32px;
  min-width: 280px;
  background: linear-gradient(180deg, #0f8a5f 0%, #0c6f4c 100%);
  color: #ffffff;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 14px 32px rgba(15, 135, 95, 0.35);
  font-size: 14px;
  z-index: 1000;
  animation: toast-in 0.3s ease;
}

.toast.is-error {
  background: linear-gradient(180deg, #d54a3c 0%, #b13a30 100%);
  box-shadow: 0 14px 32px rgba(213, 74, 60, 0.35);
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
