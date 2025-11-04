import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 当前活动的菜单项
  const activeMenu = ref('project-management')

  // 设置活动菜单
  const setActiveMenu = (menu: string) => {
    activeMenu.value = menu
  }

  return {
    activeMenu,
    setActiveMenu
  }
})
