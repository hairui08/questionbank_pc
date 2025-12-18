import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useProjectStore } from './project'
import { useChapterStore } from './chapter'
import { useQuestionStore } from './question'
import type { KnowledgePoint, KnowledgePointFormData, ProjectTreeNode, ChapterTreeNode, SectionTreeNode } from '@/views/knowledge-point-management/types'

export const useKnowledgePointStore = defineStore('knowledgePoint', () => {
  const projectStore = useProjectStore()
  const chapterStore = useChapterStore()
  const questionStore = useQuestionStore()

  // Mock数据
  const knowledgePoints = ref<KnowledgePoint[]>([
    // 高级会计师 - 财务战略管理 (s1) - 章节练习 (ch-002)
    // 第一章 财务战略概述 (sec-001)
    {
      id: 'kp-001',
      subjectId: 's1',
      name: '战略定义与特征',
      chapterIds: ['sec-001'],
      difficultyLevel: 3,
      frequencyLevel: 4,
      createTime: '2025-01-10T12:00:00Z',
      creatorId: 'user-001',
      status: 'active'
    },
    {
      id: 'kp-002',
      subjectId: 's1',
      name: '战略类型与选择',
      chapterIds: ['sec-001'],
      difficultyLevel: 4,
      frequencyLevel: 5,
      createTime: '2025-01-10T12:05:00Z',
      creatorId: 'user-001',
      status: 'active'
    },
    {
      id: 'kp-003',
      subjectId: 's1',
      name: '战略实施与控制',
      chapterIds: ['sec-001'],
      difficultyLevel: 5,
      frequencyLevel: 4,
      createTime: '2025-01-10T12:10:00Z',
      creatorId: 'user-001',
      status: 'active'
    },
    
    // 第二章 预算管理 (sec-002)
    {
      id: 'kp-004',
      subjectId: 's1',
      name: '预算编制方法',
      chapterIds: ['sec-002'],
      difficultyLevel: 3,
      frequencyLevel: 5,
      createTime: '2025-01-10T12:15:00Z',
      creatorId: 'user-001',
      status: 'active'
    },
    {
      id: 'kp-005',
      subjectId: 's1',
      name: '预算控制与分析',
      chapterIds: ['sec-002'],
      difficultyLevel: 4,
      frequencyLevel: 4,
      createTime: '2025-01-10T12:20:00Z',
      creatorId: 'user-001',
      status: 'active'
    },
    {
      id: 'kp-006',
      subjectId: 's1',
      name: '预算执行与调整',
      chapterIds: ['sec-002'],
      difficultyLevel: 4,
      frequencyLevel: 3,
      createTime: '2025-01-10T12:25:00Z',
      creatorId: 'user-001',
      status: 'active'
    },
    
    // 第三章 成本分析 (sec-003)
    {
      id: 'kp-007',
      subjectId: 's1',
      name: '成本核算方法',
      chapterIds: ['sec-003'],
      difficultyLevel: 4,
      frequencyLevel: 5,
      createTime: '2025-01-10T12:30:00Z',
      creatorId: 'user-001',
      status: 'active'
    },
    {
      id: 'kp-008',
      subjectId: 's1',
      name: '成本控制技术',
      chapterIds: ['sec-003'],
      difficultyLevel: 5,
      frequencyLevel: 4,
      createTime: '2025-01-10T12:35:00Z',
      creatorId: 'user-001',
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
          name: subject.name,
          chapters: []
        }))
    }))
  })

  /**
   * 项目树数据（包含章节、小节）- 用于知识点管理页面的四级导航
   */
  const projectTreeWithChapters = computed<ProjectTreeNode[]>(() => {
    return projectStore.projects.map(project => ({
      id: project.id,
      name: project.name,
      subjects: projectStore.subjects
        .filter(subject => subject.projectId === project.id)
        .map(subject => {
          // 获取该科目下的章节练习
          const chapterPractice = chapterStore.chapters.find(
            chapter => chapter.subjectId === subject.id && chapter.isChapterPractice === true
          )
          
          // 如果有章节练习，直接展示其下的小节作为章节
          let chapters = []
          if (chapterPractice) {
            chapters = chapterStore.sections
              .filter(section => section.chapterId === chapterPractice.id)
              .map(section => ({
                id: section.id,
                subjectId: subject.id,
                name: section.name,
                sections: chapterStore.subSections
                  .filter(subSection => subSection.sectionId === section.id)
                  .map(subSection => ({
                    id: subSection.id,
                    chapterId: section.id,
                    name: subSection.name
                  }))
              }))
          }
          
          return {
            id: subject.id,
            projectId: subject.projectId,
            projectName: subject.projectName,
            name: subject.name,
            chapters
          }
        })
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
      difficultyLevel: data.difficultyLevel,
      frequencyLevel: data.frequencyLevel,
      createTime: new Date().toISOString(),
      creatorId: 'user-001',
      status: 'active'  // 默认启用
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
      chapterIds: data.chapterIds !== undefined ? data.chapterIds : currentKp.chapterIds,
      difficultyLevel: data.difficultyLevel !== undefined ? data.difficultyLevel : currentKp.difficultyLevel,
      frequencyLevel: data.frequencyLevel !== undefined ? data.frequencyLevel : currentKp.frequencyLevel
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
   * 软删除知识点（不从数据中移除，仅标记为已删除）
   */
  const deleteKnowledgePointSoft = (id: string, reason?: string): boolean => {
    const kp = knowledgePoints.value.find(k => k.id === id)
    if (kp) {
      kp.status = 'deleted'
      kp.deprecatedReason = reason
      kp.deprecatedDate = new Date().toISOString()
      return true
    }
    return false
  }

  /**
   * 标记知识点为过时
   */
  const deprecateKnowledgePoint = (id: string, reason: string, replacedBy?: string): boolean => {
    const kp = knowledgePoints.value.find(k => k.id === id)
    if (kp) {
      kp.status = 'deprecated'
      kp.deprecatedReason = reason
      kp.deprecatedDate = new Date().toISOString()
      if (replacedBy) {
        kp.replacedBy = replacedBy
      }
      return true
    }
    return false
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

  /**
   * 批量切换知识点状态
   */
  const batchToggleStatus = (ids: string[], targetStatus: 'active' | 'disabled'): void => {
    ids.forEach(id => {
      const kp = knowledgePoints.value.find(k => k.id === id)
      if (kp) {
        kp.status = targetStatus
      }
    })
  }

  /**
   * 批量删除知识点
   */
  const batchDelete = (ids: string[]): void => {
    // 1. 批量删除知识点
    knowledgePoints.value = knowledgePoints.value.filter(kp => !ids.includes(kp.id))

    // 2. 一次性清理所有试题关联
    questionStore.mockQuestions.forEach(question => {
      if (question.knowledgePointIds) {
        question.knowledgePointIds = question.knowledgePointIds.filter(
          kpId => !ids.includes(kpId)
        )
      }
    })
  }

  return {
    knowledgePoints,
    projectTree,
    projectTreeWithChapters,
    getKnowledgePointsBySubject,
    getKnowledgePointById,
    getQuestionCountByKnowledgePoint,
    getQuestionsByKnowledgePoint,
    getPaginatedQuestionsByKnowledgePoint,
    addKnowledgePoint,
    updateKnowledgePoint,
    deleteKnowledgePoint,
    toggleKnowledgePointStatus,
    deleteKnowledgePointSoft,
    deprecateKnowledgePoint,
    batchToggleStatus,
    batchDelete,
    getChapterNamesByIds,
    getChapterDetailsByIds,
    getChapterNamesOnly,
    getAllSectionNames,
    linkQuestionToKnowledgePoint,
    unlinkQuestionFromKnowledgePoint,
    getAvailableQuestionsForKnowledgePoint
  }
})
