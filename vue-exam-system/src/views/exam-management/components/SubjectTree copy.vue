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
              <span class="count">{{ (subject as any).learningStages?.filter((stage: any) => stage.status === 'active').length || 0 }}</span>
            </div>
            <!-- 学习阶段列表 -->
            <div class="tree-children">
              <div
                v-for="stage in (subject as any).learningStages || []"
                :key="stage.id"
                class="tree-item"
                :class="{ 
                  'stage': true,
                  'is-expanded': expandedStages.has(stage.id)
                }"
              >
                <div class="tree-item-header" @click="stage.isChapterPractice && toggleStage(stage.id); selectStage(stage)">
                  <span class="arrow">{{ expandedStages.has(stage.id) ? '▼' : '▶' }}</span>
                  <span class="node-icon">📖</span>
                  <span class="name">{{ stage.name }}</span>
                  <span class="count">{{ getStageQuestionCount(stage.id) }}</span>
                </div>
                <!-- 章节列表（仅章节练习显示） -->
                <div v-if="stage.isChapterPractice" class="tree-children">
                  <div
                    v-for="chapter in getChaptersBySubject(subject.id)"
                    :key="chapter.id"
                    class="tree-item"
                    :class="{ 
                      'chapter': true,
                      'is-expanded': expandedChapters.has(chapter.id)
                    }"
                  >
                    <div class="tree-item-header" @click="toggleChapter(chapter.id)">
                      <span class="arrow">{{ expandedChapters.has(chapter.id) ? '▼' : '▶' }}</span>
                      <span class="node-icon">📁</span>
                      <span class="name">{{ chapter.name }}</span>
                      <span class="count">{{ getSectionsByChapter(chapter.id).length }}</span>
                    </div>
                    <!-- 小节列表 -->
                    <div class="tree-children">
                      <div
                        v-for="section in getSectionsByChapter(chapter.id)"
                        :key="section.id"
                        class="tree-item"
                        :class="{ 
                          'section': true
                        }"
                      >
                        <div class="tree-item-header">
                          <span class="arrow">&nbsp;&nbsp;</span>
                          <span class="node-icon">📄</span>
                          <span class="name">{{ section.name }}</span>
                          <span class="count">{{ getSectionQuestionCount(section.id) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
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
import type { SubjectTreeNode } from '../types'
import type { LearningStage } from '@/views/learning-stage-management/types'

const chapterStore = useChapterStore()

// Props
interface Props {
  activeSubjectId?: string
  activeProjectId?: string
  activeStageId?: string
}

const props = withDefaults(defineProps<Props>(), {
  activeSubjectId: '',
  activeProjectId: '',
  activeStageId: ''
})

// 当前激活的ID（使用ref来跟踪，而不是直接使用props）
const activeProjectId = ref(props.activeProjectId)
const activeSubjectId = ref(props.activeSubjectId)
const activeStageId = ref(props.activeStageId)

// Emits
const emit = defineEmits<{
  'subject-change': [subject: SubjectTreeNode]
  'stage-change': [stage: any]
  'project-change': [project: any]
  'update:activeProjectId': [id: string]
  'update:activeSubjectId': [id: string]
  'update:activeStageId': [id: string]
}>()

// 监听props变化，更新内部状态
watch(() => props.activeProjectId, (newId) => {
  activeProjectId.value = newId
})

watch(() => props.activeSubjectId, (newId) => {
  activeSubjectId.value = newId
})

watch(() => props.activeStageId, (newId) => {
  activeStageId.value = newId
})

// Mock函数：获取学习阶段的试题数量
const getStageQuestionCount = (stageId: string): number => {
  // 实际项目中应从store获取，这里使用mock数据
  const mockCounts: Record<string, number> = {
    'ls-001': 3,
    'ls-002': 2,
    'ls-003': 2,
    'ls-004': 1,
    'ls-005': 2,
    'ls-006': 2,
    'ls-007': 1,
    'ls-008': 0,
    'ls-009': 1,
    'ls-010': 1,
    'ls-011': 1,
    'ls-012': 1,
    'ls-013': 2,
    'ls-014': 2,
    'ls-015': 1
  }
  return mockCounts[stageId] || 3
}

// Mock函数：获取小节的试题数量
const getSectionQuestionCount = (sectionId: string): number => {
  // 实际项目中应从store获取，这里使用mock数据
  const mockCounts: Record<string, number> = {
    'sec-001': 3,
    'sec-002': 3,
    'sec-003': 3,
    'sec-004': 3,
    'sec-005': 3,
    'sec-006': 3,
    'sec-007': 2,
    'sec-008': 2,
    'sec-009': 3,
    'sec-010': 3
  }
  return mockCounts[sectionId] || 3
}

// 获取科目下的章节列表
const getChaptersBySubject = (subjectId: string) => {
  return chapterStore.chapters.filter(ch => ch.subjectId === subjectId && ch.status === 'active').sort((a, b) => a.order - b.order)
}

// 获取章节下的小节列表
const getSectionsByChapter = (chapterId: string) => {
  return chapterStore.sections.filter(sec => sec.chapterId === chapterId && sec.status === 'active').sort((a, b) => a.order - b.order)
}

// 项目树数据
const projectTree = chapterStore.projectTree

// 展开的项目集合（默认展开第一个项目）
const expandedProjects = ref<Set<string>>(new Set([projectTree[0]?.id].filter(Boolean)))

// 展开的科目集合（默认展开财务战略管理和税务风险控制）
const expandedSubjects = ref<Set<string>>(new Set(['s1']))

// 展开的学习阶段集合
const expandedStages = ref<Set<string>>(new Set(['ls-001']))

// 展开的章节集合
const expandedChapters = ref<Set<string>>(new Set(['ch-001', 'ch-002', 'ch-003']))

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
 * 切换学习阶段展开/收起
 */
const toggleStage = (stageId: string) => {
  if (expandedStages.value.has(stageId)) {
    expandedStages.value.delete(stageId)
  } else {
    expandedStages.value.add(stageId)
  }
}

/**
 * 切换章节展开/收起
 */
const toggleChapter = (chapterId: string) => {
  if (expandedChapters.value.has(chapterId)) {
    expandedChapters.value.delete(chapterId)
  } else {
    expandedChapters.value.add(chapterId)
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
const selectSubject = (subject: SubjectTreeNode) => {
  activeSubjectId.value = subject.id
  emit('subject-change', subject)
  emit('update:activeSubjectId', subject.id)
}

/**
 * 选择学习阶段
 */
const selectStage = (stage: any) => {
  activeStageId.value = stage.id
  emit('stage-change', stage)
  emit('update:activeStageId', stage.id)
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