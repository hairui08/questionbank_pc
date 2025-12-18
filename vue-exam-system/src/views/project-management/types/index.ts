import type { Status, BaseEntity } from '@/types/common'

// 项目实体
export interface Project extends BaseEntity {
  name: string
  status: Status
  order: number
}

// 科目实体
export interface Subject extends BaseEntity {
  projectId: string
  projectName: string
  name: string
  status: Status
  order: number
}

// 项目表单数据
export interface ProjectFormData {
  name: string
  status: Status
  order?: number
}

// 科目表单数据
export interface SubjectFormData {
  projectId: string
  projectName: string
  name: string
  status: Status
  order: number
}
