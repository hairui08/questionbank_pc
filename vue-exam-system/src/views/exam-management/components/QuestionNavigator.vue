<template>
  <div class="question-navigator">
    <div class="navigator-header">
      <h3>试题导航</h3>
      <div class="total-info">
        共 {{ totalCount }} 题 / {{ totalScore }}分
      </div>
    </div>

    <div class="navigator-list">
      <div
        v-for="(group, groupIndex) in questionGroups"
        :key="group.type"
        class="type-group"
      >
        <!-- 题型头部: 只显示题型名称 -->
        <div class="type-header" @click="scrollToType(group.type)">
          <span class="type-name">{{ group.typeName }}</span>
        </div>

        <!-- 统一操作栏: 统计信息 + 批量设分 + 上下移动 -->
        <div class="type-controls">
          <div class="type-stats">
            共{{ group.count }}题 / 总{{ group.totalScore }}分 / 每题{{ group.avgScore }}分
          </div>

          <div class="batch-score-setter">
            <label>批量设分:</label>
            <input
              v-model.number="batchScores[group.type]"
              type="number"
              min="1"
              placeholder="分值"
              @click="stopPropagation"
            />
            <button
              class="apply-btn"
              @click="handleBatchSetScore(group.type, $event)"
            >
              应用
            </button>
          </div>

          <div class="type-actions">
            <button
              class="type-move-btn"
              :disabled="groupIndex === 0"
              title="上移"
              @click="handleMoveTypeUp(group.type, $event)"
            >
              ⬆️
            </button>
            <button
              class="type-move-btn"
              :disabled="groupIndex === questionGroups.length - 1"
              title="下移"
              @click="handleMoveTypeDown(group.type, $event)"
            >
              ⬇️
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ExamQuestion } from '../types'

interface Props {
  questions: ExamQuestion[]
  activeQuestionId?: string
}

interface Emits {
  (e: 'scroll-to-type', type: string): void
  (e: 'scroll-to-question', questionId: string): void
  (e: 'batch-update-score', type: string, score: number): void
  (e: 'move-type-up', type: string): void
  (e: 'move-type-down', type: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 题型分组
const questionGroups = computed(() => {
  const typeNames: Record<string, string> = {
    single: '单选题',
    multiple: '多选题',
    judgment: '判断题',
    uncertain: '不定项',
    essay: '简答题',
    combination: '组合题'
  }

  const groups: Record<string, ExamQuestion[]> = {}

  props.questions.forEach(q => {
    if (!groups[q.type]) {
      groups[q.type] = []
    }
    groups[q.type].push(q)
  })

  return Object.entries(groups).map(([type, questions]) => {
    const totalScore = questions.filter(q => !q.isOptional).reduce((sum, q) => sum + q.score, 0)
    const count = questions.length
    const avgScore = count > 0 ? Math.round(totalScore / count) : 0

    return {
      type,
      typeName: typeNames[type] || type,
      questions,
      count,
      totalScore,
      avgScore
    }
  })
})

// 总题数
const totalCount = computed(() => props.questions.length)

// 总分(仅必答题)
const totalScore = computed(() =>
  props.questions.filter(q => !q.isOptional).reduce((sum, q) => sum + q.score, 0)
)

// 滚动到题型
function scrollToType(type: string) {
  emit('scroll-to-type', type)
}

// 滚动到题目
function scrollToQuestion(questionId: string) {
  emit('scroll-to-question', questionId)
}

// 批量设置分值的输入值 (按题型存储)
const batchScores = ref<Record<string, number>>({})

// 处理批量设置分值
function handleBatchSetScore(type: string, event: Event) {
  event.stopPropagation() // 阻止事件冒泡到 type-header
  const score = batchScores.value[type]
  if (score && score > 0) {
    emit('batch-update-score', type, score)
    // 清空输入框
    batchScores.value[type] = 0
  }
}

// 阻止输入框点击事件冒泡
function stopPropagation(event: Event) {
  event.stopPropagation()
}

// 题型上移
function handleMoveTypeUp(type: string, event: Event) {
  event.stopPropagation()
  emit('move-type-up', type)
}

// 题型下移
function handleMoveTypeDown(type: string, event: Event) {
  event.stopPropagation()
  emit('move-type-down', type)
}
</script>

<style scoped>
.question-navigator {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  overflow: hidden;
  position: sticky;
  top: 20px;
  /* 移除max-height限制,使用网页滚动条 */
  display: flex;
  flex-direction: column;
}

.navigator-header {
  padding: 16px;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 2px solid var(--panel-border);
}

.navigator-header h3 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-text);
}

.total-info {
  font-size: 13px;
  color: var(--secondary-text);
  font-weight: 500;
}

.navigator-list {
  flex: 1;
  padding: 12px;
}

.type-group {
  margin-bottom: 16px;
}

.type-group:last-child {
  margin-bottom: 0;
}

.type-header {
  padding: 10px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border-radius: 8px;
  transition: all 0.2s ease;
  margin-bottom: 8px;
  cursor: pointer;
}

.type-header:hover {
  opacity: 0.9;
}

.type-name {
  font-size: 14px;
  font-weight: 600;
}

.type-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f8fafc;
  border: 1px solid var(--panel-border);
  border-radius: 6px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.type-stats {
  font-size: 12px;
  color: var(--primary-text);
  font-weight: 500;
  white-space: nowrap;
}

.batch-score-setter {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 180px;
}

.type-actions {
  display: flex;
  gap: 4px;
}

.type-move-btn {
  padding: 4px 8px;
  background: #ffffff;
  border: 1px solid var(--panel-border);
  color: var(--primary-text);
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.type-move-btn:hover:not(:disabled) {
  background: rgba(0, 102, 204, 0.08);
  border-color: var(--accent);
  transform: scale(1.05);
}

.type-move-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.batch-score-setter label {
  font-size: 12px;
  font-weight: 600;
  color: var(--primary-text);
  white-space: nowrap;
}

.batch-score-setter input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid var(--panel-border);
  border-radius: 4px;
  font-size: 13px;
  text-align: center;
  min-width: 60px;
}

.batch-score-setter input:focus {
  outline: none;
  border-color: var(--accent);
}

.apply-btn {
  padding: 6px 14px;
  background: linear-gradient(180deg, #4f77ff 0%, #2f57e3 100%);
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.apply-btn:hover {
  background: linear-gradient(180deg, #4b6ee6 0%, #264acc 100%);
  transform: scale(1.05);
}
</style>
