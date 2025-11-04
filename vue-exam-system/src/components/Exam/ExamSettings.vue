<template>
  <BaseModal :visible="show" @update:visible="(val) => !val && $emit('close')" title="答题设置">
    <div class="settings-panel">
      <!-- 字体大小 -->
      <div class="setting-group">
        <div class="setting-label">字体大小</div>
        <div class="setting-options">
          <button
            v-for="option in fontSizeOptions"
            :key="option.value"
            class="option-button"
            :class="{ 'is-active': settings.fontSize === option.value }"
            @click="updateSetting('fontSize', option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <!-- 答题模式 -->
      <div class="setting-group">
        <div class="setting-label">答题模式</div>
        <div class="setting-options">
          <button
            v-for="option in modeOptions"
            :key="option.value"
            class="option-button"
            :class="{ 'is-active': settings.mode === option.value }"
            @click="updateSetting('mode', option.value)"
          >
            {{ option.label }}
          </button>
        </div>
        <div class="setting-hint">
          {{ modeHint }}
        </div>
      </div>

      <!-- 显示设置 -->
      <div class="setting-group">
        <div class="setting-label">显示设置</div>
        <div class="setting-toggle">
          <label class="toggle-item">
            <input
              type="checkbox"
              v-model="localSettings.showAnalysis"
              @change="updateSetting('showAnalysis', localSettings.showAnalysis)"
            />
            <span class="toggle-label">自动显示答案解析</span>
          </label>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="setting-actions">
        <button class="action-button secondary" @click="resetSettings">
          恢复默认
        </button>
        <button class="action-button primary" @click="$emit('close')">
          确定
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseModal from '@/components/Modal/BaseModal.vue'
import type { ExamSettings } from '@/stores/examSession'

interface Props {
  show: boolean
  settings: ExamSettings
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update', settings: Partial<ExamSettings>): void
}>()

// 本地设置副本
const localSettings = ref<ExamSettings>({ ...props.settings })

// 监听外部设置变化
watch(
  () => props.settings,
  (newSettings) => {
    localSettings.value = { ...newSettings }
  },
  { deep: true }
)

// 字体大小选项
const fontSizeOptions = [
  { label: '小', value: 'small' as const },
  { label: '中', value: 'medium' as const },
  { label: '大', value: 'large' as const },
  { label: '特大', value: 'xlarge' as const }
]

// 答题模式选项
const modeOptions = [
  { label: '练习模式', value: 'practice' as const },
  { label: '考试模式', value: 'exam' as const }
]

// 模式提示
const modeHint = computed(() => {
  if (localSettings.value.mode === 'practice') {
    return '练习模式：可随时查看答案解析，实时反馈对错'
  }
  return '考试模式：提交后才能查看答案，模拟真实考试环境'
})

// 更新设置
function updateSetting<K extends keyof ExamSettings>(key: K, value: ExamSettings[K]) {
  localSettings.value[key] = value
  emit('update', { [key]: value })
}

// 恢复默认设置
function resetSettings() {
  const defaultSettings: ExamSettings = {
    fontSize: 'medium',
    showAnalysis: false,
    mode: 'practice'
  }

  localSettings.value = { ...defaultSettings }
  emit('update', defaultSettings)
}
</script>

<style scoped>
.settings-panel {
  padding: 20px 0;
}

/* 设置组 */
.setting-group {
  margin-bottom: 32px;
}

.setting-group:last-of-type {
  margin-bottom: 24px;
}

.setting-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

/* 选项按钮 */
.setting-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 10px;
}

.option-button {
  padding: 10px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: #ffffff;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-button:hover {
  border-color: var(--brand-primary, #ff6f3c);
  background: rgba(255, 111, 60, 0.03);
  color: var(--brand-primary, #ff6f3c);
}

.option-button.is-active {
  border-color: var(--brand-primary, #ff6f3c);
  background: rgba(255, 111, 60, 0.1);
  color: var(--brand-primary, #ff6f3c);
  font-weight: 600;
}

/* 设置提示 */
.setting-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
  line-height: 1.5;
}

/* 切换开关 */
.setting-toggle {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toggle-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.toggle-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--brand-primary, #ff6f3c);
}

.toggle-label {
  font-size: 14px;
  color: #333;
  user-select: none;
}

/* 操作按钮 */
.setting-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #e4eaf2;
}

.action-button {
  padding: 10px 24px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button.primary {
  border: none;
  background: linear-gradient(135deg, #ff7b50 0%, #ff4d3a 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(255, 94, 66, 0.25);
}

.action-button.primary:hover {
  background: linear-gradient(135deg, #ff5722 0%, #e64a19 100%);
  box-shadow: 0 6px 16px rgba(255, 87, 34, 0.35);
  transform: translateY(-1px);
}

.action-button.secondary {
  border: 1px solid #e0e0e0;
  background: #ffffff;
  color: #666;
}

.action-button.secondary:hover {
  border-color: var(--brand-primary, #ff6f3c);
  background: rgba(255, 111, 60, 0.03);
  color: var(--brand-primary, #ff6f3c);
}
</style>
