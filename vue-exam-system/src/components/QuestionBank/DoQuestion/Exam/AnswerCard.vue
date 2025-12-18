<template>
  <div class="answer-card" :style="{ background: bgColorMap[bgColor] }">
    <!-- 工具栏 -->
    <div class="toolbar">
      <button class="tool-button" @click="$emit('open-calculator')" title="科学计算器">
        <span class="tool-icon">🔢</span>
        <span class="tool-label">计算器</span>
      </button>

      <button class="tool-button" @click="handleReset" title="重新做题">
        <span class="tool-icon">🔄</span>
        <span class="tool-label">重做</span>
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
            <span class="sp-label">显示设置</span>
            <div class="sp-options">
              <label class="sp-checkbox">
                <input type="checkbox" v-model="autoShowAnalysis" @change="setAutoShow(autoShowAnalysis)" /> 自动显示答案解析
              </label>
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

    <!-- 答题卡主体 -->
    <div class="card-body">
      <div class="card-title">答题卡</div>

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
            v-for="(q, index) in group.questions"
            :key="q.id"
            class="question-number"
            :class="getQuestionStatus(q.id)"
            @click="$emit('go-to-question', q.globalIndex)"
          >
            {{ q.displayNo }}
          </div>
        </div>
      </div>

      <div class="filter-bar">
        <div class="filter-item">
          <span class="filter-swatch done"></span>
          <span>已做 {{ props.statistics.answered }}</span>
        </div>
        <div class="filter-item">
          <span class="filter-swatch todo"></span>
          <span>未做 {{ props.statistics.unanswered }}</span>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="submit-section">
      <button class="save-exit-button" @click="handleSaveAndExit">
        暂存退出
      </button>
      <button class="submit-button" @click="handleSubmit">
        交卷
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
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
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'go-to-question', index: number): void
  (e: 'open-calculator'): void
  (e: 'open-settings'): void
  (e: 'reset'): void
  (e: 'submit'): void
  (e: 'save-and-exit'): void
  (e: 'apply-settings', payload: { fontSize: 'small' | 'medium' | 'large'; bgColor: 'white' | 'mint' | 'sand' }): void
}>()

const showSettingsPanel = ref(false)
const fontSize = ref<'small' | 'medium' | 'large'>(loadFontSize())
const bgColor = ref<'white' | 'mint' | 'sand'>(loadBgColor())
const bgColorMap: Record<'white'|'mint'|'sand', string> = { white: '#ffffff', mint: '#e9f7ef', sand: '#efefea' }

const autoShowAnalysis = ref<boolean>(loadAutoShow())
function setFontSize(size: 'small' | 'medium' | 'large') {
  fontSize.value = size
  localStorage.setItem('analysis.fontSize', size)
  emit('apply-settings', { fontSize: size, bgColor: bgColor.value })
}
function setBgColor(color: 'white' | 'mint' | 'sand') {
  bgColor.value = color
  localStorage.setItem('analysis.bgColor', color)
  emit('apply-settings', { fontSize: fontSize.value, bgColor: color })
}

function setAutoShow(v: boolean) {
  autoShowAnalysis.value = v
  localStorage.setItem('analysis.autoShow', String(v))
}
function loadFontSize(): 'small' | 'medium' | 'large' {
  const f = localStorage.getItem('analysis.fontSize')
  return f === 'small' || f === 'medium' || f === 'large' ? f : 'medium'
}
function loadBgColor(): 'white' | 'mint' | 'sand' {
  const b = localStorage.getItem('analysis.bgColor')
  return b === 'white' || b === 'mint' || b === 'sand' ? b : 'white'
}

function loadAutoShow(): boolean {
  return localStorage.getItem('analysis.autoShow') === 'true'
}

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
  const groups: Record<string, { type: string; title: string; questions: Array<Question & { globalIndex: number; displayNo: number }> }> = {}

  props.questions.forEach((question, index) => {
    const type = question.type
    if (!groups[type]) {
      groups[type] = { type, title: questionTypeLabels[type] || '未知题型', questions: [] }
    }
    groups[type].questions.push({ ...question, globalIndex: index, displayNo: index + 1 })
  })

  return Object.values(groups)
})

