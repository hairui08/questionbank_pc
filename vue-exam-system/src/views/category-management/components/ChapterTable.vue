<template>
  <div class="chapter-list-panel">
    <div class="panel-header">
      <!-- <div class="breadcrumb">{{ breadcrumb }}</div> -->
        <div class="filter-group">
          <label
            for="chapter-status-filter"
            style="margin-right: 8px; font-weight: 600; font-size: 13px"
            >启用状态：</label
          >
          <select
            id="chapter-status-filter"
            v-model="statusFilter"
            class="status-filter-select"
            style="
              padding: 6px 12px;
              border-radius: 6px;
              border: 1px solid #cdd5e0;
              font-size: 13px;
              cursor: pointer;
            "
          >
            <option value="all">全部</option>
            <option value="active">启用</option>
            <option value="disabled">禁用</option>
          </select>
        </div>

        <div  class="filter-group">
          <button class="btn primary" @click="$emit('add-chapter')">+ 添加分类</button>

          <button
            class="btn secondary"
            :disabled="getAllSelectedCount() === 0"
            @click="handleBatchEnableAll"
          >
            批量启用
          </button>

          <button
            class="btn secondary"
            :disabled="getAllSelectedCount() === 0"
            @click="handleBatchDisableAll"
          >
            批量禁用
          </button>

          <button
            class="btn secondary"
            @click="toggleExpandAll"
            :disabled="filteredChapters.length === 0"
          >
            {{ allExpanded ? '全部收起' : '全部展开' }}
          </button>
        </div>
    </div>

    <table class="chapter-table">
      <thead>
        <tr>
          <th>序号</th>
          <th>分类名称</th>
          <th>最后操作时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="filteredChapters.length === 0">
          <tr>
            <td colspan="4" style="text-align: center; padding: 40px; color: var(--secondary-text)">
              暂无分类数据，点击右上角【添加分类】创建
            </td>
          </tr>
        </template>
        <template v-for="(chapter, index) in filteredChapters" :key="chapter.id">
          <!-- 章节行 -->
          <tr
            class="chapter-row"
            :class="{
              'is-expanded': expandedChapters.has(chapter.id),
              'has-children': getChapterSections(chapter.id).length > 0
            }"
            @click="toggleChapter(chapter.id, $event)"
          >
            <td>{{ index + 1 }}</td>
            <td>
              <div class="chapter-cell">
                <input
                  type="checkbox"
                  :checked="isChapterAllSelected(chapter.id)"
                  @change="toggleChapterSelectAll(chapter.id)"
                  @click.stop
                  style="margin-right: 8px; cursor: pointer;"
                />
                <strong>{{ chapter.name }}</strong>
                <span class="status-inline" :class="chapter.status === 'active' ? 'is-active' : 'is-disabled'">
                  {{ chapter.status === 'active' ? '启用' : '禁用' }}
                </span>
              </div>
            </td>
            <td>{{ formatLastOperationTime(chapter) }}</td>
            <td>
              <div class="action-group">
                <button
                  class="btn icon-btn"
                  :disabled="index === 0"
                  @click.stop="moveChapterUp(index)"
                  title="上移"
                >
                  ↑
                </button>
                <button
                  class="btn icon-btn"
                  :disabled="index === filteredChapters.length - 1"
                  @click.stop="moveChapterDown(index)"
                  title="下移"
                >
                  ↓
                </button>
                <button class="btn secondary" @click.stop="$emit('edit-chapter', chapter)">
                  编辑
                </button>
                <button v-if="chapter.isChapterPractice" class="btn primary" @click.stop="$emit('add-section', chapter)">
                  添加子项
                </button>
              </div>
            </td>
          </tr>

          <!-- 递归渲染子分类（第二级） -->
          <template v-if="expandedChapters.has(chapter.id)">
            <template v-for="(section, sectionIndex) in getChapterSections(chapter.id)" :key="section.id">
              <!-- 小节行 -->
              <tr 
                class="chapter-row"
                :class="{
                  'is-expanded': expandedSections.has(section.id),
                  'has-children': getSectionSubSections(section.id).length > 0
                }"
                @click="toggleSection(section.id, $event)"
              >
                <td>{{ '' }}</td>
                <td style="padding-left: 40px;">
                  <div class="chapter-cell">
                    <input
                      type="checkbox"
                      :checked="isSectionSelected(chapter.id, section.id)"
                      @change="toggleSectionSelection(chapter.id, section.id)"
                      @click.stop
                      style="margin-right: 8px; cursor: pointer;"
                    />
                    <strong>{{ section.name }}</strong>
                    <span class="status-inline" :class="section.status === 'active' ? 'is-active' : 'is-disabled'">
                      {{ section.status === 'active' ? '启用' : '禁用' }}
                    </span>
                  </div>
                </td>
                <td>{{ formatLastOperationTime(section) }}</td>
                <td>
                  <div class="action-group">
                    <button
                      class="btn icon-btn"
                      :disabled="sectionIndex === 0"
                      @click.stop="moveSectionUp(chapter.id, sectionIndex)"
                      title="上移"
                    >
                      ↑
                    </button>
                    <button
                      class="btn icon-btn"
                      :disabled="sectionIndex === getChapterSections(chapter.id).length - 1"
                      @click.stop="moveSectionDown(chapter.id, sectionIndex)"
                      title="下移"
                    >
                      ↓
                    </button>
                    <button class="btn secondary" @click.stop="$emit('edit-section', section)">
                      编辑
                    </button>
                    <button class="btn primary" @click.stop="$emit('add-section', section)">
                      添加子项
                    </button>
                  </div>
                </td>
              </tr>

              <!-- 递归渲染第三级子项（紧跟在对应小节后面） -->
                  <template v-if="expandedSections.has(section.id)">
                    <tr 
                      v-for="(subSection, subSectionIndex) in getSectionSubSections(section.id)" 
                      :key="subSection.id" 
                      class="chapter-row"
                      :class="{
                        'is-expanded': expandedSubSections.has(subSection.id)
                      }"
                      @click="toggleSubSection(subSection.id, $event)"
                    >
                      <td>{{ '' }}</td>
                      <td style="padding-left: 80px;">
                        <div class="chapter-cell">
                          <input
                            type="checkbox"
                            :checked="isSubSectionSelected(section.id, subSection.id)"
                            @change="toggleSubSectionSelection(section.id, subSection.id)"
                            @click.stop
                            style="margin-right: 8px; cursor: pointer;"
                          />
                          <strong>{{ subSection.name }}</strong>
                          <span class="status-inline" :class="subSection.status === 'active' ? 'is-active' : 'is-disabled'">
                            {{ subSection.status === 'active' ? '启用' : '禁用' }}
                          </span>
                        </div>
                      </td>
                      <td>{{ formatLastOperationTime(subSection) }}</td>
                      <td>
                        <div class="action-group">
                      <button
                        class="btn icon-btn"
                        :disabled="subSectionIndex === 0"
                        @click.stop="moveSubSectionUp(section.id, subSectionIndex)"
                        title="上移"
                      >
                        ↑
                      </button>
                      <button
                        class="btn icon-btn"
                        :disabled="subSectionIndex === getSectionSubSections(section.id).length - 1"
                        @click.stop="moveSubSectionDown(section.id, subSectionIndex)"
                        title="下移"
                      >
                        ↓
                      </button>
                      <button class="btn secondary" @click.stop="$emit('edit-section', subSection)">
                        编辑
                      </button>
                      <button class="btn primary" @click.stop="$emit('add-section', subSection)">
                        添加子项
                      </button>
                    </div>
                      </td>
                    </tr>
                  </template>
            </template>
          </template>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useChapterStore } from '@/stores/chapter'
