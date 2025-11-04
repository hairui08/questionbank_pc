# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Vue 3 + TypeScript + Vite 的题库管理系统,支持 6 种题型的录入和管理。项目采用 Composition API 和 Pinia 状态管理,是 `../prototype/` 目录下 HTML 原型的 Vue 实现版本。

## 常用命令

```bash
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

### 数据流架构

项目采用**分层 Pinia Stores** 管理数据,形成树形依赖关系:

```
projectStore (项目/科目)
    ↓
chapterStore (章节/小节) ← 引用 projectStore.projectTree
    ↓
questionTypeStore (题型配置) ← 引用 projectTree
    ↓
questionStore (试题数据) ← 引用所有上层 stores
```

**关键约束**:
- `projectStore` 是数据源头,包含 `projects` 和 `subjects`
- `chapterStore.projectTree` 必须与 `projectStore` 数据同步
- `questionTypeStore` 按科目配置题型,支持内部/外部名称映射
- 所有 ID 关联必须保持一致 (如 `subjectId` 对应 `subjects.id`)

### 三级联动筛选

题库管理页面实现**项目 → 科目 → 章节**的三级联动:

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

### 组合题特殊结构

组合题 (`type: 'combination'`) 由**案例背景 + 多个小问**组成:

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

### 类型定义规范

每个视图模块在 `types/index.ts` 中定义自己的类型:

- `project-management/types/index.ts` - Project, Subject, ProjectFormData
- `chapter-management/types/index.ts` - Chapter, Section, ChapterFormData
- `question-type-management/types/index.ts` - QuestionType, QuestionTypeFormData
- `question-management/types/index.ts` - QuestionForm, QuestionFilter, SubQuestion

**命名约定**: 表单数据类型以 `FormData` 结尾,树节点类型以 `TreeNode` 结尾。

## 关键业务规则

### 唯一性约束

各层级数据有严格的唯一性要求:

| 层级 | 约束范围 | 字段 |
|------|---------|------|
| 项目名称 | 全局唯一 | `project.name` |
| 科目名称 | 项目内唯一 | `subject.name` (同 `projectId`) |
| 章节名称 | 科目内唯一 | `chapter.name` (同 `subjectId`) |
| 小节名称 | 章节内唯一 | `section.name` (同 `chapterId`) |
| 内部题型名称 | 科目内唯一 | `questionType.internalName` (同 `subjectId`) |
| 外部显示名称 | 科目内唯一 | `questionType.displayName` (同 `subjectId`) |
| 题干内容 | 科目+章节内唯一 | `question.stem` (同 `subjectId` + `chapterId`) |

### 删除保护

- **删除章节**: 必须先删除该章节下的所有小节 (`chapterStore.deleteChapter` 会检查)
- **删除题型**: 必须确保没有试题引用该题型 (`questionTypeStore.deleteQuestionType` 会检查)
- **删除项目**: 会级联删除该项目下的所有科目 (`projectStore.deleteProject`)

### 状态管理

所有实体支持 `active` / `disabled` 状态切换:
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

章节管理和题型管理页面使用 `SubjectTree` 组件显示项目-科目树:

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
| 题干内容 | 1-5000 字符（纯文本）/ 20KB（富文本） | 支持文本格式、LaTeX公式、图片（≤5张）、表格 |
| 选项内容 | 1-500 字符/选项（纯文本）/ 2KB（富文本） | 客观题 2-10 个选项，支持文本格式、LaTeX公式、图片（≤1张） |
| 试题解析 | 1-3000 字符（纯文本）/ 10KB（富文本） | 支持文本格式、LaTeX公式、图片（≤3张）、表格 |
| 参考答案 (简答题) | 1-2000 字符 | 纯文本输入 |

### 组合题字段

| 字段 | 长度限制 | 备注 |
|------|---------|------|
| 案例背景 | 1-5000 字符（纯文本）/ 20KB（富文本） | 大题干，支持文本格式、LaTeX公式、图片（≤5张）、表格 |
| 小问数量 | ≥ 1 | 建议 3-8 个 |
| 小问题干 | 1-5000 字符（纯文本）/ 20KB（富文本） | 每个小问，支持文本格式、LaTeX公式、图片（≤5张）、表格 |
| 小问解析 | 1-3000 字符（纯文本）/ 10KB（富文本） | 每个小问，支持文本格式、LaTeX公式、图片（≤3张）、表格 |

## 富文本支持规范

### 功能概述

为了支持更丰富的题目内容表达，系统支持在以下字段中使用富文本编辑：
- 题干内容（常规题目和组合题案例背景）
- 选项内容（客观题选项）
- 试题解析

富文本编辑器支持以下功能：
- **文本格式化**：粗体、斜体、下划线、删除线、上标、下标
- **数学公式**：LaTeX 语法的行内公式和块级公式
- **图片插入**：支持本地上传、拖拽、粘贴
- **表格插入**：支持基础表格的创建和编辑

### 技术选型

**核心技术栈**：
- **富文本编辑器**：Tiptap (Vue 3 官方支持)
- **数学公式引擎**：KaTeX (LaTeX 渲染)
- **相关依赖**：
  ```json
  {
    "@tiptap/vue-3": "^2.x",
    "@tiptap/starter-kit": "^2.x",
    "@tiptap/extension-image": "^2.x",
    "@tiptap/extension-table": "^2.x",
    "@tiptap/extension-mathematics": "^2.x",
    "katex": "^0.16.x"
  }
  ```

**组件结构**：
```
src/components/Editor/
├── RichTextEditor.vue       # 主编辑器组件
├── EditorToolbar.vue        # 工具栏组件
├── MathFormulaModal.vue     # 数学公式编辑弹窗
├── ImageUploadButton.vue    # 图片上传按钮
└── types/
    └── editor.ts            # TypeScript 类型定义
