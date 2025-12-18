<template>
  <div class="answer-card" :style="{ background: cardBgColor }">
    <!-- 工具栏 -->
    <div class="toolbar">
      <button class="tool-button" @click="$emit('open-calculator')" title="科学计算器">
        <span class="tool-icon">🔢</span>
        <span class="tool-label">计算器</span>
      </button>
      <div class="settings-wrapper" @mouseenter="showSettingsPanel = true" @mouseleave="showSettingsPanel = false">
        <button class="tool-button" title="答题设置">
          <span class="tool-icon">⚙️</span>
          <span class="tool-label">设置</span>
        </button>
        <div class="settings-popover" v-show="showSettingsPanel">
          <div class="sp-row">
            <span class="sp-label">字体大小</span>
            <div class="sp-options">
              <button :class="['sp-chip', fontSize==='small' && 'is-active']" @click="setFontSize('small')">小</button>
              <button :class="['sp-chip', fontSize==='medium' && 'is-active']" @click="setFontSize('medium')">正常</button>
              <button :class="['sp-chip', fontSize==='large' && 'is-active']" @click="setFontSize('large')">大</button>
            </div>
          </div>
          <div class="sp-row">
            <span class="sp-label">背景颜色</span>
            <div class="sp-options">
              <button :class="['sp-color', bgColor==='white' && 'is-active']" style="background:#ffffff" @click="setBgColor('white')"></button>
              <button :class="['sp-color', bgColor==='mint' && 'is-active']" style="background:#e9f7ef" @click="setBgColor('mint')"></button>
              <button :class="['sp-color', bgColor==='sand' && 'is-active']" style="background:#efefea" @click="setBgColor('sand')"></button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 头部：答题卡 + 只看错题 + 收起 -->
    <div class="card-header">
      <div class="header-left">
        <span class="red-dot"></span>
        <span class="header-title">答题卡</span>
        <div class="toggle-switch">
          <span>只看错题</span>
          <div class="switch" :class="{ on: showOnlyWrong }" @click="showOnlyWrong = !showOnlyWrong">
            <span class="switch-handle"></span>
          </div>
        </div>
      </div>
      <div class="header-actions">
        <button class="collapse-btn" @click="collapsed = !collapsed">{{ collapsed ? '展开' : '收起' }} <span>{{ collapsed ? '∨' : '∧' }}</span></button>
      </div>
    </div>

    <!-- 答题卡主体 -->
    <div class="card-body" v-show="!collapsed">

      <!-- 按题型分组显示 -->
      <div
        v-for="group in questionGroups"
        :key="group.type"
        class="question-group"
      >
        <div class="group-header">
          <span class="group-title">{{ group.title }}</span>
          <span class="group-count">（{{ group.questions.length }}题）</span>
        </div>

        <div class="question-grid">
          <div
            v-for="q in group.questions"
            :key="q.id"
            class="question-number"
            :class="getQuestionClass(q)"
            @click="$emit('go-to-question', q.globalIndex)"
          >
            {{ displayIndexMap[q.id] }}
          </div>
        </div>
      </div>

      <div class="legend">
        <div class="legend-item"><span class="dot incorrect"></span>错误 {{ localStats.incorrect }}</div>
        <div class="legend-item"><span class="dot partial"></span>不全对 {{ localStats.partial }}</div>
        <div class="legend-item"><span class="dot correct"></span>正确 {{ localStats.correct }}</div>
        <div class="legend-item"><span class="dot unanswered"></span>未做 {{ localStats.unanswered }}</div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="submit-section">
      <button class="save-exit-button" @click="handleBackToList">
        返回列表
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Question } from '@/views/question-management/types'
import type { UserAnswer } from '@/stores/examSession'

interface Props {
  questions: Question[]
  answers: Record<string, UserAnswer>
  statistics: {
    total: number
    answered: number
    correct: number
    incorrect: number
    partial: number
    unanswered: number
  }
  cardBg?: string
  initialFontSize?: 'small' | 'medium' | 'large'
  initialBgColor?: 'white' | 'mint' | 'sand'
}

const props = defineProps<Props>()
const cardBgColor = computed(() => props.cardBg || '#ffffff')

const showOnlyWrong = ref(false)
const collapsed = ref(false)
const showSettingsPanel = ref(false)
const fontSize = ref<'small' | 'medium' | 'large'>(loadFontSize())
const bgColor = ref<'white' | 'mint' | 'sand'>(props.initialBgColor ?? 'white')
watch(() => props.initialFontSize, v => { if (v) { fontSize.value = v; localStorage.setItem('analysis.fontSize', v) } })
watch(() => props.initialBgColor, v => { if (v) bgColor.value = v })
function setFontSize(size: 'small' | 'medium' | 'large') {
  fontSize.value = size
  localStorage.setItem('analysis.fontSize', size)
  emit('apply-settings', { fontSize: size, bgColor: bgColor.value })
}
function setBgColor(color: 'white' | 'mint' | 'sand') {
  bgColor.value = color
  emit('apply-settings', { fontSize: fontSize.value, bgColor: color })
}
function loadFontSize(): 'small' | 'medium' | 'large' {
  const f = localStorage.getItem('analysis.fontSize')
  return f === 'small' || f === 'medium' || f === 'large' ? f : (props.initialFontSize ?? 'medium')
}

