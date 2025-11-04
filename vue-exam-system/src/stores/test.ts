import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Test, TestForm, TestFilter, ReviewStatus } from '@/views/test-management/types'

export const useTestStore = defineStore('test', () => {
  // 状态
  const tests = ref<Test[]>([
    {
      id: 'test-001',
      name: '2025年财务战略管理期末考试',
      examType: 'formal',
      totalScore: 100,
      passingScore: 60,
      duration: 120,
      startTime: '2025-01-15 09:00',
      endTime: '2025-01-15 11:00',
      subjectId: 's1',
      projectId: 'p1',
      examPaperId: 'exam-001',
      showAnswer: false,
      showExplanation: false,
      showScore: true,
      attemptLimit: 1,
      status: 'approved',
      createTime: '2025-01-10 10:30:00',
      creatorId: 'u1',
      creatorName: '张老师',
      reviewerId: 'u2',
      reviewerName: '李主任',
      reviewTime: '2025-01-11 14:20:00'
    },
    {
      id: 'test-002',
      name: '财务战略管理模拟考试(第一次)',
      examType: 'mock',
      totalScore: 100,
      passingScore: 60,
      duration: 90,
      startTime: '2025-01-20 14:00',
      endTime: '2025-01-20 15:30',
      subjectId: 's1',
      projectId: 'p1',
      examPaperId: 'exam-002',
      showAnswer: true,
      showExplanation: true,
      showScore: true,
      attemptLimit: 3,
      status: 'pending',
      createTime: '2025-01-12 09:15:00',
      creatorId: 'u1',
      creatorName: '张老师'
    },
    {
      id: 'test-003',
      name: '财务战略管理随堂测验-第三章',
      examType: 'quiz',
      totalScore: 50,
      passingScore: 30,
      duration: 30,
      startTime: '2025-01-18 10:00',
      endTime: '2025-01-18 10:30',
      subjectId: 's1',
      projectId: 'p1',
      examPaperId: 'exam-003',
      showAnswer: true,
      showExplanation: true,
      showScore: true,
      attemptLimit: 0,
      status: 'rejected',
      createTime: '2025-01-11 16:40:00',
      creatorId: 'u3',
      creatorName: '王助教',
      reviewerId: 'u2',
      reviewerName: '李主任',
      reviewTime: '2025-01-12 10:10:00',
      rejectReason: '考试时长过短,建议调整为45分钟'
    },
    {
      id: 'test-004',
      name: '高级财务管理综合测试',
      examType: 'practice',
      totalScore: 150,
      passingScore: 90,
      duration: 150,
      startTime: '2025-01-25 09:00',
      endTime: '2025-01-25 11:30',
      subjectId: 's2',
      projectId: 'p1',
      examPaperId: 'exam-004',
      showAnswer: true,
      showExplanation: true,
      showScore: false,
      attemptLimit: 5,
      status: 'approved',
      createTime: '2025-01-13 11:20:00',
      creatorId: 'u1',
      creatorName: '张老师',
      reviewerId: 'u2',
      reviewerName: '李主任',
      reviewTime: '2025-01-14 09:00:00'
    },
    {
      id: 'test-005',
      name: '财务战略管理VIP专享模拟考',
      examType: 'mock',
      totalScore: 100,
      passingScore: 70,
      duration: 120,
      startTime: '2025-02-01 14:00',
      endTime: '2025-02-01 16:00',
      subjectId: 's1',
      projectId: 'p1',
      examPaperId: 'exam-005',
      showAnswer: true,
      showExplanation: true,
      showScore: true,
      attemptLimit: 0,
      status: 'pending',
      createTime: '2025-01-14 15:30:00',
      creatorId: 'u4',
      creatorName: '赵老师'
    },
    {
      id: 'test-006',
      name: '管理会计期末考试',
      examType: 'formal',
      totalScore: 100,
      passingScore: 60,
      duration: 120,
      startTime: '2025-01-22 09:00',
      endTime: '2025-01-22 11:00',
      subjectId: 's2',
      projectId: 'p1',
      examPaperId: 'exam-006',
      showAnswer: false,
      showExplanation: false,
      showScore: true,
      attemptLimit: 1,
      status: 'approved',
      createTime: '2025-01-09 10:00:00',
      creatorId: 'u1',
      creatorName: '张老师',
      reviewerId: 'u2',
      reviewerName: '李主任',
      reviewTime: '2025-01-10 16:00:00'
    },
    {
      id: 'test-007',
      name: '会计基础知识随堂小测',
      examType: 'quiz',
      totalScore: 30,
      passingScore: 18,
      duration: 20,
      startTime: '2025-01-17 15:00',
      endTime: '2025-01-17 15:20',
      subjectId: 's3',
      projectId: 'p2',
      examPaperId: 'exam-007',
      showAnswer: true,
      showExplanation: false,
      showScore: true,
      attemptLimit: 2,
      status: 'pending',
      createTime: '2025-01-15 09:30:00',
      creatorId: 'u5',
      creatorName: '刘老师'
    }
  ])

  // Getters
  const getTestById = computed(() => (id: string) => {
    return tests.value.find(t => t.id === id)
  })

  // 筛选和分页
  const getPaginatedTests = computed(() => (
    filter: TestFilter,
    page: number,
    pageSize: number
  ) => {
    // 筛选
    let filtered = tests.value

    if (filter.projectId) {
      filtered = filtered.filter(t => t.projectId === filter.projectId)
    }

    if (filter.subjectId) {
      filtered = filtered.filter(t => t.subjectId === filter.subjectId)
    }

    if (filter.status) {
      filtered = filtered.filter(t => t.status === filter.status)
    }

    if (filter.examType) {
      filtered = filtered.filter(t => t.examType === filter.examType)
    }

    if (filter.testName) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(filter.testName!.toLowerCase())
      )
    }

    // 按创建时间倒序
    filtered.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())

    // 分页
    const total = filtered.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const data = filtered.slice(start, start + pageSize)

    return {
      data,
      total,
      currentPage: page,
      totalPages,
      pageSize
    }
  })

  // Actions
  /** 添加考试 */
  function addTest(form: TestForm) {
    // 检查名称唯一性
    if (!isTestNameUnique(form.name, form.subjectId)) {
      throw new Error('该考试名称已存在')
    }

    const newTest: Test = {
      ...form,
      id: `test-${Date.now()}`,
      showAnswer: form.showAnswer !== undefined ? form.showAnswer : true,
      showExplanation: form.showExplanation !== undefined ? form.showExplanation : true,
      showScore: form.showScore !== undefined ? form.showScore : true,
      attemptLimit: form.attemptLimit || 0,
      status: 'pending', // 默认待审核
      createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      creatorId: 'u-current',
      creatorName: '当前用户'
    }

    tests.value.push(newTest)
  }

  /** 更新考试 */
  function updateTest(id: string, form: TestForm) {
    const test = tests.value.find(t => t.id === id)
    if (!test) {
      throw new Error('考试不存在')
    }

    // 检查名称唯一性(排除自己)
    if (!isTestNameUnique(form.name, form.subjectId, id)) {
      throw new Error('该考试名称已存在')
    }

    Object.assign(test, form)
  }

  /** 删除考试 */
  function deleteTest(id: string) {
    const test = tests.value.find(t => t.id === id)
    if (!test) {
      throw new Error('考试不存在')
    }

    // 已审核的不能删除
    if (test.status === 'approved') {
      throw new Error('已审核的考试不能删除')
    }

    const index = tests.value.findIndex(t => t.id === id)
    tests.value.splice(index, 1)
  }

  /** 批量删除考试 */
  function deleteTestsBatch(ids: string[]) {
    const approvedTests = ids.filter(id => {
      const test = tests.value.find(t => t.id === id)
      return test?.status === 'approved'
    })

    if (approvedTests.length > 0) {
      throw new Error('选中的考试中包含已审核的考试,无法删除')
    }

    tests.value = tests.value.filter(t => !ids.includes(t.id))
  }

  /** 审核通过 */
  function approveTest(id: string) {
    const test = tests.value.find(t => t.id === id)
    if (!test) {
      throw new Error('考试不存在')
    }

    test.status = 'approved'
    test.reviewerId = 'u-reviewer'
    test.reviewerName = '审核员'
    test.reviewTime = new Date().toISOString().replace('T', ' ').slice(0, 19)
    test.rejectReason = undefined
  }

  /** 驳回 */
  function rejectTest(id: string, reason: string) {
    const test = tests.value.find(t => t.id === id)
    if (!test) {
      throw new Error('考试不存在')
    }

    test.status = 'rejected'
    test.reviewerId = 'u-reviewer'
    test.reviewerName = '审核员'
    test.reviewTime = new Date().toISOString().replace('T', ' ').slice(0, 19)
    test.rejectReason = reason
  }

  /** 重新提交(已驳回 → 待审核) */
  function resubmitTest(id: string) {
    const test = tests.value.find(t => t.id === id)
    if (!test) {
      throw new Error('考试不存在')
    }

    if (test.status !== 'rejected') {
      throw new Error('只有已驳回的考试可以重新提交')
    }

    test.status = 'pending'
    test.reviewerId = undefined
    test.reviewerName = undefined
    test.reviewTime = undefined
    test.rejectReason = undefined
  }

  /** 检查考试名称唯一性 */
  function isTestNameUnique(name: string, subjectId: string, excludeId?: string): boolean {
    return !tests.value.some(t =>
      t.name === name &&
      t.subjectId === subjectId &&
      t.id !== excludeId
    )
  }

  return {
    tests,
    getTestById,
    getPaginatedTests,
    addTest,
    updateTest,
    deleteTest,
    deleteTestsBatch,
    approveTest,
    rejectTest,
    resubmitTest,
    isTestNameUnique
  }
})
