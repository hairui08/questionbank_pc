<template>
  <div class="rule-template-table-container">
    <div class="table-header">
      <h3>收费规则列表</h3>
      <p class="table-description">系统预设10条收费规则,支持启用/禁用和排序管理</p>
    </div>

    <table class="rule-template-table">
      <thead>
        <tr>
          <th width="8%">模板编码</th>
          <th width="15%">显示名称</th>
          <th width="12%">适用对象</th>
          <th width="12%">参数占位</th>
          <th width="8%">启用</th>
          <th width="28%">说明</th>
          <th width="7%">排序</th>
          <th width="10%">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="template in sortedTemplates" :key="template.id">
          <td><code class="template-code">{{ template.code }}</code></td>
          <td class="template-name">{{ template.displayName }}</td>
          <td>
            <span class="applicable-tags">{{ formatApplicableTo(template.applicableTo) }}</span>
          </td>
          <td><code class="param-placeholder">{{ template.paramPlaceholder }}</code></td>
          <td>
            <span
              class="status-badge"
              :class="template.status === 'active' ? 'status-active' : 'status-disabled'"
            >
              {{ template.status === 'active' ? '启用' : '禁用' }}
            </span>
          </td>
          <td class="description">{{ template.description }}</td>
          <td class="order-value">{{ template.order }}</td>
          <td>
            <div class="action-buttons">
              <button
                class="btn btn-sm btn-secondary"
                @click="$emit('edit-template', template)"
              >
                编辑
              </button>
              <button
                class="btn btn-sm"
                :class="template.status === 'active' ? 'btn-warning' : 'btn-primary'"
                @click="$emit('toggle-status', template)"
              >
                {{ template.status === 'active' ? '禁用' : '启用' }}
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePaymentRuleStore } from '@/stores/paymentRule'
import type { PaymentRule, ApplicableObject } from '@/views/payment-rule-management/types'

defineEmits<{
  'edit-template': [template: PaymentRule]
  'toggle-status': [template: PaymentRule]
}>()

const ruleStore = usePaymentRuleStore()

// 按排序值降序排列
const sortedTemplates = computed(() =>
  [...ruleStore.rules].sort((a, b) => b.order - a.order)
)

/**
 * 格式化适用对象显示
 */
function formatApplicableTo(applicableTo: ApplicableObject[]): string {
  if (applicableTo.length === 0) return '(预留)'

  const map: Record<ApplicableObject, string> = {
    question: '题',
    exam: '卷',
    chapter: '章',
    subject: '科'
  }

  return applicableTo.map(item => map[item]).join('/')
}
</script>

<style scoped>
.rule-template-table-container {
  background: var(--panel-bg);
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--panel-border);
}

.table-header h3 {
  color: var(--primary-text);
  font-size: 22px;
  margin-bottom: 8px;
}

.table-description {
  color: var(--secondary-text);
  font-size: 14px;
  margin: 0;
}

.rule-template-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 8px;
  overflow: hidden;
}

.rule-template-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.rule-template-table th {
  color: #ffffff;
  font-weight: 600;
  text-align: left;
  padding: 14px 12px;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.rule-template-table tbody tr {
  border-bottom: 1px solid var(--table-border);
  transition: background-color 0.2s ease;
}

.rule-template-table tbody tr:hover {
  background-color: var(--row-hover);
}

.rule-template-table tbody tr:last-child {
  border-bottom: none;
}

.rule-template-table td {
  padding: 12px;
  color: var(--secondary-text);
  font-size: 14px;
  vertical-align: middle;
}

.template-code {
  background: #f0f4f8;
  color: #667eea;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Consolas', monospace;
  font-size: 13px;
  font-weight: 600;
}

.template-name {
  color: var(--primary-text);
  font-weight: 500;
}

.applicable-tags {
  color: var(--accent);
  font-size: 13px;
  font-weight: 500;
}

.param-placeholder {
  background: #fff4e6;
  color: #d97706;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Consolas', monospace;
  font-size: 12px;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-disabled {
  background: #f3f4f6;
  color: #6b7280;
}

.description {
  color: var(--secondary-text);
  font-size: 13px;
  line-height: 1.5;
}

.order-value {
  color: var(--primary-text);
  font-weight: 500;
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 6px 14px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-sm {
  padding: 5px 12px;
  font-size: 12px;
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
}

.btn-warning {
  background: #fbbf24;
  color: #78350f;
}

.btn-warning:hover {
  background: #f59e0b;
}
</style>
