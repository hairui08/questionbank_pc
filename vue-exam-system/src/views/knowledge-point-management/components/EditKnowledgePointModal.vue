<template>
  <BaseModal
    :visible="isVisible"
    title="编辑知识点"
    @update:visible="isVisible = $event"
    @close="handleClose"
  >
    <form v-if="knowledgePoint" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="subject">所属科目 <span class="required">*</span></label>
        <input
          id="subject"
          :value="subjectInfo"
          type="text"
          readonly
          class="readonly-input"
        />
      </div>

      <div class="form-group">
        <label for="knowledge-point-name">知识点名称 <span class="required">*</span></label>
        <input
          id="knowledge-point-name"
          v-model="formData.name"
          type="text"
          placeholder="请输入知识点名称（1-100字符）"
          maxlength="100"
          :class="{ 'is-invalid': errors.name }"
          @input="errors.name = ''"
        />
        <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
      </div>

      <div class="form-group">
        <label for="chapters">关联章节（可选）</label>
        <div class="chapter-tree">
          <div v-if="chaptersTree.length === 0" class="empty-text">
            该科目下暂无章节
          </div>
          <div v-for="chapter in chaptersTree" :key="chapter.id" class="chapter-node">
            <!-- 章节行 -->
            <div class="chapter-row">
              <span
                v-if="chapter.sections.length > 0"
                class="expand-icon"
                @click="toggleChapter(chapter.id)"
              >
                {{ expandedChapters.has(chapter.id) ? '▼' : '▶' }}
              </span>
              <span v-else class="expand-icon-placeholder"></span>
              <input
                :id="`chapter-${chapter.id}`"
                v-model="formData.chapterIds"
                type="checkbox"
                :value="chapter.id"
              />
              <label :for="`chapter-${chapter.id}`">{{ chapter.name }}</label>
            </div>

            <!-- 小节列表（可展开） -->
            <div v-if="expandedChapters.has(chapter.id)" class="section-list">
              <div v-for="section in chapter.sections" :key="section.id" class="section-item">
                <input
                  :id="`section-${section.id}`"
                  v-model="formData.chapterIds"
                  type="checkbox"
                  :value="section.id"
                />
                <label :for="`section-${section.id}`">{{ section.name }}</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <button class="btn secondary" @click="handleClose">取消</button>
      <button class="btn primary" @click="handleSubmit">确定</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { useProjectStore } from '@/stores/project'
import { useChapterStore } from '@/stores/chapter'
import BaseModal from '@/components/Modal/BaseModal.vue'
import type { KnowledgePoint, KnowledgePointFormData } from '../types'

// Props
interface Props {
  visible: boolean
  knowledgePoint: KnowledgePoint | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean]
  submit: [id: string, updates: Partial<KnowledgePointFormData>]
}>()

const projectStore = useProjectStore()
const chapterStore = useChapterStore()

// 本地visible状态
const isVisible = ref(props.visible)

// 表单数据
const formData = reactive<KnowledgePointFormData>({
  subjectId: '',
  name: '',
  chapterIds: []
})

// 表单错误
const errors = reactive({
  name: ''
})

// 科目信息
const subjectInfo = computed(() => {
  if (!props.knowledgePoint) return ''
  const subject = projectStore.subjects.find(s => s.id === props.knowledgePoint!.subjectId)
  if (!subject) return ''
  return `${subject.projectName} - ${subject.name}`
})

// 获取当前科目下的章节树（包含小节）
const chaptersTree = computed(() => {
  if (!props.knowledgePoint) return []
  const chapterList = chapterStore.getChaptersBySubject(props.knowledgePoint.subjectId).value
  return chapterList.map(chapter => ({
    ...chapter,
    sections: chapterStore.getSectionsByChapter(chapter.id).value
  }))
})

// 章节展开/收起状态
const expandedChapters = ref<Set<string>>(new Set())

// 切换章节展开/收起
const toggleChapter = (chapterId: string) => {
  if (expandedChapters.value.has(chapterId)) {
    expandedChapters.value.delete(chapterId)
  } else {
    expandedChapters.value.add(chapterId)
  }
}

// 监听visible变化
watch(
  () => props.visible,
  (newVal) => {
    isVisible.value = newVal
    if (newVal && props.knowledgePoint) {
      // 填充表单数据
      formData.subjectId = props.knowledgePoint.subjectId
      formData.name = props.knowledgePoint.name
      formData.chapterIds = [...props.knowledgePoint.chapterIds]
      errors.name = ''
      // 重置章节展开状态
      expandedChapters.value.clear()
    }
  }
)

watch(isVisible, (newVal) => {
  emit('update:visible', newVal)
})

/**
 * 验证表单
 */
const validate = (): boolean => {
  let isValid = true

  // 验证知识点名称
  if (!formData.name || formData.name.trim().length === 0) {
    errors.name = '知识点名称不能为空'
    isValid = false
  } else if (formData.name.length > 100) {
    errors.name = '知识点名称不能超过100个字符'
    isValid = false
  }

  return isValid
}

/**
 * 提交表单
 */
const handleSubmit = () => {
  if (!props.knowledgePoint || !validate()) {
    return
  }

  emit('submit', props.knowledgePoint.id, {
    name: formData.name,
    chapterIds: formData.chapterIds
  })
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
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 14px;
  color: var(--primary-text);
}

.form-group .required {
  color: #e74c3c;
}

.form-group input[type="text"] {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #dfe3eb;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-group input[type="text"]:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}

.form-group input.is-invalid {
  border-color: #e74c3c;
}

.form-group input.readonly-input {
  background-color: #f5f5f5;
  color: var(--secondary-text);
  cursor: not-allowed;
}

.error-message {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #e74c3c;
}

.chapter-tree {
  padding: 12px;
  background: #f8f9fa;
  border: 1px solid #dfe3eb;
  border-radius: 6px;
  max-height: 300px;
  overflow-y: auto;
}

.chapter-node {
  margin-bottom: 4px;
}

.chapter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 4px;
  transition: background-color 0.2s;
  border-radius: 4px;
}

.chapter-row:hover {
  background-color: rgba(0, 102, 204, 0.05);
}

.expand-icon {
  cursor: pointer;
  user-select: none;
  width: 16px;
  font-size: 10px;
  color: var(--secondary-text);
  text-align: center;
  flex-shrink: 0;
  transition: color 0.2s;
}

.expand-icon:hover {
  color: var(--accent);
}

.expand-icon-placeholder {
  width: 16px;
  flex-shrink: 0;
}

.chapter-row input[type="checkbox"] {
  cursor: pointer;
  flex-shrink: 0;
}

.chapter-row label {
  margin: 0;
  cursor: pointer;
  color: var(--primary-text);
  font-weight: 500;
  flex: 1;
}

.section-list {
  margin-left: 24px;
  padding-left: 12px;
  border-left: 2px solid #e4eaf2;
  margin-top: 4px;
}

.section-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 4px;
  padding-left: 12px;
  transition: background-color 0.2s;
  border-radius: 4px;
}

.section-item:hover {
  background-color: rgba(0, 102, 204, 0.05);
}

.section-item input[type="checkbox"] {
  cursor: pointer;
  flex-shrink: 0;
}

.section-item label {
  margin: 0;
  cursor: pointer;
  color: var(--primary-text);
  font-weight: 400;
  flex: 1;
  font-size: 14px;
}

.empty-text {
  padding: 20px;
  text-align: center;
  color: #999;
  font-style: italic;
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
