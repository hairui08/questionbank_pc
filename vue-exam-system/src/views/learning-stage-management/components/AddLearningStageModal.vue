<template>
  <BaseModal
    :visible="isVisible"
    title="添加学习阶段"
    @update:visible="isVisible = $event"
    @close="handleClose"
  >
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="subject-name">所属科目</label>
        <input
          id="subject-name"
          :value="subjectName"
          type="text"
          readonly
          class="readonly-input"
        />
      </div>

      <div class="form-group">
        <label for="stage-name">阶段名称 <span class="required">*</span></label>
        <input
          id="stage-name"
          v-model="formData.name"
          type="text"
          placeholder="请输入阶段名称（如：预习阶段、课堂学习阶段、复习阶段）"
          maxlength="50"
          :class="{ 'is-invalid': errors.name }"
          @input="errors.name = ''"
        />
        <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
      </div>

      <div class="form-group">
        <label for="stage-description">阶段描述</label>
        <textarea
          id="stage-description"
          v-model="formData.description"
          placeholder="请输入阶段描述（选填，最多200字符）"
          maxlength="200"
          rows="4"
          :class="{ 'is-invalid': errors.description }"
          @input="errors.description = ''"
        ></textarea>
        <span v-if="errors.description" class="error-message">{{ errors.description }}</span>
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
import type { LearningStageFormData } from '../types'

// Props
interface Props {
  visible: boolean
  subjectName: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean]
  submit: [data: LearningStageFormData]
}>()

// 本地visible状态
const isVisible = ref(props.visible)

// 表单数据
const formData = reactive<LearningStageFormData>({
  name: '',
  description: ''
})

// 表单错误
const errors = reactive({
  name: '',
  description: ''
})

// 监听visible变化
watch(
  () => props.visible,
  (newVal) => {
    isVisible.value = newVal
    if (newVal) {
      // 重置表单
      formData.name = ''
      formData.description = ''
      errors.name = ''
      errors.description = ''
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

  // 验证阶段名称
  if (!formData.name || formData.name.trim().length === 0) {
    errors.name = '阶段名称不能为空'
    isValid = false
  } else if (formData.name.length > 50) {
    errors.name = '阶段名称不能超过50个字符'
    isValid = false
  }

  // 验证阶段描述（选填）
  if (formData.description && formData.description.length > 200) {
    errors.description = '阶段描述不能超过200个字符'
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

  emit('submit', {
    name: formData.name.trim(),
    description: formData.description?.trim()
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
.form-group textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #dfe3eb;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}

.form-group input.is-invalid,
.form-group textarea.is-invalid {
  border-color: #e74c3c;
}

.form-group .readonly-input {
  background-color: #f5f5f5;
  color: var(--secondary-text);
  cursor: not-allowed;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
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
