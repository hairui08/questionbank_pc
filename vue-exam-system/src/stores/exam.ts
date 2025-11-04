import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Exam, ExamForm, ExamFilter } from '@/views/exam-management/types'

export const useExamStore = defineStore('exam', () => {
  // Mock试卷数据
  const mockExams = ref<Exam[]>([
    {
      id: 'exam-001',
      name: '2024年财务战略管理期末考试',
      projectId: 'proj-001',
      subjectId: 's1',
      learningStageId: 'ls-004', // 复习冲刺阶段
      totalScore: 100,
      passingScore: 60,
      year: 2024,
      validFrom: '2024-01-01',
      validTo: '2024-12-31',
      questions: [
        { questionId: 'q-001', type: 'single', score: 5, order: 1, isOptional: false },
        { questionId: 'q-006', type: 'single', score: 5, order: 2, isOptional: false },
        { questionId: 'q-002', type: 'multiple', score: 10, order: 3, isOptional: false },
        { questionId: 'q-003', type: 'judgment', score: 5, order: 4, isOptional: false },
        { questionId: 'q-009', type: 'judgment', score: 5, order: 5, isOptional: true },
        { questionId: 'q-005', type: 'essay', score: 20, order: 6, isOptional: false },
        { questionId: 'q-011', type: 'combination', score: 50, order: 7, isOptional: false }
      ],
      createTime: '2024-10-10T08:00:00.000Z',
      updateTime: '2024-10-10T08:00:00.000Z',
      creatorId: 'admin',
      creatorName: '系统管理员',
      status: 'active'
    },
    {
      id: 'exam-002',
      name: '2024年财务战略管理模拟测试',
      projectId: 'proj-001',
      subjectId: 's1',
      learningStageId: 'ls-003', // 练习巩固阶段
      totalScore: 80,
      passingScore: 48,
      year: 2024,
      validFrom: '2024-06-01',
      validTo: '2024-12-31',
      questions: [
        { questionId: 'q-001', type: 'single', score: 10, order: 1, isOptional: false },
        { questionId: 'q-002', type: 'multiple', score: 15, order: 2, isOptional: false },
        { questionId: 'q-003', type: 'judgment', score: 10, order: 3, isOptional: false },
        { questionId: 'q-004', type: 'uncertain', score: 15, order: 4, isOptional: false },
        { questionId: 'q-005', type: 'essay', score: 30, order: 5, isOptional: false }
      ],
      createTime: '2024-10-08T14:30:00.000Z',
      updateTime: '2024-10-08T14:30:00.000Z',
      creatorId: 'editor',
      creatorName: '张老师',
      status: 'active'
    },
    {
      id: 'exam-003',
      name: '2023年财务战略管理期末考试',
      projectId: 'proj-001',
      subjectId: 's1',
      learningStageId: 'ls-004', // 复习冲刺阶段
      totalScore: 100,
      passingScore: 60,
      year: 2023,
      validFrom: '2023-01-01',
      validTo: '2023-12-31',
      questions: [
        { questionId: 'q-006', type: 'single', score: 20, order: 1, isOptional: false },
        { questionId: 'q-002', type: 'multiple', score: 20, order: 2, isOptional: false },
        { questionId: 'q-009', type: 'judgment', score: 20, order: 3, isOptional: false },
        { questionId: 'q-010', type: 'essay', score: 40, order: 4, isOptional: false }
      ],
      createTime: '2023-12-15T09:00:00.000Z',
      updateTime: '2023-12-15T09:00:00.000Z',
      creatorId: 'admin',
      creatorName: '系统管理员',
      status: 'disabled'
    },
    {
      id: 'exam-004',
      name: '会计实务基础测试',
      projectId: 'proj-001',
      subjectId: 's2',
      learningStageId: 'ls-005', // 基础学习阶段
      totalScore: 60,
      passingScore: 36,
      year: 2024,
      validFrom: '2024-03-01',
      validTo: '2024-12-31',
      questions: [
        { questionId: 'q-007', type: 'single', score: 15, order: 1, isOptional: false },
        { questionId: 'q-008', type: 'multiple', score: 20, order: 2, isOptional: false },
        { questionId: 'q-007', type: 'single', score: 10, order: 3, isOptional: true },
        { questionId: 'q-008', type: 'multiple', score: 15, order: 4, isOptional: false }
      ],
      createTime: '2024-10-12T10:15:00.000Z',
      updateTime: '2024-10-12T10:15:00.000Z',
      creatorId: 'editor',
      creatorName: '李老师',
      status: 'active'
    }
  ])

  // 当前筛选条件
  const currentFilter = ref<ExamFilter>({})

  // 获取筛选后的试卷列表
  function getFilteredExams(filter: ExamFilter): Exam[] {
    return mockExams.value.filter(exam => {
      if (filter.subjectId && exam.subjectId !== filter.subjectId) return false
      if (filter.status && exam.status !== filter.status) return false
      if (filter.examName && !exam.name.includes(filter.examName)) return false
      if (filter.learningStageId && exam.learningStageId !== filter.learningStageId) return false
      if (filter.startTime) {
        const examTime = new Date(exam.createTime).getTime()
        const startTime = new Date(filter.startTime).getTime()
        if (examTime < startTime) return false
      }
      if (filter.endTime) {
        const examTime = new Date(exam.createTime).getTime()
        const endTime = new Date(filter.endTime).getTime()
        if (examTime > endTime) return false
      }
      return true
    })
  }

  // 分页查询试卷
  function getPaginatedExams(filter: ExamFilter, page: number, pageSize: number): {
    data: Exam[]
    total: number
    currentPage: number
    pageSize: number
    totalPages: number
  } {
    const filteredData = getFilteredExams(filter)
    const total = filteredData.length
    const totalPages = Math.ceil(total / pageSize)
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const data = filteredData.slice(startIndex, endIndex)

    return {
      data,
      total,
      currentPage: page,
      pageSize,
      totalPages
    }
  }

  // 根据ID获取试卷详情
  function getExamById(id: string): Exam | undefined {
    return mockExams.value.find(exam => exam.id === id)
  }

  // 添加试卷
  function addExam(form: ExamForm): void {
    // 计算总分(仅必答题)
    const totalScore = form.questions
      .filter(q => !q.isOptional)
      .reduce((sum, q) => sum + q.score, 0)

    const newExam: Exam = {
      ...form,
      id: `exam-${Date.now()}`,
      totalScore,
      year: form.year || new Date().getFullYear(),
      validFrom: form.validFrom || '',
      validTo: form.validTo || '',
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      creatorId: 'user-001',
      creatorName: '当前用户',
      status: 'active'
    }
    mockExams.value.push(newExam)
  }

  // 更新试卷
  function updateExam(id: string, form: Partial<ExamForm>): void {
    const index = mockExams.value.findIndex(exam => exam.id === id)
    if (index > -1) {
      const updatedExam = {
        ...mockExams.value[index],
        ...form,
        updateTime: new Date().toISOString()
      }

      // 重新计算总分
      if (form.questions) {
        updatedExam.totalScore = form.questions
          .filter(q => !q.isOptional)
          .reduce((sum, q) => sum + q.score, 0)
      }

      mockExams.value[index] = updatedExam
    }
  }

  // 删除试卷
  function deleteExam(id: string): void {
    const index = mockExams.value.findIndex(exam => exam.id === id)
    if (index > -1) {
      mockExams.value.splice(index, 1)
    }
  }

  // 批量删除试卷
  function deleteExamsBatch(ids: string[]): void {
    mockExams.value = mockExams.value.filter(exam => !ids.includes(exam.id))
  }

  // 切换试卷状态
  function toggleExamStatus(id: string): void {
    const exam = mockExams.value.find(e => e.id === id)
    if (exam) {
      exam.status = exam.status === 'active' ? 'disabled' : 'active'
      exam.updateTime = new Date().toISOString()
    }
  }

  // 检查试卷名称唯一性
  function checkExamNameUnique(name: string, subjectId: string, excludeId?: string): boolean {
    return !mockExams.value.some(exam =>
      exam.name === name &&
      exam.subjectId === subjectId &&
      exam.id !== excludeId
    )
  }

  return {
    mockExams,
    currentFilter,
    getFilteredExams,
    getPaginatedExams,
    getExamById,
    addExam,
    updateExam,
    deleteExam,
    deleteExamsBatch,
    toggleExamStatus,
    checkExamNameUnique
  }
})
