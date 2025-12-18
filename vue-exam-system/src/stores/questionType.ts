import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  QuestionType,
  QuestionTypeFormData,
  InternalType
} from '@/views/question-type-management/types'
import { INTERNAL_TYPE_NAMES } from '@/views/question-type-management/types'

export const useQuestionTypeStore = defineStore('questionType', () => {
  // Mock数据
  const questionTypes = ref<QuestionType[]>([
    {
      id: 'qt1',
      internalType: 'essay' as InternalType,
      internalName: '简答题',
      displayName: '案例分析题',
      order: 1,
      status: 'active',
      subjectId: 's1', // 财务战略管理
      createdAt: new Date('2025-09-15'),
      updatedAt: new Date('2025-09-15')
    },
    {
      id: 'qt2',
      internalType: 'combination' as InternalType,
      internalName: '组合题',
      displayName: '综合应用题',
      order: 2,
      status: 'active',
      subjectId: 's1', // 财务战略管理
      createdAt: new Date('2025-09-15'),
      updatedAt: new Date('2025-09-15')
    },
    {
      id: 'qt3',
      internalType: 'essay' as InternalType,
      internalName: '简答题',
      displayName: '简答题',
      order: 3,
      status: 'active',
      subjectId: 's1', // 财务战略管理
      createdAt: new Date('2025-09-15'),
      updatedAt: new Date('2025-09-15')
    },
    {
      id: 'qt4',
      internalType: 'single_choice' as InternalType,
      internalName: '单选题',
      displayName: '单项选择题',
      order: 4,
      status: 'active',
      subjectId: 's2', // 税务风险控制
      createdAt: new Date('2025-05-18'),
      updatedAt: new Date('2025-05-18')
    },
    {
      id: 'qt5',
      internalType: 'multiple_choice' as InternalType,
      internalName: '多选题',
      displayName: '多项选择题',
      order: 5,
      status: 'active',
      subjectId: 's2', // 税务风险控制
      createdAt: new Date('2025-05-18'),
      updatedAt: new Date('2025-05-18')
    },
    {
      id: 'qt6',
      internalType: 'judgment' as InternalType,
      internalName: '判断题',
      displayName: '判断题',
      order: 6,
      status: 'disabled',
      subjectId: 's3', // 内部挖潜优化
      createdAt: new Date('2025-05-18'),
      updatedAt: new Date('2025-05-18')
    },
    // 25个题型用于测试分页，分配给不同科目
    ...Array.from({ length: 25 }, (_, i) => {
      const types: InternalType[] = [
        'single_choice',
        'multiple_choice',
        'judgment',
        'essay'
      ] as InternalType[]
      const type = types[i % 4]
      const subjectIds = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10']
      const subjectId = subjectIds[i % subjectIds.length]
      return {
        id: `qt${100 + i}`,
        internalType: type,
        internalName: INTERNAL_TYPE_NAMES[type],
        displayName: `题型${i + 1}`,
        order: i + 7,
        status: (i % 3 !== 0 ? 'active' : 'disabled') as 'active' | 'disabled',
        subjectId: subjectId,
        createdAt: new Date('2025-05-18'),
        updatedAt: new Date('2025-05-18')
      }
    })
  ])

  /**
   * 获取所有题型列表
   */
  const getAllQuestionTypes = computed(() => questionTypes.value)

  /**
   * 根据科目ID获取题型列表
   */
  const getQuestionTypesBySubject = (subjectId: string): QuestionType[] => {
    return questionTypes.value
      .filter(type => type.subjectId === subjectId && type.status === 'active')
      .sort((a, b) => a.order - b.order)
  }

  /**
   * 添加题型
   * 包含三重唯一性校验：内部题型、外部名称、排序
   */
  const addQuestionType = (data: QuestionTypeFormData) => {
    // 确保subjectId存在
    if (!data.subjectId) {
      throw new Error('缺少科目ID')
    }

    // 校验内部题型唯一性（按科目）
    if (questionTypes.value.some((qt) => qt.internalType === data.internalType && qt.subjectId === data.subjectId)) {
      throw new Error('该科目下已存在相同的内部题型')
    }

    // 校验外部名称唯一性（按科目）
    if (questionTypes.value.some((qt) => qt.displayName === data.displayName.trim() && qt.subjectId === data.subjectId)) {
      throw new Error('该科目下外部显示名称重复')
    }

    // 校验排序唯一性（按科目）
    if (questionTypes.value.some((qt) => qt.order === data.order && qt.subjectId === data.subjectId)) {
      throw new Error('该科目下排序值重复')
    }

    const newQuestionType: QuestionType = {
      id: `qt${Date.now()}`,
      internalType: data.internalType,
      internalName: INTERNAL_TYPE_NAMES[data.internalType],
      displayName: data.displayName.trim(),
      order: data.order,
      status: data.status,
      subjectId: data.subjectId,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    questionTypes.value.push(newQuestionType)
    return newQuestionType
  }

  /**
   * 更新题型
   * 编辑时内部题型不可修改，只需校验外部名称和排序
   */
  const updateQuestionType = (id: string, updates: Partial<QuestionTypeFormData>) => {
    const index = questionTypes.value.findIndex((qt) => qt.id === id)
    if (index === -1) {
      throw new Error('题型不存在')
    }

    const currentType = questionTypes.value[index]
    const otherTypes = questionTypes.value.filter((qt) => qt.id !== id)

    // 如果修改了外部名称，校验唯一性（按科目）
    if (updates.displayName && updates.displayName.trim() !== currentType.displayName) {
      if (otherTypes.some((qt) => qt.displayName === updates.displayName.trim() && qt.subjectId === currentType.subjectId)) {
        throw new Error('该科目下外部显示名称重复')
      }
    }

    // 如果修改了排序，校验唯一性（按科目）
    if (updates.order && updates.order !== currentType.order) {
      if (otherTypes.some((qt) => qt.order === updates.order && qt.subjectId === currentType.subjectId)) {
        throw new Error('该科目下排序值重复')
      }
    }

    // 更新数据
    questionTypes.value[index] = {
      ...currentType,
      ...(updates.displayName && { displayName: updates.displayName.trim() }),
      ...(updates.order && { order: updates.order }),
      ...(updates.status && { status: updates.status }),
      updatedAt: new Date()
    }

    return questionTypes.value[index]
  }

  /**
   * 删除题型
   */
  const deleteQuestionType = (id: string) => {
    const index = questionTypes.value.findIndex((qt) => qt.id === id)
    if (index === -1) {
      throw new Error('题型不存在')
    }

    questionTypes.value.splice(index, 1)
  }

  /**
   * 切换题型状态
   */
  const toggleQuestionTypeStatus = (id: string) => {
    const index = questionTypes.value.findIndex((qt) => qt.id === id)
    if (index === -1) {
      throw new Error('题型不存在')
    }

    questionTypes.value[index].status =
      questionTypes.value[index].status === 'active' ? 'disabled' : 'active'
    questionTypes.value[index].updatedAt = new Date()
  }

  /**
   * 上移题型
   */
  const moveUp = (id: string) => {
    const currentType = questionTypes.value.find((qt) => qt.id === id)
    if (!currentType) {
      throw new Error('题型不存在')
    }

    // 获取所有题型,按 order 排序
    const allTypes = questionTypes.value.sort((a, b) => a.order - b.order)

    const currentIndex = allTypes.findIndex((qt) => qt.id === id)

    // 如果已经是第一个,不能上移
    if (currentIndex === 0) {
      throw new Error('已经是第一个题型,无法上移')
    }

    // 交换 order 值
    const prevType = allTypes[currentIndex - 1]
    const tempOrder = currentType.order
    currentType.order = prevType.order
    prevType.order = tempOrder

    // 更新时间戳
    currentType.updatedAt = new Date()
    prevType.updatedAt = new Date()
  }

  /**
   * 下移题型
   */
  const moveDown = (id: string) => {
    const currentType = questionTypes.value.find((qt) => qt.id === id)
    if (!currentType) {
      throw new Error('题型不存在')
    }

    // 获取所有题型,按 order 排序
    const allTypes = questionTypes.value.sort((a, b) => a.order - b.order)

    const currentIndex = allTypes.findIndex((qt) => qt.id === id)

    // 如果已经是最后一个,不能下移
    if (currentIndex === allTypes.length - 1) {
      throw new Error('已经是最后一个题型,无法下移')
    }

    // 交换 order 值
    const nextType = allTypes[currentIndex + 1]
    const tempOrder = currentType.order
    currentType.order = nextType.order
    nextType.order = tempOrder

    // 更新时间戳
    currentType.updatedAt = new Date()
    nextType.updatedAt = new Date()
  }

  // 构建项目树数据，实时计算题型数量
  const projectTree = computed(() => {
    // 计算每个科目下的题型数量
    const getSubjectTypeCount = (subjectId: string): number => {
      return questionTypes.value.filter(type => type.subjectId === subjectId).length
    }

    return [
      {
        id: 'p1',
        name: '高级会计师',
        icon: '📁',
        count: 3,
        subjects: [
          {
            id: 's1',
            name: '财务战略管理',
            icon: '📚',
            count: getSubjectTypeCount('s1')
          },
          {
            id: 's2',
            name: '税务风险控制',
            icon: '📚',
            count: getSubjectTypeCount('s2')
          },
          {
            id: 's3',
            name: '内部挖潜优化',
            icon: '📚',
            count: getSubjectTypeCount('s3')
          }
        ]
      },
      {
        id: 'p2',
        name: '高级经济师',
        icon: '📁',
        count: 2,
        subjects: [
          {
            id: 's4',
            name: '经济基础知识',
            icon: '📚',
            count: getSubjectTypeCount('s4')
          },
          {
            id: 's5',
            name: '工商管理',
            icon: '📚',
            count: getSubjectTypeCount('s5')
          }
        ]
      },
      {
        id: 'p3',
        name: '中级经济师',
        icon: '📁',
        count: 2,
        subjects: [
          {
            id: 's6',
            name: '经济基础知识',
            icon: '📚',
            count: getSubjectTypeCount('s6')
          },
          {
            id: 's7',
            name: '金融专业',
            icon: '📚',
            count: getSubjectTypeCount('s7')
          }
        ]
      },
      {
        id: 'p4',
        name: '中级会计师',
        icon: '📁',
        count: 3,
        subjects: [
          {
            id: 's8',
            name: '会计实务',
            icon: '📚',
            count: getSubjectTypeCount('s8')
          },
          {
            id: 's9',
            name: '财务管理',
            icon: '📚',
            count: getSubjectTypeCount('s9')
          },
          {
            id: 's10',
            name: '经济法',
            icon: '📚',
            count: getSubjectTypeCount('s10')
          }
        ]
      }
    ]
  })

  return {
    questionTypes,
    getAllQuestionTypes,
    getQuestionTypesBySubject,
    projectTree,
    addQuestionType,
    updateQuestionType,
    deleteQuestionType,
    toggleQuestionTypeStatus,
    moveUp,
    moveDown
  }
})
