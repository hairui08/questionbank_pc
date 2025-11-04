<template>
  <BaseModal
    v-if="isOpen"
    title="分配评卷任务"
    :width="600"
    @close="emit('close')"
  >
    <div class="assign-task-modal">
      <div class="exam-info">
        <h4>考试信息</h4>
        <div class="info-row">
          <span class="label">考试名称:</span>
          <span class="value">{{ exam?.examName }}</span>
        </div>
        <div class="info-row">
          <span class="label">参与人数:</span>
          <span class="value">{{ exam?.participantCount }}人</span>
        </div>
      </div>

      <div class="form-section">
        <h4>分配方式</h4>
        <div class="radio-group">
          <label class="radio-label">
            <input
              v-model="assignmentType"
              type="radio"
              value="by_question"
            />
            <span>按题目分配</span>
            <span class="radio-desc">(不同教师批阅不同题目)</span>
          </label>
          <label class="radio-label">
            <input
              v-model="assignmentType"
              type="radio"
              value="by_student"
            />
            <span>按学生分配</span>
            <span class="radio-desc">(不同教师批阅不同学生的试卷)</span>
          </label>
        </div>
      </div>

      <div class="form-section">
        <h4>选择评卷教师</h4>
        <div class="teacher-list">
          <label
            v-for="teacher in teachers"
            :key="teacher.id"
            class="teacher-item"
          >
            <input
              v-model="selectedTeacherIds"
              type="checkbox"
              :value="teacher.id"
            />
            <div class="teacher-info">
              <span class="teacher-name">{{ teacher.name }}</span>
              <span class="teacher-dept">{{ teacher.department }}</span>
            </div>
          </label>
        </div>
      </div>
    </div>

    <template #footer>
      <button
        class="btn secondary"
        @click="emit('close')"
      >
        取消
      </button>
      <button
        class="btn primary"
        :disabled="selectedTeacherIds.length === 0"
        @click="handleSubmit"
      >
        确定分配
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseModal from '@/components/Modal/BaseModal.vue'
import { useMarkingStore } from '@/stores/marking'
import type { MarkingRecord, AssignTaskData } from '../types'

// Props
interface Props {
  isOpen: boolean
  examId: string | null
}

const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'close'): void
  (e: 'submit', data: AssignTaskData): void
}

const emit = defineEmits<Emits>()

// Store
const markingStore = useMarkingStore()

// 考试信息
const exam = ref<MarkingRecord | null>(null)

// 教师列表
const teachers = ref(markingStore.getAllTeachers())

// 分配方式
const assignmentType = ref<'by_question' | 'by_student'>('by_question')

// 选中的教师ID列表
const selectedTeacherIds = ref<string[]>([])

// 监听 examId 变化,加载考试信息
watch(
  () => props.examId,
  (newExamId) => {
    if (newExamId) {
      exam.value = markingStore.getMarkingRecordById(newExamId) || null
    } else {
      exam.value = null
    }
  },
  { immediate: true }
)

// 监听弹窗关闭,重置表单
watch(
  () => props.isOpen,
  (isOpen) => {
    if (!isOpen) {
      selectedTeacherIds.value = []
      assignmentType.value = 'by_question'
    }
  }
)

/**
 * 提交分配
 */
const handleSubmit = () => {
  if (!props.examId || selectedTeacherIds.value.length === 0) {
    return
  }

  const data: AssignTaskData = {
    examId: props.examId,
    teacherIds: selectedTeacherIds.value,
    assignmentType: assignmentType.value
  }

  emit('submit', data)
}
</script>

<style scoped>
.assign-task-modal {
  padding: 0;
}

.exam-info {
  padding: 20px;
  background: var(--row-hover);
  border-radius: 6px;
  margin-bottom: 24px;
}

.exam-info h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-text);
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row .label {
  width: 80px;
  color: var(--secondary-text);
}

.info-row .value {
  flex: 1;
  color: var(--primary-text);
  font-weight: 500;
}

.form-section {
  margin-bottom: 24px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.form-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-text);
}

/* 单选按钮组 */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.radio-label {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid var(--panel-border);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.radio-label:hover {
  border-color: var(--accent);
  background-color: var(--row-hover);
}

.radio-label input[type='radio'] {
  margin-right: 10px;
  cursor: pointer;
}

.radio-desc {
  margin-left: 8px;
  font-size: 12px;
  color: var(--secondary-text);
}

/* 教师列表 */
.teacher-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 240px;
  overflow-y: auto;
  padding: 4px;
}

.teacher-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid var(--panel-border);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.teacher-item:hover {
  border-color: var(--accent);
  background-color: var(--row-hover);
}

.teacher-item input[type='checkbox'] {
  margin-right: 12px;
  cursor: pointer;
}

.teacher-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.teacher-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--primary-text);
}

.teacher-dept {
  font-size: 12px;
  color: var(--secondary-text);
}

/* 按钮 */
.btn {
  height: 36px;
  padding: 0 24px;
  border: 1px solid transparent;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn.primary {
  background: linear-gradient(180deg, #4f77ff 0%, #2f57e3 100%);
  color: #ffffff;
  border-color: #375edf;
  box-shadow: 0 2px 6px rgba(79, 119, 255, 0.3);
}

.btn.primary:hover:not(:disabled) {
  background: linear-gradient(180deg, #5f87ff 0%, #3f67f3 100%);
  box-shadow: 0 4px 12px rgba(79, 119, 255, 0.4);
  transform: translateY(-1px);
}

.btn.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn.secondary {
  background: #ffffff;
  color: var(--secondary-text);
  border-color: var(--panel-border);
}

.btn.secondary:hover {
  background: var(--row-hover);
  border-color: var(--accent);
  color: var(--primary-text);
}

/* 滚动条样式 */
.teacher-list::-webkit-scrollbar {
  width: 6px;
}

.teacher-list::-webkit-scrollbar-track {
  background: transparent;
}

.teacher-list::-webkit-scrollbar-thumb {
  background: #d0d0d0;
  border-radius: 3px;
}

.teacher-list::-webkit-scrollbar-thumb:hover {
  background: #b0b0b0;
}
</style>
