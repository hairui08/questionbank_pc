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
          'project': true,
          'is-active': props.activeNodeId === project.id
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
              'subject': true,
              'is-active': props.activeNodeId === subject.id
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
              'chapter': true,
              'is-expanded': expandedChapters.has(chapter.id),
              'is-active': props.activeNodeId === chapter.id
            }"
              >
                <div class="tree-item-header" @click="toggleChapter(chapter.id); selectChapter(chapter)">
                  <span class="arrow" v-if="chapter.isChapterPractice || getSectionsByChapter(chapter.id).length > 0 || paperStore.getPapersByChapter(chapter.id).length > 0">{{ expandedChapters.has(chapter.id) ? '▼' : '▶' }}</span>
                  <span v-else class="arrow"></span>
                  <span class="node-icon">📖</span>
                  <span class="name">{{ chapter.name }}</span>
                  <div class="action-buttons">
                    <button v-if="!chapter.isChapterPractice" class="action-btn add-btn" title="添加" @click.stop="startAddSection(chapter.id)">➕</button>
                  </div>
                </div>
                <!-- 小节和试卷列表 -->
                <div v-if="chapter.isChapterPractice || getSectionsByChapter(chapter.id).length > 0 || paperStore.getPapersByChapter(chapter.id).length > 0" class="tree-children" style="padding-left: 20px;">
                  <!-- 小节列表（只在章节练习中显示） -->
                  <template v-if="chapter.isChapterPractice">
                    <div
                      v-for="section in getSectionsByChapter(chapter.id)"
                      :key="section.id"
                      class="tree-item"
                      :class="{ 
                'section': true,
                'is-expanded': expandedSections.has(section.id),
                'is-active': props.activeNodeId === section.id
              }"
                    >
                      <div class="tree-item-header" @click="toggleSection(section.id); selectSection(section)">
                        <span v-if="getSubSectionsBySection(section.id).length > 0" class="arrow">{{ expandedSections.has(section.id) ? '▼' : '▶' }}</span>
                        <span v-else class="arrow"></span>
                        <span class="node-icon">📑</span>
                        <span class="name">{{ section.name }}</span>
                      </div>
                      <!-- 子小节列表 -->
                      <div class="tree-children" style="padding-left:34px">
                        <div
                          v-for="subSection in getSubSectionsBySection(section.id)"
                          :key="subSection.id"
                          class="tree-item"
                          :class="{ 
                    'subsection': true,
                    'is-active': props.activeNodeId === subSection.id
                  }"
                        >
                          <div class="tree-item-header" @click="selectSubSection(subSection)">
                            <span class="node-icon">📄</span>
                            <span class="name">{{ subSection.name }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                  <!-- 试卷列表（新增的试卷显示在这里） -->
                  <div
                    v-for="paper in paperStore.getPapersByChapter(chapter.id)"
                    :key="paper.id"
                    class="tree-item"
                    :class="{ 
              'paper': true,
              'is-active': props.activeNodeId === paper.id
            }"
                  >
                    <div class="tree-item-header" @click="selectPaper(paper)">
                      <span class="node-icon">📄</span>
                      <span class="name">{{ paper.name }}</span>
                      <div class="action-buttons">
                        <button class="action-btn edit-btn" title="编辑" @click.stop="startEditPaper(paper, chapter.id)">✏️</button>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 添加小节表单 -->
                <div v-if="addingSection === chapter.id" class="add-section-form">
                  <div class="form-content">
                    <input 
                      type="text" 
                      v-model="newSectionName" 
                      placeholder="请输入试卷名称" 
                      class="section-input" 
                      @keyup.enter="confirmAddSection(chapter.id)"
                      autofocus
                    />
                    <div class="form-buttons">
                      <button class="form-btn confirm-btn" @click="confirmAddSection(chapter.id)">确定</button>
                      <button class="form-btn cancel-btn" @click="cancelAddSection">取消</button>
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
import { ref } from 'vue'
import { useChapterStore } from '@/stores/chapter'// 导入类型
import { usePaperStore } from '@/stores/paper'// 导入试卷store