import type { Chapter, Section } from '../types'

const chapterStore = useChapterStore()

// Props
interface Props {
  subjectId: string
  subjectName: string
  projectName: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'add-chapter': []
  'edit-chapter': [chapter: Chapter]
  'delete-chapter': [chapter: Chapter]
  'toggle-chapter-status': [chapter: Chapter]
  'add-section': [parent: Chapter | Section]
  'edit-section': [section: Section]
  'delete-section': [section: Section]
  'toggle-section-status': [section: Section]
  'batch-toggle-section-status': [sectionIds: string[], targetStatus: 'active' | 'disabled']
  'batch-toggle-chapter-status': [chapterIds: string[], targetStatus: 'active' | 'disabled']
}>()

// 状态筛选
const statusFilter = ref<'all' | 'active' | 'disabled'>('all')

// 展开的章节集合
const expandedChapters = ref<Set<string>>(new Set())

// 展开的小节集合（用于第三级）
const expandedSections = ref<Set<string>>(new Set())

// 展开的第三级子项集合
const expandedSubSections = ref<Set<string>>(new Set())

// 每个章节的选中小节ID集合
const selectedSectionIdsByChapter = ref<Map<string, Set<string>>>(new Map())

// 每个小节的选中第三级子项ID集合
const selectedSubSectionIdsBySection = ref<Map<string, Set<string>>>(new Map())

