/**
 * 学习阶段管理相关类型定义
 */

// 学习阶段接口
export interface LearningStage {
  id: string
  subjectId: string      // 所属科目ID
  name: string           // 阶段名称
  description?: string   // 阶段描述
  sortOrder: number      // 排序序号
  creator: string        // 创建人
  createdAt: string      // 创建时间
  status: 'active' | 'disabled'  // 状态
}

// 学习阶段表单数据接口
export interface LearningStageFormData {
  name: string
  description?: string
}

// 科目树节点接口（与章节管理保持一致）
export interface SubjectTreeNode {
  id: string
  name: string
  type: 'subject'
}

// 项目树节点接口
export interface ProjectTreeNode {
  id: string
  name: string
  type: 'project'
  subjects: SubjectTreeNode[]
}