const chapterStore = useChapterStore()
const paperStore = usePaperStore()

// 控制添加/编辑输入框显示的状态
const addingSection = ref<string | null>(null)
const newSectionName = ref('')
// 当前编辑的试卷信息
const editingPaper = ref<any | null>(null)

// Props
interface Props {
  // 用于添加页面跳转的完整层级数据
  filter?: {
    projectId?: string
    subjectId?: string
    chapterId?: string
    sectionId?: string
    subSectionId?: string
  }
  // 当前显示的选中节点ID
  activeNodeId?: string
}

const props = withDefaults(defineProps<Props>(), {
  filter: () => ({}),
  activeNodeId: ''
})

// Emits
const emit = defineEmits<{
  'subject-change': [subject: any]
  'project-change': [project: any]
  'chapter-change': [chapter: any]
  'section-change': [section: any]
  'subsection-change': [subSection: any]
  'paper-change': [paper: any]
  'filter-change': [filterState: any]
  'update:activeNodeId': [id: string]
}>()

// 项目树数据
const projectTree = chapterStore.projectTree

// 展开的项目集合（默认全部折叠）
const expandedProjects = ref<Set<string>>(new Set<string>())

// 展开的科目集合（默认全部折叠）
const expandedSubjects = ref<Set<string>>(new Set<string>())

// 展开的章节集合（默认全部折叠）
const expandedChapters = ref<Set<string>>(new Set<string>())

// 展开的小节集合（默认全部折叠）
const expandedSections = ref<Set<string>>(new Set<string>())

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
 * 切换小节展开/收起
 */
const toggleSection = (sectionId: string) => {
  if (expandedSections.value.has(sectionId)) {
    expandedSections.value.delete(sectionId)
  } else {
    expandedSections.value.add(sectionId)
  }
}

/**
 * 选择项目
 */
const selectProject = (project: any) => {
  console.log('选中项目:', project)
  // 发出事件
  emit('project-change', project)
  // 发出filter-change事件，包含完整的层级信息
  emit('filter-change', {
    type: 'project',
    projectId: project.id,
    subjectId: '',
    chapterId: '',
    sectionId: '',
    subSectionId: ''
  })
}

/**
 * 选择科目
 */
const selectSubject = (subject: any) => {
  console.log('选中科目:', subject)
  // 发出事件
  emit('subject-change', subject)
  // 发出filter-change事件，包含项目和科目信息
  // 查找当前科目的父项目
  const parentProject = projectTree.find(p => p.subjects.some(s => s.id === subject.id))
  emit('filter-change', {
    type: 'subject',
    projectId: parentProject?.id,
    subjectId: subject.id,
    chapterId: '',
    sectionId: '',
    subSectionId: ''
  })
}

/**
 * 选择章节
 */
const selectChapter = (chapter: any) => {
  console.log('选中章节:', chapter)
  // 发出事件
  emit('chapter-change', chapter)
  // 发出filter-change事件，包含完整层级信息
  // 查找当前章节的父科目和父项目
  let parentProjectId = ''
  let parentSubjectId = ''
  for (const project of projectTree) {
    for (const subject of project.subjects) {
      if (chapterStore.chapters.some(ch => ch.id === chapter.id && ch.subjectId === subject.id)) {
        parentProjectId = project.id
        parentSubjectId = subject.id
        break
      }
    }
    if (parentSubjectId) break
  }
  emit('filter-change', {
    type: 'chapter',
    projectId: parentProjectId,
    subjectId: parentSubjectId,
    chapterId: chapter.id,
    sectionId: '',
    subSectionId: ''
  })
}

/**
 * 选择小节
 */