```

### 数学公式规范

#### 语法标准

系统采用 **LaTeX 语法** 来表示数学公式，支持以下两种格式：

- **行内公式**：使用 `$...$` 包裹，如 `$x^2 + y^2 = z^2$`
- **块级公式**：使用 `$$...$$` 包裹，独占一行居中显示

#### 常用公式示例

| 类型 | LaTeX 语法 | 渲染效果说明 |
|------|-----------|------------|
| 上标 | `$x^2$` | x的平方 |
| 下标 | `$a_1$` | a下标1 |
| 分式 | `$\frac{a}{b}$` | a分之b |
| 根式 | `$\sqrt{x}$` | 根号x |
| 求和 | `$\sum_{i=1}^{n} x_i$` | 从1到n的求和 |
| 积分 | `$\int_{a}^{b} f(x) dx$` | 从a到b的积分 |
| 矩阵 | `$\begin{bmatrix} a & b \\ c & d \end{bmatrix}$` | 2x2矩阵 |
| 希腊字母 | `$\alpha, \beta, \gamma$` | α, β, γ |

#### 公式长度限制

- 单个公式：≤ 500 字符（LaTeX 源码）
- 单个文档中公式总数：建议 ≤ 20 个（性能考虑）

### 图片上传规范

#### 文件格式与大小

| 限制项 | 规则 | 说明 |
|--------|------|------|
| 支持格式 | JPG、PNG、GIF、WebP | 常见图片格式 |
| 单张大小 | ≤ 2MB | 超过自动压缩 |
| 总数量（题干） | ≤ 5张 | 单个题干内 |
| 总数量（选项） | ≤ 1张/选项 | 每个选项独立计算 |
| 总数量（解析） | ≤ 3张 | 单个解析内 |

#### 存储方案（分阶段）

**原型阶段（当前）**：
- 采用 **Base64 内联存储**
- 图片数据直接嵌入 HTML
- 优点：无需后端接口
- 缺点：增大数据库体积（Base64 比原始大 33%）

**生产环境（规划）**：
- 采用 **对象存储 + URL 引用**
- 推荐阿里云 OSS / 腾讯云 COS
- 前端直传，后端签名
- 支持 CDN 加速

#### 图片优化

- 自动压缩：上传时对 > 1MB 的图片进行压缩
- 尺寸限制：建议图片宽度 ≤ 800px（保证显示效果）
- Alt 文本：必须提供图片描述（无障碍访问）

### 表格支持规范

#### 表格尺寸限制

| 限制项 | 规则 | 说明 |
|--------|------|------|
| 最大行数 | 10 行 | 超过影响页面性能 |
| 最大列数 | 10 列 | 超过影响页面布局 |
| 单元格内容 | ≤ 200 字符 | 每个单元格 |
| 嵌套限制 | 不支持表格嵌套 | 复杂度控制 |

#### 表格功能

- ✅ 插入表格（指定行列数）
- ✅ 增删行列
- ✅ 合并单元格（不支持，保持简单）
- ✅ 单元格内文本格式化（粗体、斜体）
- ❌ 单元格内插入图片（不支持）

### 字段约束更新

将原有的纯文本字段约束更新为支持富文本：

| 字段 | 纯文本长度 | 富文本HTML长度 | 富文本功能 |
|------|-----------|--------------|-----------|
| 题干内容 | 1-5000 字符 | ≤ 20KB | 文本格式、公式、图片（≤5张）、表格（≤10×10） |
| 选项内容 | 1-500 字符 | ≤ 2KB | 文本格式、公式、图片（≤1张） |
| 试题解析 | 1-3000 字符 | ≤ 10KB | 文本格式、公式、图片（≤3张）、表格（≤10×10） |
| 案例背景 | 1-5000 字符 | ≤ 20KB | 文本格式、公式、图片（≤5张）、表格（≤10×10） |
| 小问题干 | 1-5000 字符 | ≤ 20KB | 文本格式、公式、图片（≤5张）、表格（≤10×10） |
| 小问解析 | 1-3000 字符 | ≤ 10KB | 文本格式、公式、图片（≤3张）、表格（≤10×10） |

**说明**：
- 纯文本长度：使用 `textarea` 时的字符数限制
- 富文本HTML长度：使用富文本编辑器后的 HTML 内容大小限制
- 1KB ≈ 1024 字节 ≈ 512 个中文字符（UTF-8编码）

### 安全性要求

#### XSS 防护

**问题**：富文本内容包含 HTML，存在 XSS 攻击风险

**方案**：
1. **服务端清洗**：使用 DOMPurify 清洗所有 HTML 内容
2. **白名单标签**：只允许以下标签
   ```
   <p>, <br>, <strong>, <em>, <u>, <del>, <sup>, <sub>,
   <a>, <img>, <table>, <tr>, <td>, <th>, <thead>, <tbody>,
   <ul>, <ol>, <li>, <span>
   ```
3. **白名单属性**：只允许以下属性
   ```
   href (仅 http/https), src (图片URL),
   alt, title, class, style (受限CSS)
   ```
4. **禁止标签**：严格禁止
   ```
   <script>, <iframe>, <object>, <embed>, <form>, <input>
   ```

#### CSP 策略

在页面头部添加 Content Security Policy：
```html
<meta http-equiv="Content-Security-Policy"
      content="script-src 'self'; object-src 'none'; base-uri 'self';">
