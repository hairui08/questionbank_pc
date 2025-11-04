<template>
  <div class="project-subject-tree">
    <div class="tree-header">
      <h3>项目科目</h3>
    </div>
    <div class="tree-content">
      <div
        v-for="project in projects"
        :key="project.id"
        class="tree-node project-node"
      >
        <!-- 项目节点 -->
        <div
          class="node-label"
          :class="{ expanded: expandedProjects.includes(project.id) }"
          @click="toggleProject(project.id)"
        >
          <span class="expand-icon">{{ expandedProjects.includes(project.id) ? '▼' : '▶' }}</span>
          <span class="node-name">{{ project.name }}</span>
          <span class="exam-count">({{ getProjectExamCount(project.id) }})</span>
        </div>

        <!-- 科目列表 -->
        <div
          v-show="expandedProjects.includes(project.id)"
          class="subject-list"
        >
          <div
            v-for="subject in getSubjectsByProject(project.id)"
            :key="subject.id"
            class="tree-node subject-node"
            :class="{ active: selectedSubjectId === subject.id }"
            @click="selectSubject(project.id, subject.id)"
          >
            <span class="node-name">{{ subject.name }}</span>
            <span class="exam-count">({{ getSubjectExamCount(subject.id) }})</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProjectStore } from '@/stores/project'
import { useMarkingStore } from '@/stores/marking'

// Emits
interface Emits {
  (e: 'select', projectId: string, subjectId: string): void
}

const emit = defineEmits<Emits>()

// Stores
const projectStore = useProjectStore()
const markingStore = useMarkingStore()

// 项目和科目数据
const projects = computed(() => projectStore.projects.filter((p) => p.status === 'active'))

// 当前展开的项目ID列表
const expandedProjects = ref<string[]>([])

// 当前选中的科目ID
const selectedSubjectId = ref<string>('')

/**
 * 获取项目下的科目列表
 */
const getSubjectsByProject = (projectId: string) => {
  return projectStore.subjects.filter(
    (s) => s.projectId === projectId && s.status === 'active'
  )
}

/**
 * 获取项目下的考试数量
 */
const getProjectExamCount = (projectId: string): number => {
  return markingStore.getExamCount(projectId)
}

/**
 * 获取科目下的考试数量
 */
const getSubjectExamCount = (subjectId: string): number => {
  return markingStore.getExamCount(undefined, subjectId)
}

/**
 * 切换项目展开/折叠状态
 */
const toggleProject = (projectId: string) => {
  const index = expandedProjects.value.indexOf(projectId)
  if (index > -1) {
    expandedProjects.value.splice(index, 1)
  } else {
    expandedProjects.value.push(projectId)
  }
}

/**
 * 选择科目
 */
const selectSubject = (projectId: string, subjectId: string) => {
  selectedSubjectId.value = subjectId
  emit('select', projectId, subjectId)
}
</script>

<style scoped>
.project-subject-tree {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  overflow: hidden;
}

.tree-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--panel-border);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.tree-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.tree-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}

/* 树节点 */
.tree-node {
  cursor: pointer;
  user-select: none;
}

/* 项目节点 */
.project-node {
  margin-bottom: 8px;
}

.node-label {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  color: var(--primary-text);
  transition: background-color 0.2s;
}

.node-label:hover {
  background-color: var(--row-hover);
}

.expand-icon {
  display: inline-block;
  width: 16px;
  margin-right: 8px;
  font-size: 12px;
  color: var(--secondary-text);
  transition: transform 0.2s;
}

.node-label.expanded .expand-icon {
  transform: rotate(0deg);
}

.node-name {
  flex: 1;
  color: var(--primary-text);
}

.exam-count {
  margin-left: 8px;
  font-size: 12px;
  font-weight: 400;
  color: var(--secondary-text);
}

/* 科目列表 */
.subject-list {
  padding-left: 24px;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 科目节点 */
.subject-node {
  display: flex;
  align-items: center;
  padding: 8px 20px;
  font-size: 13px;
  color: var(--secondary-text);
  transition: all 0.2s;
}

.subject-node:hover {
  background-color: var(--row-hover);
  color: var(--primary-text);
}

.subject-node.active {
  background: linear-gradient(90deg, rgba(79, 119, 255, 0.1) 0%, transparent 100%);
  border-left: 3px solid var(--accent);
  color: var(--accent);
  font-weight: 500;
}

.subject-node .node-name {
  flex: 1;
}

/* 滚动条样式 */
.tree-content::-webkit-scrollbar {
  width: 6px;
}

.tree-content::-webkit-scrollbar-track {
  background: transparent;
}

.tree-content::-webkit-scrollbar-thumb {
  background: #d0d0d0;
  border-radius: 3px;
}

.tree-content::-webkit-scrollbar-thumb:hover {
  background: #b0b0b0;
}
</style>
