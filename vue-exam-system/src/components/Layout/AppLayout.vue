<template>
  <div class="app-shell">
    <Sidebar />
    <main class="content">
      <div class="content-header">
        <h1>{{ title }}</h1>
        <span class="tag">v1.0</span>
      </div>
      <slot />
    </main>
    <Toast />
  </div>
</template>

<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import Toast from '@/components/Feedback/Toast.vue'

interface Props {
  title: string
}

defineProps<Props>()
</script>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
}

.content {
  flex: 1;
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.content-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

@media (max-width: 768px) {
  .content {
    padding: 16px;
  }
}
</style>
