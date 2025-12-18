<template>
  <div class="star-rating" :class="{ readonly: readonly }">
    <span
      v-for="star in 5"
      :key="star"
      class="star"
      :class="{ filled: star <= (hoveredStar || modelValue), clickable: !readonly }"
      :title="readonly ? '' : getStarLabel(star)"
      @click="!readonly && handleClick(star)"
      @mouseenter="!readonly && (hoveredStar = star)"
      @mouseleave="!readonly && (hoveredStar = 0)"
    >
      {{ star <= (hoveredStar || modelValue) ? '★' : '☆' }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue: number
  readonly?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: number): void
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false
})

const emit = defineEmits<Emits>()

const hoveredStar = ref(0)

function handleClick(star: number) {
  if (!props.readonly) {
    emit('update:modelValue', star)
  }
}

function getStarLabel(star: number): string {
  const labels = ['', '1星', '2星', '3星', '4星', '5星']
  return labels[star] || ''
}
</script>

<style scoped>
.star-rating {
  display: inline-flex;
  gap: 4px;
  align-items: center;
}

.star {
  font-size: 20px;
  line-height: 1;
  user-select: none;
  transition: all 0.2s ease;
}

.star.clickable {
  cursor: pointer;
}

.star.clickable:hover {
  transform: scale(1.2);
}

.star.filled {
  color: #FFD700;
}

.star:not(.filled) {
  color: #CCCCCC;
}

.star-rating.readonly .star {
  cursor: default;
}
</style>
