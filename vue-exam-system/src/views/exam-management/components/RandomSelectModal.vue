<template>
  <BaseModal
    :visible="show"
    title="随机组卷"
    width="1000px"
    @update:visible="handleClose"
  >
    <template #body>
      <div class="random-select-content">
        <!-- 模式选择标签页 -->
        <div class="mode-tabs">
          <button
            class="mode-tab"
            :class="{ active: mode === 'chapter' }"
            @click="mode = 'chapter'"
          >
            📚 按章节出题
          </button>
          <button
            class="mode-tab"
            :class="{ active: mode === 'knowledgePoint' }"
            @click="mode = 'knowledgePoint'"
          >
            💡 按知识点出题
          </button>
        </div>

        <!-- 配置表单 -->
        <div class="config-form">
          <!-- 题型选择 -->
          <div class="form-row">
            <label class="form-label">题型<span class="required">*</span></label>
            <div class="question-type-selector">
              <button
                v-for="type in questionTypes"
                :key="type.value"
                class="type-btn"
                :class="{ active: config.type === type.value }"
                type="button"
                @click="config.type = type.value as any"
              >
                <span class="type-icon">{{ type.icon }}</span>
                <span class="type-label">{{ type.label }}</span>
              </button>
            </div>
          </div>

          <!-- 按章节选择 -->
          <div v-if="mode === 'chapter'" class="form-row">
            <label class="form-label">选择章节<span class="required">*</span></label>
            <div class="checkbox-group">
              <label
                v-for="chapter in chapters"
                :key="chapter.id"
                class="checkbox-item"
              >
                <input
                  type="checkbox"
                  :value="chapter.id"
                  :checked="config.targetIds.includes(chapter.id)"
                  @change="toggleTarget(chapter.id)"
                />
                <span>{{ chapter.name }}</span>
              </label>
              <div v-if="chapters.length === 0" class="empty-hint">
                该科目暂无章节数据
              </div>
            </div>
          </div>

          <!-- 按知识点选择 -->
          <div v-if="mode === 'knowledgePoint'" class="form-row">
            <label class="form-label">选择知识点<span class="required">*</span></label>
            <div class="checkbox-group">
              <label
                v-for="kp in knowledgePoints"
                :key="kp.id"
                class="checkbox-item"
              >
                <input
                  type="checkbox"
                  :value="kp.id"
                  :checked="config.targetIds.includes(kp.id)"
                  @change="toggleTarget(kp.id)"
                />
                <span>{{ kp.name }}</span>
              </label>
              <div v-if="knowledgePoints.length === 0" class="empty-hint">
                该科目暂无知识点数据
              </div>
            </div>
          </div>

          <!-- 难度配置 -->
          <div class="difficulty-config">
            <div class="difficulty-header">
              <span class="form-label">试题数量配置<span class="required">*</span></span>
              <div class="quick-actions">
                <button class="btn-quick" @click="setAllDifficulties(5)">全部设为5题</button>
                <button class="btn-quick" @click="setAllDifficulties(10)">全部设为10题</button>
                <button class="btn-quick" @click="clearAllDifficulties">清空</button>
              </div>
            </div>
            <div class="difficulty-items">
              <div class="difficulty-item">
                <label>简单</label>
                <input
                  v-model.number="config.difficulties.easy"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="form-input"
                />
                <span class="unit">题</span>
              </div>
              <div class="difficulty-item">
                <label>中等</label>
                <input
                  v-model.number="config.difficulties.medium"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="form-input"
                />
                <span class="unit">题</span>
              </div>
              <div class="difficulty-item">
                <label>困难</label>
                <input
                  v-model.number="config.difficulties.hard"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="form-input"
                />
                <span class="unit">题</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </template>
    <template #footer>
      <button class="btn secondary" @click="handleClose">取消</button>
      <button class="btn primary" :disabled="!canGenerate" @click="handleGenerate">
        🎲 开始组卷
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseModal from '@/components/Modal/BaseModal.vue'
import { useChapterStore } from '@/stores/chapter'
import { useKnowledgePointStore } from '@/stores/knowledgePoint'
import { useQuestionStore } from '@/stores/question'
import type { QuestionType } from '@/views/question-management/types'

interface Props {
  show: boolean
  subjectId: string
  excludeIds?: string[] // 已添加到试卷的试题ID
}

interface Emits {
  (e: 'close'): void
  (e: 'confirm', questionIds: string[]): void
}

interface RandomSelectConfig {
  type: QuestionType | ''
  targetIds: string[] // 章节ID或知识点ID
  difficulties: {
    easy: number
    medium: number
    hard: number
  }
}

