import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type {
  Chapter,
  Section,
  ChapterFormData,
  SectionFormData,
  ProjectTreeNode,
  Status
} from '@/views/chapter-management/types'

export const useChapterStore = defineStore('chapter', () => {
  // Mock数据：章节列表（与projectStore中的科目ID对应）
  const chapters = ref<Chapter[]>([
    // 高级会计师 - 财务战略管理 (s1)
    {
      id: 'ch-001',
      subjectId: 's1',
      subjectName: '财务战略管理',
      name: '第一章 财务战略概述',
      status: 'active',
      order: 1,
      createdAt: '2025-01-10T10:00:00Z'
    },
    {
      id: 'ch-002',
      subjectId: 's1',
      subjectName: '财务战略管理',
      name: '第二章 预算管理',
      status: 'active',
      order: 2,
      createdAt: '2025-01-10T10:05:00Z'
    },
    {
      id: 'ch-003',
      subjectId: 's1',
      subjectName: '财务战略管理',
      name: '第三章 成本分析',
      status: 'active',
      order: 3,
      createdAt: '2025-01-10T10:10:00Z'
    },
    // 高级会计师 - 税务风险控制 (s2)
    {
      id: 'ch-004',
      subjectId: 's2',
      subjectName: '税务风险控制',
      name: '第一章 税务风险概述',
      status: 'active',
      order: 1,
      createdAt: '2025-01-10T10:15:00Z'
    },
    {
      id: 'ch-005',
      subjectId: 's2',
      subjectName: '税务风险控制',
      name: '第二章 税务筹划',
      status: 'active',
      order: 2,
      createdAt: '2025-01-10T10:20:00Z'
    },
    // 高级经济师 - 宏观经济分析 (s4)
    {
      id: 'ch-006',
      subjectId: 's4',
      subjectName: '宏观经济分析',
      name: '第一章 宏观经济指标',
      status: 'active',
      order: 1,
      createdAt: '2025-01-10T10:25:00Z'
    },
    {
      id: 'ch-007',
      subjectId: 's4',
      subjectName: '宏观经济分析',
      name: '第二章 货币政策',
      status: 'active',
      order: 2,
      createdAt: '2025-01-10T10:30:00Z'
    },
    // 中级会计师 - 成本管理实务 (s8)
    {
      id: 'ch-008',
      subjectId: 's8',
      subjectName: '成本管理实务',
      name: '第一章 成本核算',
      status: 'active',
      order: 1,
      createdAt: '2025-01-10T10:35:00Z'
    },
    {
      id: 'ch-009',
      subjectId: 's8',
      subjectName: '成本管理实务',
      name: '第二章 成本控制',
      status: 'active',
      order: 2,
      createdAt: '2025-01-10T10:40:00Z'
    }
  ])

  // Mock数据：小节列表（与章节ID对应）
  const sections = ref<Section[]>([
    // 财务战略管理 - 第一章 财务战略概述
    {
      id: 'sec-001',
      chapterId: 'ch-001',
      chapterName: '第一章 财务战略概述',
      name: '第一节 战略定义',
      status: 'active',
      order: 1,
      createdAt: '2025-01-10T11:00:00Z'
    },
    {
      id: 'sec-002',
      chapterId: 'ch-001',
      chapterName: '第一章 财务战略概述',
      name: '第二节 战略类型',
      status: 'active',
      order: 2,
      createdAt: '2025-01-10T11:05:00Z'
    },
    {
      id: 'sec-003',
      chapterId: 'ch-001',
      chapterName: '第一章 财务战略概述',
      name: '第三节 战略实施',
      status: 'active',
      order: 3,
      createdAt: '2025-01-10T11:07:00Z'
    },
    // 财务战略管理 - 第二章 预算管理
    {
      id: 'sec-004',
      chapterId: 'ch-002',
      chapterName: '第二章 预算管理',
      name: '第一节 预算编制',
      status: 'active',
      order: 1,
      createdAt: '2025-01-10T11:10:00Z'
    },
    {
      id: 'sec-005',
      chapterId: 'ch-002',
      chapterName: '第二章 预算管理',
      name: '第二节 预算控制',
      status: 'active',
      order: 2,
      createdAt: '2025-01-10T11:15:00Z'
    },
    {
      id: 'sec-006',
      chapterId: 'ch-002',
      chapterName: '第二章 预算管理',
      name: '第三节 预算分析',
      status: 'active',
      order: 3,
      createdAt: '2025-01-10T11:20:00Z'
    },
    // 财务战略管理 - 第三章 成本分析
    {
      id: 'sec-007',
      chapterId: 'ch-003',
      chapterName: '第三章 成本分析',
      name: '第一节 成本核算方法',
      status: 'active',
      order: 1,
      createdAt: '2025-01-10T11:25:00Z'
    },
    {
      id: 'sec-008',
      chapterId: 'ch-003',
      chapterName: '第三章 成本分析',
      name: '第二节 成本控制技术',
      status: 'active',
      order: 2,
      createdAt: '2025-01-10T11:30:00Z'
    },
    // 税务风险控制 - 第一章 税务风险概述
    {
      id: 'sec-009',
      chapterId: 'ch-004',
      chapterName: '第一章 税务风险概述',
      name: '第一节 税务风险识别',
      status: 'active',
      order: 1,
      createdAt: '2025-01-10T11:35:00Z'
    },
    {
      id: 'sec-010',
      chapterId: 'ch-004',
      chapterName: '第一章 税务风险概述',
      name: '第二节 税务风险评估',
      status: 'active',
      order: 2,
      createdAt: '2025-01-10T11:40:00Z'
    }
  ])

  // Mock数据：项目和科目树结构（用于左侧导航，与projectStore数据同步）
  const projectTree = ref<ProjectTreeNode[]>([
    {
      id: 'p1',
      name: '高级会计师',
      subjects: [
        { id: 's1', projectId: 'p1', name: '财务战略管理' },
        { id: 's2', projectId: 'p1', name: '税务风险控制' },
        { id: 's3', projectId: 'p1', name: '内部控制优化' }
      ]
    },
    {
      id: 'p2',
      name: '高级经济师',
      subjects: [
        { id: 's4', projectId: 'p2', name: '宏观经济分析' },
        { id: 's5', projectId: 'p2', name: '产业经济研究' }
      ]
    },
    {
      id: 'p3',
      name: '中级经济师',
      subjects: [
        { id: 's6', projectId: 'p3', name: '市场经济基础' },
        { id: 's7', projectId: 'p3', name: '项目可行性评估' }
      ]
    },
    {
      id: 'p4',
      name: '中级会计师',
      subjects: [
        { id: 's8', projectId: 'p4', name: '成本管理实务' },
        { id: 's9', projectId: 'p4', name: '财务报表编制' },
        { id: 's10', projectId: 'p4', name: '审计与合规' }
      ]
    }
  ])

  /**
   * 获取指定科目的章节列表
   */
  const getChaptersBySubject = (subjectId: string) => {
    return computed(() =>
      chapters.value.filter((ch) => ch.subjectId === subjectId).sort((a, b) => a.order - b.order)
    )
  }

  /**
   * 获取指定章节的小节列表
   */
  const getSectionsByChapter = (chapterId: string) => {
    return computed(() =>
      sections.value.filter((sec) => sec.chapterId === chapterId).sort((a, b) => a.order - b.order)
    )
  }

  /**
   * 添加章节
   */
  const addChapter = (chapterData: ChapterFormData): boolean => {
    // 唯一性校验：同一科目下章节名称不能重复
    const isDuplicate = chapters.value.some(
      (ch) => ch.subjectId === chapterData.subjectId && ch.name === chapterData.name
    )

    if (isDuplicate) {
      throw new Error('该科目下已存在同名章节')
    }

    const newChapter: Chapter = {
      id: `ch-${Date.now()}`,
      subjectId: chapterData.subjectId,
      subjectName: chapterData.subjectName,
      name: chapterData.name,
      status: chapterData.status,
      order: chapterData.order,
      createdAt: new Date().toISOString()
    }

    chapters.value.push(newChapter)
    return true
  }

  /**
   * 编辑章节
   */
  const updateChapter = (chapterId: string, updates: Partial<ChapterFormData>): boolean => {
    const chapter = chapters.value.find((ch) => ch.id === chapterId)
    if (!chapter) {
      throw new Error('章节不存在')
    }

    // 如果修改了名称，需要校验唯一性
    if (updates.name && updates.name !== chapter.name) {
      const isDuplicate = chapters.value.some(
        (ch) => ch.id !== chapterId && ch.subjectId === chapter.subjectId && ch.name === updates.name
      )

      if (isDuplicate) {
        throw new Error('该科目下已存在同名章节')
      }
    }

    Object.assign(chapter, updates, { updatedAt: new Date().toISOString() })
    return true
  }

  /**
   * 删除章节（需检查是否有小节）
   */
  const deleteChapter = (chapterId: string): boolean => {
    const chapter = chapters.value.find((ch) => ch.id === chapterId)
    if (!chapter) {
      throw new Error('章节不存在')
    }

    // 检查是否有小节
    const sectionCount = sections.value.filter((sec) => sec.chapterId === chapterId).length
    if (sectionCount > 0) {
      throw new Error(`该章节下存在${sectionCount}个小节，请先删除小节`)
    }

    const index = chapters.value.findIndex((ch) => ch.id === chapterId)
    chapters.value.splice(index, 1)
    return true
  }

  /**
   * 切换章节状态
   */
  const toggleChapterStatus = (chapterId: string): boolean => {
    const chapter = chapters.value.find((ch) => ch.id === chapterId)
    if (!chapter) {
      throw new Error('章节不存在')
    }

    chapter.status = chapter.status === 'active' ? 'disabled' : 'active'
    chapter.updatedAt = new Date().toISOString()
    return true
  }

  /**
   * 添加小节
   */
  const addSection = (sectionData: SectionFormData): boolean => {
    // 唯一性校验：同一章节下小节名称不能重复
    const isDuplicate = sections.value.some(
      (sec) => sec.chapterId === sectionData.chapterId && sec.name === sectionData.name
    )

    if (isDuplicate) {
      throw new Error('该章节下已存在同名小节')
    }

    const newSection: Section = {
      id: `sec-${Date.now()}`,
      chapterId: sectionData.chapterId,
      chapterName: sectionData.chapterName,
      name: sectionData.name,
      status: sectionData.status,
      order: sectionData.order,
      createdAt: new Date().toISOString()
    }

    sections.value.push(newSection)
    return true
  }

  /**
   * 编辑小节
   */
  const updateSection = (sectionId: string, updates: Partial<SectionFormData>): boolean => {
    const section = sections.value.find((sec) => sec.id === sectionId)
    if (!section) {
      throw new Error('小节不存在')
    }

    // 如果修改了名称，需要校验唯一性
    if (updates.name && updates.name !== section.name) {
      const isDuplicate = sections.value.some(
        (sec) =>
          sec.id !== sectionId && sec.chapterId === section.chapterId && sec.name === updates.name
      )

      if (isDuplicate) {
        throw new Error('该章节下已存在同名小节')
      }
    }

    Object.assign(section, updates, { updatedAt: new Date().toISOString() })
    return true
  }

  /**
   * 删除小节
   */
  const deleteSection = (sectionId: string): boolean => {
    const index = sections.value.findIndex((sec) => sec.id === sectionId)
    if (index === -1) {
      throw new Error('小节不存在')
    }

    sections.value.splice(index, 1)
    return true
  }

  /**
   * 切换小节状态
   */
  const toggleSectionStatus = (sectionId: string): boolean => {
    const section = sections.value.find((sec) => sec.id === sectionId)
    if (!section) {
      throw new Error('小节不存在')
    }

    section.status = section.status === 'active' ? 'disabled' : 'active'
    section.updatedAt = new Date().toISOString()
    return true
  }

  return {
    chapters,
    sections,
    projectTree,
    getChaptersBySubject,
    getSectionsByChapter,
    addChapter,
    updateChapter,
    deleteChapter,
    toggleChapterStatus,
    addSection,
    updateSection,
    deleteSection,
    toggleSectionStatus
  }
})