// 选中的章节ID集合
const selectedChapterIds = ref<Set<string>>(new Set())

// 面包屑
const breadcrumb = computed(() => {
  return `${props.projectName} / ${props.subjectName} / 分类列表`
})

// 获取当前科目的章节列表
const chapters = chapterStore.getChaptersBySubject(props.subjectId)

// 过滤后的章节列表
const filteredChapters = computed(() => {
  if (statusFilter.value === 'all') {
    return chapters.value
  }
  return chapters.value.filter((ch) => ch.status === statusFilter.value)
})

/**
 * 获取指定章节的小节列表
 */
const getChapterSections = (chapterId: string) => {
  return chapterStore.getSectionsByChapter(chapterId).value
}

/**
 * 获取指定小节的第三级子项列表
 */
const getSectionSubSections = (sectionId: string) => {
  return chapterStore.getSubSectionsBySection(sectionId).value
}

/**
 * 切换小节展开/收起（用于第三级）
 */
const toggleSection = (sectionId: string, event: MouseEvent) => {
  // 如果点击的是按钮，不触发折叠
  const target = event.target as HTMLElement
  if (target.closest('.action-group') || target.closest('input[type="checkbox"]')) {
    return
  }

  if (expandedSections.value.has(sectionId)) {
    expandedSections.value.delete(sectionId)
  } else {
    expandedSections.value.add(sectionId)
  }
}

/**
 * 切换第三级子项展开/收起
 */
const toggleSubSection = (subSectionId: string, event: MouseEvent) => {
  // 如果点击的是按钮，不触发折叠
  const target = event.target as HTMLElement
  if (target.closest('.action-group') || target.closest('input[type="checkbox"]')) {
    return
  }

  if (expandedSubSections.value.has(subSectionId)) {
    expandedSubSections.value.delete(subSectionId)
  } else {
    expandedSubSections.value.add(subSectionId)
  }
}

/**
 * 上移第三级子项
 */
const moveSubSectionUp = (sectionId: string, index: number) => {
  if (index === 0) return

  const subSections = getSectionSubSections(sectionId)
  const currentSubSection = subSections[index]
  const prevSubSection = subSections[index - 1]

  // 交换order值
  const tempOrder = currentSubSection.order
  currentSubSection.order = prevSubSection.order
  prevSubSection.order = tempOrder

  // 更新时间
  currentSubSection.updatedAt = new Date().toISOString()
  prevSubSection.updatedAt = new Date().toISOString()
}

/**
 * 下移第三级子项
 */
const moveSubSectionDown = (sectionId: string, index: number) => {
  const subSections = getSectionSubSections(sectionId)
  if (index === subSections.length - 1) return

  const currentSubSection = subSections[index]
  const nextSubSection = subSections[index + 1]

  // 交换order值
  const tempOrder = currentSubSection.order
  currentSubSection.order = nextSubSection.order
  nextSubSection.order = tempOrder

  // 更新时间
  currentSubSection.updatedAt = new Date().toISOString()
  nextSubSection.updatedAt = new Date().toISOString()
}

