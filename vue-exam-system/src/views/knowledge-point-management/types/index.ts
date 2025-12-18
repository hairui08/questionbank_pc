/**
 * 知识点管理模块类型定义
 */

/**
 * 状态枚举
 */
export type Status = 'active' | 'disabled' | 'deleted' | 'deprecated'

/**
 * 状态中文名称映射
 */
export const StatusNames: Record<Status, string> = {
  active: '启用',
  disabled: '禁用',
  deleted: '已删除',
  deprecated: '已过时'
}

/**
 * 知识点接口
 */
export interface KnowledgePoint {
  id: string
  subjectId: string // 所属科目
  name: string // 知识点名称
  chapterIds: string[] // 关联章节ID列表
  difficultyLevel: number // 难易程度 (1-5星)
  frequencyLevel: number // 出现频率 (1-5星)
  createTime: string
  creatorId: string
  status: Status
  deprecatedReason?: string // 过时原因（当 status 为 deprecated 时）
  deprecatedDate?: string   // 标记过时日期（当 status 为 deprecated 或 deleted 时）
  replacedBy?: string       // 被哪个知识点替代（当 status 为 deprecated 时）
}

/**
 * 知识点表单数据
 */
export interface KnowledgePointFormData {
  subjectId: string
  name: string
  chapterIds?: string[]
  difficultyLevel?: number
  frequencyLevel: number
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
  chapters: ChapterTreeNode[]
}

/**
 * 章节树节点(用于导航)
 */
export interface ChapterTreeNode {
  id: string
  subjectId: string
  name: string
  sections: SectionTreeNode[]
}

/**
 * 小节树节点(用于导航)
 */
export interface SectionTreeNode {
  id: string
  chapterId: string
  name: string
}

/**
 * 筛选器状态(用于四级树导航)
 */
export interface FilterState {
  type: 'subject' | 'chapter' | 'section'
  id: string
  subjectId: string
}
