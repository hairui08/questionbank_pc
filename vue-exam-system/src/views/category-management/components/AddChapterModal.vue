<template>
  <BaseModal
    :visible="isVisible"
    title="添加分类"
    @update:visible="isVisible = $event"
    @close="handleClose"
  >
    <form class="form" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="project">所属项目 <span class="required">*</span></label>
        <input
          id="project"
          :value="props.projectName"
          type="text"
          class="readonly-input"
          readonly
        />
      </div>

      <div class="form-group">
        <label for="subject">所属科目 <span class="required">*</span></label>
        <input
          id="subject"
          :value="props.subjectName"
          type="text"
          class="readonly-input"
          readonly
        />
      </div>

      <div class="form-group">
        <label for="category-name">分类名称 <span class="required">*</span></label>
        <input
          id="category-name"
          v-model="formData.name"
          type="text"
          placeholder="请输入分类名称（1-50字符）"
          maxlength="50"
          :class="{ 'is-invalid': errors.name }"
          @input="errors.name = ''"
        />
        <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
      </div>

      <div class="form-group">
        <label>状态 <span class="required">*</span></label>
        <div class="radio-group">
          <label class="radio-label">
            <input type="radio" value="active" v-model="formData.status" />
            <span>启用</span>
          </label>
          <label class="radio-label">
            <input type="radio" value="disabled" v-model="formData.status" />
            <span>禁用</span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label>类型 <span class="required">*</span></label>
        <select v-model="formType" :class="{ 'is-invalid': errors.isChapterPractice }" @change="handleTypeChange">
          <option value="">请选择类型</option>
          <option value="chapter-practice">章节练习</option>
          <option value="past-exam">历年真题</option>
          <option value="other">其他</option>
        </select>
        <span v-if="errors.isChapterPractice" class="error-message">{{ errors.isChapterPractice }}</span>
      </div>

      <div class="form-group">
        <label for="category-order">排序 <span class="required">*</span></label>
        <input
          id="category-order"
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
import type { ChapterFormData, Status } from '../types'

// Props
interface Props {
  visible: boolean
  projectId?: string
  projectName?: string
  subjectId?: string
  subjectName?: string
  defaultOrder?: number
}

const props = withDefaults(defineProps<Props>(), {
  projectId: '',
  projectName: '',
  subjectId: '',
  subjectName: '',
  defaultOrder: 1
})

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean]
  submit: [data: ChapterFormData]
}>()

// 本地visible状态
const isVisible = ref(props.visible)

// 表单数据
const formData = reactive<ChapterFormData>({
  subjectId: '',
  subjectName: '',
  name: '',
  status: 'active' as Status,
  isChapterPractice: false,
  order: props.defaultOrder
})

// 类型选择
const formType = ref<string>('')

// 表单错误
const errors = reactive({
  name: '',
  order: '',
  isChapterPractice: ''
})

// 监听visible变化
watch(
  () => props.visible,
  (newVal) => {
    isVisible.value = newVal
    if (newVal) {
      // 使用 props 的值初始化表单
      formData.subjectId = props.subjectId || ''
      formData.subjectName = props.subjectName || ''
      formData.name = ''
      formData.status = 'active'
      formData.isChapterPractice = false
      formData.order = props.defaultOrder
      formType.value = ''
      errors.name = ''
      errors.order = ''
      errors.isChapterPractice = ''
    }
  }
)

// 监听名称变化，如果名称是"章节练习"，则自动设置isChapterPractice为true
watch(
  () => formData.name,
  (newName) => {
    if (newName === '章节练习') {
      formData.isChapterPractice = true
      formType.value = 'chapter-practice'
    }
  }
)

// 处理类型变化
const handleTypeChange = () => {
  if (formType.value === 'chapter-practice') {
    formData.isChapterPractice = true
    // 如果名称不是"章节练习"，自动设置名称为"章节练习"
    if (formData.name !== '章节练习') {
      formData.name = '章节练习'
    }
  } else {
    formData.isChapterPractice = false
  }
  errors.isChapterPractice = ''
}

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

  // 验证类型
  if (!formType.value) {
    errors.isChapterPractice = '请选择类型'
    isValid = false
  }

  return isValid
}

/**
 * 提交表单
 */
const handleSubmit = () => {
  if (!validate()) {
    return
  }

  // 提交表单数据
  const submitData: ChapterFormData = {
    projectId: formData.projectId,
    projectName: formData.projectName,
    subjectId: formData.subjectId,
    subjectName: formData.subjectName,
    name: formData.name,
    status: formData.status,
    isChapterPractice: formData.isChapterPractice,
    order: formData.order
  }

  emit('submit', submitData)
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

.radio-group {
  display: flex;
  gap: 24px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.radio-label input[type="radio"] {
  cursor: pointer;
  width: 16px;
  height: 16px;
  margin-right: 10px;
}

.radio-label span {
  user-select: none;
}
</style>
