<template>
  <div class="tree-panel">
    <h4>分类导航</h4>
    <div class="search-box">
      <input type="text" placeholder="搜索分类..." class="search-input" />
    </div>
    <div class="tree-content">
      <!-- 项目列表 -->
      <div
        v-for="project in projectTree"
        :key="project.id"
        class="tree-item"
        :class="{ 
          'is-expanded': expandedProjects.has(project.id),
          'project': true
        }"
      >
        <div class="tree-item-header" @click="toggleProject(project.id); selectProject(project)">
          <span class="arrow">{{ expandedProjects.has(project.id) ? '▼' : '▶' }}</span>
          <span class="node-icon">📁</span>
          <span class="name">{{ project.name }}</span>
          <span class="count">{{ project.subjects.length }}</span>
        </div>
        <!-- 科目列表 -->
        <div class="tree-children">
          <div
            v-for="subject in project.subjects"
            :key="subject.id"
            class="tree-item"
            :class="{ 
              'is-expanded': expandedSubjects.has(subject.id),
              'subject': true
            }"
          >
            <div class="tree-item-header" @click="toggleSubject(subject.id); selectSubject(subject)">
              <span class="arrow">{{ expandedSubjects.has(subject.id) ? '▼' : '▶' }}</span>
              <span class="node-icon">📚</span>
              <span class="name">{{ subject.name }}</span>
              <span class="count">{{ getChapterCountBySubject(subject.id) }}</span>
            </div>
            <!-- 章节列表 -->
            <div class="tree-children">
              <div
                v-for="chapter in getChaptersBySubject(subject.id)"
                :key="chapter.id"
                class="tree-item"
                :class="{ 
                  'chapter': true
                }"
              >
                <div class="tree-item-header" @click="selectChapter(chapter)">
                  <span class="node-icon">📖</span>
                  <span class="name">{{ chapter.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useChapterStore } from '@/stores/chapter'// 导入类型

const chapterStore = useChapterStore()

// Props
interface Props {
  activeSubjectId?: string
  activeProjectId?: string
  activeChapterId?: string
}

const props = withDefaults(defineProps<Props>(), {
  activeSubjectId: '',
  activeProjectId: '',
  activeChapterId: ''
})

// 当前激活的ID（使用ref来跟踪，而不是直接使用props）
const activeProjectId = ref(props.activeProjectId)
const activeSubjectId = ref(props.activeSubjectId)
const activeChapterId = ref(props.activeChapterId)

// Emits
const emit = defineEmits<{
  'subject-change': [subject: any]
  'project-change': [project: any]
  'chapter-change': [chapter: any]
  'update:activeProjectId': [id: string]
  'update:activeSubjectId': [id: string]
  'update:activeChapterId': [id: string]
}>()

// 监听props变化，更新内部状态
watch(() => props.activeProjectId, (newId) => {
  activeProjectId.value = newId
})

watch(() => props.activeSubjectId, (newId) => {
  activeSubjectId.value = newId
})

watch(() => props.activeChapterId, (newId) => {
  activeChapterId.value = newId
})

// 项目树数据
const projectTree = chapterStore.projectTree

// 展开的项目集合（默认展开第一个项目）
const expandedProjects = ref<Set<string>>(new Set<string>(projectTree[0]?.id ? [projectTree[0].id] : []))

// 展开的科目集合（默认展开财务战略管理和税务风险控制）
const expandedSubjects = ref<Set<string>>(new Set(['s1']))

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
 * 切换科目展开/收起
 */
const toggleSubject = (subjectId: string) => {
  if (expandedSubjects.value.has(subjectId)) {
    expandedSubjects.value.delete(subjectId)
  } else {
    expandedSubjects.value.add(subjectId)
  }
}

/**
 * 选择项目
 */
const selectProject = (project: any) => {
  activeProjectId.value = project.id
  emit('project-change', project)
  emit('update:activeProjectId', project.id)
}

/**
 * 选择科目
 */
const selectSubject = (subject: any) => {
  activeSubjectId.value = subject.id
  emit('subject-change', subject)
  emit('update:activeSubjectId', subject.id)
}

/**
 * 选择章节
 */
const selectChapter = (chapter: any) => {
  activeChapterId.value = chapter.id
  emit('chapter-change', chapter)
  emit('update:activeChapterId', chapter.id)
}

/**
 * 获取科目下的章节数量（只统计isChapterPractice: false的数据）
 */
const getChapterCountBySubject = (subjectId: string) => {
  return chapterStore.chapters.filter(ch => ch.subjectId === subjectId && ch.status === 'active' && !ch.isChapterPractice).length
}

/**
 * 获取科目下的章节列表（只返回isChapterPractice: false的数据）
 */
const getChaptersBySubject = (subjectId: string) => {
  return chapterStore.chapters.filter(ch => ch.subjectId === subjectId && ch.status === 'active' && !ch.isChapterPractice).sort((a, b) => a.order - b.order)
}
</script>

<style scoped>
.tree-panel {
  width: 280px;
  background: #ffffff;
  border: 1px solid #e0e6ed;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.tree-panel h4 {
  margin: 0;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-bottom: none;
}

.search-box {
  padding: 10px 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.search-input {
  width: 100%;
  padding: 7px 11px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  transition: all 0.2s ease;
  background-color: #ffffff;
}

.search-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

/* 树内容容器 */
.tree-content {
  max-height: 500px;
  overflow-y: auto;
}

/* 树节点基础样式 */
.tree-item {
  position: relative;
}

.tree-item-header {
  display: flex;
  align-items: center;
  padding: 6px 16px;
  cursor: pointer;
  font-size: 13px;
  color: #606266;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  background-color: transparent;
}

.tree-item-header:hover {
  background-color: #f5f7fa;
  color: #303133;
}

/* 项目样式 */
.tree-item.project .tree-item-header {
  font-weight: 600;
  background-color: transparent;
  padding-left: 16px;
}

/* 科目样式 */
.tree-item.subject .tree-item-header {
  padding-left: 32px;
  background-color: transparent;
}

/* 学习阶段样式 */
.tree-item.stage .tree-item-header {
  padding-left: 52px;
  font-size: 13px;
  color: #606266;
}

/* 章节样式 */
.tree-item.chapter .tree-item-header {
  padding-left: 52px;
  font-size: 13px;
  color: #606266;
}

/* 小节样式 */
.tree-item.section .tree-item-header {
  padding-left: 72px;
  font-size: 13px;
  color: #606266;
}

/* 箭头样式 */
.arrow {
  width: 12px;
  margin-right: 4px;
  font-size: 8px;
  color: #909399;
  transition: transform 0.3s ease;
  display: inline-block;
  text-align: center;
}

/* 节点图标样式 */
.node-icon {
  margin-right: 6px;
  font-size: 14px;
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* 文件夹图标 */
.folder-icon {
  color: #f59e0b;
}

/* 书籍图标 */
.book-icon {
  color: #3b82f6;
}

/* 章节图标 */
.chapter-icon {
  color: #10b981;
}

/* 文档图标 */
.document-icon {
  color: #6b7280;
}

/* 名称样式 */
.name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 数量样式 */
.count {
  font-size: 12px;
  color: #909399;
  background: transparent;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
  margin-left: auto;
}

/* 子节点容器 */
.tree-children {
  display: none;
}

/* 展开状态显示子节点 */
.tree-item.is-expanded > .tree-children {
  display: block;
}

/* 滚动条样式 */
.tree-content::-webkit-scrollbar {
  width: 6px;
}

.tree-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.tree-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.tree-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>