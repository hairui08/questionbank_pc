import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Project, Subject } from '@/views/project-management/types'

export const useProjectStore = defineStore('project', () => {
  // Mock数据
  const projects = ref<Project[]>([
    {
      id: 'p1',
      name: '高级会计师',
      status: 'active',
      order: 1,
      createdAt: '2025-09-15 09:30'
    },
    {
      id: 'p2',
      name: '高级经济师',
      status: 'active',
      order: 2,
      createdAt: '2025-08-22 14:10'
    },
    {
      id: 'p3',
      name: '中级经济师',
      status: 'disabled',
      order: 3,
      createdAt: '2025-07-02 11:05'
    },
    {
      id: 'p4',
      name: '中级会计师',
      status: 'active',
      order: 4,
      createdAt: '2025-05-18 10:20'
    }
  ])

  const subjects = ref<Subject[]>([
    {
      id: 's1',
      projectId: 'p1',
      projectName: '高级会计师',
      name: '财务战略管理',
      status: 'active',
      order: 1,
      createdAt: '2025-09-15 09:30'
    },
    {
      id: 's2',
      projectId: 'p1',
      projectName: '高级会计师',
      name: '税务风险控制',
      status: 'active',
      order: 2,
      createdAt: '2025-09-15 09:30'
    },
    {
      id: 's3',
      projectId: 'p1',
      projectName: '高级会计师',
      name: '内部控制优化',
      status: 'disabled',
      order: 3,
      createdAt: '2025-09-15 09:30'
    },
    {
      id: 's4',
      projectId: 'p2',
      projectName: '高级经济师',
      name: '宏观经济分析',
      status: 'active',
      order: 1,
      createdAt: '2025-08-22 14:10'
    },
    {
      id: 's5',
      projectId: 'p2',
      projectName: '高级经济师',
      name: '产业经济研究',
      status: 'active',
      order: 2,
      createdAt: '2025-08-22 14:10'
    },
    {
      id: 's6',
      projectId: 'p3',
      projectName: '中级经济师',
      name: '市场经济基础',
      status: 'disabled',
      order: 1,
      createdAt: '2025-07-02 11:05'
    },
    {
      id: 's7',
      projectId: 'p3',
      projectName: '中级经济师',
      name: '项目可行性评估',
      status: 'disabled',
      order: 2,
      createdAt: '2025-07-02 11:05'
    },
    {
      id: 's8',
      projectId: 'p4',
      projectName: '中级会计师',
      name: '成本管理实务',
      status: 'active',
      order: 1,
      createdAt: '2025-05-18 10:20'
    },
    {
      id: 's9',
      projectId: 'p4',
      projectName: '中级会计师',
      name: '财务报表编制',
      status: 'active',
      order: 2,
      createdAt: '2025-05-18 10:20'
    },
    {
      id: 's10',
      projectId: 'p4',
      projectName: '中级会计师',
      name: '审计与合规',
      status: 'active',
      order: 3,
      createdAt: '2025-05-18 10:20'
    }
  ])

  // 根据项目ID获取科目列表
  const getSubjectsByProjectId = (projectId: string) => {
    return subjects.value.filter(s => s.projectId === projectId)
  }

  // 添加项目
  const addProject = (project: Omit<Project, 'id' | 'createdAt'>) => {
    // 自动计算order：取所有项目中最大的order值+1
    const maxOrder = projects.value.length > 0
      ? Math.max(...projects.value.map(p => p.order))
      : 0

    const newProject: Project = {
      ...project,
      id: `p${Date.now()}`,
      order: maxOrder + 1, // 自动设置为最大值+1
      createdAt: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    projects.value.push(newProject)
    return newProject
  }

  // 更新项目
  const updateProject = (id: string, data: Partial<Project>) => {
    const index = projects.value.findIndex(p => p.id === id)
    if (index !== -1) {
      projects.value[index] = { ...projects.value[index], ...data }
      return true
    }
    return false
  }

  // 删除项目
  const deleteProject = (id: string) => {
    const index = projects.value.findIndex(p => p.id === id)
    if (index !== -1) {
      projects.value.splice(index, 1)
      // 同时删除该项目下的所有科目
      subjects.value = subjects.value.filter(s => s.projectId !== id)
      return true
    }
    return false
  }

  // 添加科目
  const addSubject = (subject: Omit<Subject, 'id' | 'createdAt'>) => {
    // 自动计算order：取同项目下所有科目中最大的order值+1
    const projectSubjects = subjects.value.filter(s => s.projectId === subject.projectId)
    const maxOrder = projectSubjects.length > 0
      ? Math.max(...projectSubjects.map(s => s.order))
      : 0

    const newSubject: Subject = {
      ...subject,
      id: `s${Date.now()}`,
      order: maxOrder + 1, // 自动设置为最大值+1
      createdAt: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    subjects.value.push(newSubject)
    return newSubject
  }

  // 更新科目
  const updateSubject = (id: string, data: Partial<Subject>) => {
    const index = subjects.value.findIndex(s => s.id === id)
    if (index !== -1) {
      subjects.value[index] = { ...subjects.value[index], ...data }
      return true
    }
    return false
  }

  // 删除科目
  const deleteSubject = (id: string) => {
    const index = subjects.value.findIndex(s => s.id === id)
    if (index !== -1) {
      subjects.value.splice(index, 1)
      return true
    }
    return false
  }

  // 切换项目状态
  const toggleProjectStatus = (id: string): { success: boolean; message?: string } => {
    const project = projects.value.find(p => p.id === id)
    if (!project) {
      return { success: false, message: '项目不存在' }
    }

    // 如果是从禁用到启用,检查是否有同名的启用项目
    if (project.status === 'disabled') {
      const exists = projects.value.some(
        p => p.id !== id && p.name === project.name && p.status === 'active'
      )
      if (exists) {
        return { success: false, message: '已存在同名的启用项目,启用失败' }
      }
    }

    // 切换状态
    project.status = project.status === 'active' ? 'disabled' : 'active'
    return { success: true }
  }

  // 切换科目状态
  const toggleSubjectStatus = (id: string): { success: boolean; message?: string } => {
    const subject = subjects.value.find(s => s.id === id)
    if (!subject) {
      return { success: false, message: '科目不存在' }
    }

    // 如果是从禁用到启用,检查是否有同项目下同名的启用科目
    if (subject.status === 'disabled') {
      const exists = subjects.value.some(
        s => s.id !== id &&
             s.projectId === subject.projectId &&
             s.name === subject.name &&
             s.status === 'active'
      )
      if (exists) {
        return { success: false, message: '该项目下已存在同名的启用科目,启用失败' }
      }
    }

    // 切换状态
    subject.status = subject.status === 'active' ? 'disabled' : 'active'
    return { success: true }
  }

  // 重新排序项目（拖拽后调用）
  const reorderProjects = (draggedId: string, targetId: string) => {
    const draggedProject = projects.value.find(p => p.id === draggedId)
    const targetProject = projects.value.find(p => p.id === targetId)

    if (!draggedProject || !targetProject) return

    const draggedOrder = draggedProject.order
    const targetOrder = targetProject.order

    // 交换order值
    draggedProject.order = targetOrder
    targetProject.order = draggedOrder

    // 按order重新排序数组
    projects.value.sort((a, b) => a.order - b.order)
  }

  // 重新排序科目（拖拽后调用）
  const reorderSubjects = (draggedId: string, targetId: string) => {
    const draggedSubject = subjects.value.find(s => s.id === draggedId)
    const targetSubject = subjects.value.find(s => s.id === targetId)

    if (!draggedSubject || !targetSubject) return

    const draggedOrder = draggedSubject.order
    const targetOrder = targetSubject.order

    // 交换order值
    draggedSubject.order = targetOrder
    targetSubject.order = draggedOrder

    // 按order重新排序数组
    subjects.value.sort((a, b) => a.order - b.order)
  }

  return {
    projects,
    subjects,
    // 为题库管理页面提供兼容的 mock 数据别名
    mockProjects: projects,
    mockSubjects: subjects,
    getSubjectsByProjectId,
    addProject,
    updateProject,
    deleteProject,
    addSubject,
    updateSubject,
    deleteSubject,
    toggleProjectStatus,
    toggleSubjectStatus,
    reorderProjects,
    reorderSubjects
  }
})
