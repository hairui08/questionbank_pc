<template>
  <aside class="sidebar">
    <div class="sidebar-header">棰樺簱绯荤粺鍚庡彴</div>
    <ul class="menu">
      <li v-for="item in menuItems" :key="item.path" class="menu-item">
        <router-link
          :to="item.path"
          class="menu-link"
          :class="{ 'is-active': isActive(item.path) }"
        >
          <span class="icon"></span>
          {{ item.label }}
        </router-link>
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

interface MenuItem {
  path: string
  label: string
}

const menuItems: MenuItem[] = [
  { path: '/project-management', label: '项目管理' },
  { path: '/chapter-management', label: '章节管理' },
  { path: '/payment-rule-management', label: '收费规则' },
  { path: '/learning-stage-management', label: '学习阶段管理' },
  { path: '/knowledge-point-management', label: '知识点管理' },
  { path: '/question-type-management', label: '题型管理' },
  { path: '/question-management', label: '试题管理' },
  { path: '/exam-management', label: '试卷管理' },
  { path: '/test-management', label: '考试管理' },
  { path: '/marking-management', label: '阅卷管理' },
  { path: '/design-guidelines', label: '设计规范' }
]

const route = useRoute()

const isActive = computed(() => (path: string) => {
  return route.path === path
})
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.04);
}

.sidebar-header {
  padding: 24px;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: var(--primary-text);
  border-bottom: 1px solid var(--sidebar-border);
}

.menu {
  list-style: none;
  margin: 0;
  padding: 8px 0;
}

.menu-item {
  margin: 0;
}

.menu-link {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  color: var(--primary-text);
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.menu-link:hover {
  background-color: #e6e6e6;
}

.menu-link.is-active {
  background-color: #d9ebff;
  color: var(--accent);
  border-left: 4px solid var(--accent);
  padding-left: 20px;
}

.menu-link .icon {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  border-radius: 4px;
  background: linear-gradient(180deg, #4f77ff 0%, #2651d4 100%);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4);
  position: relative;
}

.menu-link .icon::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #ffffff;
}
</style>

