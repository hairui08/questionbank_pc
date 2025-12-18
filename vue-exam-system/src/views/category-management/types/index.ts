/**
 * 章节管理模块类型定义
 */

// 导入学习阶段类型
import type { LearningStage } from '@/views/learning-stage-management/types'

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
  projectId: string
  projectName: string
  subjectId: string
  subjectName: string
  name: string
  status: Status
  isChapterPractice: boolean
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
 * 子项接口（第三级）
 */
export interface SubSection extends BaseEntity {
  sectionId: string
  sectionName: string
  name: string
  status: Status
  order: number
}

/**
 * 章节表单数据
 */
export interface ChapterFormData {
  projectId?: string
  projectName?: string
  subjectId: string
  subjectName: string
  name: string
  status: Status
  isChapterPractice: boolean
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
  learningStages?: LearningStage[]
}
