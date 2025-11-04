<template>
  <div v-if="visible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h3>编辑收费规则排序</h3>
        <button class="close-button" @click="closeModal">×</button>
      </div>

      <div class="modal-body">
        <div class="form-group readonly-info">
          <label>模板编码</label>
          <div class="readonly-value"><code>{{ template?.code }}</code></div>
        </div>

        <div class="form-group readonly-info">
          <label>显示名称</label>
          <div class="readonly-value">{{ template?.displayName }}</div>
        </div>

        <div class="form-group readonly-info">
          <label>适用对象</label>
          <div class="readonly-value">{{ formatApplicableTo(template?.applicableTo || []) }}</div>
        </div>

        <div class="form-group readonly-info">
          <label>说明</label>
          <div class="readonly-value description-text">{{ template?.description }}</div>
        </div>

        <div class="divider"></div>

        <div class="form-group">
          <label class="required">排序值</label>
          <input
            v-model.number="formData.order"
            type="number"
            class="form-input"
            placeholder="请输入排序值(1-999)"
            min="1"
            max="999"
            required
          />
          <span class="form-help">值越大,在下拉选项中越靠前</span>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="closeModal">取消</button>
        <button class="btn btn-primary" @click="handleSubmit">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PaymentRule, ApplicableObject } from '@/views/payment-rule-management/types'

interface Props {
  visible: boolean
  template: PaymentRule | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  submit: [data: { order: number }]
}>()

const formData = ref({
  order: 100
})

// 监听模板变化,初始化表单数据
watch(
  () => props.template,
  (newTemplate) => {
    if (newTemplate) {
      formData.value.order = newTemplate.order
    }
  },
  { immediate: true }
)

/**
 * 格式化适用对象显示
 */
function formatApplicableTo(applicableTo: ApplicableObject[]): string {
  if (applicableTo.length === 0) return '(预留)'

  const map: Record<ApplicableObject, string> = {
    question: '试题',
    exam: '试卷',
    chapter: '章节',
    subject: '科目'
  }

  return applicableTo.map(item => map[item]).join('、')
}

/**
 * 关闭弹窗
 */
function closeModal() {
  emit('update:visible', false)
}

/**
 * 提交表单
 */
function handleSubmit() {
  if (formData.value.order < 1 || formData.value.order > 999) {
    alert('排序值必须在1-999之间')
    return
  }

  emit('submit', {
    order: formData.value.order
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid var(--panel-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  color: var(--primary-text);
  font-size: 20px;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 32px;
  color: var(--secondary-text);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #f3f4f6;
  color: var(--primary-text);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: var(--primary-text);
  font-weight: 500;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-group label.required::after {
  content: ' *';
  color: #ef4444;
}

.readonly-info label {
  color: var(--secondary-text);
  font-size: 13px;
}

.readonly-value {
  color: var(--primary-text);
  padding: 10px 14px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
}

.readonly-value code {
  background: #f0f4f8;
  color: #667eea;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Consolas', monospace;
  font-size: 13px;
  font-weight: 600;
}

.description-text {
  line-height: 1.6;
}

.divider {
  height: 1px;
  background: var(--panel-border);
  margin: 24px 0;
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}

.form-help {
  display: block;
  color: var(--secondary-text);
  font-size: 13px;
  margin-top: 6px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--panel-border);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background: #d1d5db;
}

.btn-primary {
  background: var(--accent);
  color: white;
}

.btn-primary:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
}
</style>