const emit = defineEmits<{
  (e: 'go-to-question', index: number): void
  (e: 'open-calculator'): void
  (e: 'open-settings'): void
  (e: 'apply-settings', payload: { fontSize: 'small' | 'medium' | 'large'; bgColor: 'white' | 'mint' | 'sand' }): void
  (e: 'back-to-list'): void
}>()

// 题型标签映射
const questionTypeLabels: Record<string, string> = {
  single: '单选题',
  multiple: '多选题',
  judgment: '判断题',
  uncertain: '不定项选择题',
  essay: '简答题',
  combination: '组合题'
}

// 按题型分组
const questionGroups = computed(() => {
  const groups: Record<string, { type: string; title: string; questions: Array<Question & { globalIndex: number }> }> = {}

  props.questions.forEach((question, index) => {
    const type = question.type
    if (!groups[type]) {
      groups[type] = {
        type,
        title: questionTypeLabels[type] || '未知题型',
        questions: []
      }
    }
    groups[type].questions.push({
      ...question,
      globalIndex: index
    })
  })

  if (showOnlyWrong.value) {
    Object.values(groups).forEach(g => {
      g.questions = g.questions.filter(q => {
        const a = props.answers[q.id]
        return !!a && !a.isCorrect && a.answer !== null
      })
    })
  }

  Object.values(groups).forEach(g => {
    g.questions.sort((qa, qb) => qa.globalIndex - qb.globalIndex)
  })

  const typeOrder = ['single', 'multiple', 'judgment', 'essay', 'uncertain', 'combination']
  let list = Object.values(groups).sort((a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type))
  if (showOnlyWrong.value) {
    list = list.filter(g => g.questions.length > 0)
  }
  return list
})

const localStats = computed(() => {
  let incorrect = 0, partial = 0, correct = 0, unanswered = 0
  props.questions.forEach((q, index) => {
    const state = getQuestionState({ ...q, globalIndex: index })
    if (state === 'unanswered') unanswered++
    else if (state === 'correct') correct++
    else if (state === 'partial') partial++
    else incorrect++
  })
  return { incorrect, partial, correct, unanswered }
})

const displayIndexMap = computed<Record<string, number>>(() => {
  const order = ['single', 'multiple', 'judgment', 'essay', 'uncertain', 'combination']
  const list = props.questions.map((q, i) => ({ ...q, globalIndex: i }))
  list.sort((a, b) => {
    const ta = order.indexOf(a.type)
    const tb = order.indexOf(b.type)
    if (ta !== tb) return ta - tb
    return a.globalIndex - b.globalIndex
  })
  const map: Record<string, number> = {}
  list.forEach((q, idx) => { map[q.id] = idx + 1 })
  return map
})

// 状态判定与样式（支持按题目计算不全对）
function getQuestionState(q: Question & { globalIndex: number }): 'unanswered' | 'correct' | 'partial' | 'incorrect' {
  const answer = props.answers[q.id]
  if (!answer || answer.answer === null) return 'unanswered'
  if (answer.isCorrect) return 'correct'
  if (answer.isPartial) return 'partial'
  if (q.type === 'multiple' || q.type === 'uncertain') {
    const userAnswers = Array.isArray(answer.answer) ? [...answer.answer].sort() : [String(answer.answer)].sort()
    const correctAnswers = Array.isArray(q.answer) ? [...q.answer].sort() : [String(q.answer)].sort()
    const isFullyCorrect = JSON.stringify(userAnswers) === JSON.stringify(correctAnswers)
    if (isFullyCorrect) return 'correct'
    const hasCorrectOptions = userAnswers.some(a => correctAnswers.includes(a))
    const hasIncorrectOptions = userAnswers.some(a => !correctAnswers.includes(a))
    const isPartial = hasCorrectOptions && !hasIncorrectOptions && userAnswers.length < correctAnswers.length
    return isPartial ? 'partial' : 'incorrect'
  }
  return 'incorrect'
}
function getQuestionClass(q: Question & { globalIndex: number }): string {
  return `status-${getQuestionState(q)}`
}

function handleBackToList() {
  emit('back-to-list')
}
</script>

<style scoped>
.answer-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

/* 工具栏 */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 16px;
  border-bottom: 1px solid #e4eaf2;
  background: transparent;
}

.tool-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
}

.tool-button:hover {
  background: rgba(255, 111, 60, 0.08);
}

.tool-icon {
  font-size: 20px;
}

.tool-label {
  font-size: 11px;
  font-weight: 500;
  color: #666;
}

/* 卡片主体 */
.card-body {
  flex: 1;
  padding: 20px 16px;
  overflow-y: auto;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(255, 111, 60, 0.2);
}

/* 题型分组 */
.question-group {
  margin-bottom: 24px;
}

