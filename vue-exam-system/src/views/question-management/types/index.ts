// 题库管理类型定义

import type { PaymentRuleParams } from '@/views/payment-rule-management/types'

/** 题型 */
export type QuestionType = 'single' | 'multiple' | 'uncertain' | 'judgment' | 'essay' | 'combination'

/** 题型中文名称映射 */
export const QuestionTypeNames: Record<QuestionType, string> = {
  single: '单选题',
  multiple: '多选题',
  uncertain: '不定项',
  judgment: '判断题',
  essay: '简答题',
  combination: '组合题'
}

/**
 * 题型内部名称（题型管理系统使用）
 * 映射关系：简短名称 -> 完整内部名称
 */
export const INTERNAL_TYPE_MAP = {
  single: 'single_choice',
  multiple: 'multiple_choice',
  uncertain: 'uncertain_choice',
  judgment: 'judgment',
  essay: 'essay',
  combination: 'combination'
} as const

/**
 * 题型简短名称（试题管理页面使用）
 * 映射关系：完整内部名称 -> 简短名称
 */
export const SHORT_TYPE_MAP: Record<string, QuestionType> = {
  'single_choice': 'single',
  'multiple_choice': 'multiple',
  'uncertain_choice': 'uncertain',
  'judgment': 'judgment',
  'essay': 'essay',
  'combination': 'combination'
}

/**
 * 将内部题型名称转换为简短题型名称
 * @param internalType 内部题型名称（如 'single_choice'）
 * @returns 简短题型名称（如 'single'），如果未找到则返回 undefined
 */
export function toShortType(internalType: string): QuestionType | undefined {
  return SHORT_TYPE_MAP[internalType]
}

/**
 * 将简短题型名称转换为内部题型名称
 * @param shortType 简短题型名称（如 'single'）
 * @returns 内部题型名称（如 'single_choice'）
 */
export function toInternalType(shortType: QuestionType): string {
  return INTERNAL_TYPE_MAP[shortType]
}

/** 试题频次（常考程度） */
export type QuestionFrequency = 'low' | 'medium' | 'high'

/** 试题频次中文名称映射 */
export const QuestionFrequencyNames: Record<QuestionFrequency, string> = {
  low: '低频',
  medium: '中频',
  high: '高频'
}

/** 试题状态 */
export type QuestionStatus = 'active' | 'disabled' | 'deleted' | 'deprecated'

/** 试题状态中文名称映射 */
export const QuestionStatusNames: Record<QuestionStatus, string> = {
  active: '启用',
  disabled: '禁用',
  deleted: '已删除',
  deprecated: '已过时'
}

/** 选项 */
export interface QuestionOption {
  label: string // A, B, C, D, ...
  content: string // 选项内容
}

/** 小问（组合题） */
export interface SubQuestion {
  id: string
  type: QuestionType
  stem: string // 小问题干
  options?: QuestionOption[] // 客观题选项
  answer: string | string[] // 答案
  explanation: string // 解析
  disabled?: boolean // 是否禁用（编辑模式下可用）
}

/** 试题过滤条件 */
export interface QuestionFilter {
  projectId?: string
  subjectId?: string
  chapterId?: string
  sectionId?: string // 小节ID
  subSectionId?: string // 子小节ID
  paperId?: string // 试卷ID
  year?: string
  knowledgePointId?: string // 知识点ID（精确匹配）
  knowledgePointKeyword?: string // 知识点关键词（模糊搜索）
  stemKeyword?: string // 题目内容搜索
  type?: QuestionType // 题型筛选
  frequency?: QuestionFrequency // 试题频次筛选
  paymentRuleId?: string // 收费规则筛选
  status?: 'active' | 'disabled' | 'all' // 启用状态筛选
  source?: string // 试题来源
  difficulty?: string // 试题难度
}

/** 试题表单数据 */
export interface QuestionForm {
  // 基本信息
  projectId: string
  subjectId: string
  chapterId: string
  type: QuestionType

  // 来源信息
  year?: string
  frequency: QuestionFrequency // 试题频次（必填）
  knowledgePointIds?: string[] // 知识点ID数组(支持多个知识点)

  // 题目内容
  stem: string // 题干
  options?: QuestionOption[] // 选项（客观题）
  answer: string | string[] // 答案
  explanation: string // 解析

  // 组合题特殊字段
  mainStem?: string // 大题干（案例背景）
  subQuestions?: SubQuestion[] // 小问列表

  // 访问规则
  paymentRuleId?: string        // 访问权限规则ID
  paymentRuleParams?: PaymentRuleParams        // 规则参数
  inheritChapterRule?: boolean         // 是否继承章节规则

  // 试题来源标识（自动判断，不需要用户输入）
  fromExamId?: string // 如果从试卷同步，记录试卷ID
}

/** 试题数据 */
export interface Question extends QuestionForm {
  id: string
  createTime: string
  updateTime: string
  creatorId: string
  status: QuestionStatus
  deprecatedReason?: string // 过时原因（当 status 为 deprecated 时）
  deprecatedDate?: string   // 标记过时日期（当 status 为 deprecated 或 deleted 时）
}
