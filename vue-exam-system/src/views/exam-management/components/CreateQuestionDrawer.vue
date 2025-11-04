<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="modelValue" class="drawer-overlay" @click="handleClose">
        <div class="drawer-content" @click.stop>
          <div class="drawer-header">
            <h3>创建新试题</h3>
            <button class="close-btn" @click="handleClose">✕</button>
          </div>

          <div class="drawer-body">
            <!-- 题型与难度选择 -->
            <div class="form-section">
              <div class="section-header">
                <h4>题型选择</h4>
                <div class="difficulty-selector">
                  <label>难度：</label>
                  <select v-model="filter.difficulty" class="difficulty-select">
                    <option value="">不限</option>
                    <option value="easy">简单</option>
                    <option value="medium">中等</option>
                    <option value="hard">困难</option>
                  </select>
                </div>
              </div>
              <div class="type-selector">
                <label v-for="type in questionTypes" :key="type.value" class="type-label" :class="{ active: currentType === type.value }">
                  <input
                    type="radio"
                    name="question-type"
                    :value="type.value"
                    v-model="currentType"
                    class="type-radio"
                  >
                  {{ type.label }}
                </label>
              </div>
            </div>

            <!-- 组合题特殊区域 -->
            <div v-if="currentType === 'combination'" class="form-section">
              <h4>案例背景（大题干）</h4>
              <div class="form-group">
                <label>案例背景 <span class="required">*</span></label>
                <textarea
                  v-model="mainStem"
                  placeholder="请输入组合题的案例背景材料（所有小问都基于此背景）..."
                  required
                  rows="6"
                  maxlength="5000"
                ></textarea>
                <span class="form-hint">提示：案例背景为所有小问提供统一的上下文，最多5000字符</span>
              </div>

              <div class="sub-questions-header">
                <h4>小问列表</h4>
                <button type="button" class="add-sub-question-btn" @click="addSubQuestion">
                  ➕ 添加小问
                </button>
              </div>

              <div v-if="subQuestions.length === 0" class="empty-sub-questions">
                <p>暂无小问，请点击【添加小问】按钮开始创建</p>
              </div>

              <div v-for="(subQ, index) in subQuestions" :key="subQ.id" class="sub-question-card">
                <div class="sub-question-header">
                  <span class="sub-question-number">小问 {{ index + 1 }}</span>
                  <button type="button" class="remove-sub-question-btn" @click="removeSubQuestion(index)">
                    删除小问
                  </button>
                </div>

                <div class="sub-question-body">
                  <!-- 小问题型选择 -->
                  <div class="form-group">
                    <label>题型 <span class="required">*</span></label>
                    <select v-model="subQ.type" @change="onSubQuestionTypeChange(index)">
                      <option value="single">单选题</option>
                      <option value="multiple">多选题</option>
                      <option value="judgment">判断题</option>
                      <option value="essay">简答题</option>
                    </select>
                    <span class="form-hint">注意：组合题小问不支持不定项题型</span>
                  </div>

                  <!-- 小问题干 -->
                  <div class="form-group">
                    <label>题干 <span class="required">*</span></label>
                    <textarea
                      v-model="subQ.stem"
                      :placeholder="`请输入第${index + 1}个小问的题干内容...`"
                      required
                      rows="3"
                    ></textarea>
                  </div>

                  <!-- 客观题选项 -->
                  <div v-if="isSubQuestionObjective(subQ.type)" class="form-group">
                    <label>选项设置 <span class="required">*</span></label>
                    <div class="options-container">
                      <div v-for="(opt, optIndex) in subQ.options" :key="opt.label" class="option-item">
                        <div class="option-label">{{ opt.label }}</div>
                        <input
                          type="text"
                          class="option-input"
                          v-model="opt.content"
                          :placeholder="`请输入选项${opt.label}内容`"
                          required
                        >
                        <button
                          type="button"
                          class="option-remove"
                          @click="removeSubQuestionOption(index, optIndex)"
                          :disabled="subQ.options!.length <= 2"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      class="add-option-btn"
                      @click="addSubQuestionOption(index)"
                      :disabled="subQ.options!.length >= 10"
                    >
                      ➕ 添加选项
                    </button>
                  </div>

                  <!-- 答案 -->
                  <div class="form-group">
                    <label>正确答案 <span class="required">*</span></label>

                    <!-- 单选题答案 -->
                    <div v-if="subQ.type === 'single'" class="answer-selector">
                      <label v-for="opt in subQ.options" :key="opt.label" class="answer-option">
                        <input type="radio" :value="opt.label" v-model="subQ.answer" :name="`sub-answer-${index}`">
                        {{ opt.label }}
                      </label>
                    </div>

                    <!-- 多选题答案 -->
                    <div v-else-if="subQ.type === 'multiple'" class="answer-selector">
                      <label v-for="opt in subQ.options" :key="opt.label" class="answer-option">
                        <input type="checkbox" :value="opt.label" v-model="subQ.answer" :name="`sub-answer-${index}`">
                        {{ opt.label }}
                      </label>
                    </div>

                    <!-- 判断题答案 -->
                    <div v-else-if="subQ.type === 'judgment'" class="answer-selector">
                      <label class="answer-option">
                        <input type="radio" value="true" v-model="subQ.answer" :name="`sub-answer-${index}`">
                        正确
                      </label>
                      <label class="answer-option">
                        <input type="radio" value="false" v-model="subQ.answer" :name="`sub-answer-${index}`">
                        错误
                      </label>
                    </div>

                    <!-- 简答题答案 -->
                    <div v-else>
                      <textarea
                        v-model="subQ.answer"
                        placeholder="请输入参考答案"
                        rows="3"
                      ></textarea>
                    </div>
                  </div>

                  <!-- 小问解析 -->
                  <div class="form-group">
                    <label>解析 <span class="required">*</span></label>
                    <textarea
                      v-model="subQ.explanation"
                      placeholder="请输入本小问的详细解析..."
                      rows="3"
                      required
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- 常规题型内容 -->
            <div v-else>
              <!-- 试题内容 -->
              <div class="form-section">
                <h4>试题内容</h4>
                <div class="form-group">
                  <label>题干 <span class="required">*</span></label>
                  <textarea
                    v-model="questionForm.stem"
                    placeholder="请输入题目内容..."
                    required
                    rows="6"
                    maxlength="5000"
                  ></textarea>
                  <span class="form-hint">提示：可输入题目描述、背景材料等内容，最多5000字符</span>
                </div>

                <!-- 客观题选项 -->
                <div v-if="isObjectiveQuestion" class="form-group">
                  <label>选项设置 <span class="required">*</span></label>
                  <div class="options-container">
                    <div v-for="(option, index) in options" :key="option.label" class="option-item">
                      <div class="option-label">{{ option.label }}</div>
                      <input
                        type="text"
                        class="option-input"
                        v-model="option.content"
                        :placeholder="`请输入选项${option.label}内容`"
                        required
                        maxlength="500"
                      >
                      <button
                        type="button"
                        class="option-remove"
                        @click="removeOption(index)"
                        :disabled="options.length <= 2"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    class="add-option-btn"
                    @click="addOption"
                    :disabled="options.length >= 10"
                  >
                    ➕ 添加选项
                  </button>
                  <span class="form-hint">提示：最少2个选项，最多10个选项，每个选项最多500字符</span>
                </div>
              </div>

              <!-- 答案与解析 -->
              <div class="form-section">
                <h4>答案与解析</h4>
                <div class="form-group">
                  <label>正确答案 <span class="required">*</span></label>

                  <!-- 单选题答案 -->
                  <div v-if="currentType === 'single'" class="answer-selector">
                    <label v-for="option in options" :key="option.label" class="answer-option">
                      <input type="radio" :value="option.label" v-model="singleAnswer">
                      {{ option.label }}
                    </label>
                  </div>

                  <!-- 多选题答案 -->
                  <div v-else-if="currentType === 'multiple'" class="answer-selector">
                    <label v-for="option in options" :key="option.label" class="answer-option">
                      <input type="checkbox" :value="option.label" v-model="multipleAnswer">
                      {{ option.label }}
                    </label>
                  </div>

                  <!-- 判断题答案 -->
                  <div v-else-if="currentType === 'judgment'" class="answer-selector">
                    <label class="answer-option">
                      <input type="radio" value="true" v-model="singleAnswer">
                      正确
                    </label>
                    <label class="answer-option">
                      <input type="radio" value="false" v-model="singleAnswer">
                      错误
                    </label>
                  </div>

                  <!-- 不定项答案 -->
                  <div v-else-if="currentType === 'uncertain'" class="answer-selector">
                    <label v-for="option in options" :key="option.label" class="answer-option">
                      <input type="checkbox" :value="option.label" v-model="multipleAnswer">
                      {{ option.label }}
                    </label>
                  </div>

                  <!-- 简答题答案 -->
                  <div v-else>
                    <textarea
                      v-model="textAnswer"
                      placeholder="请输入参考答案，最多2000字符"
                      rows="4"
                      maxlength="2000"
                    ></textarea>
                  </div>
                </div>

                <div class="form-group">
                  <label>试题解析 <span class="required">*</span></label>
                  <textarea
                    v-model="questionForm.explanation"
                    placeholder="请输入详细的答案解析，帮助学生理解...（最多3000字符）"
                    rows="5"
                    required
                    maxlength="3000"
                  ></textarea>
                  <span class="form-hint">提示：详细的解析有助于学生理解知识点，建议包含答案解析、知识点说明、解题思路</span>
                </div>
              </div>
            </div>
          </div>

          <div class="drawer-footer">
            <button type="button" class="btn secondary" @click="handleClose">取消</button>
            <button type="button" class="btn secondary" @click="handleSaveOnly">保存</button>
            <button type="button" class="btn primary" @click="handleSaveAndNext">保存并下一题</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useToast } from '@/composables/useToast'
