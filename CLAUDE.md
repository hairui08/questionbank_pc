# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Vue 3 + TypeScript + Vite 的在线题库与考试管理系统,位于 `vue-exam-system/` 目录。系统支持**管理端**(题库/试卷/考试管理)和**学生端**(在线答题/成绩查看)两大模块。

## 常用命令

```bash
# 进入 Vue 项目目录
cd vue-exam-system

# 安装依赖
npm install

# 启动开发服务器 (http://localhost:5173)
npm run dev

# 类型检查 + 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 核心架构

### 系统模块划分

项目分为三大功能区:

1. **门户与学生端** (`/`, `/student/*`)
   - 门户首页: 系统入口和导航
   - 学生端: 在线答题、成绩查看
   - 相关 stores: `examSession.ts`, `learningStage.ts`

2. **管理端 - 基础数据管理** (`/project-management`, `/chapter-management`, 等)
   - 项目/科目管理
   - 章节/小节管理
   - 学习阶段管理
   - 知识点管理
   - 题型配置管理
   - 相关 stores: `project.ts`, `chapter.ts`, `learningStage.ts`, `knowledgePoint.ts`, `questionType.ts`

3. **管理端 - 题库与考试** (`/question-management`, `/exam-management`, `/test-management`)
   - 题库管理: 6种题型录入与管理
   - 试卷管理: 组卷与试卷配置
   - 考试管理: 考试发布与监控
   - 阅卷管理: 主观题批阅
   - 相关 stores: `question.ts`, `exam.ts`, `test.ts`, `marking.ts`

### 数据流架构

项目采用**分层 Pinia Stores** 管理数据,形成树形依赖关系:

```
learningStageStore (学习阶段: 小学/初中/高中)
    ↓
projectStore (项目/科目)
    ↓
chapterStore (章节/小节) ← 引用 projectStore.projectTree
    ↓
knowledgePointStore (知识点) ← 跨章节关联
    ↓
questionTypeStore (题型配置) ← 按科目配置
    ↓
questionStore (试题数据) ← 引用所有上层 stores
    ↓
examStore (试卷) ← 引用 questionStore
    ↓
testStore (考试) ← 引用 examStore
    ↓
markingStore (阅卷) ← 引用 testStore
```

**关键约束**:
- `learningStageStore` 是数据源头,定义学习阶段(如"小学数学")
- `projectStore` 包含 `projects` 和 `subjects`,所有科目必须归属于某个项目
- `chapterStore.projectTree` 必须与 `projectStore` 数据同步
- `knowledgePointStore` 支持跨章节关联,用于知识图谱构建
- `questionStore` 中的试题可关联多个知识点
- 所有 ID 关联必须保持一致 (如 `subjectId` 对应 `subjects.id`)

### 三级联动筛选

题库管理、试卷管理等页面实现**项目 → 科目 → 章节**的三级联动:

```typescript
// 核心实现模式
const filteredSubjects = computed(() => {
  if (!filter.value.projectId) return []
  return projectStore.subjects.filter(s => s.projectId === filter.value.projectId)
})

const filteredChapters = computed(() => {
  if (!filter.value.subjectId) return []
  return chapterStore.chapters.filter(c => c.subjectId === filter.value.subjectId)
})
```

**重要**: 选择上级时必须清空下级选项 (`onProjectChange` 清空 `subjectId` 和 `chapterId`)

### 题型系统

系统支持 **6 种题型**:

#### 常规题型
1. **单选题** (`single`) - 单选答案 + 2-10个选项
2. **多选题** (`multiple`) - 多选答案 + 2-10个选项
3. **判断题** (`judgment`) - 正确/错误二选一
4. **不定项** (`uncertain`) - 多选答案,至少选择一个
5. **简答题** (`essay`) - 文本答案(最多2000字符)

#### 特殊题型
6. **组合题** (`combination`) - 包含案例背景 + 多个小问
   - 案例背景: 最多5000字符
   - 小问题型: 单选、多选、判断、简答 (**不支持不定项**)
   - 小问数量: 不限,建议3-8个

```typescript
interface QuestionForm {
  mainStem?: string          // 案例背景 (仅组合题)
  subQuestions?: SubQuestion[] // 小问列表 (仅组合题)
  // ... 其他常规字段
}

interface SubQuestion {
  type: 'single' | 'multiple' | 'judgment' | 'essay' // 不支持 'uncertain'
  stem: string
  options?: QuestionOption[]  // 客观题才有
  answer: string | string[]
  explanation: string
}
```

**限制**: 小问**不支持不定项题型**,这是有意设计以控制复杂度。

### 知识点系统

知识点管理支持跨章节关联:

- 知识点可关联到**多个章节**
- 试题可关联到**多个知识点**
- 支持知识点的**父子层级关系**(预留)
- 用于构建知识图谱和智能推荐

### 类型定义规范

每个视图模块在 `types/index.ts` 中定义自己的类型:

- `project-management/types/index.ts` - Project, Subject, ProjectFormData
- `chapter-management/types/index.ts` - Chapter, Section, ChapterFormData
- `learning-stage-management/types/index.ts` - LearningStage, LearningStageFormData
- `knowledge-point-management/types/index.ts` - KnowledgePoint, KnowledgePointFormData
- `question-type-management/types/index.ts` - QuestionType, QuestionTypeFormData
- `question-management/types/index.ts` - QuestionForm, QuestionFilter, SubQuestion
- `exam-management/types/index.ts` - Exam, ExamFormData
- `test-management/types/index.ts` - Test, TestFormData
- `marking-management/types/index.ts` - MarkingTask, MarkingFormData

**命名约定**: 表单数据类型以 `FormData` 结尾,树节点类型以 `TreeNode` 结尾。

## 关键业务规则

### 唯一性约束

各层级数据有严格的唯一性要求:

| 层级 | 约束范围 | 字段 |
|------|---------|------|
| 学习阶段名称 | 全局唯一 | `learningStage.name` |
| 项目名称 | 学习阶段内唯一 | `project.name` (同 `learningStageId`) |
| 科目名称 | 项目内唯一 | `subject.name` (同 `projectId`) |
| 章节名称 | 科目内唯一 | `chapter.name` (同 `subjectId`) |
| 小节名称 | 章节内唯一 | `section.name` (同 `chapterId`) |
| 知识点名称 | 科目内唯一 | `knowledgePoint.name` (同 `subjectId`) |
| 内部题型名称 | 科目内唯一 | `questionType.internalName` (同 `subjectId`) |
| 外部显示名称 | 科目内唯一 | `questionType.displayName` (同 `subjectId`) |
| 题干内容 | 科目+章节内唯一 | `question.stem` (同 `subjectId` + `chapterId`) |

### 删除保护

- **删除学习阶段**: 必须先删除该学习阶段下的所有项目
- **删除项目**: 必须先删除该项目下的所有科目
- **删除科目**: 会级联删除该科目下的所有章节、知识点、题型、试题
- **删除章节**: 必须先删除该章节下的所有小节
- **删除题型**: 必须确保没有试题引用该题型
- **删除试题**: 必须确保该试题没有被任何试卷引用

### 状态管理

所有实体支持 `active` / `disabled` 状态切换:
- **禁用学习阶段**: 该学习阶段下的项目不可选
- **禁用项目**: 科目"添加"按钮变为禁用状态
- **禁用科目**: 题型配置中该科目不可选
- **禁用题型**: 题库管理中该题型不可选
- **禁用章节/小节**: 不影响独立编辑,但在筛选时可能被过滤

## 组件复用模式

### 三标签页结构

所有管理页面采用统一的三标签页布局:

```vue
<TabNavigation :tabs="tabs" :default-tab="'prototype'">
  <template #prototype>原型展示</template>
  <template #requirements>需求文档</template>
  <template #style-guide>样式指南</template>
</TabNavigation>
```

**标签页配置**:
```typescript
const tabs = [
  { key: 'prototype', label: '原型展示', icon: '🎨' },
  { key: 'requirements', label: '需求文档', icon: '📋' },
  { key: 'style-guide', label: '样式指南', icon: '🎯' }
]
```

### 树形导航 (SubjectTree)

章节管理、知识点管理和题型管理页面使用 `SubjectTree` 组件显示项目-科目树:

```vue
<SubjectTree
  :active-subject-id="activeSubject?.id"
  @subject-change="handleSubjectChange"
/>
```

**数据源**: 所有使用该组件的 store 必须提供 `projectTree` 属性 (与 `chapterStore.projectTree` 结构一致)。

### Toast 反馈

使用 `useToast` composable 提供统一的 Toast 提示:

```typescript
import { useToast } from '@/composables/useToast'
const { showToast } = useToast()

// 成功提示 (默认)
showToast('操作成功')

// 错误提示
showToast('操作失败', { type: 'error' })
```

## 样式系统

### CSS 变量 (Design Tokens)

全局 CSS 变量定义在 `src/styles/index.css`:

```css
:root {
  --primary-text: #2c3e50;
  --secondary-text: #5a6c7d;
  --accent: #0066cc;
  --accent-hover: #0052a3;
  --panel-bg: #ffffff;
  --panel-border: #e4eaf2;
  --table-border: #dfe3eb;
  --row-hover: #f0f7ff;
}
```

### 需求文档表格样式

**紫色渐变表头** (功能规格/字段约束):
```css
.spec-table thead,
.constraint-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.spec-table th,
.constraint-table th {
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

**粉红色渐变表头** (验收标准):
```css
.acceptance-criteria thead {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}
```

**重要**: 这些样式在所有管理页面的需求文档标签页中保持一致,确保视觉统一。

## 数据字段约束

### 常规字段

| 字段 | 长度限制 | 备注 |
|------|---------|------|
| 题干内容 | 1-5000 字符 | 支持富文本(预留) |
| 选项内容 | 1-500 字符/选项 | 客观题 2-10 个选项 |
| 试题解析 | 1-3000 字符 | 建议包含解题思路 |
| 参考答案 (简答题) | 1-2000 字符 | 文本输入 |

### 组合题字段

| 字段 | 长度限制 | 备注 |
|------|---------|------|
| 案例背景 | 1-5000 字符 | 大题干 |
| 小问数量 | ≥ 1 | 建议 3-8 个 |
| 小问题干 | 1-5000 字符 | 每个小问 |
| 小问解析 | 1-3000 字符 | 每个小问 |

## 路由系统

### 路由结构

```
/ - 门户首页
/student - 学生端入口
  /student/exam/:id - 在线答题
  /student/result/:id - 答题结果

管理端:
/project-management - 项目管理
/chapter-management - 章节管理
/learning-stage-management - 学习阶段管理
/knowledge-point-management - 知识点管理
/question-type-management - 题型管理
/question-management - 题库管理
  /question-management/add - 添加试题
  /question-management/edit/:id - 编辑试题
/exam-management - 试卷管理
  /exam-management/create - 创建试卷
  /exam-management/edit/:id - 编辑试卷
/test-management - 考试管理
  /test-management/create - 创建考试
  /test-management/edit/:id - 编辑考试
/marking-management - 阅卷管理
/design-guidelines - 设计规范
```

所有路由使用懒加载以优化首屏性能:

```typescript
component: () => import('@/views/project-management/index.vue')
```

## 学生端功能

### 答题会话管理

使用 `examSession` store 管理学生答题状态:

- 答题进度自动保存
- 支持暂停/继续答题
- 倒计时提醒
- 自动提交(时间到)

### 答题卡与导航

学生端组件:
- `ExamHeader.vue` - 考试头部(时间/进度)
- `QuestionPanel.vue` - 题目展示区
- `AnswerCard.vue` - 答题卡(题目导航)
- `ScientificCalculator.vue` - 科学计算器(理科考试)
- `ExamSettings.vue` - 答题设置

## 重要注意事项

### Mock 数据命名

`projectStore` 提供了兼容性别名用于题库管理页面:

```typescript
return {
  projects,
  subjects,
  // 兼容别名
  mockProjects: projects,
  mockSubjects: subjects,
  // ...
}
```

**原因**: 题库管理页面历史上使用 `mockProjects` 命名,保留别名避免破坏性修改。

### 科目 ID 一致性

章节数据的 `subjectId` 必须与 `projectStore.subjects` 中的 `id` 匹配:

```typescript
// ✅ 正确
{ id: 'ch-001', subjectId: 's1', ... }  // 对应 subjects 中 id: 's1'

// ❌ 错误
{ id: 'ch-001', subjectId: 'subj-001', ... }  // 旧格式,已废弃
```

### 组合题验证逻辑

保存组合题时的完整性检查:

```typescript
function validateCombinationQuestion() {
  // 1. 案例背景必填
  if (!mainStem.value.trim()) return false

  // 2. 至少一个小问
  if (subQuestions.value.length === 0) return false

  // 3. 每个小问的题干、答案、解析必填
  for (const subQ of subQuestions.value) {
    if (!subQ.stem.trim() || !subQ.answer || !subQ.explanation.trim()) {
      return false
    }
    // 4. 客观题小问必须有选项
    if (isObjective(subQ.type) && !subQ.options?.length) {
      return false
    }
  }
  return true
}
```

## 开发建议

### 添加新功能模块

1. 在 `src/views/` 下创建新模块目录
2. 创建 `types/index.ts` 定义类型
3. 创建对应的 Pinia store (如需要)
4. 在 `router/index.ts` 添加路由
5. 在 `Sidebar.vue` 添加导航项
6. 遵循三标签页结构(原型/需求/样式)

### 数据关联注意事项

- 添加新实体时,确保唯一性约束得到满足
- 删除实体时,检查是否有级联删除需求
- 修改 ID 引用时,确保所有依赖项同步更新
- 使用 computed 实现数据联动筛选

### 组件开发规范

- 优先复用现有组件(`Modal`, `Toast`, `SubjectTree` 等)
- 表单验证使用统一的验证逻辑
- 状态管理使用 Pinia,避免 props drilling
- 组件通信优先使用 emit,复杂场景使用 store

## 与 HTML 原型的关系

本项目是 `../prototype/` 目录下 HTML 原型的 Vue 实现版本:

- **HTML 原型** (prototype/) - 产品文档和静态交互原型
- **Vue 实现** (vue-exam-system/) - 可运行的管理后台应用

**关键差异**:
- Vue 版本使用真实的响应式状态管理 (Pinia)
- Vue 版本支持路由导航,HTML 原型是独立页面
- Vue 版本表单验证更完善,HTML 原型仅做演示
- 设计规范在两个项目中保持一致 (CSS 变量、颜色、字体等)

## 技术栈

- **框架**: Vue 3.5+ (Composition API)
- **语言**: TypeScript 5.9+
- **构建**: Vite 7.1+
- **状态管理**: Pinia 3.0+
- **路由**: Vue Router 4.6+
- **样式**: CSS 变量 + Scoped CSS