```

### 性能优化要求

#### 编辑器懒加载

- 只在用户点击"编辑"按钮时才加载富文本编辑器组件
- 使用 Vue 的 `defineAsyncComponent` 实现按需加载
- 预计节省首屏加载时间 ~200ms

#### 图片压缩

- 上传时自动压缩 > 1MB 的图片
- 使用 Canvas API 进行客户端压缩
- 目标：压缩后 ≤ 500KB，质量 85%

#### 内容大小限制

- 单个文档（题目）的 HTML 总大小：≤ 100KB
- 超过限制时给出警告提示
- 建议：优化图片、减少冗余格式

#### 渲染优化

- 对于只读显示（如查看试题），使用轻量级渲染器
- 不加载完整的 Tiptap 编辑器
- 只渲染 HTML 内容 + KaTeX 公式

### 实施计划

#### 阶段 1：基础富文本（1-2天）

**任务清单**：
- [x] 安装 Tiptap + 相关依赖
- [x] 创建 RichTextEditor 通用组件
- [x] 实现基础工具栏（粗体、斜体、列表、链接）
- [x] 替换题库管理页面的 textarea
- [x] 替换试卷管理抽屉的 textarea

#### 阶段 2：数学公式（1-2天）

**任务清单**：
- [ ] 集成 KaTeX 渲染引擎
- [ ] 添加公式输入弹窗（实时预览）
- [ ] 支持行内公式 `$...$` 和块级公式 `$$...$$`
- [ ] 提供常用公式模板库（分式、根式、积分、矩阵等）

#### 阶段 3：图片和表格（1天）

**任务清单**：
- [ ] 实现图片上传（拖拽 + 粘贴）
- [ ] 添加图片大小限制和自动压缩
- [ ] 实现表格插入和编辑
- [ ] 支持表格行列增删

#### 阶段 4：测试和优化（0.5天）

**任务清单**：
- [ ] 处理现有纯文本数据的兼容显示
- [ ] 添加 HTML 内容清洗（XSS 防护）
- [ ] 性能测试和优化
- [ ] 组合题小问的富文本测试

### 验收标准

| 功能点 | 验收标准 |
|--------|---------|
| 文本格式化 | 支持粗体、斜体、下划线等，格式正确渲染，支持组合使用 |
| 数学公式 | LaTeX 语法正确渲染，支持行内和块级公式，提供实时预览 |
| 图片上传 | 支持本地上传、拖拽、粘贴，符合大小和数量限制，正确显示 |
| 表格插入 | 支持插入、编辑、删除行列，布局正确，支持基础格式 |
| 安全性 | 通过 XSS 测试，所有 HTML 内容经过清洗，无安全漏洞 |
| 性能 | 编辑器加载时间 < 500ms，页面渲染流畅（60fps） |
| 兼容性 | 兼容现有纯文本数据，正确显示和编辑 |

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

## 路由说明

默认路由重定向到项目管理:

```typescript
{ path: '/', redirect: '/project-management' }
```

所有路由使用懒加载以优化首屏性能:

```typescript
component: () => import('@/views/project-management/index.vue')
```

## 与 HTML 原型的关系

本项目是 `../prototype/` 目录下 HTML 原型的 Vue 实现版本:

- **HTML 原型** (prototype/) - 产品文档和静态交互原型
- **Vue 实现** (vue-exam-system/) - 可运行的管理后台应用

**关键差异**:
- Vue 版本使用真实的响应式状态管理 (Pinia)
- Vue 版本支持路由导航,HTML 原型是独立页面
- Vue 版本表单验证更完善,HTML 原型仅做演示
- 设计规范在两个项目中保持一致 (CSS 变量、颜色、字体等)
