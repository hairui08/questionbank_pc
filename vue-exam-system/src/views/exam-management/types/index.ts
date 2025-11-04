// 试卷管理类型定义
import type { QuestionOption, SubQuestion } from '@/views/question-management/types'
import type { PaymentRuleParams } from '@/views/payment-rule-management/types'

/** 试卷状态 */
export type ExamStatus = 'active' | 'disabled'

/** 嵌入式试题数据（试卷专属试题） */
export interface EmbeddedQuestionData {
  stem: string // 题干
  options?: QuestionOption[] // 选项（客观题）
  answer: string | string[] // 答案
  explanation: string // 解析
  mainStem?: string // 案例背景（组合题）
  subQuestions?: SubQuestion[] // 小问列表（组合题）
  chapterId?: string // 所属章节
  knowledgePointIds?: string[] // 关联知识点
  difficulty?: string // 难度
  source?: string // 来源
}

/** 试卷中的题目 */
export interface ExamQuestion {
  questionId: string // 试题ID（嵌入式用临时ID，引用式为题库ID）
  type: string // 题型
  score: number // 该题分值
  order: number // 排序序号
  isOptional: boolean // 是否为选答题(非必答)
  embedded?: EmbeddedQuestionData // 嵌入式试题完整数据（如果存在，则不从题库查询）
}

/** 试卷筛选条件 */
export interface ExamFilter {
  subjectId?: string // 科目ID
  status?: ExamStatus // 试卷状态
  startTime?: string // 创建时间-起始
  endTime?: string // 创建时间-结束
  examName?: string // 试卷名称(模糊搜索)
  year?: number // 年份筛选
  paymentRuleId?: string // 收费规则筛选
  learningStageId?: string // 学习阶段ID筛选
}

/** 试卷表单数据 */
export interface ExamForm {
  name: string // 试卷名称
  subjectId: string // 所属科目
  projectId: string // 所属项目
  learningStageId: string // 学习阶段ID（必填）
  passingScore: number // 及格分
  questions: ExamQuestion[] // 试题列表
  validFrom?: string // 有效期开始日期
  validTo?: string // 有效期结束日期
  year?: number // 试卷年份
  // 收费规则
  paymentRuleId?: string
  paymentRuleParams?: PaymentRuleParams
}

/** 试卷数据 */
export interface Exam extends ExamForm {
  id: string
  totalScore: number // 总分(自动计算,仅必答题)
  createTime: string
  updateTime: string
  creatorId: string
  creatorName: string
  status: ExamStatus
}
