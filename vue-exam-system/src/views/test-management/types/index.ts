// 考试管理类型定义

import type { PaymentRuleParams } from '@/views/payment-rule-management/types'

/** 考试类型 */
export type ExamType = 'formal' | 'mock' | 'practice' | 'quiz'
// formal: 正式考试, mock: 模拟考试, practice: 练习测试, quiz: 随堂测验

/** 审核状态 */
export type ReviewStatus = 'pending' | 'approved' | 'rejected'
// pending: 待审核, approved: 已审核(通过), rejected: 已驳回

/** 考试筛选条件 */
export interface TestFilter {
  projectId?: string      // 项目ID
  subjectId?: string      // 科目ID
  status?: ReviewStatus   // 审核状态
  examType?: ExamType     // 考试类型
  testName?: string       // 考试名称(模糊搜索)
}

/** 考试表单数据 */
export interface TestForm {
  name: string            // 考试名称
  examType: ExamType      // 考试类型
  totalScore: number      // 总分
  passingScore: number    // 及格分
  duration: number        // 考试时长(分钟)
  startTime: string       // 考试开始时间
  endTime: string         // 考试结束时间
  subjectId: string       // 所属科目
  projectId: string       // 所属项目
  examPaperId: string     // 关联的试卷ID
  showAnswer?: boolean    // 是否显示答案
  showExplanation?: boolean  // 是否显示解析
  showScore?: boolean     // 是否显示分数
  attemptLimit?: number   // 可做次数限制（0表示无限制）
  // 收费规则
  paymentRuleId?: string
  paymentRuleParams?: PaymentRuleParams
}

/** 考试数据 */
export interface Test extends TestForm {
  id: string              // 考试ID
  status: ReviewStatus    // 审核状态
  createTime: string      // 创建时间
  creatorId: string       // 创建人ID
  creatorName: string     // 创建人姓名
  reviewerId?: string     // 审核人ID
  reviewerName?: string   // 审核人姓名
  reviewTime?: string     // 审核时间
  rejectReason?: string   // 驳回原因
}

/** 考试类型选项 */
export const ExamTypeOptions = [
  { value: 'formal', label: '正式考试' },
  { value: 'mock', label: '模拟考试' },
  { value: 'practice', label: '练习测试' },
  { value: 'quiz', label: '随堂测验' }
] as const

/** 审核状态选项 */
export const ReviewStatusOptions = [
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已审核' },
  { value: 'rejected', label: '已驳回' }
] as const

/** 获取考试类型显示文本 */
export function getExamTypeLabel(type: ExamType): string {
  return ExamTypeOptions.find(opt => opt.value === type)?.label || type
}

/** 获取审核状态显示文本 */
export function getReviewStatusLabel(status: ReviewStatus): string {
  return ReviewStatusOptions.find(opt => opt.value === status)?.label || status
}
