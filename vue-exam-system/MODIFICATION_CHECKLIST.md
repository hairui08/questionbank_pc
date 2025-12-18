# 题库系统原型更新清单

本文档列出所有需要修改的文件和具体修改内容。

## ✅ 已完成

### 1. 类型定义文件
**文件**: `src/views/question-management/types/index.ts`
- ✅ 删除 `QuestionSource` 和 `QuestionDifficulty` 类型
- ✅ 新增 `QuestionFrequency` 类型（low/medium/high）
- ✅ 新增 `QuestionFrequencyNames` 映射
- ✅ 更新 `QuestionFilter` 和 `QuestionForm` 接口

---

## 📋 待完成修改（详细步骤）

### 2. QuestionFilter.vue - 筛选器组件

**文件位置**: `src/views/question-management/components/QuestionFilter.vue`

#### 修改 A：添加题目内容搜索（模板顶部）

**位置**: 第2-3行之间

**原代码**:
```vue
<template>
  <div class="question-filter">
    <div class="filter-row">
```

**改为**:
```vue
<template>
  <div class="question-filter">
    <!-- 题目内容搜索 -->
    <div class="filter-search-row">
      <div class="search-group">
        <label>题目内容搜索</label>
        <input
          type="text"
          v-model="localFilter.stemKeyword"
          placeholder="请输入题干关键词进行搜索"
          class="search-input"
        />
      </div>
    </div>

    <div class="filter-row">
```

---

#### 修改 B：删除"试题来源"筛选项

**位置**: 第52-61行

**删除以下代码**:
```vue
      <!-- 5. 试题来源 -->
      <div class="filter-group">
        <label>试题来源</label>
        <select v-model="localFilter.source">
          <option value="">全部来源</option>
          <option value="official">历年真题</option>
          <option value="simulation">模拟试题</option>
          <option value="custom">自定义</option>
        </select>
      </div>
```

---

#### 修改 C：知识点改为文本输入框

**位置**: 第37-50行

**原代码**:
```vue
      <!-- 4. 知识点 -->
      <div class="filter-group">
        <label>知识点</label>
        <select v-model="localFilter.knowledgePointId" :disabled="!activeSubjectId">
          <option value="">{{ activeSubjectId ? '全部知识点' : '请先选择科目' }}</option>
          <option
            v-for="kp in filteredKnowledgePoints"
            :key="kp.id"
            :value="kp.id"
          >
            {{ kp.name }}
          </option>
        </select>
      </div>
```

**改为**:
```vue
      <!-- 4. 知识点（支持模糊搜索） -->
      <div class="filter-group">
        <label>知识点</label>
        <input
          type="text"
          v-model="localFilter.knowledgePointKeyword"
          :placeholder="activeSubjectId ? '输入知识点名称搜索' : '请先选择科目'"
          :disabled="!activeSubjectId"
          class="knowledge-point-search"
        />
      </div>
```

---

#### 修改 D："试题难度"改为"试题频次"

**位置**: 第89-98行

**原代码**:
```vue
      <!-- 8. 试题难度 -->
      <div class="filter-group">
        <label>试题难度</label>
        <select v-model="localFilter.difficulty">
          <option value="">全部难度</option>
          <option value="easy">简单</option>
          <option value="medium">中等</option>
          <option value="hard">困难</option>
        </select>
      </div>
```

**改为**:
```vue
      <!-- 7. 试题频次 -->
      <div class="filter-group">
        <label>试题频次</label>
        <select v-model="localFilter.frequency">
          <option value="">全部频次</option>
          <option value="low">低频</option>
          <option value="medium">中频</option>
          <option value="high">高频</option>
        </select>
      </div>
```

---

#### 修改 E：年份改为动态选项

**位置**: 第63-74行

**原代码**:
```vue
      <!-- 6. 所属年份 -->
      <div class="filter-group">
        <label>所属年份</label>
        <select v-model="localFilter.year">
          <option value="">全部年份</option>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
          <option value="2021">2021</option>
        </select>
      </div>
```

**改为**:
```vue
      <!-- 5. 所属年份 -->
      <div class="filter-group">
        <label>所属年份</label>
        <select v-model="localFilter.year">
          <option value="">全部年份</option>
          <option v-for="year in yearOptions" :key="year" :value="String(year)">
            {{ year }}
          </option>
        </select>
      </div>
```

---

#### 修改 F：Script部分 - 添加年份computed

**位置**: 第174行之后（filteredKnowledgePoints 之后）

**添加以下代码**:
```typescript
// 年份选项（动态计算：当前年份-10 到 当前年份）
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const years: number[] = []
  for (let year = currentYear; year >= currentYear - 10; year--) {
    years.push(year)
  }
  return years
})
```

---

