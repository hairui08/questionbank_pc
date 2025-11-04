<template>
  <BaseModal
    v-model:visible="isVisible"
    title="新增科目"
    description="补充科目信息后提交，系统自动归类至选定项目。"
    @confirm="handleSubmit"
    @cancel="handleCancel"
  >
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>所属项目</label>
        <input :value="projectName" type="text" readonly />
      </div>

      <div class="form-group">
        <label for="subject-name">科目名称 *</label>
        <input
          id="subject-name"
          v-model="formData.name"
          type="text"
          placeholder="请输入科目名称"
          maxlength="30"
          required
        />
      </div>

      <div class="form-group">
        <label for="subject-year">年份</label>
        <select id="subject-year" v-model="formData.year">
          <option v-for="year in yearOptions" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="subject-order">排序 *</label>
        <input
          id="subject-order"
          v-model.number="formData.order"
          type="number"
          min="1"
          placeholder="请输入排序号"
          required
        />
      </div>

      <div class="form-group">
        <label for="subject-status">状态</label>
        <select id="subject-status" v-model="formData.status">
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
import type { SubjectFormData } from '../types'

interface Props {
  visible: boolean
  projectId: string
  projectName: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'submit': [data: SubjectFormData]
}>()

const projectStore = useProjectStore()
const { showToast } = useToast()

const isVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const currentYear = new Date().getFullYear()
const yearOptions = [currentYear, currentYear - 1, currentYear - 2]

const formData = ref<SubjectFormData>({
  projectId: '',
  projectName: '',
  name: '',
  year: currentYear,
  status: 'active',
  order: 1
})

// 监听props变化，更新表单
watch([() => props.visible, () => props.projectId], ([visible, projectId]) => {
  if (visible && projectId) {
    const subjects = projectStore.getSubjectsByProjectId(projectId)
    formData.value = {
      projectId: props.projectId,
      projectName: props.projectName,
      name: '',
      year: currentYear,
      status: 'active',
      order: subjects.length + 1
    }
  }
}, { immediate: true })

const validate = (): boolean => {
  const trimmedName = formData.value.name.trim()

  if (!trimmedName) {
    showToast('请完整填写科目名称与排序。', { type: 'error' })
    return false
  }

  // 验证科目名称唯一性（同一项目下,仅检查启用状态的科目）
  const subjects = projectStore.getSubjectsByProjectId(formData.value.projectId)
  const exists = subjects.some(s => s.name === trimmedName && s.status === 'active')
  if (exists) {
    showToast('当前项目下已存在同名的启用科目。', { type: 'error' })
    return false
  }

  if (formData.value.year < currentYear) {
    showToast('年份不能早于当年。', { type: 'error' })
    return false
  }

  if (!Number.isInteger(formData.value.order) || formData.value.order <= 0) {
    showToast('排序必须为正整数。', { type: 'error' })
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