const props = withDefaults(defineProps<Props>(), {
  excludeIds: () => []
})
const emit = defineEmits<Emits>()

const chapterStore = useChapterStore()
const knowledgePointStore = useKnowledgePointStore()
const questionStore = useQuestionStore()

// 题型配置
const questionTypes = [
  { value: 'single', label: '单选题', icon: '📝' },
  { value: 'multiple', label: '多选题', icon: '☑️' },
  { value: 'judgment', label: '判断题', icon: '✓' },
  { value: 'uncertain', label: '不定项', icon: '🎯' },
  { value: 'essay', label: '简答题', icon: '📄' },
  { value: 'combination', label: '组合题', icon: '📦' }
]

// 模式: chapter | knowledgePoint
const mode = ref<'chapter' | 'knowledgePoint'>('chapter')

// 配置数据
const config = ref<RandomSelectConfig>({
  type: '',
  targetIds: [],
  difficulties: {
    easy: 0,
    medium: 0,
    hard: 0
  }
})

// 获取该科目的章节列表
const chapters = computed(() => {
  return chapterStore.chapters.filter(c => c.subjectId === props.subjectId && c.status === 'active')
})

// 获取该科目的知识点列表
const knowledgePoints = computed(() => {
  return knowledgePointStore.knowledgePoints.filter(
    kp => kp.subjectId === props.subjectId && kp.status === 'active'
  )
})

// 总需求数量
const totalRequired = computed(() => {
  return config.value.difficulties.easy + config.value.difficulties.medium + config.value.difficulties.hard
})

// 可用试题数量
const availableCount = computed(() => {
  if (!config.value.type || config.value.targetIds.length === 0) return 0

  // 获取候选试题池
  const candidates = getCandidateQuestions()
  return candidates.length
})

// 是否可以生成
const canGenerate = computed(() => {
  return (
    config.value.type !== '' &&
    config.value.targetIds.length > 0 &&
    totalRequired.value > 0
  )
})

// 切换目标选择(章节或知识点)
function toggleTarget(id: string) {
  const index = config.value.targetIds.indexOf(id)
  if (index > -1) {
    config.value.targetIds.splice(index, 1)
  } else {
    config.value.targetIds.push(id)
  }
}

// 快速设置所有难度
function setAllDifficulties(count: number) {
  config.value.difficulties.easy = count
  config.value.difficulties.medium = count
  config.value.difficulties.hard = count
}

// 清空所有难度
function clearAllDifficulties() {
  config.value.difficulties.easy = 0
  config.value.difficulties.medium = 0
  config.value.difficulties.hard = 0
}

// 获取候选试题池
function getCandidateQuestions() {
  const filter: any = {
    subjectId: props.subjectId,
    type: config.value.type as any
  }

  if (mode.value === 'chapter') {
    // 按章节筛选: 试题的chapterId在选中的章节列表中
    return questionStore.mockQuestions.filter(q => {
      if (filter.subjectId && q.subjectId !== filter.subjectId) return false
      if (filter.type && q.type !== filter.type) return false
      if (!config.value.targetIds.includes(q.chapterId)) return false
      if (props.excludeIds.includes(q.id)) return false
      return true
    })
  } else {
    // 按知识点筛选
    return questionStore.mockQuestions.filter(q => {
      if (filter.subjectId && q.subjectId !== filter.subjectId) return false
      if (filter.type && q.type !== filter.type) return false
      if (!q.knowledgePointId || !config.value.targetIds.includes(q.knowledgePointId)) return false
      if (props.excludeIds.includes(q.id)) return false
      return true
    })
  }
}