// 移除示例数据初始化代码，避免与其他模块数据冲突
onMounted(() => {
  // 分类管理模块现在使用chapterStore中已有的原始数据
  // 不再添加示例数据，避免影响其他模块的展示
})

/**
 * 切换章节展开/收起
 */
const toggleChapter = (chapterId: string, event: MouseEvent) => {
  // 如果点击的是按钮，不触发折叠
  const target = event.target as HTMLElement
  if (target.closest('.action-group') || target.closest('input[type="checkbox"]')) {
    return
  }

  if (expandedChapters.value.has(chapterId)) {
    expandedChapters.value.delete(chapterId)
  } else {
    expandedChapters.value.add(chapterId)
  }
}

/**
 * 判断是否全部展开
 */
const allExpanded = computed(() => {
  if (filteredChapters.value.length === 0) return false
  return filteredChapters.value.every((ch) => expandedChapters.value.has(ch.id))
})

/**
 * 切换全部展开/全部收起
 */
const toggleExpandAll = () => {
  if (allExpanded.value) {
    // 全部收起
    expandedChapters.value.clear()
  } else {
    // 全部展开
    filteredChapters.value.forEach((ch) => {
      expandedChapters.value.add(ch.id)
    })
  }
}

/**
 * 上移章节
 */
const moveChapterUp = (index: number) => {
  if (index === 0) return

  const currentChapter = filteredChapters.value[index]
  const prevChapter = filteredChapters.value[index - 1]

  // 交换order值
  const tempOrder = currentChapter.order
  currentChapter.order = prevChapter.order
  prevChapter.order = tempOrder

  // 更新时间
  currentChapter.updatedAt = new Date().toISOString()
  prevChapter.updatedAt = new Date().toISOString()
}

/**
 * 下移章节
 */
const moveChapterDown = (index: number) => {
  if (index === filteredChapters.value.length - 1) return

  const currentChapter = filteredChapters.value[index]
  const nextChapter = filteredChapters.value[index + 1]

  // 交换order值
  const tempOrder = currentChapter.order
  currentChapter.order = nextChapter.order
  nextChapter.order = tempOrder

  // 更新时间
  currentChapter.updatedAt = new Date().toISOString()
  nextChapter.updatedAt = new Date().toISOString()
}

/**
 * 上移小节
 */
const moveSectionUp = (chapterId: string, sectionIndex: number) => {
  const sections = getChapterSections(chapterId)
  if (sectionIndex === 0) return

  const currentSection = sections[sectionIndex]
  const prevSection = sections[sectionIndex - 1]

  // 交换order值
  const tempOrder = currentSection.order
  currentSection.order = prevSection.order
  prevSection.order = tempOrder

  // 更新时间
  currentSection.updatedAt = new Date().toISOString()
  prevSection.updatedAt = new Date().toISOString()
}

/**
 * 下移小节
 */
const moveSectionDown = (chapterId: string, sectionIndex: number) => {
  const sections = getChapterSections(chapterId)
  if (sectionIndex === sections.length - 1) return

  const currentSection = sections[sectionIndex]
  const nextSection = sections[sectionIndex + 1]

  // 交换order值
  const tempOrder = currentSection.order
  currentSection.order = nextSection.order
  nextSection.order = tempOrder

  // 更新时间
  currentSection.updatedAt = new Date().toISOString()
  nextSection.updatedAt = new Date().toISOString()
}

/**
 * 格式化最后操作时间
 */
const formatLastOperationTime = (item: Chapter | Section) => {
  const time = item.updatedAt || item.createdAt
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\//g, '-')
}

/**
 * 获取章节的选中小节集合（确保集合存在）
 */
const getSelectedSections = (chapterId: string): Set<string> => {
  if (!selectedSectionIdsByChapter.value.has(chapterId)) {
    selectedSectionIdsByChapter.value.set(chapterId, new Set())
  }
  return selectedSectionIdsByChapter.value.get(chapterId)!
}

