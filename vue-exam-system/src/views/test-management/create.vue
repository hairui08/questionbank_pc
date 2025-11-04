<template>
  <AppLayout :title="`题库系统 - ${isEditMode ? '编辑考试' : '创建考试'}`">
    <div class="create-test-page">
      <!-- 顶部操作栏 -->
      <div class="top-bar">
        <button class="btn secondary" @click="handleBack">
          ← 返回列表
        </button>
        <div class="top-actions">
          <button class="btn primary" @click="handleSave">
            💾 保存考试
          </button>
        </div>
      </div>

      <!-- 基础信息表单 -->
      <div class="form-panel">
        <h3 class="panel-title">📝 基础信息</h3>

        <div class="form-grid">
          <!-- 第一行：考试基本信息（考试名称 + 考试类型 + 收费规则） -->
          <div class="form-row-name-type-payment">
            <div class="form-item">
              <label>考试名称 <span class="required">*</span></label>
              <input
                v-model="testForm.name"
                type="text"
                placeholder="请输入考试名称(1-100字符)"
                :class="{ error: errors.name }"
              />
              <p v-if="errors.name" class="error-text">{{ errors.name }}</p>
            </div>

            <div class="form-item">
              <label>考试类型 <span class="required">*</span></label>
              <select v-model="testForm.examType">
                <option value="formal">正式考试</option>
                <option value="mock">模拟考试</option>
                <option value="practice">练习测试</option>
                <option value="quiz">随堂测验</option>
              </select>
            </div>

            <div class="form-item">
              <label>收费规则</label>
              <PaymentRuleSelector
                v-model="testForm.paymentRuleId"
                :applicable-to="['exam']"
              />
            </div>
          </div>

          <!-- 第二行：级联选择（项目→科目→试卷） -->
          <div class="form-row">
            <div class="form-item">
              <label>所属项目 <span class="required">*</span></label>
              <select
                v-model="testForm.projectId"
                :class="{ error: errors.projectId }"
                @change="handleProjectChange"
              >
                <option value="">请选择项目</option>
                <option
                  v-for="project in projects"
                  :key="project.id"
                  :value="project.id"
                >
                  {{ project.name }}
                </option>
              </select>
              <p v-if="errors.projectId" class="error-text">{{ errors.projectId }}</p>
            </div>

            <div class="form-item">
              <label>所属科目 <span class="required">*</span></label>
              <select
                v-model="testForm.subjectId"
                :class="{ error: errors.subjectId }"
                @change="handleSubjectChange"
                :disabled="!testForm.projectId"
              >
                <option value="">{{ testForm.projectId ? '请选择科目' : '请先选择项目' }}</option>
                <option
                  v-for="subject in filteredSubjects"
                  :key="subject.id"
                  :value="subject.id"
                >
                  {{ subject.name }}
                </option>
              </select>
              <p v-if="errors.subjectId" class="error-text">{{ errors.subjectId }}</p>
            </div>

            <div class="form-item">
              <label>关联试卷 <span class="required">*</span></label>
              <div class="input-with-button">
                <select
                  v-model="testForm.examPaperId"
                  :class="{ error: errors.examPaperId }"
                  :disabled="!testForm.subjectId"
                >
                  <option value="">{{ testForm.subjectId ? '请选择试卷' : '请先选择科目' }}</option>
                  <option
                    v-for="exam in availableExams"
                    :key="exam.id"
                    :value="exam.id"
                  >
                    {{ exam.name }} (总分: {{ exam.totalScore }}分)
                  </option>
                </select>
                <button
                  v-if="testForm.examPaperId"
                  type="button"
                  class="btn preview-btn"
                  @click="showExamPreview"
                >
                  👁️ 预览
                </button>
              </div>
              <p v-if="errors.examPaperId" class="error-text">{{ errors.examPaperId }}</p>
            </div>
          </div>

          <!-- 第三行：时间设置 -->
          <div class="form-row">
            <div class="form-item">
              <label>考试时长(分钟) <span class="required">*</span></label>
              <input
                v-model.number="testForm.duration"
                type="number"
                placeholder="考试时长"
                min="1"
                max="600"
              />
            </div>

            <div class="form-item">
              <label>考试开始时间 <span class="required">*</span></label>
              <input
                v-model="testForm.startTime"
                type="datetime-local"
                :class="{ error: errors.startTime }"
              />
              <p v-if="errors.startTime" class="error-text">{{ errors.startTime }}</p>
            </div>

            <div class="form-item">
              <label>考试结束时间 <span class="required">*</span></label>
              <input
                v-model="testForm.endTime"
                type="datetime-local"
                :class="{ error: errors.endTime }"
              />
              <p v-if="errors.endTime" class="error-text">{{ errors.endTime }}</p>
            </div>
          </div>

          <!-- 第四行：分数设置 -->
          <div class="form-row score-row">
            <div class="form-item">
              <label>总分</label>
              <input
                v-model.number="testForm.totalScore"
                type="number"
                placeholder="总分"
                readonly
                class="readonly-input"
              />
            </div>

            <div class="form-item">
              <label>及格分 <span class="required">*</span></label>
              <input
                v-model.number="testForm.passingScore"
                type="number"
                placeholder="及格分"
                min="0"
                :max="testForm.totalScore"
              />
            </div>

            <div class="form-item">
              <!-- 空白占位，保持布局对齐 -->
            </div>
          </div>
        </div>
      </div>

      <!-- 考试配置表单 -->
      <div class="form-panel">
        <h3 class="panel-title">⚙️ 考试配置</h3>

        <div class="config-grid">
          <!-- 显示设置 -->
          <div class="config-section">
            <h4 class="config-section-title">显示设置</h4>
            <div class="config-items">
              <div class="config-item">
                <label class="switch-label">
                  <input
                    type="checkbox"
                    v-model="testForm.showAnswer"
                    class="switch-input"
                  />
                  <span class="switch-slider"></span>
                  <span class="switch-text">显示答案</span>
                </label>
                <span class="config-desc">考生提交后是否显示正确答案</span>
              </div>

              <div class="config-item">
                <label class="switch-label">
                  <input
                    type="checkbox"
                    v-model="testForm.showExplanation"
                    class="switch-input"
                  />
                  <span class="switch-slider"></span>
                  <span class="switch-text">显示解析</span>
                </label>
                <span class="config-desc">考生提交后是否显示题目解析</span>
              </div>

              <div class="config-item">
                <label class="switch-label">
                  <input
                    type="checkbox"
                    v-model="testForm.showScore"
                    class="switch-input"
                  />
                  <span class="switch-slider"></span>
                  <span class="switch-text">显示分数</span>
                </label>
                <span class="config-desc">考生提交后是否立即显示成绩</span>
              </div>
            </div>
          </div>

          <!-- 限制设置 -->
          <div class="config-section">
            <h4 class="config-section-title">限制设置</h4>
            <div class="config-items">
              <div class="config-item">
                <label class="input-label">可做次数</label>
                <div class="attempt-input-group">
                  <input
                    v-model.number="testForm.attemptLimit"
                    type="number"
                    min="0"
                    max="100"
                    class="attempt-input"
                  />
                  <span class="attempt-hint">0 表示无限制</span>
                </div>
                <span class="config-desc">限制考生参加考试的次数</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 试卷预览模态框 -->
    <ExamPreviewModal
      v-model="showPreviewModal"
      :exam-id="previewExamId"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppLayout from '@/components/Layout/AppLayout.vue'
