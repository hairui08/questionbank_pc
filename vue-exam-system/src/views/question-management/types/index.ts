// 题库管理类型定义

import type { PaymentRuleParams } from '@/views/payment-rule-management/types'

/** 题型 */
export type QuestionType = 'single' | 'multiple' | 'judgment' | 'essay' | 'combination'

/** 题型中文名称映射 */
export const QuestionTypeNames: Record<QuestionType, string> = {
  single: '单选题',
  multiple: '多选题',
  judgment: '判断题',
  essay: '简答题',
  combination: '组合题'
}

/** 试题来源 */
export type QuestionSource = 'official' | 'simulation' | 'custom'

/** 试题难度 */
export type QuestionDifficulty = 'easy' | 'medium' | 'hard'

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
}

/** 试题过滤条件 */
export interface QuestionFilter {
  projectId?: string
  subjectId?: string
  chapterId?: string
  source?: QuestionSource
  year?: string
  knowledgePointId?: string // 知识点ID
  type?: QuestionType // 题型筛选
  difficulty?: QuestionDifficulty
  paymentRuleId?: string // 收费规则筛选
}

/** 试题表单数据 */
export interface QuestionForm {
  // 基本信息
  projectId: string
  subjectId: string
  chapterId: string
  type: QuestionType

  // 来源信息
  source: QuestionSource
  year?: string
  difficulty?: QuestionDifficulty
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
}

/** 试题数据 */
export interface Question extends QuestionForm {
  id: string
  createTime: string
  updateTime: string
  creatorId: string
  status: 'active' | 'disabled'
}
