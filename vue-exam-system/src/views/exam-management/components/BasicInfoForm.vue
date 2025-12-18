<template>
  <div class="basic-info-form-horizontal">
    <h3>基础信息</h3>

    <!-- 第一行: 项目 + 科目 + 学习阶段 + 年份 + 收费规则 -->
    <div class="form-row-five-cols">
      <div class="form-group">
        <label class="required">所属项目</label>
        <select v-model="localForm.projectId" @change="onProjectChange" required>
          <option value="">请选择项目</option>
          <option v-for="project in projects" :key="project.id" :value="project.id">
            {{ project.name }}
          </option>
        </select>
        <span v-if="errors.projectId" class="error-text">{{ errors.projectId }}</span>
      </div>

      <div class="form-group">
        <label class="required">所属科目</label>
        <select
          v-model="localForm.subjectId"
          @change="onSubjectChange"
          :disabled="!localForm.projectId"
          required
        >
          <option value="">{{ localForm.projectId ? '请选择科目' : '请先选择项目' }}</option>
          <option v-for="subject in filteredSubjects" :key="subject.id" :value="subject.id">
            {{ subject.name }}
          </option>
        </select>
        <span v-if="errors.subjectId" class="error-text">{{ errors.subjectId }}</span>
      </div>

      <div class="form-group">
        <label class="required">分类</label>
        <select v-model="localForm.learningStageId" @blur="validateLearningStage">
          <option value="">请选择分类</option>
          <option v-for="stage in learningStages" :key="stage.id" :value="stage.id">
            {{ stage.name }}
          </option>
        </select>
        <span v-if="errors.learningStageId" class="error-text">{{ errors.learningStageId }}</span>
      </div>

      <div class="form-group">
        <label>年份</label>
        <input
          v-model.number="localForm.year"
          type="number"
          min="2000"
          max="2100"
          :placeholder="currentYear.toString()"
        />
      </div>

      <div class="form-group">
        <label>收费规则</label>
        <PaymentRuleSelector
          v-model="localForm.paymentRuleId"
          :applicable-to="['exam']"
        />
      </div>

    </div>

    <!-- 第三行: 试卷名称 + 有效期 -->
    <div class="form-row-double">
      <div class="form-group">
        <label class="required">试卷名称</label>
        <input
          v-model="localForm.name"
          type="text"
          placeholder="请输入试卷名称(1-100字符)"
          maxlength="100"
          @blur="validateName"
        />
        <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
      </div>

      <div class="form-group">
        <label>有效期</label>
        <div class="date-range-wrapper">
          <input
            v-model="localForm.validFrom"
            type="date"
            placeholder="开始日期"
          />
          <span class="date-separator">至</span>
          <input
            v-model="localForm.validTo"
            type="date"
            placeholder="结束日期"
            :min="localForm.validFrom"
          />
        </div>
        <span v-if="errors.validPeriod" class="error-text">{{ errors.validPeriod }}</span>
      </div>
    </div>

    <!-- 第三行: 分数设置 + 题目统计 -->
    <div class="form-row-double">
      <div class="form-group score-setting-group-minimal">
        <label class="required">分数设置</label>
        <div class="score-inputs">
          <div class="score-input-wrapper">
            <label>及格分</label>
            <input
              v-model.number="localForm.passingScore"
              type="number"
              min="0"
              :max="totalScore"
              @blur="validatePassingScore"
            />
            <span>分</span>
          </div>
          <span class="score-separator">/</span>
          <div class="total-score-display">
            <span class="score-label-text">总分</span>
            <span class="score-value">{{ totalScore }}</span>
            <span>分</span>
            <span class="score-hint">（根据题目自动计算）</span>
          </div>
        </div>
        <span v-if="errors.passingScore" class="error-text">{{ errors.passingScore }}</span>
      </div>

      <div class="stats-item">
        <span class="stats-label">题目统计</span>
        <div class="stats-value-group">
          <span class="stats-value">必答 {{ requiredCount }}题</span>
          <span class="stats-separator">/</span>
          <span class="stats-value optional">选答 {{ optionalCount }}题</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useProjectStore } from '@/stores/project'
import { useExamStore } from '@/stores/exam'
import { useLearningStageStore } from '@/stores/learningStage'
import PaymentRuleSelector from '@/components/PaymentRuleSelector.vue'
import type { ExamForm } from '../types'

interface Props {
  modelValue: ExamForm
  totalScore: number
  requiredCount: number
  optionalCount: number
}