#### 修改 G：Script部分 - 更新切换事件

**位置**: 第189-201行

**原代码**:
```typescript
function onProjectChange() {
  localFilter.value.subjectId = ''
  localFilter.value.chapterId = ''
  localFilter.value.knowledgePointId = ''
}

function onSubjectChange() {
  localFilter.value.chapterId = ''
  localFilter.value.knowledgePointId = ''
}
```

**改为**:
```typescript
function onProjectChange() {
  localFilter.value.subjectId = ''
  localFilter.value.chapterId = ''
  localFilter.value.knowledgePointId = ''
  localFilter.value.knowledgePointKeyword = ''
}

function onSubjectChange() {
  localFilter.value.chapterId = ''
  localFilter.value.knowledgePointId = ''
  localFilter.value.knowledgePointKeyword = ''
}
```

---

#### 修改 H：Style部分 - 添加新样式

**位置**: 第220行之后（.question-filter 样式之后）

**添加以下样式**:
```css
.filter-search-row {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--panel-border);
}

.search-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.search-group label {
  font-size: 13px;
  font-weight: 600;
  color: var(--primary-text);
}

.search-input,
.knowledge-point-search {
  padding: 8px 12px;
  border: 1px solid #cdd5e0;
  border-radius: 6px;
  font-size: 14px;
  background: #ffffff;
  transition: border-color 0.2s ease;
}

.search-input:focus,
.knowledge-point-search:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}

.search-input:disabled,
.knowledge-point-search:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}
```

---

### 3. QuestionTable.vue - 表格组件

**文件位置**: `src/views/question-management/components/QuestionTable.vue`

#### 修改 A：删除"试题难度"列头

**位置**: thead中，删除第18行

**删除**:
```vue
<th width="7%">试题难度</th>
```

#### 修改 B：添加"频次"列头

**位置**: 上一步删除的位置

**添加**:
```vue
<th width="7%">频次</th>
```

---

#### 修改 C：删除"试题难度"单元格

**位置**: tbody中，删除第56-60行

**删除**:
```vue
<td>
  <span class="difficulty-badge" :class="`difficulty-${question.difficulty}`">
    {{ getDifficultyName(question.difficulty) }}
  </span>
</td>
```

#### 修改 D：添加"频次"单元格

**位置**: 上一步删除的位置

**添加**:
```vue
<td>
  <span class="frequency-badge" :class="`frequency-${question.frequency}`">
    {{ getFrequencyName(question.frequency) }}
  </span>
</td>
```

---

#### 修改 E：Script部分 - 导入频次类型

**位置**: 第84行

**原代码**:
```typescript
import { QuestionTypeNames } from '../types'
```

**改为**:
```typescript
import { QuestionTypeNames, QuestionFrequencyNames } from '../types'
```

---

#### 修改 F：Script部分 - 删除难度函数，添加频次函数

**查找并删除** `getDifficultyName` 函数

**添加以下函数**:
```typescript
function getFrequencyName(frequency?: string): string {
  if (!frequency) return '-'
  return QuestionFrequencyNames[frequency as keyof typeof QuestionFrequencyNames] || frequency
}
```

---

#### 修改 G：Style部分 - 删除难度样式，添加频次样式

**删除以下样式**（如果存在）:
```css
.difficulty-badge { ... }
.difficulty-easy { ... }
.difficulty-medium { ... }
.difficulty-hard { ... }
```

**添加以下样式**:
```css
.frequency-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.frequency-low {
  background: #e3f2fd;
  color: #1976d2;
}

.frequency-medium {
  background: #fff3e0;
  color: #f57c00;
}

.frequency-high {
  background: #ffebee;
  color: #c62828;
}
```

---

### 4. 其他模块（简要说明）

#### 项目管理 - 科目默认禁用
**文件**: `src/views/project-management/components/AddSubjectModal.vue`
- 查找 `active: true`
- 改为 `active: false`

#### 知识点管理 - 状态默认"全部"
**文件**: `src/views/knowledge-point-management/index.vue`
- 查找 `status: ''`
- 改为 `status: 'all'`

#### 题型管理 - 删除描述字段
**文件**:
- `AddTypeModal.vue`
- `EditTypeModal.vue`
- `TypeTable.vue`
- 删除所有与 `description` 相关的代码

---

## 验证清单

完成修改后，请验证：
- [ ] 题目搜索框显示在最顶部
- [ ] "试题来源"已删除
- [ ] "试题难度"改为"试题频次"
- [ ] 知识点改为输入框
- [ ] 年份动态显示（2015-2025）
- [ ] 表格中"频次"列正确显示徽章
- [ ] 所有筛选项正常工作

---

**备注**: 由于工具限制，请手动按照上述步骤完成修改，或使用IDE的查找替换功能批量处理。
