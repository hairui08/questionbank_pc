/**
 * 知识点管理模块类型定义
 */

/**
 * 状态枚举
 */
export type Status = 'active' | 'disabled'

/**
 * 知识点接口
 */
export interface KnowledgePoint {
  id: string
  subjectId: string // 所属科目
  name: string // 知识点名称
  chapterIds: string[] // 关联章节ID列表
  createTime: string
  creatorId: string
  status: Status
}

/**
 * 知识点表单数据
 */
export interface KnowledgePointFormData {
  subjectId: string
  name: string
  chapterIds?: string[]
}

/**
 * 项目树节点(用于导航)
 */
export interface ProjectTreeNode {
  id: string
  name: string
  subjects: SubjectTreeNode[]
}

/**
 * 科目树节点(用于导航)
 */
export interface SubjectTreeNode {
  id: string
  projectId: string
  projectName: string
  name: string
}