.group-header {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 12px;
}

.group-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.group-count {
  font-size: 12px;
  color: #999;
}

.question-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
}

.question-number {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

/* 未作答状态 */
.question-number.status-unanswered {
  background: #ffffff;
  color: #999;
  border-color: #ccc;
}

.question-number.status-unanswered:hover {
  background: rgba(255, 111, 60, 0.08);
  border-color: var(--brand-primary, #ff6f3c);
  color: var(--brand-primary, #ff6f3c);
}

/* 正确状态 */
.question-number.status-correct {
  background: rgba(82, 196, 26, 0.4);
  color: #52c41a;
  border-color: #52c41a;
}

.question-number.status-correct:hover {
  background: rgba(82, 196, 26, 0.5);
}

/* 错误状态 */
.question-number.status-incorrect {
  background: rgba(245, 34, 45, 0.12);
  color: #f5222d;
  border-color: #f5222d;
}

.question-number.status-incorrect:hover {
  background: rgba(245, 34, 45, 0.2);
}

/* 部分正确（半绿半白，与图示一致） */
.question-number.status-partial {
  background: linear-gradient(90deg, #ffffff 0 50%, rgba(82, 196, 26, 0.4) 50% 100%);
  color: #2c3e50;
  border-color: #52c41a;
}

.question-number.status-partial:hover {
  filter: brightness(1.05);
}

/* 操作按钮区域 */
.submit-section {
  padding: 16px;
  border-top: 1px solid #e4eaf2;
  display: flex;
  gap: 12px;
}

/* 暂存退出按钮 */
.save-exit-button {
  flex: 1;
  padding: 14px;
  border: 1px solid #e0e0e0;
  border-radius: 999px;
  background: #ffffff;
  color: #666;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-exit-button:hover {
  border-color: var(--brand-primary, #ff6f3c);
  background: rgba(255, 111, 60, 0.03);
  color: var(--brand-primary, #ff6f3c);
}

/* 交卷按钮 */
.submit-button {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #ff7b50 0%, #ff4d3a 100%);
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 94, 66, 0.25);
  transition: all 0.2s ease;
}

.submit-button:hover {
  background: linear-gradient(135deg, #ff5722 0%, #e64a19 100%);
  box-shadow: 0 6px 16px rgba(255, 87, 34, 0.35);
  transform: translateY(-1px);
}

/* 滚动条样式 */
.card-body::-webkit-scrollbar {
  width: 6px;
}

.card-body::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 3px;
}

.card-body::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.card-body::-webkit-scrollbar-thumb:hover {
  background: #999;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e4eaf2;
  background: transparent;
}
.header-left { display: flex; align-items: center; gap: 10px; }
.red-dot { width: 8px; height: 8px; background: #ff443d; border-radius: 50%; }
.header-title { font-size: 15px; font-weight: 700; color: #333; }
.header-actions { display: flex; align-items: center; gap: 12px; }
.toggle-switch { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #666; }
.switch { width: 36px; height: 18px; border-radius: 999px; background: #e9edf3; position: relative; cursor: pointer; }
.switch.on { background: #ff443d; }
.switch-handle { width: 16px; height: 16px; background: #ffffff; border-radius: 50%; position: absolute; top: 1px; left: 1px; transition: left 0.2s; }
.switch.on .switch-handle { left: 19px; }
.collapse-btn { border: none; background: transparent; color: #666; font-size: 12px; cursor: pointer; }

.legend { display: flex; gap: 12px; padding: 12px 8px; border-top: 1px dashed #eee; margin-top: 8px; }
.legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #666; }
.dot { width: 12px; height: 12px; border-radius: 4px; display: inline-block; }
.dot.correct { background: #52c41a; }
.dot.incorrect { background: #f5222d; }
.dot.partial { background: linear-gradient(90deg, #ffffff 0 50%, #52c41a 50% 100%); border: 1px solid #52c41a; }
.dot.unanswered { border: 1px solid #ccc; background: #ffffff; }

.save-exit-button {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #ff7b50 0%, #ff4d3a 100%);
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 94, 66, 0.25);
  transition: all 0.2s ease;
}
.save-exit-button:hover { background: linear-gradient(135deg, #ff5722 0%, #e64a19 100%); }
.settings-wrapper{position:relative}
.settings-popover{position:absolute;top:52px;right:0;background:#fff;border:1px solid #e4eaf2;box-shadow:0 12px 24px rgba(17,36,80,.12);border-radius:12px;padding:12px;width:220px;z-index:10}
.sp-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.sp-label{font-size:15px;color:#333}
.sp-options{display:flex;gap:8px}
.sp-chip{border:1px solid #e4eaf2;background:#fff;border-radius:6px;padding:4px 8px;font-size:13px;cursor:pointer}
.sp-chip.is-active{border-color:#ff443d;color:#ff443d}
.sp-color{width:24px;height:24px;border-radius:6px;border:1px solid #e4eaf2;cursor:pointer}
.sp-color.is-active{box-shadow:0 0 0 2px #ff443d inset}
</style>