import type { QuestionType, QuestionOption, SubQuestion } from '@/views/question-management/types'
import type { ExamQuestion, EmbeddedQuestionData } from '../types'

interface Props {
  modelValue: boolean
  subjectId: string
  projectId: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', examQuestion: ExamQuestion): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { showToast } = useToast()

// 筛选条件
const filter = ref<{
  difficulty?: string
}>({})

// 题型列表
const questionTypes = [
  { value: 'single', label: '单选题' },
  { value: 'multiple', label: '多选题' },
  { value: 'judgment', label: '判断题' },
  { value: 'uncertain', label: '不定项' },
  { value: 'essay', label: '简答题' },
  { value: 'combination', label: '组合题' }
]

// 当前题型
const currentType = ref<QuestionType>('single')

// 试题表单
const questionForm = ref({
  stem: '',
  explanation: ''
})

// 选项列表（常规题型）
const options = ref<QuestionOption[]>([
  { label: 'A', content: '' },
  { label: 'B', content: '' },
  { label: 'C', content: '' },
  { label: 'D', content: '' }
])

// 答案（常规题型）
const singleAnswer = ref('')
const multipleAnswer = ref<string[]>([])
const textAnswer = ref('')

// 组合题相关
const mainStem = ref('')
const subQuestions = ref<SubQuestion[]>([])

// 计算属性
const isObjectiveQuestion = computed(() => {
  return ['single', 'multiple', 'uncertain'].includes(currentType.value)
})

// 选项管理
function addOption() {
  if (options.value.length >= 10) return
  const nextLabel = String.fromCharCode(65 + options.value.length)
  options.value.push({ label: nextLabel, content: '' })
}

function removeOption(index: number) {
  if (options.value.length <= 2) return
  options.value.splice(index, 1)
  options.value.forEach((opt, idx) => {
    opt.label = String.fromCharCode(65 + idx)
  })
}

// 组合题：添加小问
function addSubQuestion() {
  const newSubQuestion: SubQuestion = {
    id: Date.now().toString() + Math.random(),
    type: 'single',
    stem: '',
    options: [
      { label: 'A', content: '' },
      { label: 'B', content: '' },
      { label: 'C', content: '' },
      { label: 'D', content: '' }
    ],
    answer: '',
    explanation: ''
  }
  subQuestions.value.push(newSubQuestion)
}

// 组合题：删除小问
function removeSubQuestion(index: number) {
  subQuestions.value.splice(index, 1)
}

// 组合题：判断小问是否为客观题
function isSubQuestionObjective(type: QuestionType): boolean {
  return ['single', 'multiple'].includes(type)
}

// 组合题：小问题型变化
function onSubQuestionTypeChange(index: number) {
  const subQ = subQuestions.value[index]

  // 重置答案
  if (subQ.type === 'single' || subQ.type === 'judgment') {
    subQ.answer = ''
  } else if (subQ.type === 'multiple') {
    subQ.answer = []
  } else {
    subQ.answer = ''
  }

  // 判断题不需要选项
  if (subQ.type === 'judgment') {
    subQ.options = undefined
  } else if (isSubQuestionObjective(subQ.type) && !subQ.options) {
    subQ.options = [
      { label: 'A', content: '' },
      { label: 'B', content: '' },
      { label: 'C', content: '' },
      { label: 'D', content: '' }
    ]
  } else if (subQ.type === 'essay') {
    subQ.options = undefined
  }
}

// 组合题：小问添加选项
function addSubQuestionOption(subQIndex: number) {
  const subQ = subQuestions.value[subQIndex]
  if (!subQ.options || subQ.options.length >= 10) return
  const nextLabel = String.fromCharCode(65 + subQ.options.length)
  subQ.options.push({ label: nextLabel, content: '' })
}

// 组合题：小问删除选项
function removeSubQuestionOption(subQIndex: number, optIndex: number) {
  const subQ = subQuestions.value[subQIndex]
  if (!subQ.options || subQ.options.length <= 2) return
  subQ.options.splice(optIndex, 1)
  subQ.options.forEach((opt, idx) => {
    opt.label = String.fromCharCode(65 + idx)
  })
}

// 表单验证
function validateForm(): boolean {
  // 组合题验证
  if (currentType.value === 'combination') {
    if (!mainStem.value.trim()) {
      showToast('请输入案例背景', { type: 'error' })
      return false
    }
    if (subQuestions.value.length === 0) {
      showToast('组合题至少需要添加一个小问', { type: 'error' })
      return false
    }
    // 验证每个小问
    for (let i = 0; i < subQuestions.value.length; i++) {
      const subQ = subQuestions.value[i]
      if (!subQ.stem.trim()) {
        showToast(`小问${i + 1}的题干不能为空`, { type: 'error' })
        return false
      }
      if (isSubQuestionObjective(subQ.type) && subQ.options) {
        if (subQ.options.some(opt => !opt.content.trim())) {
          showToast(`小问${i + 1}的选项内容不能为空`, { type: 'error' })
          return false
        }
      }
      if (subQ.type === 'single' || subQ.type === 'judgment') {
        if (!subQ.answer) {
          showToast(`小问${i + 1}未选择答案`, { type: 'error' })
          return false
        }
      } else if (subQ.type === 'multiple') {
        if (!Array.isArray(subQ.answer) || subQ.answer.length === 0) {
          showToast(`小问${i + 1}至少选择一个答案`, { type: 'error' })
          return false
        }
      } else {
        if (typeof subQ.answer === 'string' && !subQ.answer.trim()) {
          showToast(`小问${i + 1}的答案不能为空`, { type: 'error' })
          return false
        }
      }
      if (!subQ.explanation.trim()) {
        showToast(`小问${i + 1}的解析不能为空`, { type: 'error' })
        return false
      }
    }
    return true
  }

  // 常规题型验证
  if (!questionForm.value.stem.trim()) {
    showToast('请输入题干内容', { type: 'error' })
    return false
  }
  if (isObjectiveQuestion.value) {
    if (options.value.some(opt => !opt.content.trim())) {
      showToast('请填写所有选项内容', { type: 'error' })
      return false
    }
    if (currentType.value === 'single' && !singleAnswer.value) {
      showToast('请选择正确答案', { type: 'error' })
      return false
    }
    if ((currentType.value === 'multiple' || currentType.value === 'uncertain') && multipleAnswer.value.length === 0) {
      showToast('请至少选择一个正确答案', { type: 'error' })
      return false
    }
  } else if (currentType.value === 'judgment' && !singleAnswer.value) {
    showToast('请选择正确答案', { type: 'error' })
    return false
  } else if (currentType.value === 'essay' && !textAnswer.value.trim()) {
    showToast('请输入参考答案', { type: 'error' })
    return false
  }
  if (!questionForm.value.explanation.trim()) {
    showToast('请输入试题解析', { type: 'error' })
    return false
  }
  return true
}

// 获取默认分值
function getDefaultScore(type: string): number {
  const defaultScores: Record<string, number> = {
    single: 5,
    multiple: 10,
    judgment: 5,
    uncertain: 10,
    essay: 20,
    combination: 50
  }
  return defaultScores[type] || 10
}

// 生成临时ID
function generateEmbeddedId(): string {
  return `embedded-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// 构建试题数据
function buildExamQuestion(): ExamQuestion {
  // 构建嵌入式试题数据
  const embedded: EmbeddedQuestionData = {
    stem: '',
    answer: '',
    explanation: '',
    difficulty: filter.value.difficulty
  }

  // 组合题
  if (currentType.value === 'combination') {
    embedded.stem = mainStem.value
    embedded.mainStem = mainStem.value
    embedded.subQuestions = subQuestions.value.map(subQ => ({ ...subQ }))
    embedded.answer = '参见小问答案'
    embedded.explanation = '参见各小问解析'
  } else {
    // 常规题型
    embedded.stem = questionForm.value.stem
    embedded.explanation = questionForm.value.explanation

    if (isObjectiveQuestion.value) {
      embedded.options = options.value.map(opt => ({ ...opt }))
      if (currentType.value === 'single') {
        embedded.answer = singleAnswer.value
      } else {
        embedded.answer = [...multipleAnswer.value]
      }
    } else if (currentType.value === 'judgment') {
      embedded.answer = singleAnswer.value
    } else {
      embedded.answer = textAnswer.value
    }
  }

  // 构建 ExamQuestion 对象
  return {
    questionId: generateEmbeddedId(),
    type: currentType.value,
    score: getDefaultScore(currentType.value),
    order: 0, // 由父组件设置
    isOptional: false,
    embedded
  }
}

// 保存试题（关闭抽屉）
function handleSaveOnly() {
  if (!validateForm()) return

  const examQuestion = buildExamQuestion()
  emit('confirm', examQuestion)
  emit('update:modelValue', false)
  showToast('试题已添加到试卷', { type: 'success' })

  // 重置表单
  resetForm()
}

// 保存并下一题（保持打开）
function handleSaveAndNext() {
  if (!validateForm()) return

  const examQuestion = buildExamQuestion()
  emit('confirm', examQuestion)
  showToast('试题已添加，请继续创建下一题', { type: 'success' })

  // 重置表单，继续下一题
  resetForm()
}

// 重置表单
function resetForm() {
  filter.value = {}
  currentType.value = 'single'
  questionForm.value = { stem: '', explanation: '' }
  singleAnswer.value = ''
  multipleAnswer.value = []
  textAnswer.value = ''
  mainStem.value = ''
  subQuestions.value = []
  options.value = [
    { label: 'A', content: '' },
    { label: 'B', content: '' },
    { label: 'C', content: '' },
    { label: 'D', content: '' }
  ]
}

// 关闭抽屉
function handleClose() {
  emit('update:modelValue', false)
}

// 监听题型变化,重置答案
watch(currentType, () => {
  singleAnswer.value = ''
  multipleAnswer.value = []
  textAnswer.value = ''
  mainStem.value = ''
  subQuestions.value = []

  if (currentType.value === 'combination') {
    options.value = []
  } else if (!isObjectiveQuestion.value && currentType.value !== 'judgment') {
    options.value = []
  } else if (options.value.length === 0) {
    options.value = [
      { label: 'A', content: '' },
      { label: 'B', content: '' },
      { label: 'C', content: '' },
      { label: 'D', content: '' }
    ]
  }
})
</script>

<style scoped>
/* 抽屉遮罩 */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

/* 抽屉内容 */
.drawer-content {
  width: 85%;
  max-width: 1400px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
}

/* 抽屉头部 */
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  border-bottom: 1px solid var(--panel-border);
  background: var(--panel-bg);
}

.drawer-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-text);
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--secondary-text);
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--primary-text);
}

/* 抽屉主体 */
.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 抽屉底部 */
.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 32px;
  border-top: 1px solid var(--panel-border);
  background: var(--panel-bg);
}

/* 表单区域 */
.form-section {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  padding: 24px;
}

.form-section h4 {
  margin: 0 0 20px;
  font-size: 16px;
  font-weight: 600;
  color: var(--accent);
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-section h4::before {
  content: "";
  width: 4px;
  height: 16px;
  background: linear-gradient(180deg, #4f77ff 0%, #2f57e3 100%);
  border-radius: 2px;
}

/* 题型区域头部（题型标题 + 难度选择并排） */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h4 {
  margin: 0;
}

.difficulty-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--primary-text);
}

.difficulty-selector label {
  font-weight: 500;
  white-space: nowrap;
}

.difficulty-select {
  padding: 6px 12px;
  border: 1px solid #cdd5e0;
  border-radius: 6px;
  font-size: 13px;
  background: #ffffff;
  cursor: pointer;
  transition: border-color 0.2s ease;
  min-width: 100px;
}

.difficulty-select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.filter-grid-two-cols {
  grid-template-columns: 1fr 1fr;
}

.form-group {
  display: grid;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  font-size: 13px;
  color: var(--primary-text);
}

.form-group label .required {
  color: #d54a3c;
  margin-left: 2px;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #cdd5e0;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}

.form-group input:disabled {
  background: #f5f5f5;
  color: var(--secondary-text);
  cursor: not-allowed;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-hint {
  font-size: 12px;
  color: var(--secondary-text);
}

/* 题型选择 */
.type-selector {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.type-radio {
  position: absolute;
  opacity: 0;
}

.type-label {
  padding: 10px 20px;
  border-radius: 8px;
  border: 2px solid #e4eaf2;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 14px;
  color: var(--primary-text);
}

.type-label:hover {
  border-color: var(--accent);
  background: var(--row-hover);
}

.type-label.active {
  border-color: var(--accent);
  background: linear-gradient(180deg, #e6f2ff 0%, #d9ebff 100%);
  color: var(--accent);
  font-weight: 600;
}

/* 选项管理 */
.options-container {
  display: grid;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.option-label {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: linear-gradient(180deg, #4f77ff 0%, #2f57e3 100%);
  color: #ffffff;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.option-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #cdd5e0;
  border-radius: 6px;
  font-size: 14px;
}

.option-remove {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #cf4a30;
  background: #ffffff;
  color: #cf4a30;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-remove:hover:not(:disabled) {
  background: #fff3f0;
}

.option-remove:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-option-btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: 2px dashed var(--accent);
  background: #ffffff;
  color: var(--accent);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: fit-content;
}

.add-option-btn:hover:not(:disabled) {
  background: var(--row-hover);
}

.add-option-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 答案选择 */
.answer-selector {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.answer-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #e4eaf2;
  border-radius: 6px;
  background: #fafcfe;
  cursor: pointer;
  transition: all 0.2s ease;
}

.answer-option:hover {
  background: var(--row-hover);
  border-color: var(--accent);
}

.answer-option input {
  cursor: pointer;
}

/* 组合题相关样式 */
.sub-questions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.sub-questions-header h4 {
  margin: 0;
}

.add-sub-question-btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: 2px dashed var(--accent);
  background: #ffffff;
  color: var(--accent);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-sub-question-btn:hover {
  background: var(--row-hover);
}

.empty-sub-questions {
  text-align: center;
  padding: 40px 20px;
  color: var(--secondary-text);
  background: #fafcfe;
  border: 1px dashed #e4eaf2;
  border-radius: 8px;
}

.sub-question-card {
  background: #fafcfe;
  border: 1px solid #e4eaf2;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}

.sub-question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(180deg, #e6f2ff 0%, #d9ebff 100%);
  border-bottom: 1px solid #e4eaf2;
}

.sub-question-number {
  font-weight: 600;
  font-size: 14px;
  color: var(--accent);
}

.remove-sub-question-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #cf4a30;
  background: #ffffff;
  color: #cf4a30;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-sub-question-btn:hover {
  background: #fff3f0;
}

.sub-question-body {
  padding: 16px;
  display: grid;
  gap: 16px;
}

/* 按钮样式 */
.btn {
  padding: 10px 24px;
  border-radius: 8px;
  border: 1px solid transparent;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn.primary {
  background: linear-gradient(180deg, #4f77ff 0%, #2f57e3 100%);
  color: #ffffff;
  border-color: #375edf;
  box-shadow: 0 4px 8px rgba(79, 119, 255, 0.3);
}

.btn.primary:hover {
  background: linear-gradient(180deg, #4b6ee6 0%, #264acc 100%);
}

.btn.secondary {
  background-color: #ffffff;
  color: var(--accent);
  border-color: rgba(0, 102, 204, 0.4);
}

.btn.secondary:hover {
  background-color: rgba(0, 102, 204, 0.08);
}

/* 抽屉动画 */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-enter-active .drawer-content,
.drawer-leave-active .drawer-content {
  transition: transform 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .drawer-content,
.drawer-leave-to .drawer-content {
  transform: translateX(100%);
}
</style>
