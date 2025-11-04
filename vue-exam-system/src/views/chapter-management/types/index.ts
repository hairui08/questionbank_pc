/**
 * 章节管理模块类型定义
 */

/**
 * 状态枚举
 */
export type Status = 'active' | 'disabled'

/**
 * 基础实体接口
 */
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt?: string
}

/**
 * 章节接口
 */
export interface Chapter extends BaseEntity {
  subjectId: string
  subjectName: string
  name: string
  status: Status
  order: number
}

/**
 * 小节接口
 */
export interface Section extends BaseEntity {
  chapterId: string
  chapterName: string
  name: string
  status: Status
  order: number
}

/**
 * 章节表单数据
 */
export interface ChapterFormData {
  subjectId: string
  subjectName: string
  name: string
  status: Status
  order: number
}

/**
 * 小节表单数据
 */
export interface SectionFormData {
  chapterId: string
  chapterName: string
  name: string
  status: Status
  order: number
}

/**
 * 项目树节点（用于导航）
 */
export interface ProjectTreeNode {
  id: string
  name: string
  subjects: SubjectTreeNode[]
}

/**
 * 科目树节点（用于导航）
 */
export interface SubjectTreeNode {
  id: string
  projectId: string
  name: string
}
