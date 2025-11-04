<template>
  <BaseModal :visible="show" @update:visible="(val) => !val && $emit('close')" title="科学计算器">
    <div class="calculator">
      <!-- 显示屏 -->
      <div class="display">
        <div class="display-secondary">{{ displaySecondary }}</div>
        <div class="display-primary">{{ displayPrimary }}</div>
      </div>

      <!-- 按钮区 -->
      <div class="button-grid">
        <!-- 第一行：清除、删除、括号 -->
        <button class="btn btn-function" @click="clear">C</button>
        <button class="btn btn-function" @click="backspace">⌫</button>
        <button class="btn btn-operator" @click="append('(')">(</button>
        <button class="btn btn-operator" @click="append(')')">)</button>

        <!-- 第二行：三角函数 -->
        <button class="btn btn-function" @click="calculate('sin')">sin</button>
        <button class="btn btn-function" @click="calculate('cos')">cos</button>
        <button class="btn btn-function" @click="calculate('tan')">tan</button>
        <button class="btn btn-operator" @click="append('÷')">÷</button>

        <!-- 第三行：数字7-9和乘法 -->
        <button class="btn btn-number" @click="append('7')">7</button>
        <button class="btn btn-number" @click="append('8')">8</button>
        <button class="btn btn-number" @click="append('9')">9</button>
        <button class="btn btn-operator" @click="append('×')">×</button>

        <!-- 第四行：数字4-6和减法 -->
        <button class="btn btn-number" @click="append('4')">4</button>
        <button class="btn btn-number" @click="append('5')">5</button>
        <button class="btn btn-number" @click="append('6')">6</button>
        <button class="btn btn-operator" @click="append('-')">-</button>

        <!-- 第五行：数字1-3和加法 -->
        <button class="btn btn-number" @click="append('1')">1</button>
        <button class="btn btn-number" @click="append('2')">2</button>
        <button class="btn btn-number" @click="append('3')">3</button>
        <button class="btn btn-operator" @click="append('+')">+</button>

        <!-- 第六行：特殊运算 -->
        <button class="btn btn-function" @click="calculate('sqrt')">√</button>
        <button class="btn btn-number" @click="append('0')">0</button>
        <button class="btn btn-number" @click="append('.')">.</button>
        <button class="btn btn-equals" @click="equals">=</button>

        <!-- 第七行：高级功能 -->
        <button class="btn btn-function" @click="calculate('pow')">x²</button>
        <button class="btn btn-function" @click="calculate('log')">log</button>
        <button class="btn btn-function" @click="calculate('ln')">ln</button>
        <button class="btn btn-function" @click="toggleSign">±</button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseModal from '@/components/Modal/BaseModal.vue'

interface Props {
  show: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const expression = ref('')
const result = ref<number | null>(null)

const displayPrimary = computed(() => {
  return result.value !== null ? String(result.value) : expression.value || '0'
})

const displaySecondary = computed(() => {
  return result.value !== null ? expression.value : ''
})

// 追加字符
function append(char: string) {
  if (result.value !== null) {
    expression.value = String(result.value)
    result.value = null
  }
  expression.value += char
}

// 清除
function clear() {
  expression.value = ''
  result.value = null
}

// 删除最后一个字符
function backspace() {
  if (result.value !== null) {
    result.value = null
  } else {
    expression.value = expression.value.slice(0, -1)
  }
}

// 计算特殊函数
function calculate(func: string) {
  try {
    const value = result.value !== null ? result.value : parseExpression(expression.value)

    switch (func) {
      case 'sin':
        result.value = Math.sin((value * Math.PI) / 180)
        break
      case 'cos':
        result.value = Math.cos((value * Math.PI) / 180)
        break
      case 'tan':
        result.value = Math.tan((value * Math.PI) / 180)
        break
      case 'sqrt':
        result.value = Math.sqrt(value)
        break
      case 'pow':
        result.value = Math.pow(value, 2)
        break
      case 'log':
        result.value = Math.log10(value)
        break
      case 'ln':
        result.value = Math.log(value)
        break
    }

    expression.value = `${func}(${value})`
  } catch (error) {
    expression.value = '错误'
  }
}

// 切换正负号
function toggleSign() {
  try {
    const value = result.value !== null ? result.value : parseExpression(expression.value)
    result.value = -value
    expression.value = String(-value)
  } catch (error) {
    // 忽略错误
  }
}

// 计算等于
function equals() {
  try {
    result.value = parseExpression(expression.value)
  } catch (error) {
    expression.value = '错误'
    result.value = null
  }
}

// 解析表达式
function parseExpression(expr: string): number {
  if (!expr) return 0

  // 替换运算符为标准符号
  expr = expr.replace(/×/g, '*').replace(/÷/g, '/')

  // 使用 Function 构造器安全计算表达式
  try {
    const func = new Function(`return ${expr}`)
    const value = func()
    if (typeof value !== 'number' || !isFinite(value)) {
      throw new Error('Invalid result')
    }
    return value
  } catch {
    throw new Error('Invalid expression')
  }
}
</script>

<style scoped>
.calculator {
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
}

/* 显示屏 */
.display {
  background: #1a1a1a;
  color: #ffffff;
  padding: 20px;
  border-radius: 12px 12px 0 0;
  text-align: right;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 8px;
}

.display-secondary {
  font-size: 14px;
  color: #999;
  min-height: 20px;
}

.display-primary {
  font-size: 32px;
  font-weight: 700;
  min-height: 40px;
  word-break: break-all;
}

/* 按钮网格 */
.button-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: #e0e0e0;
  border-radius: 0 0 12px 12px;
  overflow: hidden;
}

.btn {
  aspect-ratio: 1;
  border: none;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #ffffff;
}

.btn:active {
  transform: scale(0.95);
}

/* 数字按钮 */
.btn-number {
  color: #333;
  background: #ffffff;
}

.btn-number:hover {
  background: #f5f5f5;
}

/* 运算符按钮 */
.btn-operator {
  color: var(--brand-primary, #ff6f3c);
  background: #fff1eb;
  font-weight: 700;
}

.btn-operator:hover {
  background: #ffe5d9;
}

/* 功能按钮 */
.btn-function {
  color: #666;
  background: #f5f5f5;
  font-size: 14px;
}

.btn-function:hover {
  background: #e8e8e8;
}

/* 等号按钮 */
.btn-equals {
  background: linear-gradient(135deg, #ff7b50 0%, #ff4d3a 100%);
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
}

.btn-equals:hover {
  background: linear-gradient(135deg, #ff5722 0%, #e64a19 100%);
}
</style>
