/**
 * 收费规则管理 - 类型定义
 */

import type { Status } from '@/types/common'

/**
 * 规则适用对象类型
 */
export type ApplicableObject = 'question' | 'exam' | 'chapter' | 'subject'

/**
 * 权限规则参数类型
 */
export interface PaymentRuleParams {
  chapterId?: string         // 章节ID (用于T002, T005)
  examId?: string            // 试卷ID (用于T006)
  courseId?: string          // 课程ID (用于T007, 预留)
  subjectId?: string         // 科目ID (用于T008)
  trialCount?: number        // 试看题数 (用于T009)
  startTime?: string         // 开始时间 (用于T010)
  endTime?: string           // 结束时间 (用于T010)
}

/**
 * 收费规则
 */
export interface PaymentRule {
  id: string                          // 规则ID
  code: string                        // 规则编码 (如T001, T002)
  displayName: string                 // 显示名称
  applicableTo: ApplicableObject[]    // 适用对象列表
  paramPlaceholder: string            // 参数占位符提示
  description: string                 // 说明
  status: Status                      // 启用状态
  order: number                       // 排序值(越小越靠前)
  createdAt: string                   // 创建时间
}

/**
 * 收费规则表单数据
 */
export interface PaymentRuleFormData {
  displayName: string
  applicableTo: ApplicableObject[]
  paramPlaceholder: string
  description: string
  status: Status
  order: number
}

/**
 * 实体的访问权限配置
 */
export interface EntityPaymentConfig {
  paymentRuleId?: string       // 关联的收费规则ID
  permissionRuleParams?: PaymentRuleParams       // 权限规则参数
  inheritChapterRule?: boolean        // 是否继承章节规则(仅试题使用)
}
