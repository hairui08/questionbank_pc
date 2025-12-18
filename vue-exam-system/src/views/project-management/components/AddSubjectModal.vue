<template>
  <BaseModal
    v-model:visible="isVisible"
    :title="props.editingSubject ? '编辑科目' : '新增科目'"
    :description="props.editingSubject ? '修改科目基本信息。' : '补充科目信息后提交，系统自动归类至选定项目。'"
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
import type { SubjectFormData, Subject } from '../types'

interface Props {
  visible: boolean
  projectId: string
  projectName: string
  editingSubject?: Subject
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

const formData = ref<SubjectFormData>({
  projectId: '',
  projectName: '',
  name: '',
  status: 'disabled',
  order: 0 // 默认值，提交时会在store中重新计算
})

// 监听props变化，重置或预填表单
watch([() => props.visible, () => props.projectId, () => props.editingSubject], ([visible, projectId]) => {
  if (visible && projectId) {
    const editingSubject = props.editingSubject
    const isEdit = Boolean(editingSubject)
    formData.value = {
      projectId: isEdit && editingSubject ? editingSubject.projectId : props.projectId,
      projectName: isEdit && editingSubject ? editingSubject.projectName : props.projectName,
      name: isEdit && editingSubject ? editingSubject.name : '',
      status: 'disabled',
      order: isEdit && editingSubject ? editingSubject.order : 0 // 新增时order无效，store会自动设置为最大值+1
    }
    console.log(`[AddSubjectModal] ${isEdit ? '编辑模式' : '新增模式'} status:`, formData.value.status)
  }
}, { immediate: true })

const validate = (): boolean => {
  const trimmedName = formData.value.name.trim()

  if (!trimmedName) {
    showToast('请完整填写科目名称与排序。', { type: 'error' })
    return false
  }

  // 验证科目名称唯一性（同一项目下）
  const subjects = projectStore.getSubjectsByProjectId(formData.value.projectId)

  if (props.editingSubject) {
    // 编辑模式：允许保持原名，或检查新名称唯一性（同项目内排除自身）
    if (trimmedName !== props.editingSubject.name) {
      const exists = subjects.some(
        s => s.name === trimmedName && s.id !== props.editingSubject!.id
      )
      if (exists) {
        showToast('当前项目下已存在同名科目。', { type: 'error' })
        return false
      }
    }
  } else {
    // 新增模式：检查同项目内唯一性
    const exists = subjects.some(s => s.name === trimmedName)
    if (exists) {
      showToast('当前项目下已存在同名科目。', { type: 'error' })
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
