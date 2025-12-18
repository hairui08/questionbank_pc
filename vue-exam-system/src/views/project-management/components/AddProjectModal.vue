<template>
  <BaseModal
    v-model:visible="isVisible"
    :title="props.editingProject ? '编辑项目' : '新增项目'"
    :description="props.editingProject ? '修改项目基本信息。' : '填写项目基本信息,系统将自动创建项目条目。'"
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
        <label>状态</label>
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
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseModal from '@/components/Modal/BaseModal.vue'
import { useProjectStore } from '@/stores/project'
import { useToast } from '@/composables/useToast'
import type { ProjectFormData, Project } from '../types'

interface Props {
  visible: boolean
  editingProject?: Project
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

const formData = ref<ProjectFormData>({
  name: '',
  status: 'disabled',
  order: 0 // 默认值，提交时会在store中重新计算
})

// 监听visible变化，重置或预填表单
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 状态控件默认禁用，需手动启用
    formData.value = {
      name: props.editingProject ? props.editingProject.name : '',
      status: 'disabled',
      order: props.editingProject ? props.editingProject.order : 0 // 新增时order无效，store会自动设置为最大值+1
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
  if (props.editingProject) {
    // 编辑模式：允许保持原名，或检查新名称唯一性
    if (trimmedName !== props.editingProject.name) {
      const exists = projectStore.projects.some(
        p => p.name === trimmedName && p.id !== props.editingProject!.id
      )
      if (exists) {
        showToast('项目名称已存在，请使用不同的名称。', { type: 'error' })
        return false
      }
    }
  } else {
    // 新增模式：检查全局唯一性
    const exists = projectStore.projects.some(p => p.name === trimmedName)
    if (exists) {
      showToast('项目名称已存在，请使用不同的名称。', { type: 'error' })
      return false
    }
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
}

.radio-label span {
  user-select: none;
}
</style>
