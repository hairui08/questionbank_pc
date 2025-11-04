<template>
  <div class="tree-panel">
    <h4>项目科目导航</h4>
    <div
      v-for="project in projectTree"
      :key="project.id"
      class="tree-project"
      :class="{ 'is-expanded': expandedProjects.has(project.id) }"
    >
      <div class="tree-project-header" @click="toggleProject(project.id)">
        <span class="arrow">▶</span>
        <span class="name">{{ project.name }}</span>
      </div>
      <div class="tree-subjects">
        <div
          v-for="subject in project.subjects"
          :key="subject.id"
          class="tree-subject"
          :class="{ 'is-active': activeSubjectId === subject.id }"
          @click="selectSubject(subject)"
        >
          {{ subject.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useKnowledgePointStore } from '@/stores/knowledgePoint'
import type { SubjectTreeNode } from '../types'

const knowledgePointStore = useKnowledgePointStore()

// Props
interface Props {
  activeSubjectId?: string
}

const props = withDefaults(defineProps<Props>(), {
  activeSubjectId: ''
})

// Emits
const emit = defineEmits<{
  'subject-change': [subject: SubjectTreeNode]
}>()

// 展开的项目集合（默认展开第一个项目）
const expandedProjects = ref<Set<string>>(new Set(['p1']))

// 项目树数据
const projectTree = knowledgePointStore.projectTree

/**
 * 切换项目展开/收起
 */
const toggleProject = (projectId: string) => {
  if (expandedProjects.value.has(projectId)) {
    expandedProjects.value.delete(projectId)
  } else {
    // 只允许一个项目展开
    expandedProjects.value.clear()
    expandedProjects.value.add(projectId)
  }
}

/**
 * 选择科目
 */
const selectSubject = (subject: SubjectTreeNode) => {
  emit('subject-change', subject)
}
</script>

<style scoped>
.tree-panel {
  width: 280px;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 16px;
  height: fit-content;
}

.tree-panel h4 {
  margin: 0 0 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-text);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.tree-project {
  margin-bottom: 8px;
}

.tree-project-header {
  display: flex;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.tree-project-header:hover {
  background-color: #f5f5f5;
}

.tree-project-header .arrow {
  width: 16px;
  margin-right: 8px;
  font-size: 10px;
  color: var(--accent);
  transition: transform 0.3s ease;
}

.tree-project.is-expanded .tree-project-header .arrow {
  transform: rotate(90deg);
}

.tree-project-header .name {
  font-weight: 600;
  font-size: 13px;
  color: var(--primary-text);
}

.tree-subjects {
  display: none;
  padding-left: 20px;
  margin-top: 4px;
}

.tree-project.is-expanded .tree-subjects {
  display: block;
}

.tree-subject {
  padding: 6px 8px;
  cursor: pointer;
  border-radius: 4px;
  margin: 2px 0;
  font-size: 13px;
  color: var(--secondary-text);
  transition: all 0.2s ease;
}

.tree-subject:hover {
  background-color: #f0f7ff;
  color: var(--accent);
}

.tree-subject.is-active {
  background-color: #d9ebff;
  color: var(--accent);
  font-weight: 600;
}
</style>