// 获取题目状态
function getQuestionStatus(questionId: string): string {
  const answer = props.answers[questionId]
  return answer && answer.answer !== null ? 'status-answered' : 'status-unanswered'
}

// 处理重做
function handleReset() {
  if (confirm('确定要清空所有答题记录并重新开始吗？')) {
    emit('reset')
  }
}

// 处理提交
function handleSubmit() {
  const unanswered = props.statistics.unanswered
  if (unanswered > 0) {
    if (!confirm(`还有 ${unanswered} 道题未作答，确定要提交吗？`)) {
      return
    }
  }

  emit('submit')
}

// 处理暂存退出
function handleSaveAndExit() {
  if (confirm('确定保存当前答题进度并退出吗？下次可以继续作答。')) {
    emit('save-and-exit')
  }
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
  border-bottom: 1px solid var(--panel-border, #e4eaf2);
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
  background: var(--brand-tint, rgba(255, 111, 60, 0.08));
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
  border-bottom: 2px solid var(--brand-tint, rgba(255, 111, 60, 0.2));
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
  border-color: #e0e0e0;
}

.question-number.status-unanswered:hover {
  background: rgba(255, 111, 60, 0.08);
  border-color: var(--brand-primary, #ff6f3c);
  color: var(--brand-primary, #ff6f3c);
}

/* 已做状态（与说明条匹配） */
.question-number.status-answered {
  background: #cfcfcf;
  color: #666;
  border-color: #cfcfcf;
}

.question-number.status-correct:hover {
  background: rgba(82, 196, 26, 0.5);
}

/* 错误状态 */
.question-number.status-incorrect {
  background: #f5222d;
  color: #ffffff;
  border-color: #f5222d;
}

.question-number.status-incorrect:hover {
  background: rgba(245, 34, 45, 0.2);
}

/* 部分正确状态 - 一半灰一半绿 */
.question-number.status-partial {
  background: linear-gradient(135deg,
    #f5f5f5 0%, #f5f5f5 50%,
    rgba(82, 196, 26, 0.4) 50%, rgba(82, 196, 26, 0.4) 100%
  );
  color: #52c41a;
  border-color: #52c41a;
}

.question-number.status-partial:hover {
  background: linear-gradient(135deg,
    #e8e8e8 0%, #e8e8e8 50%,
    rgba(82, 196, 26, 0.5) 50%, rgba(82, 196, 26, 0.5) 100%
  );
}

/* 操作按钮区域 */
.submit-section {
  padding: 16px;
  border-top: 1px solid var(--panel-border, #e4eaf2);
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
.settings-wrapper{position:relative}
.settings-popover{
    position: absolute;
    top: 58px;
    right: 0;
    background: #fff;
    border: 1px solid #e4eaf2;
    box-shadow: 0 12px 24px rgba(17, 36, 80, .12);
    border-radius: 12px;
    padding: 20px 20px 14px;
    width: 260px;
    z-index: 10;
}
.sp-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.sp-label{font-size:13px;color:#333}
.sp-options{display:flex;gap:8px}
.sp-chip{border:1px solid #e4eaf2;background:#fff;border-radius:6px;padding:4px 8px;font-size:12px;cursor:pointer}
.sp-chip.is-active{border-color:#ff443d;color:#ff443d}
.sp-color{width:24px;height:24px;border-radius:6px;border:1px solid #e4eaf2;cursor:pointer}
.sp-color.is-active{box-shadow:0 0 0 2px #ff443d inset}
.sp-checkbox{display:flex;align-items:center;gap:6px;font-size:12px;color:#666}

.filter-bar{display:flex;align-items:center;gap:16px;margin:8px 0 12px}
.filter-item{display:flex;align-items:center;gap:6px;font-size:12px;color:#666}
.filter-swatch{width:14px;height:14px;border-radius:3px;border:1px solid #e0e0e0;display:inline-block}
.filter-swatch.done{background:#cfcfcf}
.filter-swatch.todo{background:#ffffff}
</style>
