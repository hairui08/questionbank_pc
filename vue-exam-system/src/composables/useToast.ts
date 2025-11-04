import { ref } from 'vue'
import type { ToastType } from '@/types/common'

interface ToastOptions {
  type?: ToastType
  duration?: number
}

const toastVisible = ref(false)
const toastMessage = ref('')
const toastType = ref<ToastType>('success')
let toastTimer: number | null = null

export function useToast() {
  const showToast = (message: string, options: ToastOptions = {}) => {
    const { type = 'success', duration = 2400 } = options

    toastMessage.value = message
    toastType.value = type
    toastVisible.value = true

    // 清除之前的定时器
    if (toastTimer) {
      clearTimeout(toastTimer)
    }

    // 设置新的定时器
    toastTimer = window.setTimeout(() => {
      toastVisible.value = false
    }, duration)
  }

  const hideToast = () => {
    toastVisible.value = false
    if (toastTimer) {
      clearTimeout(toastTimer)
      toastTimer = null
    }
  }

  return {
    toastVisible,
    toastMessage,
    toastType,
    showToast,
    hideToast
  }
}