interface Emits {
  (e: 'update:modelValue', value: ExamForm): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const projectStore = useProjectStore()
const examStore = useExamStore()
const learningStageStore = useLearningStageStore()

const localForm = ref<ExamForm>({ ...props.modelValue })
const errors = ref<Record<string, string>>({})
const currentYear = new Date().getFullYear()

// 获取项目列表
const projects = computed(() => projectStore.projects)

// 过滤科目列表（根据选中的项目）
const filteredSubjects = computed(() => {
  if (!localForm.value.projectId) return []
  return projectStore.subjects.filter(s => s.projectId === localForm.value.projectId)
})

// 获取当前科目下的学习阶段列表（过滤章节练习）
const learningStages = computed(() => {
  if (!localForm.value.subjectId) return []
  return learningStageStore.learningStages.filter(
    stage => stage.subjectId === localForm.value.subjectId &&
             stage.status === 'active' &&
             stage.isChapterPractice !== true  // 过滤章节练习
  ).sort((a, b) => a.sortOrder - b.sortOrder)
})

// 获取科目名称
const subjectName = computed(() => {
  const subject = projectStore.subjects.find(s => s.id === localForm.value.subjectId)
  return subject?.name || '未知科目'
})

// 获取项目名称
const projectName = computed(() => {
  const subject = projectStore.subjects.find(s => s.id === localForm.value.subjectId)
  if (!subject) return '未知项目'
  const project = projectStore.projects.find(p => p.id === subject.projectId)
  return project?.name || '未知项目'
})

// 获取学习阶段名称
const learningStageName = computed(() => {
  const stage = learningStageStore.learningStages.find(s => s.id === localForm.value.learningStageId)
  return stage?.name || '未选择'
})

// 监听父组件传入的表单数据变化
watch(() => props.modelValue, (newVal) => {
  Object.assign(localForm.value, newVal)
}, { deep: true })

// 监听本地表单数据变化,同步到父组件
watch(localForm, () => {
  emit('update:modelValue', { ...localForm.value })
}, { deep: true })

// 监听总分变化,自动调整及格分
watch(() => props.totalScore, (newTotalScore) => {
  if (localForm.value.passingScore > newTotalScore) {
    localForm.value.passingScore = newTotalScore
  }
  validatePassingScore()
})

// 验证试卷名称
function validateName() {
  if (!localForm.value.name.trim()) {
    errors.value.name = '试卷名称不能为空'
    return false
  }

  if (localForm.value.name.length > 100) {
    errors.value.name = '试卷名称不能超过100个字符'
    return false
  }

  // 检查唯一性
  const isUnique = examStore.checkExamNameUnique(
    localForm.value.name,
    localForm.value.subjectId
  )

  if (!isUnique) {
    errors.value.name = '该试卷名称已存在'
    return false
  }

  errors.value.name = ''
  return true
}

// 验证及格分
function validatePassingScore() {
  if (localForm.value.passingScore > props.totalScore) {
    errors.value.passingScore = `及格分不能超过总分(${props.totalScore}分)`
    return false
  }

  errors.value.passingScore = ''
  return true
}

// 验证学习阶段
function validateLearningStage() {
  if (!localForm.value.learningStageId) {
    errors.value.learningStageId = '请选择学习阶段'
    return false
  }

  errors.value.learningStageId = ''
  return true
}

// 验证项目
function validateProject() {
  if (!localForm.value.projectId) {
    errors.value.projectId = '请选择所属项目'
    return false
  }
  errors.value.projectId = ''
  return true
}

// 验证科目
function validateSubject() {
  if (!localForm.value.subjectId) {
    errors.value.subjectId = '请选择所属科目'
    return false
  }
  errors.value.subjectId = ''
  return true
}

// 项目切换事件（清空科目和学习阶段）
function onProjectChange() {
  localForm.value.subjectId = ''
  localForm.value.learningStageId = ''
  errors.value.projectId = ''
  errors.value.subjectId = ''
  errors.value.learningStageId = ''
  emit('update:modelValue', localForm.value)
}

// 科目切换事件（清空学习阶段）
function onSubjectChange() {
  localForm.value.learningStageId = ''
  errors.value.subjectId = ''
  errors.value.learningStageId = ''
  emit('update:modelValue', localForm.value)
}

// 暴露验证方法给父组件
defineExpose({
  validate: () => {
    const nameValid = validateName()
    const projectValid = validateProject()
    const subjectValid = validateSubject()
    const learningStageValid = validateLearningStage()
    const passingScoreValid = validatePassingScore()
    return nameValid && projectValid && subjectValid && learningStageValid && passingScoreValid
  }
})
</script>

<style scoped>
.basic-info-form-horizontal {
  background: var(--panel-bg);
  border: 2px solid #667eea;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 20px;
  max-width: none;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
}

.basic-info-form-horizontal h3 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-text);
  padding-bottom: 12px;
  border-bottom: 1px solid var(--panel-border);
}