import ExamPreviewModal from './components/ExamPreviewModal.vue'
import PaymentRuleSelector from '@/components/PaymentRuleSelector.vue'
import { useTestStore } from '@/stores/test'
import { useProjectStore } from '@/stores/project'
import { useExamStore } from '@/stores/exam'
import { useToast } from '@/composables/useToast'
import type { TestForm } from './types'

const router = useRouter()
const route = useRoute()
const testStore = useTestStore()
const projectStore = useProjectStore()
const examStore = useExamStore()
const { showToast } = useToast()

// 是否为编辑模式
const isEditMode = computed(() => !!route.params.id)

// 表单数据
const testForm = ref<TestForm>({
  name: '',
  examType: 'formal',
  totalScore: 0,
  passingScore: 60,
  duration: 90,
  startTime: '',
  endTime: '',
  subjectId: '',
  projectId: '',
  examPaperId: '',
  showAnswer: true,
  showExplanation: true,
  showScore: true,
  attemptLimit: 0
})

// 错误信息
const errors = ref<Record<string, string>>({})

// 试卷预览相关
const showPreviewModal = ref(false)
const previewExamId = ref<string>('')

// 获取所有项目
const projects = computed(() => projectStore.projects)

// 根据选中的项目筛选科目
const filteredSubjects = computed(() => {
  if (!testForm.value.projectId) {
    return []
  }
  return projectStore.subjects.filter(s => s.projectId === testForm.value.projectId)
})

