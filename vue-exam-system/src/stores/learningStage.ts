import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useProjectStore } from './project'
import type {
  LearningStage,
  LearningStageFormData,
  ProjectTreeNode,
  SubjectTreeNode
} from '@/views/learning-stage-management/types'

export const useLearningStageStore = defineStore('learningStage', () => {
  const projectStore = useProjectStore()

  // Mock数据：学习阶段列表（与科目关联）
  const learningStages = ref<LearningStage[]>([
    // 高级会计师 - 财务战略管理 (s1)
    {
      id: 'ls-001',
      subjectId: 's1',
      name: '章节练习',
      description: '按章节进行针对性练习,巩固知识点',
      sortOrder: 1,
      creator: '张老师',
      createdAt: '2025-01-05 09:00',
      status: 'active',
      isChapterPractice: true
    },
    {
      id: 'ls-002',
      subjectId: 's1',
      name: '历年真题',
      description: '2020-2024年历年考试真题',
      sortOrder: 2,
      creator: '张老师',
      createdAt: '2025-01-05 09:05',
      status: 'active',
      isChapterPractice: false
    },
    {
      id: 'ls-003',
      subjectId: 's1',
      name: '考前冲刺',
      description: '考前重点强化,高频考点训练',
      sortOrder: 3,
      creator: '张老师',
      createdAt: '2025-01-05 09:10',
      status: 'active',
      isChapterPractice: false
    },
    {
      id: 'ls-004',
      subjectId: 's1',
      name: '入学测试',
      description: '入学水平摸底测试',
      sortOrder: 4,
      creator: '张老师',
      createdAt: '2025-01-05 09:15',
      status: 'active',
      isChapterPractice: false
    },
    // 高级会计师 - 税务风险控制 (s2)
    {
      id: 'ls-005',
      subjectId: 's2',
      name: '章节练习',
      description: '按章节进行税务风险知识练习',
      sortOrder: 1,
      creator: '李老师',
      createdAt: '2025-01-06 10:00',
      status: 'active',
      isChapterPractice: true
    },
    {
      id: 'ls-006',
      subjectId: 's2',
      name: '历年真题',
      description: '历年税务风险案例真题',
      sortOrder: 2,
      creator: '李老师',
      createdAt: '2025-01-06 10:05',
      status: 'active',
      isChapterPractice: false
    },
    {
      id: 'ls-007',
      subjectId: 's2',
      name: '考前冲刺',
      description: '税务风险重点难点强化',
      sortOrder: 3,
      creator: '李老师',
      createdAt: '2025-01-06 10:10',
      status: 'active',
      isChapterPractice: false
    },
    // 高级会计师 - 内部控制优化 (s3)
    {
      id: 'ls-008',
      subjectId: 's3',
      name: '章节练习',
      description: '内部控制理论框架分章节练习',
      sortOrder: 1,
      creator: '王老师',
      createdAt: '2025-01-07 11:00',
      status: 'disabled',
      isChapterPractice: true
    },
    // 高级经济师 - 宏观经济分析 (s4)
    {
      id: 'ls-009',
      subjectId: 's4',
      name: '章节练习',
      description: '宏观经济分析章节练习',
      sortOrder: 1,
      creator: '赵老师',
      createdAt: '2025-01-08 14:00',
      status: 'active',
      isChapterPractice: true
    },
    {
      id: 'ls-010',
      subjectId: 's4',
      name: '历年真题',
      description: '宏观经济分析历年真题',
      sortOrder: 2,
      creator: '赵老师',
      createdAt: '2025-01-08 14:05',
      status: 'active',
      isChapterPractice: false
    },
    {
      id: 'ls-011',
      subjectId: 's4',
      name: '考前冲刺',
      description: '经济指标和政策重点强化',
      sortOrder: 3,
      creator: '赵老师',
      createdAt: '2025-01-08 14:10',
      status: 'active',
      isChapterPractice: false
    },
    // 中级会计师 - 成本管理实务 (s8)
    {
      id: 'ls-012',
      subjectId: 's8',
      name: '入学测试',
      description: '成本管理基础水平测试',
      sortOrder: 1,
      creator: '孙老师',
      createdAt: '2025-01-10 15:00',
      status: 'active',
      isChapterPractice: false
    },
    {
      id: 'ls-013',
      subjectId: 's8',
      name: '章节练习',
      description: '成本管理分章节练习',
      sortOrder: 2,
      creator: '孙老师',
      createdAt: '2025-01-10 15:05',
      status: 'active',
      isChapterPractice: true
    },
    {
      id: 'ls-014',
      subjectId: 's8',
      name: '历年真题',
      description: '成本管理历年考试真题',
      sortOrder: 3,
      creator: '孙老师',
      createdAt: '2025-01-10 15:10',
      status: 'active',
      isChapterPractice: false
    },
    {
      id: 'ls-015',
      subjectId: 's8',
      name: '考前冲刺',
      description: '成本管理重点难点冲刺',
      sortOrder: 4,
      creator: '孙老师',
      createdAt: '2025-01-10 15:15',
      status: 'active',
      isChapterPractice: false
    }
  ])

  // 构建项目树（与 chapterStore 的 projectTree 结构保持一致）
  const projectTree = computed<ProjectTreeNode[]>(() => {
    return projectStore.projects.map((project) => {
      const projectSubjects = projectStore.subjects.filter(
        (s) => s.projectId === project.id
      )

      const subjects: SubjectTreeNode[] = projectSubjects.map((subject) => ({
        id: subject.id,
        name: subject.name,
        type: 'subject'
      }))

      return {
        id: project.id,
        name: project.name,
        type: 'project',
        subjects
      }
    })
  })

  // 根据科目ID获取学习阶段列表（已排序）
  const getLearningStagesBySubject = (subjectId: string) => {
    return computed(() =>
      learningStages.value
        .filter((stage) => stage.subjectId === subjectId)
        .sort((a, b) => a.sortOrder - b.sortOrder)
    )
  }

  // 添加学习阶段
  const addLearningStage = (subjectId: string, data: LearningStageFormData) => {
    // 检查同科目下是否有重名的学习阶段
    const exists = learningStages.value.some(
      (stage) =>
        stage.subjectId === subjectId &&
        stage.name === data.name.trim() &&
        stage.status === 'active'
    )

    if (exists) {
      return { success: false, message: '该科目下已存在同名的学习阶段' }
    }

    // 计算新阶段的排序号（当前科目下最大 sortOrder + 1）
    const maxSortOrder = learningStages.value
      .filter((stage) => stage.subjectId === subjectId)
      .reduce((max, stage) => Math.max(max, stage.sortOrder), 0)

    const newStage: LearningStage = {
      id: `ls-${Date.now()}`,
      subjectId,
      name: data.name.trim(),
      description: data.description?.trim(),
      sortOrder: maxSortOrder + 1,
      creator: '当前用户', // 实际项目中应从登录信息获取
      createdAt: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      status: 'active',
      isChapterPractice: data.isChapterPractice
    }

    learningStages.value.push(newStage)
    return { success: true, data: newStage }
  }

  // 编辑学习阶段
  const updateLearningStage = (id: string, data: LearningStageFormData) => {
    const stage = learningStages.value.find((s) => s.id === id)
    if (!stage) {
      return { success: false, message: '学习阶段不存在' }
    }

    // 如果修改了名称,检查是否与同科目下其他阶段重名
    if (data.name.trim() !== stage.name) {
      const exists = learningStages.value.some(
        (s) =>
          s.id !== id &&
          s.subjectId === stage.subjectId &&
          s.name === data.name.trim() &&
          s.status === 'active'
      )

      if (exists) {
        return { success: false, message: '该科目下已存在同名的学习阶段' }
      }
    }

    stage.name = data.name.trim()
    stage.description = data.description?.trim()
    stage.isChapterPractice = data.isChapterPractice

    return { success: true }
  }

  // 删除学习阶段
  const deleteLearningStage = (id: string) => {
    const index = learningStages.value.findIndex((s) => s.id === id)
    if (index === -1) {
      return { success: false, message: '学习阶段不存在' }
    }

    const deletedStage = learningStages.value[index]
    learningStages.value.splice(index, 1)

    // 调整同科目下其他阶段的排序号
    learningStages.value
      .filter((s) => s.subjectId === deletedStage.subjectId && s.sortOrder > deletedStage.sortOrder)
      .forEach((s) => {
        s.sortOrder--
      })

    return { success: true }
  }

  // 调整学习阶段排序
  const updateSortOrder = (id: string, direction: 'up' | 'down') => {
    const stage = learningStages.value.find((s) => s.id === id)
    if (!stage) {
      return { success: false, message: '学习阶段不存在' }
    }

    // 获取同科目下的所有阶段（已排序）
    const sameSubjectStages = learningStages.value
      .filter((s) => s.subjectId === stage.subjectId)
      .sort((a, b) => a.sortOrder - b.sortOrder)

    const currentIndex = sameSubjectStages.findIndex((s) => s.id === id)

    if (direction === 'up' && currentIndex === 0) {
      return { success: false, message: '已经是第一个' }
    }

    if (direction === 'down' && currentIndex === sameSubjectStages.length - 1) {
      return { success: false, message: '已经是最后一个' }
    }

    // 交换排序号
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    const targetStage = sameSubjectStages[targetIndex]

    const tempOrder = stage.sortOrder
    stage.sortOrder = targetStage.sortOrder
    targetStage.sortOrder = tempOrder

    return { success: true }
  }

  // 切换学习阶段状态
  const toggleLearningStageStatus = (id: string) => {
    const stage = learningStages.value.find((s) => s.id === id)
    if (!stage) {
      return { success: false, message: '学习阶段不存在' }
    }

    // 如果是从禁用到启用,检查是否有同科目下同名的启用阶段
    if (stage.status === 'disabled') {
      const exists = learningStages.value.some(
        (s) =>
          s.id !== id &&
          s.subjectId === stage.subjectId &&
          s.name === stage.name &&
          s.status === 'active'
      )

      if (exists) {
        return { success: false, message: '该科目下已存在同名的启用学习阶段,启用失败' }
      }
    }

    // 切换状态
    stage.status = stage.status === 'active' ? 'disabled' : 'active'
    return { success: true }
  }

  return {
    learningStages,
    projectTree,
    getLearningStagesBySubject,
    addLearningStage,
    updateLearningStage,
    deleteLearningStage,
    updateSortOrder,
    toggleLearningStageStatus
  }
})
