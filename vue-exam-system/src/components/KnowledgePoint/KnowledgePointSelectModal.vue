<template>
  <BaseModal
    :visible="isVisible"
    title="选择知识点"
    width="800px"
    @update:visible="isVisible = $event"
    @close="handleClose"
  >
    <div class="knowledge-point-select">
      <!-- 项目和科目信息(只读) -->
      <div class="info-bar">
        <div class="info-item">
          <span class="info-icon">📁</span>
          <span class="info-label">项目:</span>
          <span class="info-value">{{ currentProjectName }}</span>
        </div>
        <div class="info-divider">|</div>
        <div class="info-item">
          <span class="info-icon">📚</span>
          <span class="info-label">科目:</span>
          <span class="info-value">{{ currentSubjectName }}</span>
        </div>
      </div>

      <!-- 主内容区: 左右分栏 -->
      <div class="content-panel">
        <!-- 左侧: 章节树形菜单 -->
        <div class="chapter-tree-panel">
          <div class="panel-header">
            <span class="panel-title">章节筛选</span>
            <button class="btn-clear-filter" @click="clearChapterSelection">清空</button>
          </div>
          <div class="tree-container">
            <div v-for="chapter in chapters" :key="chapter.id" class="tree-node chapter-node">
              <!-- 章节复选框 -->
              <div class="tree-item">
                <input
                  type="checkbox"
                  :id="`chapter-${chapter.id}`"
                  :value="chapter.id"
                  :checked="selectedChapterIds.includes(chapter.id)"
                  @change="toggleChapterSelection(chapter.id)"
                />
                <span
                  v-if="chapter.sections && chapter.sections.length > 0"
                  class="expand-icon"
                  @click="toggleExpand(chapter.id)"
                >
                  {{ expandedChapters.includes(chapter.id) ? '▼' : '▶' }}
                </span>
                <label :for="`chapter-${chapter.id}`">{{ chapter.name }}</label>
              </div>

              <!-- 小节列表(展开时显示) -->
              <div
                v-if="expandedChapters.includes(chapter.id) && chapter.sections && chapter.sections.length > 0"
                class="tree-children"
              >
                <div v-for="section in chapter.sections" :key="section.id" class="tree-node section-node">
                  <div class="tree-item">
                    <input
                      type="checkbox"
                      :id="`section-${section.id}`"
                      :value="section.id"
                      :checked="selectedChapterIds.includes(section.id)"
                      @change="toggleChapterSelection(section.id)"
                    />
                    <label :for="`section-${section.id}`">{{ section.name }}</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧: 知识点列表 -->
        <div class="knowledge-point-panel">
          <div class="panel-header">
            <span class="panel-title">知识点列表 ({{ filteredKnowledgePoints.length }})</span>
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索知识点..."
              class="search-input-inline"
            />
          </div>

          <div class="knowledge-point-list">
            <!-- 知识点项(扁平列表,不分组) -->
            <template v-if="filteredKnowledgePoints.length > 0">
              <div
                v-for="kp in filteredKnowledgePoints"
                :key="kp.id"
                class="knowledge-point-item"
                :class="{ 'is-selected': localSelectedIds.includes(kp.id) }"
                @click="toggleSelection(kp.id)"
              >
                <input
                  type="checkbox"
                  :id="`kp-${kp.id}`"
                  :checked="localSelectedIds.includes(kp.id)"
                  @click.stop="toggleSelection(kp.id)"
                />
                <label :for="`kp-${kp.id}`">{{ kp.name }}</label>
              </div>
            </template>

            <!-- 空状态 -->
            <div v-else class="empty-state">
              <p>{{ searchKeyword ? '未找到匹配的知识点' : (selectedChapterIds.length > 0 ? '所选章节下暂无知识点' : '当前科目下暂无知识点数据') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 已选知识点展示 -->
      <div v-if="localSelectedIds.length > 0" class="selected-section">
        <div class="selected-header">
          <span>已选 {{ localSelectedIds.length }} 个知识点</span>
          <button class="btn-clear" @click="clearAll">清空</button>
        </div>
        <div class="selected-tags">
          <span
            v-for="id in localSelectedIds"
            :key="id"
            class="selected-tag"
          >
            {{ getKnowledgePointName(id) }}
            <button class="remove-btn" @click="removeSelection(id)">×</button>
          </span>
        </div>
      </div>
    </div>

    <template #footer>
      <button class="btn secondary" @click="handleClose">取消</button>
      <button class="btn primary" @click="handleConfirm">确定</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useKnowledgePointStore } from '@/stores/knowledgePoint'
import { useProjectStore } from '@/stores/project'
import { useChapterStore } from '@/stores/chapter'
import BaseModal from '@/components/Modal/BaseModal.vue'
import type { KnowledgePoint } from '@/views/knowledge-point-management/types'

// Props
interface Props {
  visible: boolean
  projectId: string // 锁定的项目ID (必填)
  subjectId: string // 锁定的科目ID (必填)
  selectedIds?: string[] // 已选中的知识点ID列表
}

const props = withDefaults(defineProps<Props>(), {
  selectedIds: () => []
})

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean]
  submit: [knowledgePointIds: string[]]
}>()

