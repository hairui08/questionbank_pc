<template>
  <div class="chapter-list-panel">
    <div class="panel-header">
      <div class="breadcrumb">{{ breadcrumb }}</div>
      <div style="display: flex; align-items: center; gap: 16px">
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
        <button class="btn primary" @click="$emit('add-chapter')">+ 添加章</button>
      </div>
    </div>

    <table class="chapter-table">
      <thead>
        <tr>
          <th>序号</th>
          <th>章节名称</th>
          <th>状态</th>
          <th>排序</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="filteredChapters.length === 0">
          <tr>
            <td colspan="5" style="text-align: center; padding: 40px; color: var(--secondary-text)">
              暂无章节数据，点击右上角【添加章】创建
            </td>
          </tr>
        </template>
        <template v-for="(chapter, index) in filteredChapters" :key="chapter.id">
          <!-- 章节行 -->
          <tr
            class="chapter-row"
            :class="{ 'is-expanded': expandedChapters.has(chapter.id) }"
            @click="toggleChapter(chapter.id, $event)"
          >
            <td>{{ index + 1 }}</td>
            <td>
              <div class="chapter-cell">{{ chapter.name }}</div>
            </td>
            <td>
              <span class="status" :class="chapter.status === 'active' ? 'is-active' : 'is-disabled'">
                {{ chapter.status === 'active' ? '启用' : '禁用' }}
              </span>
            </td>
            <td>{{ chapter.order }}</td>
            <td>
              <div class="action-group">
                <button class="btn secondary" @click.stop="$emit('edit-chapter', chapter)">
                  编辑
                </button>
                <button
                  class="btn secondary"
                  @click.stop="
                    chapter.status === 'active'
                      ? $emit('toggle-chapter-status', chapter)
                      : $emit('toggle-chapter-status', chapter)
                  "
                >
                  {{ chapter.status === 'active' ? '禁用' : '启用' }}
                </button>
                <button class="btn secondary" @click.stop="$emit('delete-chapter', chapter)">
                  删除
                </button>
                <button class="btn primary" @click.stop="$emit('add-section', chapter)">
                  添加小节
                </button>
              </div>
            </td>
          </tr>

          <!-- 小节展开行 -->
          <tr
            v-if="expandedChapters.has(chapter.id)"
            class="section-row is-visible"
          >
            <td colspan="5">
              <div class="section-inline-panel">
                <header>
                  {{ chapter.name }} 的小节列表 ({{ getChapterSections(chapter.id).length }}个小节)
                </header>
                <div v-if="getChapterSections(chapter.id).length === 0" style="color: var(--secondary-text); margin: 0">
                  该章节暂无小节
                </div>
                <div v-else class="section-list">
                  <div
                    v-for="section in getChapterSections(chapter.id)"
                    :key="section.id"
                    class="section-item"
                  >
                    <div class="meta">
                      <strong>{{ section.name }}</strong>
                      <span>
                        {{ section.status === 'active' ? '启用' : '禁用' }} · 排序
                        {{ section.order }}
                      </span>
                    </div>
                    <div class="action-group">
                      <button class="btn secondary" @click.stop="$emit('edit-section', section)">
                        编辑
                      </button>
                      <button
                        class="btn secondary"
                        @click.stop="$emit('toggle-section-status', section)"
                      >
                        {{ section.status === 'active' ? '禁用' : '启用' }}
                      </button>
                      <button class="btn secondary" @click.stop="$emit('delete-section', section)">
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
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
  'add-section': [chapter: Chapter]
  'edit-section': [section: Section]
  'delete-section': [section: Section]
  'toggle-section-status': [section: Section]
}>()

// 状态筛选
const statusFilter = ref<'all' | 'active' | 'disabled'>('active')

// 展开的章节集合
const expandedChapters = ref<Set<string>>(new Set())

// 面包屑
const breadcrumb = computed(() => {
  return `${props.projectName} / ${props.subjectName} / 章节列表`
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
  cursor: pointer;
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

.chapter-cell::before {
  content: '▶';
  font-size: 10px;
  color: var(--accent);
  transition: transform 0.3s ease;
}

.chapter-row.is-expanded .chapter-cell::before {
  transform: rotate(90deg);
}

.section-row {
  background-color: #f9fbff;
}

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
}

.section-item .meta strong {
  font-size: 13px;
  color: var(--primary-text);
}

.section-item .meta span {
  font-size: 11px;
  color: var(--secondary-text);
  margin-left: 8px;
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
</style>