const selectSection = (section: any) => {
  console.log('选中小节:', section)
  // 发出事件
  emit('section-change', section)
  // 发出filter-change事件，包含完整层级信息
  // 查找当前小节的父章节、父科目和父项目
  let parentProjectId = ''
  let parentSubjectId = ''
  let parentChapterId = ''
  // 先找章节
  const chapter = chapterStore.chapters.find(ch => ch.id === section.chapterId)
  if (chapter) {
    parentChapterId = chapter.id
    // 再找科目
    for (const project of projectTree) {
      for (const subject of project.subjects) {
        if (chapter.subjectId === subject.id) {
          parentSubjectId = subject.id
          parentProjectId = project.id
          break
        }
      }
      if (parentSubjectId) break
    }
  }
  emit('filter-change', {
    type: 'section',
    projectId: parentProjectId,
    subjectId: parentSubjectId,
    chapterId: parentChapterId,
    sectionId: section.id,
    subSectionId: ''
  })
}

/**
 * 选择子小节
 */
const selectSubSection = (subSection: any) => {
  console.log('选中子小节:', subSection)
  // 发出事件
  emit('subsection-change', subSection)
  // 发出filter-change事件，包含完整层级信息
  // 查找当前子小节的父小节、父章节、父科目和父项目
  let parentProjectId = ''
  let parentSubjectId = ''
  let parentChapterId = ''
  let parentSectionId = ''
  // 先找小节
  const section = chapterStore.sections.find(sec => sec.id === subSection.sectionId)
  if (section) {
    parentSectionId = section.id
    // 再找章节
    const chapter = chapterStore.chapters.find(ch => ch.id === section.chapterId)
    if (chapter) {
      parentChapterId = chapter.id
      // 再找科目
      for (const project of projectTree) {
        for (const subject of project.subjects) {
          if (chapter.subjectId === subject.id) {
            parentSubjectId = subject.id
            parentProjectId = project.id
            break
          }
        }
        if (parentSubjectId) break
      }
    }
  }
  emit('filter-change', {
    type: 'subsection',
    projectId: parentProjectId,
    subjectId: parentSubjectId,
    chapterId: parentChapterId,
    sectionId: parentSectionId,
    subSectionId: subSection.id
  })
}

/**
 * 选择试卷
 */
const selectPaper = (paper: any) => {
  console.log('选中试卷:', paper)
  // 发出事件
  emit('paper-change', paper)
  // 发出filter-change事件，包含完整层级信息
  // 查找当前试卷的父章节、父科目和父项目
  let parentProjectId = ''
  let parentSubjectId = ''
  let parentChapterId = paper.chapterId
  // 先找章节
  const chapter = chapterStore.chapters.find(ch => ch.id === paper.chapterId)
  if (chapter) {
    parentChapterId = chapter.id
    // 再找科目
    for (const project of projectTree) {
      for (const subject of project.subjects) {
        if (chapter.subjectId === subject.id) {
          parentSubjectId = subject.id
          parentProjectId = project.id
          break
        }
      }
      if (parentSubjectId) break
    }
  }
  emit('filter-change', {
    type: 'paper',
    projectId: parentProjectId,
    subjectId: parentSubjectId,
    chapterId: parentChapterId,
    sectionId: '',
    subSectionId: '',
    paperId: paper.id
  })
}

/**
 * 获取科目下的章节数量
 */
const getChapterCountBySubject = (subjectId: string) => {
  return chapterStore.chapters.filter(ch => ch.subjectId === subjectId && ch.status === 'active').length
}

/**
 * 获取科目下的章节列表
 */
const getChaptersBySubject = (subjectId: string) => {
  return chapterStore.chapters.filter(ch => ch.subjectId === subjectId && ch.status === 'active').sort((a, b) => a.order - b.order)
}

/**
 * 获取章节下的小节列表
 */
const getSectionsByChapter = (chapterId: string) => {
  return chapterStore.sections.filter(sec => sec.chapterId === chapterId && sec.status === 'active').sort((a, b) => a.order - b.order)
}

/**
 * 开始添加小节
 */
const startAddSection = (chapterId: string) => {
  addingSection.value = chapterId
  newSectionName.value = ''
  editingPaper.value = null
}