const knowledgePointStore = useKnowledgePointStore()
const projectStore = useProjectStore()
const chapterStore = useChapterStore()

// 本地状态
const isVisible = ref(props.visible)
const searchKeyword = ref('')
const localSelectedIds = ref<string[]>([...props.selectedIds])
const selectedChapterIds = ref<string[]>([]) // 选中的章节/小节ID
const expandedChapters = ref<string[]>([]) // 展开的章节ID

// 当前项目名称
const currentProjectName = computed(() => {
  const project = projectStore.projects.find(p => p.id === props.projectId)
  return project?.name || '未知项目'
})

// 当前科目名称
const currentSubjectName = computed(() => {
  const subject = projectStore.subjects.find(s => s.id === props.subjectId)
  return subject?.name || '未知科目'
})

/**
 * 当前科目下的章节列表(包含小节)
 */
const chapters = computed(() => {
  const chapterList = chapterStore.chapters.filter(c => c.subjectId === props.subjectId)
  return chapterList.map(chapter => ({
    ...chapter,
    sections: chapterStore.sections.filter(s => s.chapterId === chapter.id)
  }))
})

/**
 * 切换章节/小节选择
 */
const toggleChapterSelection = (id: string) => {
  const index = selectedChapterIds.value.indexOf(id)
  if (index > -1) {
    selectedChapterIds.value.splice(index, 1)
  } else {
    selectedChapterIds.value.push(id)
  }
}

/**
 * 切换章节展开/收起
 */
const toggleExpand = (chapterId: string) => {
  const index = expandedChapters.value.indexOf(chapterId)
  if (index > -1) {
    expandedChapters.value.splice(index, 1)
  } else {
    expandedChapters.value.push(chapterId)
  }
}

/**
 * 清空章节筛选
 */
const clearChapterSelection = () => {
  selectedChapterIds.value = []
}

/**
 * 获取当前科目下的所有知识点,并根据选中的章节筛选
 */
const allKnowledgePoints = computed(() => {
  // 获取当前科目的所有知识点
  let kps = knowledgePointStore.knowledgePoints.filter((kp: KnowledgePoint) => kp.subjectId === props.subjectId)

  // 如果选中了章节,只显示这些章节的知识点
  if (selectedChapterIds.value.length > 0) {
    kps = kps.filter((kp: KnowledgePoint) =>
      kp.chapterIds?.some(cId => selectedChapterIds.value.includes(cId))
    )
  }

  return kps
})

/**
 * 根据搜索关键词过滤知识点
 */
const filteredKnowledgePoints = computed(() => {
  if (!searchKeyword.value.trim()) {
    return allKnowledgePoints.value
  }
  const keyword = searchKeyword.value.toLowerCase()
  return allKnowledgePoints.value.filter((kp: KnowledgePoint) =>
    kp.name.toLowerCase().includes(keyword)
  )
})

/**
 * 按科目分组
 */
const groupedKnowledgePoints = computed(() => {
  const groups = new Map<string, { subjectId: string; subjectName: string; knowledgePoints: KnowledgePoint[] }>()

  filteredKnowledgePoints.value.forEach((kp: KnowledgePoint) => {
    if (!groups.has(kp.subjectId)) {
      const subject = projectStore.subjects.find(s => s.id === kp.subjectId)
      groups.set(kp.subjectId, {
        subjectId: kp.subjectId,
        subjectName: subject?.name || '未知科目',
        knowledgePoints: []
      })
    }
    groups.get(kp.subjectId)?.knowledgePoints.push(kp)
  })

  return Array.from(groups.values())
})

/**
 * 监听visible变化
 */
watch(
  () => props.visible,
  (newVal) => {
    isVisible.value = newVal
    if (newVal) {
      // 重置本地状态
      searchKeyword.value = ''
      localSelectedIds.value = [...props.selectedIds]
      selectedChapterIds.value = [] // 清空章节筛选

      // 默认展开所有章节
      expandedChapters.value = chapters.value.map(c => c.id)
    }
  }
)

watch(isVisible, (newVal) => {
  emit('update:visible', newVal)
})

/**
 * 切换选择状态
 */
const toggleSelection = (id: string) => {
  const index = localSelectedIds.value.indexOf(id)
  if (index > -1) {
    localSelectedIds.value.splice(index, 1)
  } else {
    localSelectedIds.value.push(id)
  }
}

/**
 * 移除单个选择
 */
const removeSelection = (id: string) => {
  const index = localSelectedIds.value.indexOf(id)
  if (index > -1) {
    localSelectedIds.value.splice(index, 1)
  }
}

/**
 * 清空所有选择
 */
const clearAll = () => {
  localSelectedIds.value = []
}

/**
 * 获取知识点名称
 */
const getKnowledgePointName = (id: string): string => {
  const kp = knowledgePointStore.knowledgePoints.find((k: KnowledgePoint) => k.id === id)
  return kp?.name || ''
}

/**
 * 确认选择
 */
