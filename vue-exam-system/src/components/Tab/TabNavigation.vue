<template>
  <div class="tab-container">
    <nav class="tab-navigation">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: currentTab === tab.key }"
        @click="handleTabClick(tab.key)"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-text">{{ tab.label }}</span>
      </button>
    </nav>

    <div class="tab-content">
      <slot :name="currentTab" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

export interface TabItem {
  key: string
  label: string
  icon: string
}

interface Props {
  tabs: TabItem[]
  defaultTab?: string
}

const props = withDefaults(defineProps<Props>(), {
  defaultTab: 'prototype'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
}>()

const currentTab = ref(props.defaultTab)

const handleTabClick = (tabKey: string) => {
  currentTab.value = tabKey
  emit('update:modelValue', tabKey)
  emit('change', tabKey)

  // 保存到localStorage
  localStorage.setItem('currentTab', tabKey)
}

// 从localStorage恢复上次的tab
const savedTab = localStorage.getItem('currentTab')
if (savedTab && props.tabs.some(t => t.key === savedTab)) {
  currentTab.value = savedTab
}
</script>

<style scoped>
.tab-container {
  display: flex;
  flex-direction: column;
}

.tab-navigation {
  display: flex;
  gap: 4px;
  margin: 0 0 1px 0;
  border-bottom: 1px solid var(--panel-border);
  background: linear-gradient(180deg, #fafafa 0%, #f2f2f2 100%);
  border-radius: 12px 12px 0 0;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  background: transparent;
  color: var(--secondary-text);
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.tab-btn:hover {
  color: var(--primary-text);
  background: rgba(0, 102, 204, 0.08);
}

.tab-btn.active {
  color: var(--accent);
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-bottom: 1px solid var(--panel-bg);
  margin-bottom: -1px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.tab-icon {
  font-size: 16px;
}

.tab-text {
  font-weight: 600;
}

.tab-content {
  background: var(--panel-bg);
  border-radius: 0 0 12px 12px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--panel-border);
  border-top: none;
  min-height: 600px;
  padding: 28px;
}
</style>