/**
 * 开始编辑试卷
 */
const startEditPaper = (paper: any, chapterId: string) => {
  addingSection.value = chapterId
  newSectionName.value = paper.name
  editingPaper.value = paper
}

/**
 * 确认添加或编辑试卷
 */
const confirmAddSection = (chapterId: string) => {
  if (newSectionName.value.trim()) {
    // 获取章节信息用于创建或更新试卷
    const chapter = chapterStore.chapters.find(ch => ch.id === chapterId)
    if (chapter) {
      try {
        if (editingPaper.value) {
            // 编辑模式：更新现有试卷
            // 调用store的更新方法，传递paperId和更新的名称
            paperStore.updatePaper(editingPaper.value.id, {
              name: newSectionName.value.trim()
            })
          } else {
          // 添加模式：创建新试卷
          const newPaper = {
            chapterId: chapter.id,
            chapterName: chapter.name,
            name: newSectionName.value.trim(),
            status: 'active' as const,
            order: paperStore.getPapersByChapter(chapterId).length + 1
          }
          // 调用store的addPaper方法添加试卷
          paperStore.addPaper(newPaper)
        }
        // 操作成功后重置状态
        cancelAddSection()
      } catch (error) {
        console.error(editingPaper.value ? '编辑试卷失败:' : '添加试卷失败:', error)
        // 可以在这里添加用户提示
      }
    }
  }
}

/**
 * 取消添加或编辑小节
 */
const cancelAddSection = () => {
  addingSection.value = null
  newSectionName.value = ''
  editingPaper.value = null
}

/**
 * 获取小节下的子小节列表
 */
const getSubSectionsBySection = (sectionId: string) => {
  return chapterStore.subSections.filter(subSec => subSec.sectionId === sectionId && subSec.status === 'active').sort((a, b) => a.order - b.order)
}
</script>

<style scoped>
.tree-panel {
  width: 330px;
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

.tree-item-header {
  /* 防止父节点因子节点悬停而触发hover效果 */
  pointer-events: auto;
}

.tree-item-header:hover {
  background-color: #f5f7fa;
  color: #303133;
}

/* 确保只有当前悬停的节点显示hover效果 */
.tree-item:hover > .tree-item-header {
  background-color: #f5f7fa;
  color: #303133;
}

/* 取消子节点hover时父节点的样式变化 */
.tree-item:hover > .tree-children .tree-item-header {
  background-color: transparent;
  color: #606266;
}

/* 只有当前直接悬停的节点才显示hover效果 */
.tree-item-header:hover {
  background-color: #f5f7fa !important;
  color: #303133 !important;
}

/* 选中状态样式 */
.tree-item.is-active > .tree-item-header {
  background-color: #ecf5ff !important;
  color: #409eff !important;
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

/* 操作按钮容器 */
.action-buttons {
  display: flex;
  gap: 4px;
  margin-left: 8px;
}

/* 操作按钮基础样式 */
.action-btn {
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
  padding: 0;
  background-color: transparent;
}

/* 添加按钮样式 */
.add-btn {
  color: #409eff;
}

.add-btn:hover {
  background-color: #ecf5ff;
}

/* 编辑按钮样式 */
.edit-btn {
  color: #67c23a;
}

.edit-btn:hover {
  background-color: #f0f9eb;
}

/* 添加小节表单样式 */
.add-section-form {
  padding: 6px 16px 6px 72px;
  background-color: #f9f9f9;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.form-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-input {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  transition: all 0.2s ease;
  max-width: 120px !important;
}

.section-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.form-buttons {
  display: flex;
  gap: 4px;
}

.form-btn {
  padding: 4px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-btn {
  background-color: #409eff;
  color: white;
}

.confirm-btn:hover {
  background-color: #66b1ff;
}

.cancel-btn {
  background-color: #909399;
  color: white;
}

.cancel-btn:hover {
  background-color: #a6a9ad;
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