const handleConfirm = () => {
  emit('submit', [...localSelectedIds.value])
  isVisible.value = false
}

/**
 * 关闭弹窗
 */
const handleClose = () => {
  isVisible.value = false
}
</script>

<style scoped>
.knowledge-point-select {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 只读信息条 */
.info-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 12px 20px;
  background: #f5f7fa;
  border: 1px solid #e4eaf2;
  border-radius: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-icon {
  font-size: 16px;
}

.info-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--secondary-text);
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-text);
}

.info-divider {
  color: #cbd5e0;
  font-size: 14px;
}

/* 主内容区: 左右分栏布局 */
.content-panel {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 16px;
  height: 500px;
}

/* 左侧: 章节树形面板 */
.chapter-tree-panel {
  display: flex;
  flex-direction: column;
  border: 1px solid #e4eaf2;
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
}

/* 右侧: 知识点列表面板 */
.knowledge-point-panel {
  display: flex;
  flex-direction: column;
  border: 1px solid #e4eaf2;
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
}

/* 面板头部(紫色渐变) */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  flex-shrink: 0;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* 清空筛选按钮 */
.btn-clear-filter {
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-clear-filter:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

/* 内联搜索框 */
.search-input-inline {
  width: 200px;
  padding: 6px 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.9);
  color: var(--primary-text);
  font-size: 13px;
  transition: all 0.2s ease;
}

.search-input-inline:focus {
  outline: none;
  background: #ffffff;
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
}

.search-input-inline::placeholder {
  color: #999;
}

/* 树形容器 */
.tree-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px;
}

/* 树节点 */
.tree-node {
  margin-bottom: 4px;
}

.tree-node.chapter-node {
  margin-bottom: 8px;
}

.tree-node.section-node {
  margin-left: 24px;
}

/* 树项 */
.tree-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.tree-item:hover {
  background-color: rgba(102, 126, 234, 0.06);
}

.tree-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  flex-shrink: 0;
}

.tree-item label {
  flex: 1;
  cursor: pointer;
  font-size: 14px;
  color: var(--primary-text);
  user-select: none;
}

.section-node .tree-item label {
  font-size: 13px;
  color: var(--secondary-text);
}

/* 展开/收起图标 */
.expand-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  font-size: 10px;
  color: var(--secondary-text);
  cursor: pointer;
  user-select: none;
  transition: color 0.2s ease;
  flex-shrink: 0;
}

.expand-icon:hover {
  color: var(--accent);
}

/* 树子节点容器 */
.tree-children {
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 知识点列表容器 */
.knowledge-point-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px;
  background: #fafbfc;
}

/* 知识点单项 */
.knowledge-point-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  margin-bottom: 6px;
  border-radius: 6px;
  background: #ffffff;
  border: 1px solid #e4eaf2;
  cursor: pointer;
  transition: all 0.2s ease;
}

.knowledge-point-item:hover {
  border-color: #667eea;
  background-color: rgba(102, 126, 234, 0.04);
  transform: translateX(2px);
}

.knowledge-point-item.is-selected {
  background-color: rgba(102, 126, 234, 0.1);
  border-color: #667eea;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.1);
}

.knowledge-point-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  flex-shrink: 0;
}

.knowledge-point-item label {
  flex: 1;
  margin: 0;
  cursor: pointer;
  color: var(--primary-text);
  font-size: 14px;
  user-select: none;
}

.knowledge-point-item.is-selected label {
  font-weight: 600;
  color: #667eea;
}

/* 空状态 */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: var(--secondary-text);
}

.empty-state p {
  margin: 0;
  font-size: 14px;
  color: #999;
}

.selected-section {
  padding: 12px 16px;
  background: #f0f7ff;
  border: 1px solid #b3d9ff;
  border-radius: 6px;
}

.selected-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-weight: 600;
  font-size: 13px;
  color: var(--accent);
}

.btn-clear {
  padding: 4px 12px;
  background: transparent;
  border: 1px solid var(--accent);
  border-radius: 4px;
  color: var(--accent);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear:hover {
  background: var(--accent);
  color: #ffffff;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  background: #ffffff;
  border: 1px solid #b3d9ff;
  border-radius: 4px;
  font-size: 13px;
  color: var(--primary-text);
}

.remove-btn {
  margin-left: 8px;
  padding: 0;
  width: 18px;
  height: 18px;
  background: rgba(0, 102, 204, 0.1);
  border: none;
  border-radius: 50%;
  color: var(--accent);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: var(--accent);
  color: #ffffff;
}

.btn {
  padding: 8px 20px;
  border-radius: 6px;
  border: 1px solid transparent;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn.primary {
  background: linear-gradient(180deg, #4f77ff 0%, #2f57e3 100%);
  color: #ffffff;
  border-color: #375edf;
}

.btn.primary:hover {
  background: linear-gradient(180deg, #4b6ee6 0%, #264acc 100%);
}

.btn.secondary {
  background-color: #ffffff;
  color: var(--accent);
  border-color: rgba(0, 102, 204, 0.4);
}

.btn.secondary:hover {
  background-color: rgba(0, 102, 204, 0.08);
}
</style>
