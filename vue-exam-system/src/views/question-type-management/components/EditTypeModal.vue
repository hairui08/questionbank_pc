<template>
  <BaseModal
    :visible="isVisible"
    title="编辑题型"
    description="修改题型在当前科目下的配置"
    @update:visible="isVisible = $event"
    @close="handleClose"
  >
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>所属项目</label>
        <input :value="formData.projectName" type="text" readonly class="readonly-input" />
      </div>

      <div class="form-group">
        <label>所属科目</label>
        <input :value="formData.subjectName" type="text" readonly class="readonly-input" />
      </div>

      <div class="form-group">
        <label for="internal-type">内部题型名称 <span class="required">*</span></label>
        <input
          id="internal-type"
          :value="formData.internalName"
          type="text"
          readonly
          class="readonly-input"
        />
        <span class="hint-text">编辑时内部题型不可修改</span>
      </div>

      <div class="form-group">
        <label for="display-name">外部显示名称 <span class="required">*</span></label>
        <input
          id="display-name"
          v-model="formData.displayName"
          type="text"
          placeholder="用户看到的题型名称（1-50字符）"
          maxlength="50"
          :class="{ 'is-invalid': errors.displayName }"
          @input="errors.displayName = ''"
        />
        <span v-if="errors.displayName" class="error-message">{{ errors.displayName }}</span>
      </div>

      <div class="form-group">
        <label for="description">题型描述</label>
        <textarea
          id="description"
          v-model="formData.description"
          placeholder="简要描述题型特点（0-200字符）"
          maxlength="200"
        ></textarea>
      </div>

      <div class="form-group">
        <label for="order">排序 <span class="required">*</span></label>
        <input
          id="order"
          v-model.number="formData.order"
          type="number"
          min="1"
          max="999"
          placeholder="正整数（1-999）"
          :class="{ 'is-invalid': errors.order }"
          @input="errors.order = ''"
        />
        <span v-if="errors.order" class="error-message">{{ errors.order }}</span>
      </div>

      <div class="form-group">
        <label for="status">状态</label>
        <select id="status" v-model="formData.status">
          <option value="active">启用</option>
          <option value="disabled">禁用</option>
        </select>
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
import type { QuestionType, QuestionTypeFormData } from '../types'

// Props
interface Props {
  visible: boolean
  type: QuestionType | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean]
  submit: [typeId: string, data: Partial<QuestionTypeFormData>]
}>()

// 本地visible状态
const isVisible = ref(props.visible)

// 表单数据
const formData = reactive({
  subjectName: '',
  projectName: '',
  internalName: '',
  displayName: '',
  description: '',
  order: 1,
  status: 'active' as 'active' | 'disabled'
})

// 表单错误
const errors = reactive({
  displayName: '',
  order: ''
})

// 监听visible变化
watch(
  () => props.visible,
  (newVal) => {
    isVisible.value = newVal
    if (newVal && props.type) {
      // 填充表单数据
      formData.subjectName = props.type.subjectName
      formData.projectName = props.type.projectName
      formData.internalName = props.type.internalName
      formData.displayName = props.type.displayName
      formData.description = props.type.description
      formData.order = props.type.order
      formData.status = props.type.status
      errors.displayName = ''
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

  // 验证外部显示名称
  if (!formData.displayName || formData.displayName.trim().length === 0) {
    errors.displayName = '外部显示名称不能为空'
    isValid = false
  } else if (formData.displayName.length > 50) {
    errors.displayName = '外部显示名称不能超过50个字符'
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
  if (!props.type) return

  if (!validate()) {
    return
  }

  emit('submit', props.type.id, {
    displayName: formData.displayName.trim(),
    description: formData.description.trim(),
    order: formData.order,
    status: formData.status
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
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #dfe3eb;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  font-family: inherit;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}

.form-group input.is-invalid,
.form-group select.is-invalid {
  border-color: #e74c3c;
}

.form-group input.readonly-input {
  background-color: #f5f5f5;
  color: var(--secondary-text);
  cursor: not-allowed;
}

.hint-text {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: var(--secondary-text);
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
