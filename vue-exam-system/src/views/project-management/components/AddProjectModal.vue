<template>
  <BaseModal
    v-model:visible="isVisible"
    title="新增项目"
    description="填写项目基本信息,系统将自动创建项目条目。"
    @confirm="handleSubmit"
    @cancel="handleCancel"
  >
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="project-name">项目名称 *</label>
        <input
          id="project-name"
          v-model="formData.name"
          type="text"
          placeholder="请输入项目名称"
          minlength="4"
          maxlength="20"
          required
        />
      </div>

      <div class="form-group">
        <label for="project-year">年份</label>
        <select id="project-year" v-model="formData.year">
          <option v-for="year in yearOptions" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="project-order">排序</label>
        <input
          id="project-order"
          v-model.number="formData.order"
          type="number"
          min="1"
          placeholder="自动生成"
          readonly
        />
      </div>

      <div class="form-group">
        <label for="project-status">状态</label>
        <select id="project-status" v-model="formData.status">
          <option value="active">启用</option>
          <option value="disabled">禁用</option>
        </select>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseModal from '@/components/Modal/BaseModal.vue'
import { useProjectStore } from '@/stores/project'
import { useToast } from '@/composables/useToast'
import type { ProjectFormData } from '../types'

interface Props {
  visible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'submit': [data: ProjectFormData]
}>()

const projectStore = useProjectStore()
const { showToast } = useToast()

const isVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const currentYear = new Date().getFullYear()
const yearOptions = [currentYear, currentYear - 1, currentYear - 2]

const formData = ref<ProjectFormData>({
  name: '',
  year: currentYear,
  status: 'active',
  order: projectStore.projects.length + 1
})

// 监听visible变化，重置表单
watch(() => props.visible, (newVal) => {
  if (newVal) {
    formData.value = {
      name: '',
      year: currentYear,
      status: 'active',
      order: projectStore.projects.length + 1
    }
  }
})

const validate = (): boolean => {
  const trimmedName = formData.value.name.trim()

  if (!trimmedName) {
    showToast('项目名称不能为空。', { type: 'error' })
    return false
  }

  if (trimmedName.length < 4 || trimmedName.length > 20) {
    showToast('项目名称长度应为4-20个字符。', { type: 'error' })
    return false
  }

  // 验证项目名称唯一性
  const exists = projectStore.projects.some(p => p.name === trimmedName)
  if (exists) {
    showToast('项目名称已存在，请使用不同的名称。', { type: 'error' })
    return false
  }

  return true
}

const handleSubmit = () => {
  if (!validate()) {
    return
  }

  emit('submit', formData.value)
  isVisible.value = false
}

const handleCancel = () => {
  isVisible.value = false
}
</script>

<style scoped>
form {
  display: grid;
  gap: 16px;
}
</style>
