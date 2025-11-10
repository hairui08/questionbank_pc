import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useProjectStore } from './project'
import { useChapterStore } from './chapter'
import { useQuestionStore } from './question'
import type { KnowledgePoint, KnowledgePointFormData, ProjectTreeNode } from '@/views/knowledge-point-management/types'

export const useKnowledgePointStore = defineStore('knowledgePoint', () => {
  const projectStore = useProjectStore()
  const chapterStore = useChapterStore()
  const questionStore = useQuestionStore()

  // Mock数据
  const knowledgePoints = ref<KnowledgePoint[]>([
    // 财务战略管理 (s1) - 8个知识点
    {
      id: 'kp-001',
      subjectId: 's1',
      name: '会计核算基本前提',
      chapterIds: ['ch-001'],
      createTime: '2024-10-01T10:00:00.000Z',
      creatorId: 'admin',
      status: 'active'
    },
    {
      id: 'kp-002',
      subjectId: 's1',
      name: '财务报表分析方法',
      chapterIds: ['ch-002', 'ch-003'],
      createTime: '2024-10-02T10:00:00.000Z',
      creatorId: 'admin',
      status: 'active'
    },
    {
      id: 'kp-003',
      subjectId: 's1',
      name: '现金流量管理',
      chapterIds: ['ch-002'],
      createTime: '2024-10-03T10:00:00.000Z',
      creatorId: 'editor',
      status: 'active'
    },
    {
      id: 'kp-006',
      subjectId: 's1',
      name: '投资决策分析',
      chapterIds: ['ch-001'],
      createTime: '2024-10-06T10:00:00.000Z',
      creatorId: 'admin',
      status: 'active'
    },
    {
      id: 'kp-007',
      subjectId: 's1',
      name: '资本结构优化',
      chapterIds: ['ch-002'],
      createTime: '2024-10-07T10:00:00.000Z',
      creatorId: 'admin',
      status: 'active'
    },
    {
      id: 'kp-008',
      subjectId: 's1',
      name: '风险管理策略',
      chapterIds: ['ch-003'],
      createTime: '2024-10-08T10:00:00.000Z',
      creatorId: 'editor',
      status: 'active'
    },
    {
      id: 'kp-009',
      subjectId: 's1',
      name: '绩效评价体系',
      chapterIds: ['ch-001', 'ch-002'],
      createTime: '2024-10-09T10:00:00.000Z',
      creatorId: 'admin',
      status: 'active'
    },
    {
      id: 'kp-010',
      subjectId: 's1',
      name: '企业并购重组',
      chapterIds: ['ch-003'],
      createTime: '2024-10-10T10:00:00.000Z',
      creatorId: 'editor',
      status: 'active'
    },

    // 税务风险控制 (s2) - 7个知识点
    {
      id: 'kp-004',
      subjectId: 's2',
      name: '税务风险识别',
      chapterIds: ['ch-004'],
      createTime: '2024-10-04T10:00:00.000Z',
      creatorId: 'admin',
      status: 'active'
    },
    {
      id: 'kp-005',
      subjectId: 's2',
      name: '税收优惠政策',
      chapterIds: [],
      createTime: '2024-10-05T10:00:00.000Z',
      creatorId: 'editor',
      status: 'active'
    },
    {
      id: 'kp-011',
      subjectId: 's2',
      name: '增值税管理',
      chapterIds: ['ch-004'],
      createTime: '2024-10-11T10:00:00.000Z',
      creatorId: 'admin',
      status: 'active'
    },
    {
      id: 'kp-012',
      subjectId: 's2',
      name: '所得税管理',
      chapterIds: ['ch-005'],
      createTime: '2024-10-12T10:00:00.000Z',
      creatorId: 'admin',
      status: 'active'
    },
    {
      id: 'kp-013',
      subjectId: 's2',
      name: '税务稽查应对',
      chapterIds: ['ch-005'],
      createTime: '2024-10-13T10:00:00.000Z',
      creatorId: 'editor',
      status: 'active'
    },
    {
      id: 'kp-014',
      subjectId: 's2',
      name: '国际税收',
      chapterIds: ['ch-006'],
      createTime: '2024-10-14T10:00:00.000Z',
      creatorId: 'admin',
      status: 'active'
    },
    {
      id: 'kp-015',
      subjectId: 's2',
      name: '税务内控体系',
      chapterIds: ['ch-006'],
      createTime: '2024-10-15T10:00:00.000Z',
      creatorId: 'editor',
      status: 'active'
    }
  ])

  /**
   * 项目树数据 - 与其他 store 保持一致
   */
  const projectTree = computed<ProjectTreeNode[]>(() => {
    return projectStore.projects.map(project => ({
      id: project.id,
      name: project.name,
      subjects: projectStore.subjects
        .filter(subject => subject.projectId === project.id)
        .map(subject => ({
          id: subject.id,
          projectId: subject.projectId,
          projectName: subject.projectName,
          name: subject.name
        }))
    }))
  })

  /**
   * 根据科目ID获取知识点列表
   */
  const getKnowledgePointsBySubject = (subjectId: string) => {
    return computed(() =>
      knowledgePoints.value
        .filter(kp => kp.subjectId === subjectId)
        .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
    )
  }

  /**
   * 根据ID获取知识点详情
   */
  const getKnowledgePointById = (id: string): KnowledgePoint | undefined => {
    return knowledgePoints.value.find(kp => kp.id === id)
  }

  /**
   * 统计知识点关联的试题数量
   */
  const getQuestionCountByKnowledgePoint = (knowledgePointId: string): number => {
    return questionStore.mockQuestions.filter(q => q.knowledgePointIds?.includes(knowledgePointId)).length
  }

  /**
   * 获取知识点关联的试题列表
   */
  const getQuestionsByKnowledgePoint = (knowledgePointId: string) => {
    return questionStore.mockQuestions.filter(q => q.knowledgePointIds?.includes(knowledgePointId))
  }

  /**
   * 分页获取知识点关联的试题列表
   */
  const getPaginatedQuestionsByKnowledgePoint = (
    knowledgePointId: string,
    page: number = 1,
    pageSize: number = 10
  ) => {
    const allQuestions = getQuestionsByKnowledgePoint(knowledgePointId)
    const total = allQuestions.length
    const totalPages = Math.ceil(total / pageSize)
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const list = allQuestions.slice(startIndex, endIndex)

    return {
      list,
      total,
      totalPages,
      currentPage: page,
      pageSize
    }
  }

  /**
   * 添加知识点
   */
  const addKnowledgePoint = (data: KnowledgePointFormData): void => {
    // 唯一性校验: 同科目下知识点名称不能重复(大小写不敏感)
    const exists = knowledgePoints.value.some(
      kp =>
        kp.subjectId === data.subjectId &&
        kp.name.toLowerCase().trim() === data.name.toLowerCase().trim()
    )

    if (exists) {
      throw new Error('该科目下已存在相同的知识点名称')
    }

    // 添加新知识点
    const newKnowledgePoint: KnowledgePoint = {
      id: `kp-${Date.now()}`,
      subjectId: data.subjectId,
      name: data.name.trim(),
      chapterIds: data.chapterIds || [],
      createTime: new Date().toISOString(),
      creatorId: 'user-001',
      status: 'active'
    }

    knowledgePoints.value.push(newKnowledgePoint)
  }

  /**
   * 更新知识点
   */
  const updateKnowledgePoint = (id: string, data: Partial<KnowledgePointFormData>): void => {
    const index = knowledgePoints.value.findIndex(kp => kp.id === id)
    if (index === -1) {
      throw new Error('知识点不存在')
    }

    const currentKp = knowledgePoints.value[index]

    // 如果更新了名称,需要检查唯一性
    if (data.name && data.name.trim() !== currentKp.name) {
      const exists = knowledgePoints.value.some(
        kp =>
          kp.id !== id &&
          kp.subjectId === currentKp.subjectId &&
          kp.name.toLowerCase().trim() === data.name!.toLowerCase().trim()
      )

      if (exists) {
        throw new Error('该科目下已存在相同的知识点名称')
      }
    }

    // 更新知识点
    knowledgePoints.value[index] = {
      ...currentKp,
      name: data.name ? data.name.trim() : currentKp.name,
      chapterIds: data.chapterIds !== undefined ? data.chapterIds : currentKp.chapterIds
    }
  }

  /**
   * 删除知识点
   */
  const deleteKnowledgePoint = (id: string): void => {
    const index = knowledgePoints.value.findIndex(kp => kp.id === id)
    if (index === -1) {
      throw new Error('知识点不存在')
    }

    // 删除知识点
    knowledgePoints.value.splice(index, 1)

    // 清除所有关联该知识点的试题数组中的该知识点
    questionStore.mockQuestions.forEach(question => {
      if (question.knowledgePointIds?.includes(id)) {
        question.knowledgePointIds = question.knowledgePointIds.filter(kpId => kpId !== id)
      }
    })
  }

  /**
   * 切换知识点状态
   */
  const toggleKnowledgePointStatus = (id: string): void => {
    const index = knowledgePoints.value.findIndex(kp => kp.id === id)
    if (index === -1) {
      throw new Error('知识点不存在')
    }

    const currentStatus = knowledgePoints.value[index].status
    knowledgePoints.value[index].status = currentStatus === 'active' ? 'disabled' : 'active'
  }

  /**
   * 获取章节详细信息列表（包含节数量和完整信息）
   */
  const getChapterDetailsById = (chapterId: string) => {
    const chapter = chapterStore.chapters.find(c => c.id === chapterId)
    if (!chapter) return null

    const sections = chapterStore.getSectionsByChapter(chapterId).value
    const sectionCount = sections.length

    // 生成显示文本：章名称(节数量)
    const displayText = sectionCount > 0
      ? `${chapter.name}(${sectionCount}节)`
      : chapter.name

    // 截断到5个字符
    const truncatedText = displayText.length > 5
      ? displayText.substring(0, 5) + '...'
      : displayText

    // 生成悬停提示文本：章名称 + 所有小节列表
    let tooltipText = chapter.name
    if (sectionCount > 0) {
      tooltipText += '\n' + sections.map(s => `└─ ${s.name}`).join('\n')
    }

    return {
      chapterId: chapter.id,
      chapterName: chapter.name,
      sectionCount,
      displayText: truncatedText,
      fullText: displayText,
      tooltipText,
      sections
    }
  }

  /**
   * 获取章节名称列表
   */
  const getChapterNamesByIds = (chapterIds: string[]): string[] => {
    if (!chapterIds || chapterIds.length === 0) return []

    return chapterIds
      .map(id => {
        const chapter = chapterStore.chapters.find(c => c.id === id)
        return chapter ? chapter.name : ''
      })
      .filter(name => name !== '')
  }

  /**
   * 获取章节详细信息列表
   */
  const getChapterDetailsByIds = (chapterIds: string[]) => {
    if (!chapterIds || chapterIds.length === 0) return []

    return chapterIds
      .map(id => getChapterDetailsById(id))
      .filter(detail => detail !== null) as ReturnType<typeof getChapterDetailsById>[]
  }

  /**
   * 获取纯章节名称列表（用于"章"列）
   */
  const getChapterNamesOnly = (chapterIds: string[]): string[] => {
    if (!chapterIds || chapterIds.length === 0) return []

    return chapterIds
      .map(id => {
        const chapter = chapterStore.chapters.find(c => c.id === id)
        return chapter ? chapter.name : ''
      })
      .filter(name => name !== '')
  }

  /**
   * 获取所有小节名称列表（用于"节"列）
   */
  const getAllSectionNames = (chapterIds: string[]): string[] => {
    if (!chapterIds || chapterIds.length === 0) return []

    const allSections: string[] = []
    chapterIds.forEach(chapterId => {
      const sections = chapterStore.getSectionsByChapter(chapterId).value
      sections.forEach(section => allSections.push(section.name))
    })
    return allSections
  }

  /**
   * 关联试题到知识点
   */
  const linkQuestionToKnowledgePoint = (questionId: string, knowledgePointId: string): void => {
    const question = questionStore.mockQuestions.find(q => q.id === questionId)
    if (!question) {
      throw new Error('试题不存在')
    }

    // 初始化知识点ID数组
    if (!question.knowledgePointIds) {
      question.knowledgePointIds = []
    }

    // 添加知识点ID(避免重复)
    if (!question.knowledgePointIds.includes(knowledgePointId)) {
      question.knowledgePointIds.push(knowledgePointId)
    }
  }

  /**
   * 取消试题与知识点的关联
   */
  const unlinkQuestionFromKnowledgePoint = (questionId: string, knowledgePointId: string): void => {
    const question = questionStore.mockQuestions.find(q => q.id === questionId)
    if (!question) {
      throw new Error('试题不存在')
    }

    // 从知识点ID数组中移除指定知识点
    if (question.knowledgePointIds) {
      question.knowledgePointIds = question.knowledgePointIds.filter(kpId => kpId !== knowledgePointId)
    }
  }

  /**
   * 获取同科目下未关联当前知识点的试题列表
   */
  const getAvailableQuestionsForKnowledgePoint = (knowledgePointId: string) => {
    const kp = getKnowledgePointById(knowledgePointId)
    if (!kp) return []

    // 获取同科目下的所有试题,排除已关联当前知识点的
    return questionStore.mockQuestions.filter(q =>
      q.subjectId === kp.subjectId && !q.knowledgePointIds?.includes(knowledgePointId)
    )
  }

  return {
    knowledgePoints,
    projectTree,
    getKnowledgePointsBySubject,
    getKnowledgePointById,
    getQuestionCountByKnowledgePoint,
    getQuestionsByKnowledgePoint,
    getPaginatedQuestionsByKnowledgePoint,
    addKnowledgePoint,
    updateKnowledgePoint,
    deleteKnowledgePoint,
    toggleKnowledgePointStatus,
    getChapterNamesByIds,
    getChapterDetailsByIds,
    getChapterNamesOnly,
    getAllSectionNames,
    linkQuestionToKnowledgePoint,
    unlinkQuestionFromKnowledgePoint,
    getAvailableQuestionsForKnowledgePoint
  }
})
