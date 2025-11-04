import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  MarkingRecord,
  MarkingFilter,
  MarkingPaginationResult,
  Teacher,
  AssignTaskData,
  MarkingProgress,
  ScoreStatistics,
  StudentScore,
  ExamStatus
} from '@/views/marking-management/types'

/**
 * 阅卷管理 Store
 */
export const useMarkingStore = defineStore('marking', () => {
  // Mock 评卷教师数据
  const mockTeachers = ref<Teacher[]>([
    {
      id: 'teacher-1',
      name: '张老师',
      email: 'zhang@example.com',
      department: '计算机科学与技术'
    },
    {
      id: 'teacher-2',
      name: '李老师',
      email: 'li@example.com',
      department: '软件工程'
    },
    {
      id: 'teacher-3',
      name: '王老师',
      email: 'wang@example.com',
      department: '信息安全'
    }
  ])

  // Mock 阅卷记录数据
  const mockMarkingRecords = ref<MarkingRecord[]>([
    {
      id: 'marking-1',
      examName: '数据结构期中考试',
      examType: 'formal',
      paperGenerationType: 'manual',
      duration: 120,
      totalScore: 100,
      passingScore: 60,
      participantCount: 45,
      status: 'pending' as ExamStatus,
      projectId: 'project-1',
      subjectId: 'subject-1',
      createdAt: '2025-10-10T09:00:00Z',
      updatedAt: '2025-10-10T09:00:00Z'
    },
    {
      id: 'marking-2',
      examName: '算法设计期末考试',
      examType: 'formal',
      paperGenerationType: 'template',
      duration: 150,
      totalScore: 120,
      passingScore: 72,
      participantCount: 38,
      status: 'marking' as ExamStatus,
      projectId: 'project-1',
      subjectId: 'subject-1',
      assignedTeachers: ['teacher-1', 'teacher-2'],
      createdAt: '2025-10-12T10:00:00Z',
      updatedAt: '2025-10-15T14:30:00Z'
    },
    {
      id: 'marking-3',
      examName: '编译原理课程设计',
      examType: 'practice',
      paperGenerationType: 'manual',
      duration: 180,
      totalScore: 100,
      passingScore: 60,
      participantCount: 30,
      status: 'completed' as ExamStatus,
      projectId: 'project-1',
      subjectId: 'subject-2',
      assignedTeachers: ['teacher-3'],
      createdAt: '2025-09-20T08:00:00Z',
      updatedAt: '2025-09-25T18:00:00Z'
    },
    {
      id: 'marking-4',
      examName: '数据库原理期中测试',
      examType: 'mock',
      paperGenerationType: 'random',
      duration: 90,
      totalScore: 80,
      passingScore: 48,
      participantCount: 52,
      status: 'draft' as ExamStatus,
      projectId: 'project-1',
      subjectId: 'subject-3',
      createdAt: '2025-10-16T15:00:00Z',
      updatedAt: '2025-10-16T15:00:00Z'
    },
    {
      id: 'marking-5',
      examName: '操作系统期末考试',
      examType: 'formal',
      paperGenerationType: 'template',
      duration: 120,
      totalScore: 100,
      passingScore: 60,
      participantCount: 48,
      status: 'pending' as ExamStatus,
      projectId: 'project-2',
      subjectId: 'subject-4',
      createdAt: '2025-10-14T10:00:00Z',
      updatedAt: '2025-10-14T10:00:00Z'
    }
  ])

  /**
   * 获取筛选后的阅卷记录
   */
  const getFilteredRecords = (filter: MarkingFilter): MarkingRecord[] => {
    return mockMarkingRecords.value.filter((record) => {
      // 项目筛选
      if (filter.projectId && record.projectId !== filter.projectId) {
        return false
      }

      // 科目筛选
      if (filter.subjectId && record.subjectId !== filter.subjectId) {
        return false
      }

      // 考试状态筛选
      if (filter.status && record.status !== filter.status) {
        return false
      }

      // 考试类型筛选
      if (filter.examType && record.examType !== filter.examType) {
        return false
      }

      // 考试名称模糊搜索
      if (filter.examName && !record.examName.includes(filter.examName)) {
        return false
      }

      return true
    })
  }

  /**
   * 获取分页的阅卷记录
   */
  const getPaginatedRecords = (
    filter: MarkingFilter,
    page: number,
    pageSize: number
  ): MarkingPaginationResult => {
    const filteredRecords = getFilteredRecords(filter)
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const records = filteredRecords.slice(start, end)

    return {
      records,
      total: filteredRecords.length,
      page,
      pageSize
    }
  }

  /**
   * 根据ID获取阅卷记录
   */
  const getMarkingRecordById = (id: string): MarkingRecord | undefined => {
    return mockMarkingRecords.value.find((record) => record.id === id)
  }

  /**
   * 获取指定项目/科目下的考试数量
   */
  const getExamCount = (projectId?: string, subjectId?: string): number => {
    return mockMarkingRecords.value.filter((record) => {
      if (projectId && record.projectId !== projectId) return false
      if (subjectId && record.subjectId !== subjectId) return false
      return true
    }).length
  }

  /**
   * 分配评卷任务
   */
  const assignTask = (data: AssignTaskData): boolean => {
    const record = mockMarkingRecords.value.find((r) => r.id === data.examId)
    if (!record) {
      return false
    }

    record.assignedTeachers = data.teacherIds
    record.status = 'marking' as ExamStatus
    record.updatedAt = new Date().toISOString()

    return true
  }

  /**
   * 获取批阅进度
   */
  const getMarkingProgress = (examId: string): MarkingProgress | null => {
    const record = getMarkingRecordById(examId)
    if (!record) {
      return null
    }

    // Mock 数据: 根据状态生成进度
    let markedCount = 0
    if (record.status === 'marking') {
      markedCount = Math.floor(record.participantCount * 0.6) // 60% 已批阅
    } else if (record.status === 'completed') {
      markedCount = record.participantCount // 100% 已批阅
    }

    const unmarkedCount = record.participantCount - markedCount
    const progress = (markedCount / record.participantCount) * 100

    return {
      examId,
      totalCount: record.participantCount,
      markedCount,
      unmarkedCount,
      progress: Math.round(progress)
    }
  }

  /**
   * 获取成绩统计
   */
  const getScoreStatistics = (examId: string): ScoreStatistics | null => {
    const record = getMarkingRecordById(examId)
    if (!record || record.status !== 'completed') {
      return null
    }

    // Mock 数据: 生成学生成绩
    const scores: StudentScore[] = []
    for (let i = 1; i <= record.participantCount; i++) {
      const totalScore = Math.floor(Math.random() * 40) + 60 // 60-100分
      scores.push({
        studentId: `student-${i}`,
        studentName: `学生${i}`,
        totalScore,
        objectiveScore: Math.floor(totalScore * 0.6),
        subjectiveScore: Math.floor(totalScore * 0.4),
        rank: 0, // 稍后计算排名
        isPassed: totalScore >= record.passingScore,
        submittedAt: record.createdAt,
        markedAt: record.updatedAt
      })
    }

    // 按分数降序排序并计算排名
    scores.sort((a, b) => b.totalScore - a.totalScore)
    scores.forEach((score, index) => {
      score.rank = index + 1
    })

    // 计算统计数据
    const totalScores = scores.map((s) => s.totalScore)
    const averageScore = totalScores.reduce((a, b) => a + b, 0) / totalScores.length
    const highestScore = Math.max(...totalScores)
    const lowestScore = Math.min(...totalScores)
    const passedCount = scores.filter((s) => s.isPassed).length
    const passRate = (passedCount / scores.length) * 100

    return {
      examId,
      averageScore: Math.round(averageScore * 10) / 10,
      highestScore,
      lowestScore,
      passRate: Math.round(passRate * 10) / 10,
      scores
    }
  }

  /**
   * 获取所有教师
   */
  const getAllTeachers = (): Teacher[] => {
    return mockTeachers.value
  }

  return {
    mockMarkingRecords,
    mockTeachers,
    getFilteredRecords,
    getPaginatedRecords,
    getMarkingRecordById,
    getExamCount,
    assignTask,
    getMarkingProgress,
    getScoreStatistics,
    getAllTeachers
  }
})
