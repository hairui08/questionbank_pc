/**
 * 阅卷管理模块类型定义
 */

/**
 * 考试状态枚举
 */
export enum ExamStatus {
  DRAFT = 'draft', // 草稿
  PENDING = 'pending', // 待批阅
  MARKING = 'marking', // 批阅中
  COMPLETED = 'completed' // 已完成
}

/**
 * 考试类型
 */
export type ExamType = 'formal' | 'practice' | 'mock' // 正式考试 | 练习 | 模拟考

/**
 * 组卷方式
 */
export type PaperGenerationType = 'manual' | 'random' | 'template' // 手动组卷 | 随机组卷 | 模板组卷

/**
 * 阅卷记录(考试)
 */
export interface MarkingRecord {
  id: string
  examName: string // 考试名称
  examType: ExamType // 考试类型
  paperGenerationType: PaperGenerationType // 组卷方式
  duration: number // 考试时长(分钟)
  totalScore: number // 试卷总分
  passingScore: number // 及格分数
  participantCount: number // 参与人数
  status: ExamStatus // 考试状态
  projectId: string // 项目ID
  subjectId: string // 科目ID
  assignedTeachers?: string[] // 分配的评卷教师ID列表
  createdAt: string // 创建时间
  updatedAt: string // 更新时间
}

/**
 * 筛选条件
 */
export interface MarkingFilter {
  projectId?: string // 项目ID
  subjectId?: string // 科目ID
  status?: ExamStatus // 考试状态
  examType?: ExamType // 考试类型
  examName?: string // 考试名称(模糊搜索)
}

/**
 * 分页查询结果
 */
export interface MarkingPaginationResult {
  records: MarkingRecord[]
  total: number
  page: number
  pageSize: number
}

/**
 * 评卷教师
 */
export interface Teacher {
  id: string
  name: string
  email: string
  department: string // 院系
}

/**
 * 分配任务数据
 */
export interface AssignTaskData {
  examId: string
  teacherIds: string[] // 评卷教师ID列表
  assignmentType: 'by_question' | 'by_student' // 按题目分配 | 按学生分配
}

/**
 * 批阅进度
 */
export interface MarkingProgress {
  examId: string
  totalCount: number // 总份数
  markedCount: number // 已批阅份数
  unmarkedCount: number // 未批阅份数
  progress: number // 进度百分比(0-100)
}

/**
 * 学生成绩
 */
export interface StudentScore {
  studentId: string
  studentName: string
  totalScore: number // 总分
  objectiveScore: number // 客观题得分
  subjectiveScore: number // 主观题得分
  rank: number // 排名
  isPassed: boolean // 是否及格
  submittedAt: string // 提交时间
  markedAt?: string // 批阅时间
}

/**
 * 成绩统计
 */
export interface ScoreStatistics {
  examId: string
  averageScore: number // 平均分
  highestScore: number // 最高分
  lowestScore: number // 最低分
  passRate: number // 及格率(0-100)
  scores: StudentScore[] // 学生成绩列表
}