/**
 * 获取小节的选中第三级子项集合（确保集合存在）
 */
const getSelectedSubSections = (sectionId: string): Set<string> => {
  if (!selectedSubSectionIdsBySection.value.has(sectionId)) {
    selectedSubSectionIdsBySection.value.set(sectionId, new Set())
  }
  return selectedSubSectionIdsBySection.value.get(sectionId)!
}

/**
 * 判断第三级子项是否被选中
 */
const isSubSectionSelected = (sectionId: string, subSectionId: string): boolean => {
  return getSelectedSubSections(sectionId).has(subSectionId)
}

/**
 * 切换第三级子项选中状态
 */
const toggleSubSectionSelection = (sectionId: string, subSectionId: string) => {
  const selectedSet = getSelectedSubSections(sectionId)
  if (selectedSet.has(subSectionId)) {
    selectedSet.delete(subSectionId)
  } else {
    selectedSet.add(subSectionId)
  }
}

/**
 * 判断小节是否被选中
 */
const isSectionSelected = (chapterId: string, sectionId: string): boolean => {
  const selectedSet = getSelectedSections(chapterId)
  if (selectedSet.has(sectionId)) {
    return true
  }
  // 检查该小节的所有第三级子项是否都被选中
  const subSections = getSectionSubSections(sectionId)
  if (subSections.length === 0) {
    return false
  }
  const selectedSubSet = getSelectedSubSections(sectionId)
  return subSections.every(subSec => selectedSubSet.has(subSec.id))
}

/**
 * 切换小节选中状态
 */
const toggleSectionSelection = (chapterId: string, sectionId: string) => {
  const selectedSet = getSelectedSections(chapterId)
  const subSections = getSectionSubSections(sectionId)
  const selectedSubSet = getSelectedSubSections(sectionId)
  
  if (selectedSet.has(sectionId)) {
    // 取消选中小节
    selectedSet.delete(sectionId)
    // 清空该小节的所有第三级子项选中状态
    selectedSubSet.clear()
  } else {
    // 选中小节
    selectedSet.add(sectionId)
    // 选中该小节的所有第三级子项
    subSections.forEach(subSec => selectedSubSet.add(subSec.id))
  }
}

/**
 * 判断章节是否全选
 */
const isChapterAllSelected = (chapterId: string): boolean => {
  const sections = getChapterSections(chapterId)
  if (sections.length === 0) {
    // 没有小节的章节，直接返回章节本身是否被选中
    return selectedChapterIds.value.has(chapterId)
  }
  
  // 检查所有小节及其第三级子项是否都被选中
  return sections.every(section => {
    const selectedSet = getSelectedSections(chapterId)
    if (selectedSet.has(section.id)) {
      return true
    }
    // 检查该小节的所有第三级子项是否都被选中
    const subSections = getSectionSubSections(section.id)
    if (subSections.length === 0) {
      return false
    }
    const selectedSubSet = getSelectedSubSections(section.id)
    return subSections.every(subSec => selectedSubSet.has(subSec.id))
  })
}

/**
 * 切换章节全选状态
 */
const toggleChapterSelectAll = (chapterId: string) => {
  const sections = getChapterSections(chapterId)
  if (sections.length === 0) {
    // 没有小节的章节，直接切换章节本身的选中状态
    if (selectedChapterIds.value.has(chapterId)) {
      selectedChapterIds.value.delete(chapterId)
    } else {
      selectedChapterIds.value.add(chapterId)
    }
  } else {
    // 有小节的章节，处理小节及其第三级子项的选中状态
    const isAllSelected = isChapterAllSelected(chapterId)
    const selectedSet = getSelectedSections(chapterId)
    
    sections.forEach(section => {
      if (isAllSelected) {
        // 取消全选
        selectedSet.delete(section.id)
        // 清空该小节的所有第三级子项选中状态
        getSelectedSubSections(section.id).clear()
      } else {
        // 全选
        selectedSet.add(section.id)
        // 选中该小节的所有第三级子项
        const subSections = getSectionSubSections(section.id)
        const selectedSubSet = getSelectedSubSections(section.id)
        subSections.forEach(subSec => selectedSubSet.add(subSec.id))
      }
    })
  }
}

