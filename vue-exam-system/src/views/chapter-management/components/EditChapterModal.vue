<template>
  <BaseModal
    :visible="isVisible"
    title="编辑章节"
    @update:visible="isVisible = $event"
    @close="handleClose"
  >
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="subject">所属科目 <span class="required">*</span></label>
        <input
          id="subject"
          v-model="formData.subjectName"
          type="text"
          readonly
          class="readonly-input"
        />
      </div>

      <div class="form-group">
        <label for="chapter-name">章节名称 <span class="required">*</span></label>
        <input
          id="chapter-name"
          v-model="formData.name"
          type="text"
          placeholder="请输入章节名称（1-50字符）"
          maxlength="50"
          :class="{ 'is-invalid': errors.name }"
          @input="errors.name = ''"
        />
        <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
      </div>

      <div class="form-group">
        <label for="chapter-status">状态 <span class="required">*</span></label>
        <select id="chapter-status" v-model="formData.status">
          <option value="active">启用</option>
          <option value="disabled">禁用</option>
        </select>
      </div>

      <div class="form-group">
        <label for="chapter-order">排序 <span class="required">*</span></label>
        <input
          id="chapter-order"
          v-model.number="formData.order"
          type="number"
          min="1"
          max="999"
          placeholder="请输入排序（1-999）"
          :class="{ 'is-invalid': errors.order }"
          @input="errors.order = ''"
        />
        <span v-if="errors.order" class="error-message">{{ errors.order }}</span>
      </div>
    </form>

    <template #footer>
      <button class="btn secondary" @click="handleClose">取消</button>
      <button class="btn primary" @click="handleSubmit">确定</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import BaseModal from '@/components/Modal/BaseModal.vue'
import type { Chapter, ChapterFormData } from '../types'

// Props
interface Props {
  visible: boolean
  chapter: Chapter | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean]
  submit: [chapterId: string, data: Partial<ChapterFormData>]
}>()

// 本地visible状态
const isVisible = ref(props.visible)

// 表单数据
const formData = reactive<ChapterFormData>({
  subjectId: '',
  subjectName: '',
  name: '',
  status: 'active',
  order: 1
})

// 表单错误
const errors = reactive({
  name: '',
  order: ''
})

// 监听visible变化
watch(
  () => props.visible,
  (newVal) => {
    isVisible.value = newVal
    if (newVal && props.chapter) {
      // 填充表单数据
      formData.subjectId = props.chapter.subjectId
      formData.subjectName = props.chapter.subjectName
      formData.name = props.chapter.name
      formData.status = props.chapter.status
      formData.order = props.chapter.order
      errors.name = ''
      errors.order = ''
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

  // 验证章节名称
  if (!formData.name || formData.name.trim().length === 0) {
    errors.name = '章节名称不能为空'
    isValid = false
  } else if (formData.name.length > 50) {
    errors.name = '章节名称不能超过50个字符'
    isValid = false
  }

  // 验证排序
  if (!formData.order || formData.order < 1 || formData.order > 999) {
    errors.order = '排序必须是1-999之间的正整数'
    isValid = false
  }

  return isValid
}

/**
 * 提交表单
 */
const handleSubmit = () => {
  if (!props.chapter) return

  if (!validate()) {
    return
  }

  emit('submit', props.chapter.id, {
    name: formData.name,
    status: formData.status,
    order: formData.order
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

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #dfe3eb;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
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