// 获取该科目下的可用试卷
const availableExams = computed(() => {
  if (!testForm.value.subjectId) return []
  return examStore.getPaginatedExams(
    { subjectId: testForm.value.subjectId, status: 'active' },
    1,
    100
  ).data
})

// 监听选中的试卷,自动填充总分
watch(() => testForm.value.examPaperId, (newId) => {
  if (newId) {
    const exam = examStore.getExamById(newId)
    if (exam) {
      testForm.value.totalScore = exam.totalScore
      // 自动设置及格分为总分的60%
      if (testForm.value.passingScore === 0 || testForm.value.passingScore > exam.totalScore) {
        testForm.value.passingScore = Math.floor(exam.totalScore * 0.6)
      }
    }
  }
})

// 初始化
onMounted(() => {
  if (isEditMode.value) {
    loadTestData()
  } else {
    initNewTest()
  }
})

// 初始化新考试
function initNewTest() {
  // 项目和科目默认为空，由用户手动选择
  testForm.value.projectId = ''
  testForm.value.subjectId = ''

  // 设置默认考试时间(明天)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(9, 0, 0, 0)
  testForm.value.startTime = formatDateTimeLocal(tomorrow.toISOString())

  const endTime = new Date(tomorrow)
  endTime.setHours(11, 0, 0, 0)
  testForm.value.endTime = formatDateTimeLocal(endTime.toISOString())
}

// 项目变化时清空科目和试卷选择
function handleProjectChange() {
  testForm.value.subjectId = ''
  testForm.value.examPaperId = ''
  errors.value.projectId = ''
}

// 科目变化时清空试卷选择
function handleSubjectChange() {
  testForm.value.examPaperId = ''
  errors.value.subjectId = ''
}

// 加载考试数据(编辑模式)
function loadTestData() {
  const testId = route.params.id as string
  const test = testStore.getTestById.value(testId)

  if (!test) {
    showToast('考试不存在', { type: 'error' })
    router.back()
    return
  }

  if (test.status === 'approved') {
    showToast('已审核的考试不能编辑', { type: 'error' })
    router.back()
    return
  }

  testForm.value = {
    name: test.name,
    examType: test.examType,
    totalScore: test.totalScore,
    passingScore: test.passingScore,
    duration: test.duration,
    startTime: formatDateTimeLocal(test.startTime),
    endTime: formatDateTimeLocal(test.endTime),
    subjectId: test.subjectId,
    projectId: test.projectId,
    examPaperId: test.examPaperId,
    showAnswer: test.showAnswer !== undefined ? test.showAnswer : true,
    showExplanation: test.showExplanation !== undefined ? test.showExplanation : true,
    showScore: test.showScore !== undefined ? test.showScore : true,
    attemptLimit: test.attemptLimit || 0
  }
}

// 验证表单
function validateForm(): boolean {
  errors.value = {}

  // 项目
  if (!testForm.value.projectId) {
    errors.value.projectId = '请选择项目'
  }

  // 科目
  if (!testForm.value.subjectId) {
    errors.value.subjectId = '请选择科目'
  }

  // 考试名称
  if (!testForm.value.name.trim()) {
    errors.value.name = '请输入考试名称'
  } else if (testForm.value.name.length > 100) {
    errors.value.name = '考试名称不能超过100字符'
  }

  // 关联试卷
  if (!testForm.value.examPaperId) {
    errors.value.examPaperId = '请选择关联的试卷'
  }

  // 考试时间
  if (!testForm.value.startTime) {
    errors.value.startTime = '请选择考试开始时间'
  } else {
    const startTime = new Date(testForm.value.startTime)
    const now = new Date()
    if (startTime < now) {
      errors.value.startTime = '考试开始时间不能早于当前时间'
    }
  }

  if (!testForm.value.endTime) {
    errors.value.endTime = '请选择考试结束时间'
  } else if (testForm.value.startTime) {
    const startTime = new Date(testForm.value.startTime)
    const endTime = new Date(testForm.value.endTime)
    if (endTime <= startTime) {
      errors.value.endTime = '考试结束时间必须晚于开始时间'
    }
  }

  return Object.keys(errors.value).length === 0
}