/**
 * 获取章节的选中小节数量
 */
const getSelectedCount = (chapterId: string): number => {
  return getSelectedSections(chapterId).size
}

/**
 * 批量禁用选中的小节
 */
const handleBatchDisable = (chapterId: string) => {
  const selectedSet = getSelectedSections(chapterId)
  const selectedIds = Array.from(selectedSet)

  if (selectedIds.length === 0) return

  emit('batch-toggle-section-status', chapterId, selectedIds, 'disabled')
}

/**
 * 批量启用选中的小节
 */
const handleBatchEnable = (chapterId: string) => {
  const selectedSet = getSelectedSections(chapterId)
  const selectedIds = Array.from(selectedSet)

  if (selectedIds.length === 0) return

  emit('batch-toggle-section-status', chapterId, selectedIds, 'active')
}

/**
 * 获取所有选中项的总数
 */
const getAllSelectedCount = (): number => {
  let total = 0
  // 计算选中小节的数量
  selectedSectionIdsByChapter.value.forEach(set => {
    total += set.size
  })
  // 加上选中第三级子项的数量
  selectedSubSectionIdsBySection.value.forEach(set => {
    total += set.size
  })
  // 加上选中章节的数量
  total += selectedChapterIds.value.size
  return total
}

/**
 * 批量启用所有选中项
 */
const handleBatchEnableAll = () => {
  // 收集所有选中的小节ID和第三级子项ID
  let selectedSectionIds: string[] = []
  
  // 收集直接选中的小节ID
  selectedSectionIdsByChapter.value.forEach((selectedSet) => {
    selectedSectionIds = selectedSectionIds.concat(Array.from(selectedSet))
  })
  
  // 收集所有选中的第三级子项ID
  selectedSubSectionIdsBySection.value.forEach((selectedSet) => {
    selectedSectionIds = selectedSectionIds.concat(Array.from(selectedSet))
  })
  
  // 收集所有选中的章节ID
  const selectedChapterIdsArray = Array.from(selectedChapterIds.value)
  
  // 先处理小节和第三级子项的批量启用
  if (selectedSectionIds.length > 0) {
    emit('batch-toggle-section-status', selectedSectionIds, 'active')
  }
  
  // 再处理章节的批量启用
  if (selectedChapterIdsArray.length > 0) {
    emit('batch-toggle-chapter-status', selectedChapterIdsArray, 'active')
  }
  
  // 清空所有选中状态
  selectedChapterIds.value.clear()
  selectedSectionIdsByChapter.value.clear()
  selectedSubSectionIdsBySection.value.clear()
}

/**
 * 批量禁用所有选中项
 */
const handleBatchDisableAll = () => {
  // 收集所有选中的小节ID和第三级子项ID
  let selectedSectionIds: string[] = []
  
  // 收集直接选中的小节ID
  selectedSectionIdsByChapter.value.forEach((selectedSet) => {
    selectedSectionIds = selectedSectionIds.concat(Array.from(selectedSet))
  })
  
  // 收集所有选中的第三级子项ID
  selectedSubSectionIdsBySection.value.forEach((selectedSet) => {
    selectedSectionIds = selectedSectionIds.concat(Array.from(selectedSet))
  })
  
  // 收集所有选中的章节ID
  const selectedChapterIdsArray = Array.from(selectedChapterIds.value)
  
  // 先处理小节和第三级子项的批量禁用
  if (selectedSectionIds.length > 0) {
    emit('batch-toggle-section-status', selectedSectionIds, 'disabled')
  }
  
  // 再处理章节的批量禁用
  if (selectedChapterIdsArray.length > 0) {
    emit('batch-toggle-chapter-status', selectedChapterIdsArray, 'disabled')
  }
  
  // 清空所有选中状态
  selectedChapterIds.value.clear()
  selectedSectionIdsByChapter.value.clear()
  selectedSubSectionIdsBySection.value.clear()
}
</script>

