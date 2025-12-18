<template>
  <div class="action-dropdown" ref="dropdownRef">
    <!-- 触发按钮 -->
    <button
      class="dropdown-trigger"
      @click="toggleDropdown"
      :class="{ active: isOpen }"
    >
      {{ triggerText }}
      <span class="dropdown-arrow" :class="{ open: isOpen }">▼</span>
    </button>

    <!-- 下拉菜单 -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        class="dropdown-menu"
        :style="menuStyle"
        ref="menuRef"
      >
        <div
          v-for="item in items"
          :key="item.key"
          class="menu-item"
          :class="{
            danger: item.danger,
            disabled: item.disabled
          }"
          @click.stop="handleSelect(item)"
        >
          <span v-if="item.icon" class="item-icon">{{ item.icon }}</span>
          <span class="item-label">{{ item.label }}</span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

/** 菜单项接口 */
export interface MenuItem {
  key: string          // 菜单项的唯一标识
  label: string        // 显示文本
  icon?: string        // 可选图标（emoji）
  danger?: boolean     // 是否是危险操作（红色样式）
  disabled?: boolean   // 是否禁用
}

interface Props {
  items: MenuItem[]          // 菜单项列表
  triggerText?: string       // 触发按钮文本
}

interface Emits {
  (e: 'select', key: string): void
}

const props = withDefaults(defineProps<Props>(), {
  triggerText: '操作'
})

const emit = defineEmits<Emits>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const menuStyle = ref<Record<string, string>>({})

/**
 * 切换下拉菜单显示状态
 */
function toggleDropdown() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => {
      updateMenuPosition()
    })
  }
}

/**
 * 更新菜单位置
 */
function updateMenuPosition() {
  if (!dropdownRef.value) return

  const rect = dropdownRef.value.getBoundingClientRect()
  menuStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    minWidth: `${rect.width}px`
  }
}

/**
 * 处理菜单项选择
 */
function handleSelect(item: MenuItem) {
  if (item.disabled) return

  emit('select', item.key)
  isOpen.value = false
}

/**
 * 点击外部关闭下拉菜单
 */
function handleClickOutside(event: MouseEvent) {
  if (!isOpen.value) return

  const target = event.target as Node
  const isClickInside =
    dropdownRef.value?.contains(target) ||
    menuRef.value?.contains(target)

  if (!isClickInside) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', updateMenuPosition)
  window.addEventListener('scroll', updateMenuPosition, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', updateMenuPosition)
  window.removeEventListener('scroll', updateMenuPosition, true)
})
</script>

<style scoped>
.action-dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid #d8d8d8;
  border-radius: 4px;
  background: #ffffff;
  color: var(--primary-text);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.dropdown-trigger:hover {
  background: #f5f5f5;
  border-color: #c5c5c5;
}

.dropdown-trigger.active {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.1);
}

.dropdown-arrow {
  font-size: 10px;
  transition: transform 0.2s ease;
  color: var(--secondary-text);
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.dropdown-menu {
  z-index: 9999;
  background: #ffffff;
  border: 1px solid #e4e4e4;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  min-width: 120px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--primary-text);
  cursor: pointer;
  transition: background 0.2s ease;
  white-space: nowrap;
}

.menu-item:hover {
  background: #f5f7fa;
}

.menu-item.danger {
  color: #c62828;
}

.menu-item.danger:hover {
  background: #ffebee;
}

.menu-item.disabled {
  color: #c5c5c5;
  cursor: not-allowed;
}

.menu-item.disabled:hover {
  background: transparent;
}

.item-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.item-label {
  flex: 1;
  font-weight: 600;
}
</style>
