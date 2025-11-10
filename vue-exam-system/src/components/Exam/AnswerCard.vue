<template>
  <div class="answer-card">
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

      <button class="tool-button" @click="$emit('open-settings')" title="答题设置">
        <span class="tool-icon">⚙️</span>
        <span class="tool-label">设置</span>
      </button>
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
            {{ q.globalIndex + 1 }}
          </div>
        </div>
      </div>
    </div>

    <!-- 提交按钮 -->
    <div class="submit-section">
      <button class="submit-button" @click="handleSubmit">
        提交试卷
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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

  return Object.values(groups)
})

// 获取题目状态
function getQuestionStatus(questionId: string): string {
  const answer = props.answers[questionId]

  if (!answer || answer.answer === null) {
    return 'status-unanswered'
  }

  if (answer.isCorrect) {
    return 'status-correct'
  }

  if (answer.isPartial) {
    return 'status-partial'
  }

  return 'status-incorrect'
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
  background: #fafbfc;
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
  background: #f5f5f5;
  color: #999;
  border-color: #e0e0e0;
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

/* 提交按钮 */
.submit-section {
  padding: 16px;
  border-top: 1px solid #e4eaf2;
}

.submit-button {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #ff7b50 0%, #ff4d3a 100%);
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 16px rgba(255, 94, 66, 0.25);
  transition: all 0.2s ease;
}

.submit-button:hover {
  background: linear-gradient(135deg, #ff5722 0%, #e64a19 100%);
  box-shadow: 0 10px 20px rgba(255, 87, 34, 0.35);
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
</style>