<style scoped>
.chapter-list-panel {
  flex: 1;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  overflow: hidden;
}

.panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--panel-border);
  background: linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 操作栏容器 */
.panel-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

/* 批量操作样式 */
.batch-operations {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0f7ff;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e1e8ed;
}

.batch-info {
  font-size: 13px;
  color: var(--primary-text);
  font-weight: 500;
  margin-right: 8px;
}

/* 按钮间距调整 */
.panel-actions .btn {
  white-space: nowrap;
}

/* 筛选器样式 */
.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb {
  font-size: 13px;
  color: var(--secondary-text);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn {
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid transparent;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn.primary {
  background: linear-gradient(180deg, #4f77ff 0%, #2f57e3 100%);
  color: #ffffff;
  border-color: #375edf;
  box-shadow: 0 4px 8px rgba(79, 119, 255, 0.3);
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

.chapter-table {
  width: 100%;
  border-collapse: collapse;
}

.chapter-table th {
  padding: 12px 20px;
  text-align: left;
  background: #fafafa;
  border-bottom: 1px solid var(--panel-border);
  font-weight: 600;
  color: var(--secondary-text);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.chapter-table td {
  padding: 14px 20px;
  border-bottom: 1px solid var(--panel-border);
}

.chapter-row {
  transition: all 0.2s ease;
  cursor: default;
}

.chapter-row:hover {
  background-color: #f9fbff;
}

.chapter-row.is-expanded {
  background-color: #edf4ff;
}

.chapter-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chapter-row .chapter-cell::before {
  content: '';
  font-size: 10px;
  margin-right: 10px;
}

.chapter-row.has-children .chapter-cell::before {
  content: '▶';
  font-size: 10px;
  color: var(--accent);
  transition: transform 0.3s ease;
  margin-right: 0px;
}

.chapter-row.has-children.is-expanded .chapter-cell::before {
  transform: rotate(90deg);
}

/* 第三级子项样式继承自chapter-row，不需要单独定义 */

.section-inline-panel {
  padding: 16px 20px;
  background: #ffffff;
  border: 1px dashed rgba(0, 102, 204, 0.3);
  margin: 8px 20px;
  border-radius: 8px;
}

.section-inline-panel header {
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 12px;
}

/* 批量操作工具栏 */
.section-batch-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #f8f9fa;
  border: 1px solid #e4eaf2;
  border-radius: 6px;
  margin-bottom: 12px;
}

.section-batch-toolbar .toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-batch-toolbar .toolbar-left input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--accent);
}

.section-batch-toolbar .toolbar-right {
  display: flex;
  gap: 8px;
}

.btn.btn-sm {
  padding: 5px 12px;
  font-size: 12px;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.section-list {
  display: grid;
  gap: 8px;
}

.section-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #fafcfe;
  border: 1px solid #e4eaf2;
  border-radius: 6px;
  transition: all 0.2s ease;
  gap: 12px;
}

.section-item .section-checkbox {
  display: flex;
  align-items: center;
}

.section-item .section-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--accent);
}

.section-item .meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.section-item .meta strong {
  font-size: 13px;
  color: var(--primary-text);
}

.section-item .meta span {
  font-size: 11px;
  color: var(--secondary-text);
  margin-left: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.action-group {
  display: flex;
  gap: 6px;
}

.status {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
}

.status.is-active {
  background-color: #ecfff2;
  color: #2e8b57;
  border: 1px solid rgba(46, 139, 87, 0.4);
}

.status.is-disabled {
  background-color: #fff3f0;
  color: #cf4a30;
  border: 1px solid rgba(207, 74, 48, 0.3);
}

/* 状态徽章内联样式 */
.status-inline {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-inline.is-active {
  background-color: #e6f7e6;
  color: #28a745;
}

.status-inline.is-disabled {
  background-color: #f5f5f5;
  color: #999;
}

/* 箭头按钮样式 */
.btn.icon-btn {
  min-width: 32px;
  padding: 6px 8px;
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
}

.btn.icon-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>