<template>
  <BaseModal
    :visible="isVisible"
    title="选择知识点"
    width="600px"
    @update:visible="isVisible = $event"
    @close="handleClose"
  >
    <div class="knowledge-point-select">
      <!-- 项目和科目筛选 -->
      <div class="filter-section">
        <div class="filter-row">
          <div class="filter-group">
            <label>所属项目</label>
            <select v-model="filterProjectId" @change="onProjectChange">
              <option value="">全部项目</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label>所属科目</label>
            <select v-model="filterSubjectId" :disabled="!filterProjectId && !props.subjectId">
              <option value="">{{ filterProjectId || props.subjectId ? '全部科目' : '请先选择项目' }}</option>
              <option v-for="subject in filteredSubjects" :key="subject.id" :value="subject.id">
                {{ subject.name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- 搜索框 -->
      <div class="search-box">
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索知识点名称..."
          class="search-input"
        />
      </div>

      <!-- 知识点列表 -->
      <div class="knowledge-point-list">
        <template v-if="filteredKnowledgePoints.length > 0">
          <div
            v-for="group in groupedKnowledgePoints"
            :key="group.subjectId"
            class="subject-group"
          >
            <div class="subject-header">
              <span class="subject-name">{{ group.subjectName }}</span>
              <span class="subject-count">({{ group.knowledgePoints.length }})</span>
            </div>
            <div class="knowledge-point-items">
              <div
                v-for="kp in group.knowledgePoints"
                :key="kp.id"
                class="knowledge-point-item"
                :class="{ 'is-selected': localSelectedIds.includes(kp.id) }"
                @click="toggleSelection(kp.id)"
              >
                <input
                  :id="`kp-${kp.id}`"
                  type="checkbox"
                  :checked="localSelectedIds.includes(kp.id)"
                  @click.stop="toggleSelection(kp.id)"
                />
                <label :for="`kp-${kp.id}`">{{ kp.name }}</label>
              </div>
            </div>
          </div>
        </template>
        <div v-else class="empty-state">
          <p>{{ searchKeyword ? '未找到匹配的知识点' : '该科目下暂无知识点' }}</p>
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
import BaseModal from '@/components/Modal/BaseModal.vue'
import type { KnowledgePoint } from '@/views/knowledge-point-management/types'

// Props
interface Props {
  visible: boolean
  subjectId?: string // 当前选中的科目ID (可选, 用于过滤)
  selectedIds?: string[] // 已选中的知识点ID列表
}

const props = withDefaults(defineProps<Props>(), {
  subjectId: '',
  selectedIds: () => []
})

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean]
  submit: [knowledgePointIds: string[]]
}>()

const knowledgePointStore = useKnowledgePointStore()
const projectStore = useProjectStore()

// 本地状态
const isVisible = ref(props.visible)
const searchKeyword = ref('')
const localSelectedIds = ref<string[]>([...props.selectedIds])
const filterProjectId = ref('')
const filterSubjectId = ref('')

// 项目列表
const projects = computed(() => projectStore.projects)

/**
 * 根据选中的项目过滤科目
 */
const filteredSubjects = computed(() => {
  if (filterProjectId.value) {
    return projectStore.subjects.filter(s => s.projectId === filterProjectId.value)
  }
  if (props.subjectId) {
    const subject = projectStore.subjects.find(s => s.id === props.subjectId)
    if (subject) {
      return projectStore.subjects.filter(s => s.projectId === subject.projectId)
    }
  }
  return projectStore.subjects
})

/**
 * 项目切换事件
 */
const onProjectChange = () => {
  filterSubjectId.value = ''
}

/**
 * 获取所有知识点 (按科目过滤)
 */
const allKnowledgePoints = computed(() => {
  const allKps = knowledgePointStore.knowledgePoints

  // 优先使用用户选择的科目筛选
  if (filterSubjectId.value) {
    return allKps.filter((kp: KnowledgePoint) => kp.subjectId === filterSubjectId.value)
  }

  // 如果用户选择了项目但没有选择科目，显示该项目下所有科目的知识点
  if (filterProjectId.value) {
    const projectSubjectIds = projectStore.subjects
      .filter(s => s.projectId === filterProjectId.value)
      .map(s => s.id)
    return allKps.filter((kp: KnowledgePoint) => projectSubjectIds.includes(kp.subjectId))
  }

  // 如果传入了默认的 subjectId，使用它作为初始筛选
  if (props.subjectId && !filterProjectId.value && !filterSubjectId.value) {
    return allKps.filter((kp: KnowledgePoint) => kp.subjectId === props.subjectId)
  }

  return allKps
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

      // 根据传入的 subjectId 设置初始筛选条件
      if (props.subjectId) {
        filterSubjectId.value = props.subjectId
        const subject = projectStore.subjects.find(s => s.id === props.subjectId)
        if (subject) {
          filterProjectId.value = subject.projectId
        }
      } else {
        filterProjectId.value = ''
        filterSubjectId.value = ''
      }
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

.filter-section {
  padding: 12px 16px;
  background: linear-gradient(180deg, #fafcfe 0%, #f0f4f8 100%);
  border: 1px solid #e4eaf2;
  border-radius: 8px;
}

.filter-row {
  display: flex;
  gap: 16px;
}

.filter-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 13px;
  font-weight: 600;
  color: var(--primary-text);
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid #cdd5e0;
  border-radius: 6px;
  font-size: 14px;
  background: #ffffff;
  transition: border-color 0.2s ease;
  cursor: pointer;
}

.filter-group select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}

.filter-group select:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
  color: #999;
}

.search-box {
  margin-bottom: 8px;
}

.search-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #dfe3eb;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}

.knowledge-point-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #dfe3eb;
  border-radius: 6px;
  background: #f8f9fa;
}

.subject-group {
  border-bottom: 1px solid #e4eaf2;
}

.subject-group:last-child {
  border-bottom: none;
}

.subject-header {
  padding: 12px 16px;
  background: linear-gradient(180deg, #fafcfe 0%, #f0f4f8 100%);
  font-weight: 600;
  font-size: 14px;
  color: var(--primary-text);
  border-bottom: 1px solid #e4eaf2;
}

.subject-count {
  color: var(--secondary-text);
  font-weight: 400;
  margin-left: 4px;
}

.knowledge-point-items {
  padding: 8px 12px;
  background: #ffffff;
}

.knowledge-point-item {
  display: flex;
  align-items: center;
  padding: 10px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.knowledge-point-item:hover {
  background-color: rgba(0, 102, 204, 0.05);
}

.knowledge-point-item.is-selected {
  background-color: rgba(0, 102, 204, 0.1);
}

.knowledge-point-item input[type="checkbox"] {
  margin-right: 10px;
  cursor: pointer;
}

.knowledge-point-item label {
  flex: 1;
  margin: 0;
  cursor: pointer;
  color: var(--primary-text);
  font-size: 14px;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #999;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
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
