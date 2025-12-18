import { ref } from 'vue'
import { defineStore } from 'pinia'

// 试卷数据结构
export interface Paper {
  id: string
  chapterId: string
  chapterName: string
  name: string
  status: 'active' | 'disabled'
  order: number
  createdAt: string
  isChapterPractice?: boolean
}

// 试卷表单数据结构
export interface PaperFormData {
  chapterId: string
  chapterName: string
  name: string
  status: 'active' | 'disabled'
  order: number
}

export const usePaperStore = defineStore('paper', () => {
  // 试卷列表
  const papers = ref<Paper[]>([
    // 高级会计师 - 财务战略管理 (ch-001 入学测试)
    {
      id: 'paper-001',
      chapterId: 'ch-001',
      chapterName: '入学测试',
      name: '2025年入学测试卷',
      status: 'active',
      order: 1,
      createdAt: '2025-01-15T10:00:00Z',
      isChapterPractice: false
    },
    {
      id: 'paper-002',
      chapterId: 'ch-001',
      chapterName: '入学测试',
      name: '2024年入学测试卷',
      status: 'active',
      order: 2,
      createdAt: '2024-01-15T10:00:00Z',
      isChapterPractice: false
    },
    // 高级会计师 - 财务战略管理 (ch-003 历年真题)
    {
      id: 'paper-003',
      chapterId: 'ch-003',
      chapterName: '历年真题',
      name: '2023-2024年真题合集',
      status: 'active',
      order: 1,
      createdAt: '2025-01-20T14:30:00Z',
      isChapterPractice: false
    },
    {
      id: 'paper-004',
      chapterId: 'ch-003',
      chapterName: '历年真题',
      name: '2021-2022年真题合集',
      status: 'active',
      order: 2,
      createdAt: '2025-01-20T14:35:00Z',
      isChapterPractice: false
    },
    // 高级会计师 - 税务风险控制 (ch-005 入学测试)
    {
      id: 'paper-005',
      chapterId: 'ch-005',
      chapterName: '入学测试',
      name: '税务风险控制入学测试',
      status: 'active',
      order: 1,
      createdAt: '2025-02-01T09:15:00Z',
      isChapterPractice: false
    },
    // 高级会计师 - 税务风险控制 (ch-007 历年真题)
    {
      id: 'paper-006',
      chapterId: 'ch-007',
      chapterName: '历年真题',
      name: '税务风险控制历年真题',
      status: 'active',
      order: 1,
      createdAt: '2025-02-05T11:20:00Z',
      isChapterPractice: false
    },
    // 高级经济师 - 宏观经济分析 (ch-009 入学测试)
    {
      id: 'paper-007',
      chapterId: 'ch-009',
      chapterName: '入学测试',
      name: '宏观经济分析入学测试',
      status: 'active',
      order: 1,
      createdAt: '2025-02-10T10:45:00Z',
      isChapterPractice: false
    },
    // 高级经济师 - 宏观经济分析 (ch-011 历年真题)
    {
      id: 'paper-008',
      chapterId: 'ch-011',
      chapterName: '历年真题',
      name: '宏观经济分析历年真题',
      status: 'active',
      order: 1,
      createdAt: '2025-02-15T13:30:00Z',
      isChapterPractice: false
    },
    // 中级会计师 - 成本管理实务 (ch-013 入学测试)
    {
      id: 'paper-009',
      chapterId: 'ch-013',
      chapterName: '入学测试',
      name: '成本管理实务入学测试',
      status: 'active',
      order: 1,
      createdAt: '2025-03-01T09:00:00Z',
      isChapterPractice: false
    },
    // 中级会计师 - 成本管理实务 (ch-015 历年真题)
    {
      id: 'paper-010',
      chapterId: 'ch-015',
      chapterName: '历年真题',
      name: '成本管理实务历年真题',
      status: 'active',
      order: 1,
      createdAt: '2025-03-05T14:15:00Z',
      isChapterPractice: false
    }
  ])

  /**
   * 添加试卷
   */
  const addPaper = (paperData: PaperFormData): boolean => {
    // 唯一性校验：同一章节下试卷名称不能重复
    const isDuplicate = papers.value.some(
      (paper) => paper.chapterId === paperData.chapterId && paper.name === paperData.name
    )

    if (isDuplicate) {
      throw new Error('该章节下已存在同名试卷')
    }

    const newPaper: Paper = {
      id: `paper-${Date.now()}`,
      chapterId: paperData.chapterId,
      chapterName: paperData.chapterName,
      name: paperData.name,
      status: paperData.status,
      order: paperData.order,
      createdAt: new Date().toISOString(),
      isChapterPractice: false // 新增的试卷默认不是章节练习
    }

    papers.value.push(newPaper)
    return true
  }

  /**
   * 编辑试卷
   */
  const updatePaper = (paperId: string, updates: Partial<PaperFormData>): boolean => {
    const paper = papers.value.find((paper) => paper.id === paperId)
    if (!paper) {
      throw new Error('试卷不存在')
    }

    // 如果修改了名称，需要校验唯一性
    if (updates.name && updates.name !== paper.name) {
      const isDuplicate = papers.value.some(
        (p) =>
          p.id !== paperId && p.chapterId === paper.chapterId && p.name === updates.name
      )

      if (isDuplicate) {
        throw new Error('该章节下已存在同名试卷')
      }
    }

    Object.assign(paper, updates, { updatedAt: new Date().toISOString() })
    return true
  }

  /**
   * 删除试卷
   */
  const deletePaper = (paperId: string): boolean => {
    const index = papers.value.findIndex((paper) => paper.id === paperId)
    if (index === -1) {
      throw new Error('试卷不存在')
    }

    papers.value.splice(index, 1)
    return true
  }

  /**
   * 切换试卷状态
   */
  const togglePaperStatus = (paperId: string): boolean => {
    const paper = papers.value.find((paper) => paper.id === paperId)
    if (!paper) {
      throw new Error('试卷不存在')
    }

    paper.status = paper.status === 'active' ? 'disabled' : 'active'
    paper.updatedAt = new Date().toISOString()
    return true
  }

  /**
   * 获取指定章节的试卷列表
   */
  const getPapersByChapter = (chapterId: string) => {
    return papers.value.filter((paper) => paper.chapterId === chapterId).sort((a, b) => a.order - b.order)
  }

  return {
    papers,
    addPaper,
    updatePaper,
    deletePaper,
    togglePaperStatus,
    getPapersByChapter
  }
})