import { ref, computed } from 'vue'
import { useQuestionStore } from './question'
import { useLearningStageStore } from './learningStage'
import { defineStore } from 'pinia'
import type {
  Chapter,
  Section,
  SubSection,
  ChapterFormData,
  SectionFormData,
  ProjectTreeNode,
  Status
} from '@/views/category-management/types'

export const useChapterStore = defineStore('chapter', () => {
  // 初始化学习阶段store
  const learningStageStore = useLearningStageStore()
  

// 项目和科目树结构（用于左侧导航，与projectStore数据同步，包含学习阶段）
  const projectTree = computed<ProjectTreeNode[]>(() => {
    // 原始项目树数据
    const originalProjectTree: ProjectTreeNode[] = [
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
    ]
    
    // 为每个科目添加对应的学习阶段数据
    return originalProjectTree.map(project => {
      return {
        ...project,
        subjects: project.subjects.map(subject => {
          // 获取该科目下的所有学习阶段
          const learningStages = learningStageStore.learningStages
            .filter(stage => stage.subjectId === subject.id && stage.status === 'active')
            .sort((a, b) => a.sortOrder - b.sortOrder)
          
          return {
            ...subject,
            learningStages
          }
        })
      }
    })
  })

  // Mock数据：章节列表（与projectStore中的科目ID对应）
  const chapters = ref<Chapter[]>([
    // 高级会计师 - 财务战略管理 (s1)
    {
      id: 'ch-001',
      projectId: 'p1',
      projectName: '高级会计师',
      subjectId: 's1',
      subjectName: '财务战略管理',
      name: '入学测试',
      status: 'active',
      isChapterPractice: false,
      order: 1,
      createdAt: '2025-01-10T10:00:00Z'
    },
    {
      id: 'ch-002',
      projectId: 'p1',
      projectName: '高级会计师',
      subjectId: 's1',
      subjectName: '财务战略管理',
      name: '章节练习',
      status: 'active',
      isChapterPractice: true,
      order: 2,
      createdAt: '2025-01-10T10:05:00Z'
    },
    {
      id: 'ch-003',
      projectId: 'p1',
      projectName: '高级会计师',
      subjectId: 's1',
      subjectName: '财务战略管理',
      name: '历年真题',
      status: 'active',
      isChapterPractice: false,
      order: 3,
      createdAt: '2025-01-10T10:10:00Z'
    },
    {
      id: 'ch-004',
      projectId: 'p1',
      projectName: '高级会计师',
      subjectId: 's1',
      subjectName: '财务战略管理',
      name: '考前冲刺',
      status: 'active',
      isChapterPractice: false,
      order: 4,
      createdAt: '2025-01-10T10:15:00Z'
    },
    // 高级会计师 - 税务风险控制 (s2)
    {
      id: 'ch-005',
      projectId: 'p1',
      projectName: '高级会计师',
      subjectId: 's2',
      subjectName: '税务风险控制',
      name: '入学测试',
      status: 'active',
      isChapterPractice: false,
      order: 1,
      createdAt: '2025-01-10T10:20:00Z'
    },
    {
      id: 'ch-006',
      projectId: 'p1',
      projectName: '高级会计师',
      subjectId: 's2',
      subjectName: '税务风险控制',
      name: '章节练习',
      status: 'active',
      isChapterPractice: true,
      order: 2,
      createdAt: '2025-01-10T10:25:00Z'
    },
    {
      id: 'ch-007',
      projectId: 'p1',
      projectName: '高级会计师',
      subjectId: 's2',
      subjectName: '税务风险控制',
      name: '历年真题',
      status: 'active',
      isChapterPractice: false,
      order: 3,
      createdAt: '2025-01-10T10:30:00Z'
    },
    {
      id: 'ch-008',
      projectId: 'p1',
      projectName: '高级会计师',
      subjectId: 's2',
      subjectName: '税务风险控制',
      name: '考前冲刺',
      status: 'active',
      isChapterPractice: false,
      order: 4,
      createdAt: '2025-01-10T10:35:00Z'
    },
    // 高级经济师 - 宏观经济分析 (s4)
    {
      id: 'ch-009',
      projectId: 'p2',
      projectName: '高级经济师',
      subjectId: 's4',
      subjectName: '宏观经济分析',
      name: '入学测试',
      status: 'active',
      isChapterPractice: false,
      order: 1,
      createdAt: '2025-01-10T10:40:00Z'
    },
    {
      id: 'ch-010',
      projectId: 'p2',
      projectName: '高级经济师',
      subjectId: 's4',
      subjectName: '宏观经济分析',
      name: '章节练习',
      status: 'active',
      isChapterPractice: true,
      order: 2,
      createdAt: '2025-01-10T10:45:00Z'
    },
    {
      id: 'ch-011',
      projectId: 'p2',
      projectName: '高级经济师',
      subjectId: 's4',
      subjectName: '宏观经济分析',
      name: '历年真题',
      status: 'active',
      isChapterPractice: false,
      order: 3,
      createdAt: '2025-01-10T10:50:00Z'
    },
    {
      id: 'ch-012',
      projectId: 'p2',
      projectName: '高级经济师',
      subjectId: 's4',
      subjectName: '宏观经济分析',
      name: '考前冲刺',
      status: 'active',
      isChapterPractice: false,
      order: 4,
      createdAt: '2025-01-10T10:55:00Z'
    },
    // 中级会计师 - 成本管理实务 (s8)
    {
      id: 'ch-013',
      projectId: 'p4',
      projectName: '中级会计师',
      subjectId: 's8',
      subjectName: '成本管理实务',
      name: '入学测试',
      status: 'active',
      isChapterPractice: false,
      order: 1,
      createdAt: '2025-01-10T11:00:00Z'
    },
    {
      id: 'ch-014',
      projectId: 'p4',
      projectName: '中级会计师',
      subjectId: 's8',
      subjectName: '成本管理实务',
      name: '章节练习',
      status: 'active',
      isChapterPractice: true,
      order: 2,
      createdAt: '2025-01-10T11:05:00Z'
    },
    {
      id: 'ch-015',
      projectId: 'p4',
      projectName: '中级会计师',
      subjectId: 's8',
      subjectName: '成本管理实务',
      name: '历年真题',
      status: 'active',
      isChapterPractice: false,
      order: 3,
      createdAt: '2025-01-10T11:10:00Z'
    },
    {
      id: 'ch-016',
      projectId: 'p4',
      projectName: '中级会计师',
      subjectId: 's8',
      subjectName: '成本管理实务',
      name: '考前冲刺',
      status: 'active',
      isChapterPractice: false,
      order: 4,
      createdAt: '2025-01-10T11:15:00Z'
    }
  ])

  // Mock数据：小节列表（与章节ID对应）
  const sections = ref<Section[]>([
    // 财务战略管理 - 章节练习
    {
      id: 'sec-001',
      chapterId: 'ch-002',
      chapterName: '章节练习',
      name: '第一章 财务战略概述',
      status: 'active',
      order: 1,
      createdAt: '2025-01-10T11:00:00Z'
    },
    {
      id: 'sec-002',
      chapterId: 'ch-002',
      chapterName: '章节练习',
      name: '第二章 预算管理',
      status: 'active',
      order: 2,
      createdAt: '2025-01-10T11:05:00Z'
    },
    {
      id: 'sec-003',
      chapterId: 'ch-002',
      chapterName: '章节练习',
      name: '第三章 成本分析',
      status: 'active',
      order: 3,
      createdAt: '2025-01-10T11:07:00Z'
    },
    // 税务风险控制 - 章节练习
    {
      id: 'sec-004',
      chapterId: 'ch-006',
      chapterName: '章节练习',
      name: '第一章 税务风险概述',
      status: 'active',
      order: 1,
      createdAt: '2025-01-10T11:10:00Z'
    },
    {
      id: 'sec-005',
      chapterId: 'ch-006',
      chapterName: '章节练习',
      name: '第二章 税务筹划',
      status: 'active',
      order: 2,
      createdAt: '2025-01-10T11:15:00Z'
    },
    // 高级经济师 - 章节练习
    {
      id: 'sec-006',
      chapterId: 'ch-010',
      chapterName: '章节练习',
      name: '第一章 宏观经济指标',
      status: 'active',
      order: 1,
      createdAt: '2025-01-10T11:20:00Z'
    },
    {
      id: 'sec-007',
      chapterId: 'ch-010',
      chapterName: '章节练习',
      name: '第二章 货币政策',
      status: 'active',
      order: 2,
      createdAt: '2025-01-10T11:25:00Z'
    },
    // 中级会计师 - 章节练习
    {
      id: 'sec-008',
      chapterId: 'ch-014',
      chapterName: '章节练习',
      name: '第一章 成本核算',
      status: 'active',
      order: 1,
      createdAt: '2025-01-10T11:30:00Z'
    },
    {
      id: 'sec-009',
      chapterId: 'ch-014',
      chapterName: '章节练习',
      name: '第二章 成本控制',
      status: 'active',
      order: 2,
      createdAt: '2025-01-10T11:35:00Z'
    }
  ])

  // Mock数据：第三级子项列表（与小节ID对应）
  const subSections = ref<SubSection[]>([
    // 财务战略管理 - 章节练习 - 第一章 财务战略概述
    {
      id: 'subsec-001',
      sectionId: 'sec-001',
      sectionName: '第一章 财务战略概述',
      name: '第一节 战略定义',
      status: 'active',
      order: 1,
      createdAt: '2025-01-10T11:10:00Z'
    },
    {
      id: 'subsec-002',
      sectionId: 'sec-001',
      sectionName: '第一章 财务战略概述',
      name: '第二节 战略类型',
      status: 'active',
      order: 2,
      createdAt: '2025-01-10T11:15:00Z'
    },
    {
      id: 'subsec-003',
      sectionId: 'sec-001',
      sectionName: '第一章 财务战略概述',
      name: '第三节 战略实施',
      status: 'active',
      order: 3,
      createdAt: '2025-01-10T11:20:00Z'
    },
    // 财务战略管理 - 章节练习 - 第二章 预算管理
    {
      id: 'subsec-004',
      sectionId: 'sec-002',
      sectionName: '第二章 预算管理',
      name: '第一节 预算编制',
      status: 'active',
      order: 1,
      createdAt: '2025-01-10T11:25:00Z'
    },
    {
      id: 'subsec-005',
      sectionId: 'sec-002',
      sectionName: '第二章 预算管理',
      name: '第二节 预算控制',
      status: 'active',
      order: 2,
      createdAt: '2025-01-10T11:30:00Z'
    },
    {
      id: 'subsec-006',
      sectionId: 'sec-002',
      sectionName: '第二章 预算管理',
      name: '第三节 预算分析',
      status: 'active',
      order: 3,
      createdAt: '2025-01-10T11:35:00Z'
    },
    // 财务战略管理 - 章节练习 - 第三章 成本分析
    {
      id: 'subsec-007',
      sectionId: 'sec-003',
      sectionName: '第三章 成本分析',
      name: '第一节 成本核算方法',
      status: 'active',
      order: 1,
      createdAt: '2025-01-10T11:40:00Z'
    },
    {
      id: 'subsec-008',
      sectionId: 'sec-003',
      sectionName: '第三章 成本分析',
      name: '第二节 成本控制技术',
      status: 'active',
      order: 2,
      createdAt: '2025-01-10T11:45:00Z'
    },
    
    // 税务风险控制 - 章节练习 - 第一章 税务风险概述
    {
      id: 'subsec-009',
      sectionId: 'sec-004',
      sectionName: '第一章 税务风险概述',
      name: '第一节 风险识别方法',
      status: 'active',
      order: 1,
      createdAt: '2025-01-10T11:50:00Z'
    },
    {
      id: 'subsec-010',
      sectionId: 'sec-004',
      sectionName: '第一章 税务风险概述',
      name: '第二节 风险评估模型',
      status: 'active',
      order: 2,
      createdAt: '2025-01-10T11:55:00Z'
    },
    {
      id: 'subsec-011',
      sectionId: 'sec-004',
      sectionName: '第一章 税务风险概述',
      name: '第三节 风险等级划分',
      status: 'active',
      order: 3,
      createdAt: '2025-01-10T12:00:00Z'
    },
    // 税务风险控制 - 章节练习 - 第二章 税务筹划
    {
      id: 'subsec-012',
      sectionId: 'sec-005',
      sectionName: '第二章 税务筹划',
      name: '第一节 筹划原则',
      status: 'active',
      order: 1,
      createdAt: '2025-01-10T12:05:00Z'
    },
    {
      id: 'subsec-013',
      sectionId: 'sec-005',
      sectionName: '第二章 税务筹划',
      name: '第二节 筹划方法',
      status: 'active',
      order: 2,
      createdAt: '2025-01-10T12:10:00Z'
    },
    
    // 高级经济师 - 章节练习 - 第一章 宏观经济指标
    {
      id: 'subsec-014',
      sectionId: 'sec-006',
      sectionName: '第一章 宏观经济指标',
      name: '第一节 GDP核算',
      status: 'active',
      order: 1,
      createdAt: '2025-01-10T12:15:00Z'
    },
    {
      id: 'subsec-015',
      sectionId: 'sec-006',
      sectionName: '第一章 宏观经济指标',
      name: '第二节 就业指标',
      status: 'active',
      order: 2,
      createdAt: '2025-01-10T12:20:00Z'
    },
    {
      id: 'subsec-016',
      sectionId: 'sec-006',
      sectionName: '第一章 宏观经济指标',
      name: '第三节 物价指标',
      status: 'active',
      order: 3,
      createdAt: '2025-01-10T12:25:00Z'
    },
    // 高级经济师 - 章节练习 - 第二章 货币政策
    {
      id: 'subsec-017',
      sectionId: 'sec-007',
      sectionName: '第二章 货币政策',
      name: '第一节 政策目标',
      status: 'active',
      order: 1,
      createdAt: '2025-01-10T12:30:00Z'
    },
    {
      id: 'subsec-018',
      sectionId: 'sec-007',
      sectionName: '第二章 货币政策',
      name: '第二节 政策工具',
      status: 'active',
      order: 2,
      createdAt: '2025-01-10T12:35:00Z'
    },
    
    // 中级会计师 - 章节练习 - 第一章 成本核算
    {
      id: 'subsec-019',
      sectionId: 'sec-008',
      sectionName: '第一章 成本核算',
      name: '第一节 核算原则',
      status: 'active',
      order: 1,
      createdAt: '2025-01-10T12:40:00Z'
    },
    {
      id: 'subsec-020',
      sectionId: 'sec-008',
      sectionName: '第一章 成本核算',
      name: '第二节 核算方法',
      status: 'active',
      order: 2,
      createdAt: '2025-01-10T12:45:00Z'
    },
    {
      id: 'subsec-021',
      sectionId: 'sec-008',
      sectionName: '第一章 成本核算',
      name: '第三节 费用分摊',
      status: 'active',
      order: 3,
      createdAt: '2025-01-10T12:50:00Z'
    },
    // 中级会计师 - 章节练习 - 第二章 成本控制
    {
      id: 'subsec-022',
      sectionId: 'sec-009',
      sectionName: '第二章 成本控制',
      name: '第一节 控制方法',
      status: 'active',
      order: 1,
      createdAt: '2025-01-10T12:55:00Z'
    },
    {
      id: 'subsec-023',
      sectionId: 'sec-009',
      sectionName: '第二章 成本控制',
      name: '第二节 控制流程',
      status: 'active',
      order: 2,
      createdAt: '2025-01-10T13:00:00Z'
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
   * 获取指定小节的第三级子项列表
   */
  const getSubSectionsBySection = (sectionId: string) => {
    return computed(() =>
      subSections.value.filter((subSec) => subSec.sectionId === sectionId).sort((a, b) => a.order - b.order)
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
    projectId: chapterData.projectId || '',
    projectName: chapterData.projectName || '',
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

    // 检查是否有试题引用该章节
    const questionStore = useQuestionStore()
    const questionCount = questionStore.questions.filter((q) => q.chapterId === chapterId).length
    if (questionCount > 0) {
      throw new Error('该章节正在被使用，不允许删除')
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

  /**
   * 批量切换小节状态
   */
const batchToggleSectionStatus = (sectionIds: string[], targetStatus: Status): boolean => {
  if (!sectionIds || sectionIds.length === 0) {
    throw new Error('未选择任何小节')
  }

  // 验证所有小节是否存在
  const missingSections = sectionIds.filter((id) => !sections.value.find((sec) => sec.id === id))
  if (missingSections.length > 0) {
    throw new Error(`以下小节不存在: ${missingSections.join(', ')}`)
  }

  // 批量更新状态
  const timestamp = new Date().toISOString()
  sectionIds.forEach((id) => {
    const section = sections.value.find((sec) => sec.id === id)
    if (section) {
      section.status = targetStatus
      section.updatedAt = timestamp
    }
  })

  return true
}

/**
 * 批量切换章节状态
 */
const batchToggleChapters = (chapterIds: string[], targetStatus: Status): boolean => {
  if (!chapterIds || chapterIds.length === 0) {
    throw new Error('未选择任何章节')
  }

  // 验证所有章节是否存在
  const missingChapters = chapterIds.filter((id) => !chapters.value.find((ch) => ch.id === id))
  if (missingChapters.length > 0) {
    throw new Error(`以下章节不存在: ${missingChapters.join(', ')}`)
  }

  // 批量更新状态
  const timestamp = new Date().toISOString()
  chapterIds.forEach((id) => {
    const chapter = chapters.value.find((ch) => ch.id === id)
    if (chapter) {
      chapter.status = targetStatus
      chapter.updatedAt = timestamp
    }
  })

  return true
}

/**
 * 添加第三级子项
 */
const addSubSection = (subSectionData: any): boolean => {
  // 唯一性校验：同一小节下子项名称不能重复
  const isDuplicate = subSections.value.some(
    (subSec) => subSec.sectionId === subSectionData.sectionId && subSec.name === subSectionData.name
  )

  if (isDuplicate) {
    throw new Error('该小节下已存在同名子项')
  }

  const newSubSection: SubSection = {
    id: `subsec-${Date.now()}`,
    sectionId: subSectionData.sectionId,
    sectionName: subSectionData.sectionName,
    name: subSectionData.name,
    status: subSectionData.status,
    order: subSectionData.order,
    createdAt: new Date().toISOString()
  }

  subSections.value.push(newSubSection)
  return true
}

  /**
   * 重新排序章节（拖拽后调用）
   */
  const reorderChapters = (draggedId: string, targetId: string) => {
    const draggedChapter = chapters.value.find(ch => ch.id === draggedId)
    const targetChapter = chapters.value.find(ch => ch.id === targetId)

    if (!draggedChapter || !targetChapter) return

    const draggedOrder = draggedChapter.order
    const targetOrder = targetChapter.order

    // 交换order值
    draggedChapter.order = targetOrder
    targetChapter.order = draggedOrder

    // 更新时间
    draggedChapter.updatedAt = new Date().toISOString()
    targetChapter.updatedAt = new Date().toISOString()

    // 按order重新排序数组
    chapters.value.sort((a, b) => a.order - b.order)
  }

  /**
   * 重新排序小节（拖拽后调用）
   */
  const reorderSections = (draggedId: string, targetId: string) => {
    const draggedSection = sections.value.find(sec => sec.id === draggedId)
    const targetSection = sections.value.find(sec => sec.id === targetId)

    if (!draggedSection || !targetSection) return

    const draggedOrder = draggedSection.order
    const targetOrder = targetSection.order

    // 交换order值
    draggedSection.order = targetOrder
    targetSection.order = draggedOrder

    // 更新时间
    draggedSection.updatedAt = new Date().toISOString()
    targetSection.updatedAt = new Date().toISOString()

    // 按order重新排序数组
    sections.value.sort((a, b) => a.order - b.order)
  }

  return {
    chapters,
    sections,
    subSections,
    projectTree,
    getChaptersBySubject,
    getSectionsByChapter,
    getSubSectionsBySection,
    addChapter,
    updateChapter,
    deleteChapter,
    toggleChapterStatus,
    addSection,
    updateSection,
    deleteSection,
    toggleSectionStatus,
    batchToggleSectionStatus,
    batchToggleChapters,
    addSubSection,
    reorderChapters,
    reorderSections
  }
})