// Fisher-Yates 洗牌算法
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// 生成试卷
function handleGenerate() {
  const candidates = getCandidateQuestions()

  // 按难度分组
  const easyPool = candidates.filter(q => q.difficulty === 'easy')
  const mediumPool = candidates.filter(q => q.difficulty === 'medium')
  const hardPool = candidates.filter(q => q.difficulty === 'hard')

  const selected: string[] = []
  const warnings: string[] = []

  // 从简单池抽取
  const easyRequired = config.value.difficulties.easy
  if (easyRequired > 0) {
    const shuffled = shuffleArray(easyPool)
    const picked = shuffled.slice(0, easyRequired)
    selected.push(...picked.map(q => q.id))
    if (picked.length < easyRequired) {
      warnings.push(`简单题仅有${picked.length}道(需要${easyRequired}道)`)
    }
  }

  // 从中等池抽取
  const mediumRequired = config.value.difficulties.medium
  if (mediumRequired > 0) {
    const shuffled = shuffleArray(mediumPool)
    const picked = shuffled.slice(0, mediumRequired)
    selected.push(...picked.map(q => q.id))
    if (picked.length < mediumRequired) {
      warnings.push(`中等题仅有${picked.length}道(需要${mediumRequired}道)`)
    }
  }

  // 从困难池抽取
  const hardRequired = config.value.difficulties.hard
  if (hardRequired > 0) {
    const shuffled = shuffleArray(hardPool)
    const picked = shuffled.slice(0, hardRequired)
    selected.push(...picked.map(q => q.id))
    if (picked.length < hardRequired) {
      warnings.push(`困难题仅有${picked.length}道(需要${hardRequired}道)`)
    }
  }

  if (selected.length === 0) {
    alert('没有符合条件的试题,请调整筛选条件')
    return
  }

  // 如果有警告,显示提示
  if (warnings.length > 0) {
    const message = `试题数量不足:\n${warnings.join('\n')}\n\n已抽取${selected.length}道试题,是否继续?`
    if (!confirm(message)) return
  }

  emit('confirm', selected)
  handleReset()
}

// 关闭弹窗
function handleClose() {
  emit('close')
}

// 重置配置
function handleReset() {
  config.value = {
    type: '',
    targetIds: [],
    difficulties: {
      easy: 0,
      medium: 0,
      hard: 0
    }
  }
}

// 监听模式切换,清空目标选择
watch(mode, () => {
  config.value.targetIds = []
})
</script>

<style scoped>
.random-select-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.mode-tabs {
  display: flex;
  gap: 12px;
  border-bottom: 2px solid var(--panel-border);
  padding-bottom: 4px;
}

.mode-tab {
  padding: 10px 24px;
  border: none;
  background: transparent;
  color: var(--secondary-text);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px 8px 0 0;
  transition: all 0.2s ease;
  position: relative;
}

.mode-tab:hover {
  background: rgba(0, 102, 204, 0.05);
  color: var(--accent);
}

.mode-tab.active {
  background: var(--accent);
  color: #ffffff;
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-text);
}

.required {
  color: #ff4444;
  margin-left: 4px;
}

.form-select,
.form-input {
  padding: 10px 14px;
  border: 1px solid var(--panel-border);
  border-radius: 6px;
  font-size: 14px;
  background: #ffffff;
  transition: border-color 0.2s ease;
}

.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: var(--accent);
}

.form-select {
  width: 100%;
}

.question-type-selector {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.type-btn {
  padding: 16px 12px;
  border: 2px solid var(--panel-border);
  border-radius: 10px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.type-btn:hover {
  background: rgba(0, 102, 204, 0.05);
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.15);
}

.type-btn.active {
  background: linear-gradient(135deg, #4f77ff 0%, #2f57e3 100%);
  border-color: #4f77ff;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(79, 119, 255, 0.3);
  transform: scale(1.02);
}

.type-icon {
  font-size: 28px;
  transition: transform 0.3s ease;
}

.type-btn.active .type-icon {
  transform: scale(1.1);
}

.type-label {
  font-size: 14px;
  font-weight: 600;
}

.type-btn.active .type-label {
  color: #ffffff;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid var(--panel-border);
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #ffffff;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.checkbox-item:hover {
  background: var(--row-hover);
}

.checkbox-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-item span {
  font-size: 14px;
  color: var(--primary-text);
}

.empty-hint {
  grid-column: 1 / -1;
  text-align: center;
  padding: 20px;
  color: var(--secondary-text);
  font-size: 14px;
}

.difficulty-config {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.difficulty-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quick-actions {
  display: flex;
  gap: 8px;
}

.btn-quick {
  padding: 6px 12px;
  border: 1px solid var(--panel-border);
  border-radius: 6px;
  background: #ffffff;
  color: var(--accent);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-quick:hover {
  background: var(--row-hover);
  border-color: var(--accent);
}

.difficulty-items {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.difficulty-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid var(--panel-border);
}

.difficulty-item label {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-text);
  min-width: 50px;
}

.difficulty-item .form-input {
  flex: 1;
  text-align: center;
}

.difficulty-item .unit {
  font-size: 14px;
  color: var(--secondary-text);
}

.btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn.primary {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
  color: #ffffff;
  border-color: #ff6b6b;
}

.btn.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #ff5252 0%, #ff7043 100%);
}

.btn.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn.secondary {
  background: #ffffff;
  color: var(--primary-text);
  border-color: var(--panel-border);
}

.btn.secondary:hover {
  background: #f8fafc;
}
</style>