/* 第一行: 试卷名称独占 */
.form-row-single {
  margin-bottom: 16px;
}

/* 第二行: 两列等宽布局（试卷名称 + 有效期） */
.form-row-double {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

/* 第一行: 四列布局（项目 + 科目 + 学习阶段 + 年份） */
.form-row-four-cols {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 120px;
  gap: 16px;
  margin-bottom: 16px;
}

/* 第一行: 五列等宽布局（项目 + 科目 + 学习阶段 + 年份 + 收费规则） */
.form-row-five-cols {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

/* 第一行: 三列等宽布局（项目 + 科目 + 学习阶段） - 已废弃，保留兼容 */
.form-row-triple-equal {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

/* 第三行: 三列混合布局（年份 + 付费级别 + 分数设置） */
.form-row-triple-mixed {
  display: grid;
  grid-template-columns: 120px 140px 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

/* 第二行: 三列布局 */
.form-row-triple {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr;
  gap: 16px;
  margin-bottom: 16px;
}

/* 第三行: 三列布局（年份 + 学习阶段 + 付费级别） */
.form-row-triple-new {
  display: grid;
  grid-template-columns: 120px 1fr 140px;
  gap: 16px;
  margin-bottom: 16px;
}

/* 第二行: 四列布局 */
.form-row-quad {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 2fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-text);
}

.form-group label.required::after {
  content: ' *';
  color: #ef5350;
}

.form-group input,
.form-group select {
  padding: 10px 12px;
  border: 1px solid var(--panel-border);
  border-radius: 6px;
  font-size: 14px;
  background: #ffffff;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--accent);
}

.date-range-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-range-wrapper input {
  flex: 1;
}

.date-separator {
  font-size: 14px;
  color: var(--secondary-text);
  padding: 0 4px;
}

.input-with-unit {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-with-unit input {
  flex: 1;
}

.unit {
  font-size: 14px;
  color: var(--secondary-text);
  font-weight: 500;
}

.error-text {
  font-size: 12px;
  color: #ef5350;
  margin-top: -2px;
}

/* 分数设置组样式（已弃用，保留兼容） */
.score-setting-group {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border: 2px solid #ff9800;
  border-radius: 8px;
  padding: 8px 12px;
}

.score-setting-group label {
  color: #e65100;
}

/* 分数设置组样式（弱化版本） */
.score-setting-group-minimal {
  /* 移除背景色和边框，与其他字段保持一致 */
}

.score-inputs {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.score-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-input-wrapper label {
  font-size: 14px;
  font-weight: 500;
  color: var(--primary-text);
  margin-bottom: 0;
}

.score-input-wrapper input {
  width: 80px;
  padding: 8px 12px;
  border: 1px solid var(--panel-border);
  border-radius: 6px;
  font-size: 14px;
}

.score-separator {
  font-size: 18px;
  color: var(--secondary-text);
  font-weight: 300;
  margin: 0 4px;
}

.total-score-display {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f0f4f8;  /* 轻微背景色，区分只读 */
  border-radius: 6px;
}

.score-label-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--primary-text);
}

.score-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--accent);
}

.score-hint {
  font-size: 12px;
  color: var(--secondary-text);
  margin-left: 8px;
}

.score-setting-inline {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

/* 第三行: 统计信息 - 已废弃，保留兼容 */
.stats-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--panel-border);
}

/* 统计卡片 - 适应两列布局 */
.stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e3f2fd 100%);
  border-radius: 8px;
  min-height: 80px;
}

.stats-label {
  font-size: 12px;
  color: var(--secondary-text);
  margin-bottom: 6px;
  font-weight: 500;
}

.stats-value-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stats-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent);
}

.stats-value.optional {
  color: #ff9800;
}

.stats-value.subject {
  color: #667eea;
  font-size: 13px;
}

.stats-separator {
  font-size: 12px;
  color: var(--secondary-text);
  font-weight: 500;
}

.score-label {
  font-size: 13px;
  color: #e65100;
  font-weight: 600;
}

.inline-score-input {
  width: 50px;
  padding: 3px 6px;
  border: 1px solid #ff9800;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  background: #ffffff;
}

.inline-score-input:focus {
  outline: none;
  border-color: #f57c00;
  box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.2);
}

.total-score-value {
  font-size: 14px;
  font-weight: 600;
  color: #e65100;
}

.score-unit {
  font-size: 12px;
  color: #e65100;
  font-weight: 500;
}
</style>
