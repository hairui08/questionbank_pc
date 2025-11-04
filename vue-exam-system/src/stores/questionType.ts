import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  QuestionType,
  QuestionTypeFormData,
  InternalType,
  ProjectTreeNode
} from '@/views/question-type-management/types'
import { INTERNAL_TYPE_NAMES } from '@/views/question-type-management/types'
import { useProjectStore } from './project'

export const useQuestionTypeStore = defineStore('questionType', () => {
  const projectStore = useProjectStore()

  // Mock数据
  const questionTypes = ref<QuestionType[]>([
    // 高级会计师 / 财务战略管理 (s1)
    {
      id: 'qt1',
      subjectId: 's1',
      subjectName: '财务战略管理',
      projectId: 'p1',
      projectName: '高级会计师',
      internalType: 'essay' as InternalType,
      internalName: '简答题',
      displayName: '案例分析题',
      description: '结合实际案例进行深度分析',
      order: 1,
      status: 'active',
      createdAt: new Date('2025-09-15'),
      updatedAt: new Date('2025-09-15')
    },
    {
      id: 'qt2',
      subjectId: 's1',
      subjectName: '财务战略管理',
      projectId: 'p1',
      projectName: '高级会计师',
      internalType: 'combination' as InternalType,
      internalName: '组合题',
      displayName: '综合应用题',
      description: '多知识点综合运用',
      order: 2,
      status: 'active',
      createdAt: new Date('2025-09-15'),
      updatedAt: new Date('2025-09-15')
    },
    // 高级会计师 / 税务风险控制 (s2)
    {
      id: 'qt3',
      subjectId: 's2',
      subjectName: '税务风险控制',
      projectId: 'p1',
      projectName: '高级会计师',
      internalType: 'essay' as InternalType,
      internalName: '简答题',
      displayName: '简答题',
      description: '文字论述类题目',
      order: 1,
      status: 'active',
      createdAt: new Date('2025-09-15'),
      updatedAt: new Date('2025-09-15')
    },
    // 中级会计师 / 成本管理实务 (s8)
    {
      id: 'qt4',
      subjectId: 's8',
      subjectName: '成本管理实务',
      projectId: 'p4',
      projectName: '中级会计师',
      internalType: 'single_choice' as InternalType,
      internalName: '单选题',
      displayName: '单项选择题',
      description: '四个选项中选择一个正确答案',
      order: 1,
      status: 'active',
      createdAt: new Date('2025-05-18'),
      updatedAt: new Date('2025-05-18')
    },
    {
      id: 'qt5',
      subjectId: 's8',
      subjectName: '成本管理实务',
      projectId: 'p4',
      projectName: '中级会计师',
      internalType: 'multiple_choice' as InternalType,
      internalName: '多选题',
      displayName: '多项选择题',
      description: '四个选项中选择多个正确答案',
      order: 2,
      status: 'active',
      createdAt: new Date('2025-05-18'),
      updatedAt: new Date('2025-05-18')
    },
    {
      id: 'qt6',
      subjectId: 's8',
      subjectName: '成本管理实务',
      projectId: 'p4',
      projectName: '中级会计师',
      internalType: 'judgment' as InternalType,
      internalName: '判断题',
      displayName: '判断题',
      description: '判断对错',
      order: 3,
      status: 'disabled',
      createdAt: new Date('2025-05-18'),
      updatedAt: new Date('2025-05-18')
    },
    // 中级会计师 / 财务报表编制 (s9) - 25个题型用于测试分页
    ...Array.from({ length: 25 }, (_, i) => {
      const types: InternalType[] = [
        'single_choice',
        'multiple_choice',
        'judgment',
        'essay'
      ] as InternalType[]
      const type = types[i % 4]
      return {
        id: `qt${100 + i}`,
        subjectId: 's9',
        subjectName: '财务报表编制',
        projectId: 'p4',
        projectName: '中级会计师',
        internalType: type,
        internalName: INTERNAL_TYPE_NAMES[type],
        displayName: `题型${i + 1}`,
        description: `这是第${i + 1}个题型的描述`,
        order: i + 1,
        status: (i % 3 !== 0 ? 'active' : 'disabled') as 'active' | 'disabled',
        createdAt: new Date('2025-05-18'),
        updatedAt: new Date('2025-05-18')
      }
    })
  ])

  /**
   * 项目树数据（从 projectStore 转换）
   */
  const projectTree = computed((): ProjectTreeNode[] => {
    return projectStore.projects.map((project) => ({
      id: project.id,
      name: project.name,
      subjects: projectStore.subjects
        .filter((subject) => subject.projectId === project.id)
        .map((subject) => ({
          id: subject.id,
          name: subject.name,
          projectId: subject.projectId,
          projectName: project.name
        }))
    }))
  })

  /**
   * 根据科目ID获取题型列表
   */
  const getQuestionTypesBySubject = (subjectId: string) => {
    return computed(() => questionTypes.value.filter((qt) => qt.subjectId === subjectId))
  }

  /**
   * 添加题型
   * 包含三重唯一性校验：内部题型、外部名称、排序
   */
  const addQuestionType = (data: QuestionTypeFormData) => {
    const typesInSubject = questionTypes.value.filter((qt) => qt.subjectId === data.subjectId)

    // 校验内部题型唯一性
    if (typesInSubject.some((qt) => qt.internalType === data.internalType)) {
      throw new Error('该内部题型已在当前科目下配置')
    }

    // 校验外部名称唯一性
    if (typesInSubject.some((qt) => qt.displayName === data.displayName.trim())) {
      throw new Error('外部显示名称在当前科目下重复')
    }

    // 校验排序唯一性
    if (typesInSubject.some((qt) => qt.order === data.order)) {
      throw new Error('排序值在当前科目下重复')
    }

    const newQuestionType: QuestionType = {
      id: `qt${Date.now()}`,
      subjectId: data.subjectId,
      subjectName: data.subjectName,
      projectId: data.projectId,
      projectName: data.projectName,
      internalType: data.internalType,
      internalName: INTERNAL_TYPE_NAMES[data.internalType],
      displayName: data.displayName.trim(),
      description: data.description.trim(),
      order: data.order,
      status: data.status,
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
    const typesInSubject = questionTypes.value.filter(
      (qt) => qt.subjectId === currentType.subjectId && qt.id !== id
    )

    // 如果修改了外部名称，校验唯一性
    if (updates.displayName && updates.displayName.trim() !== currentType.displayName) {
      if (typesInSubject.some((qt) => qt.displayName === updates.displayName.trim())) {
        throw new Error('外部显示名称在当前科目下重复')
      }
    }

    // 如果修改了排序，校验唯一性
    if (updates.order && updates.order !== currentType.order) {
      if (typesInSubject.some((qt) => qt.order === updates.order)) {
        throw new Error('排序值在当前科目下重复')
      }
    }

    // 更新数据
    questionTypes.value[index] = {
      ...currentType,
      ...(updates.displayName && { displayName: updates.displayName.trim() }),
      ...(updates.description !== undefined && { description: updates.description.trim() }),
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

  return {
    questionTypes,
    projectTree,
    getQuestionTypesBySubject,
    addQuestionType,
    updateQuestionType,
    deleteQuestionType,
    toggleQuestionTypeStatus
  }
})