// 保存考试
function handleSave() {
  if (!validateForm()) {
    showToast('请检查表单信息', { type: 'error' })
    return
  }

  try {
    const formData = {
      ...testForm.value,
      startTime: formatDateTime(testForm.value.startTime),
      endTime: formatDateTime(testForm.value.endTime)
    }

    if (isEditMode.value) {
      testStore.updateTest(route.params.id as string, formData)
      showToast('考试更新成功', { type: 'success' })
    } else {
      testStore.addTest(formData)
      showToast('考试创建成功,状态为待审核', { type: 'success' })
    }
    router.push('/test-management')
  } catch (error: any) {
    showToast(error.message || '保存失败', { type: 'error' })
  }
}

// 返回列表
function handleBack() {
  router.push('/test-management')
}

// 显示试卷预览
function showExamPreview() {
  if (testForm.value.examPaperId) {
    previewExamId.value = testForm.value.examPaperId
    showPreviewModal.value = true
  }
}

// 格式化日期时间(给datetime-local使用)
function formatDateTimeLocal(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// 格式化日期时间(给后端使用)
function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}
</script>

<style scoped>
.create-test-page {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
}

.top-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.btn.primary {
  background: linear-gradient(180deg, #4f77ff 0%, #2f57e3 100%);
  color: #ffffff;
  border-color: #375edf;
  box-shadow: 0 2px 6px rgba(79, 119, 255, 0.3);
}

.btn.primary:hover {
  background: linear-gradient(180deg, #4b6ee6 0%, #264acc 100%);
}

.btn.secondary {
  background: #ffffff;
  color: var(--accent);
  border-color: rgba(0, 102, 204, 0.4);
}

.btn.secondary:hover {
  background: rgba(0, 102, 204, 0.08);
}

/* 表单面板 */
.form-panel {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  padding: 24px;
}

.panel-title {
  margin: 0 0 24px;
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-text);
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 第一行: 考试名称 + 考试类型 + 收费规则（2:1:1 比例） */
.form-row-name-type-payment {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-text);
}

.required {
  color: #ef5350;
}

.form-item input[type="text"],
.form-item input[type="number"],
.form-item input[type="datetime-local"],
.form-item select {
  padding: 10px 14px;
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  font-size: 14px;
  background: #ffffff;
  transition: border-color 0.2s ease;
}

.form-item input:focus,
.form-item select:focus {
  outline: none;
  border-color: var(--accent);
}

.form-item input.error,
.form-item select.error {
  border-color: #ef5350;
}

.readonly-input {
  background: #f5f5f5;
  color: var(--secondary-text);
  cursor: not-allowed;
}

.error-text {
  margin: 0;
  font-size: 13px;
  color: #ef5350;
}

.score-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-group input {
  flex: 1;
}

.separator {
  font-size: 16px;
  font-weight: 600;
  color: var(--secondary-text);
}

/* 带按钮的输入框组 */
.input-with-button {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.input-with-button select {
  flex: 1;
}

.preview-btn {
  padding: 10px 16px;
  background: #ffffff;
  color: var(--accent);
  border: 1px solid var(--accent);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.preview-btn:hover {
  background: var(--accent);
  color: #ffffff;
}

/* 分数行样式 */
.score-row {
  grid-template-columns: 1fr 1fr 1fr;
}

@media (max-width: 1200px) {
  .form-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

/* 配置面板样式 */
.config-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-section-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--primary-text);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--panel-border);
}

.config-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-desc {
  font-size: 13px;
  color: var(--secondary-text);
  padding-left: 52px;
}

/* Switch开关样式 */
.switch-label {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  position: relative;
}

.switch-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-slider {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  background: #dfe3eb;
  border-radius: 24px;
  margin-right: 12px;
  transition: background-color 0.2s ease;
}

.switch-slider::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background: #ffffff;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: transform 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.switch-input:checked + .switch-slider {
  background: var(--accent);
}

.switch-input:checked + .switch-slider::before {
  transform: translateX(20px);
}

.switch-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--primary-text);
}

/* 次数限制输入框样式 */
.input-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-text);
  margin-bottom: 4px;
}

.attempt-input-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.attempt-input {
  width: 100px;
  padding: 8px 12px;
  border: 1px solid var(--panel-border);
  border-radius: 6px;
  font-size: 14px;
  background: #ffffff;
}

.attempt-input:focus {
  outline: none;
  border-color: var(--accent);
}

.attempt-hint {
  font-size: 13px;
  color: var(--secondary-text);
}

@media (max-width: 1200px) {
  .config-grid {
    grid-template-columns: 1fr;
  }
}
</style>
