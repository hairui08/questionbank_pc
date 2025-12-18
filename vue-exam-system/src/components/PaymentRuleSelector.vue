<template>
  <select
    :value="modelValue"
    @change="handleChange"
    class="form-select"
  >
    <option value="">{{ showInheritOption ? '继承上级规则' : '免费' }}</option>
    <option
      v-for="rule in filteredRules"
      :key="rule.id"
      :value="rule.id"
    >
      {{ rule.displayName }} - {{ rule.description }}
    </option>
  </select>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePaymentRuleStore } from '@/stores/paymentRule'
import type { ApplicableObject } from '@/views/payment-rule-management/types'

interface Props {
  modelValue?: string
  applicableTo?: ApplicableObject[]
  showInheritOption?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  applicableTo: () => [],
  showInheritOption: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const paymentRuleStore = usePaymentRuleStore()

// 根据适用对象过滤规则
const filteredRules = computed(() => {
  if (props.applicableTo.length === 0) {
    return paymentRuleStore.activeRules
  }

  return paymentRuleStore.activeRules.filter(rule => {
    return props.applicableTo.some(obj => rule.applicableTo.includes(obj))
  })
})

// 当前选中的规则
const selectedRule = computed(() => {
  if (!props.modelValue) return null
  return paymentRuleStore.getRuleById(props.modelValue)
})

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>

<style scoped>
.form-select {
  padding: 8px 12px;
  border: 1px solid var(--panel-border);
  border-radius: 4px;
  font-size: 14px;
  color: var(--primary-text);
  background-color: var(--panel-bg);
  cursor: pointer;
  transition: border-color 0.2s;
}

.form-select:hover {
  border-color: var(--accent);
}

.form-select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}
</style>
