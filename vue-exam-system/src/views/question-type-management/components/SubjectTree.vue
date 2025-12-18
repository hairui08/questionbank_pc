<template>
  <div class="tree-panel">
    <h4>科目导航</h4>
    <div class="search-box">
      <input type="text" placeholder="搜索分类..." class="search-input" />
    </div>
    <div
      v-for="project in projectTree"
      :key="project.id"
      class="tree-project"
      :class="{ 'is-expanded': expandedProjects.has(project.id) }"
    >
      <div class="tree-project-header" @click="toggleProject(project.id)">
        <span class="arrow">▼</span>
        <span class="icon folder"></span>
        <span class="name">{{ project.name }}</span>
        <span class="count">{{ project.subjects.length }}</span>
      </div>
      <div class="tree-subjects">
        <div
          v-for="subject in project.subjects"
          :key="subject.id"
          class="tree-subject"
          :class="{ 'is-active': currentActiveSubjectId === subject.id }"
          @click="selectSubject(subject)"
          style="cursor: pointer; padding: 10px;"
        >
          <span class="arrow"></span>
          <span class="icon subject"></span>
          <span class="name">{{ subject.name }}</span>
          <span class="count">{{ subject.count || 0 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuestionTypeStore } from '@/stores/questionType'
import type { SubjectTreeNode } from '../types'

const questionTypeStore = useQuestionTypeStore()

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
const projectTree = computed(() => questionTypeStore.projectTree)

// 确保activeSubjectId是响应式的
const currentActiveSubjectId = computed(() => props.activeSubjectId || '')

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
  console.log('选择科目:', subject)
  emit('subject-change', subject)
}
</script>

<style scoped>
.tree-panel {
  width: 280px;
  background: #ffffff;
  border: 1px solid #e0e6ed;
  border-radius: 8px;
  overflow: hidden;
}

.tree-panel h4 {
  margin: 0;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.search-box {
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e6ed;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #cdd5e0;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.tree-project {
  margin: 0;
}

.tree-project-header {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.tree-project-header:hover {
  background-color: #f5f7fa;
}

.tree-project-header .arrow {
  width: 16px;
  margin-right: 4px;
  font-size: 10px;
  color: #6b7280;
  transition: transform 0.3s ease;
}

.tree-project:not(.is-expanded) .tree-project-header .arrow {
  transform: rotate(-90deg);
}

.tree-project-header .icon {
  margin-right: 8px;
  font-size: 14px;
}

.icon.folder::before {
  content: "📁";
}

.icon.subject::before {
  content: "📚";
}

.tree-project-header .name {
  font-weight: 600;
  font-size: 13px;
  color: #374151;
  flex: 1;
}

.tree-subjects {
  display: none;
  margin-left: 26px;
}

.tree-project.is-expanded .tree-subjects {
  display: block;
}

.tree-subject {
  display: flex;
  align-items: center;
  padding: 6px 16px 6px 44px;
  cursor: pointer;
  margin: 0;
  font-size: 13px;
  color: #4b5563;
  transition: all 0.2s ease;
}

.tree-subject:hover {
  background-color: #f0f7ff;
  color: #3b82f6;
}

.tree-subject.is-active {
  background-color: #eff6ff;
  color: #3b82f6;
  font-weight: 500;
}

.tree-subject .icon {
  margin-right: 8px;
  font-size: 13px;
}

.tree-subject .name {
  flex: 1;
}

.count {
  font-size: 12px;
  color: #9ca3af;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}
</style>
