<template>
  <span v-if="shouldShow" class="status-tag" :class="`status-${status}`">
    {{ statusText }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { QuestionStatus } from '@/views/question-management/types'
import type { Status as KnowledgePointStatus } from '@/views/knowledge-point-management/types'

interface Props {
  status?: QuestionStatus | KnowledgePointStatus
}

const props = defineProps<Props>()

// 只显示已删除和已过时状态
const shouldShow = computed(() => {
  return props.status === 'deleted' || props.status === 'deprecated'
})

const statusText = computed(() => {
  if (props.status === 'deleted') return '已删除'
  if (props.status === 'deprecated') return '已过时'
  return ''
})
</script>

<style scoped>
.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  margin-left: 8px;
  white-space: nowrap;
}

.status-tag.status-deleted {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ef9a9a;
}

.status-tag.status-deprecated {
  background: #fff3e0;
  color: #e65100;
  border: 1px solid #ffb74d;
}
</style>
