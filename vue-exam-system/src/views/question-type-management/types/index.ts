/**
 * 题型管理模块类型定义
 */

/**
 * 内部题型枚举
 * 系统标准化名称，跨科目通用
 */
export enum InternalType {
  ESSAY = 'essay', // 简答题
  SINGLE_CHOICE = 'single_choice', // 单选题
  MULTIPLE_CHOICE = 'multiple_choice', // 多选题
  JUDGMENT = 'judgment', // 判断题
  COMBINATION = 'combination' // 组合题
}

/**
 * 状态枚举
 */
export type Status = 'active' | 'disabled'

/**
 * 题型实体
 */
export interface QuestionType {
  id: string // 题型ID
  subjectId: string // 所属科目ID
  subjectName: string // 所属科目名称
  projectId: string // 所属项目ID
  projectName: string // 所属项目名称
  internalType: InternalType // 内部题型（系统标准化）
  internalName: string // 内部题型中文名称
  displayName: string // 外部显示名称（用户看到的）
  description: string // 题型描述
  order: number // 排序（正整数，1-999）
  status: Status // 状态
  createdAt: Date // 创建时间
  updatedAt: Date // 更新时间
}

/**
 * 题型表单数据
 */
export interface QuestionTypeFormData {
  subjectId: string // 所属科目ID
  subjectName: string // 所属科目名称
  projectId: string // 所属项目ID
  projectName: string // 所属项目名称
  internalType: InternalType // 内部题型
  displayName: string // 外部显示名称
  description: string // 题型描述
  order: number // 排序
  status: Status // 状态
}

/**
 * 项目树节点
 */
export interface ProjectTreeNode {
  id: string
  name: string
  subjects: SubjectTreeNode[]
}

/**
 * 科目树节点
 */
export interface SubjectTreeNode {
  id: string
  name: string
  projectId: string
  projectName: string
}

/**
 * 内部题型名称映射
 */
export const INTERNAL_TYPE_NAMES: Record<InternalType, string> = {
  [InternalType.ESSAY]: '简答题',
  [InternalType.SINGLE_CHOICE]: '单选题',
  [InternalType.MULTIPLE_CHOICE]: '多选题',
  [InternalType.JUDGMENT]: '判断题',
  [InternalType.COMBINATION]: '组合题'
}

/**
 * 内部题型选项列表
 */
export const INTERNAL_TYPE_OPTIONS = [
  { value: InternalType.ESSAY, label: '简答题' },
  { value: InternalType.SINGLE_CHOICE, label: '单选题' },
  { value: InternalType.MULTIPLE_CHOICE, label: '多选题' },
  { value: InternalType.JUDGMENT, label: '判断题' },
  { value: InternalType.COMBINATION, label: '组合题' }
]
