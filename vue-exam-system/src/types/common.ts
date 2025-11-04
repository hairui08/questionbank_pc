// 公共类型定义

export type Status = 'active' | 'disabled'

export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt?: string
}

// Tab标签页类型
export interface TabItem {
  key: string
  label: string
  icon: string
}

// Toast消息类型
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
  id: string
  type: ToastType
  message: string
  duration?: number
}
