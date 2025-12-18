# 题库系统 - 答题规则与数据保存规范

本文档定义了章节练习的答题规则和答题数据的保存机制，确保系统的业务逻辑清晰、数据完整性可靠。

---

## 一、章节练习答题规则

### 1. 动态试题同步规则

**业务场景**：用户正在做章节练习时，管理员在该章节下添加了新试题。

**处理规则**：
- ✅ 系统实时检测章节下的试题变更
- ✅ 自动同步新添加的试题到用户的答题会话
- ✅ 新试题追加到试卷末尾展示（不打乱原有题目顺序）
- ✅ 不影响用户当前的答题进度和已作答题目
- ✅ 用户可以选择是否作答新增试题（作为附加题）

**实现要点**：
- 轮询或 WebSocket 监听章节试题变更
- 新增题目创建快照并追加到 `questionSnapshots` 数组末尾
- 更新 `questionIds` 列表但不改变 `currentQuestionIndex`
- 在答题卡中高亮显示新增题目（如标记"新增"徽章）

---

### 2. 历史记录保护规则

**业务场景**：管理员在后台修改试题信息（如纠正答案错别字、修改选项、更新解析等）。

**处理规则**：
- ✅ 已完成的答题记录完全不受影响
- ✅ 历史批改结果保持不变（对就是对，错就是错）
- ✅ 成绩统计不会因试题修改而重新计算
- ✅ 用户查看历史试卷时，展示的是答题时的题目版本（快照数据）

**典型案例**：
```
场景：某道单选题的正确答案原本是 "A（包含错别字）"
     学生答题时选择了 "B"，被判为错误

管理员操作：修正答案为 "A（纠正错别字）"

结果：该学生的历史记录仍然显示"答错"，成绩不变
     原因：批改时使用的是快照中的答案，而非修改后的答案
```

**技术实现**：
- 使用 `QuestionSnapshot` 存储题目完整快照
- 批改逻辑读取 `AnswerRecord.questionSnapshots[].answer`，而非实时查询题库
- 历史试卷展示使用快照数据渲染，确保还原用户当时看到的题目

---

### 3. 自动保存机制

**保存频率**：每 **3 分钟** 自动保存一次做题记录。

**触发时机**：
| 时机 | 说明 | 优先级 |
|------|------|--------|
| ⏰ **定时触发** | 每 3 分钟自动保存一次 | 中 |
| 🔄 **切题触发** | 用户切换到下一题/上一题时立即保存 | 高 |
| ⏸️ **暂停触发** | 用户点击"暂停答题"按钮时保存 | 高 |
| 🚪 **退出触发** | 用户关闭页面或退出考试时保存（beforeunload 事件） | 最高 |
| ✅ **提交触发** | 用户点击"提交试卷"时执行最终保存 | 最高 |

**保存内容**：
- 当前所有题目的作答情况（`answers`）
- 每道题的答题时间统计（`timings`）
- 当前题目索引（`currentQuestionIndex`）
- 答题状态（`status`）
- 最后保存时间（`lastSaveTime`）

**实现伪代码**：
```typescript
// 定时器保存
setInterval(() => {
  autoSaveProgress()
}, 3 * 60 * 1000) // 3分钟

// 切题保存
function onQuestionChange() {
  saveCurrentAnswer()
  autoSaveProgress()
}

// 退出保存
window.addEventListener('beforeunload', (e) => {
  autoSaveProgress()
})
```

---

## 二、答题数据保存规则

### 1. 答题进度保存策略

#### 1.1 自动保存时机

| 触发场景 | 保存时机 | 实现方式 |
|---------|---------|---------|
| **定时保存** | 每 3 分钟 | `setInterval(() => autoSave(), 180000)` |
| **切题保存** | 切换题目时 | 在 `currentQuestionIndex` 变更时触发 |
| **暂停保存** | 点击暂停按钮 | 按钮点击事件中调用保存逻辑 |
| **退出保存** | 关闭页面/刷新 | `window.onbeforeunload` 事件 |
| **提交保存** | 点击提交试卷 | 提交表单前执行最终保存 |

#### 1.2 保存失败处理

**本地缓存策略**：
- 每次保存前先写入 `localStorage`
- Key 格式：`answer_record_${userId}_${examId | chapterId}_${timestamp}`
- 保留最近 3 次保存记录，超过自动清理

**辅助函数**（确保 Key 规则一致）：
```typescript
// 生成缓存 Key（包含 examId/chapterId + timestamp）
function generateCacheKey(userId: string, examId?: string, chapterId?: string): string {
  const identifier = examId || chapterId || 'temp'
  const timestamp = Date.now()
  return `answer_record_${userId}_${identifier}_${timestamp}`
}

// 查找最新缓存记录
function getLatestLocalRecord(userId: string, examId?: string, chapterId?: string): AnswerRecord | null {
  const identifier = examId || chapterId || 'temp'
  const prefix = `answer_record_${userId}_${identifier}_`

  // 获取所有匹配的 keys
  const allKeys = Object.keys(localStorage).filter(k => k.startsWith(prefix))

  if (allKeys.length === 0) return null

  // 按 timestamp 排序，取最新的
  const sortedKeys = allKeys.sort((a, b) => {
    const tsA = parseInt(a.split('_').pop() || '0')
    const tsB = parseInt(b.split('_').pop() || '0')
    return tsB - tsA
  })

  const latestKey = sortedKeys[0]
  const data = localStorage.getItem(latestKey)
  return data ? JSON.parse(data) : null
}

// 保存并清理旧缓存（保留最近3次）
function saveToLocalStorageWithCleanup(record: AnswerRecord) {
  const key = generateCacheKey(record.userId, record.examId, record.chapterId)
  localStorage.setItem(key, JSON.stringify(record))

  // 清理旧缓存（保留最近3次）
  const identifier = record.examId || record.chapterId || 'temp'
  const prefix = `answer_record_${record.userId}_${identifier}_`
  const allKeys = Object.keys(localStorage).filter(k => k.startsWith(prefix))

  if (allKeys.length > 3) {
    const sortedKeys = allKeys.sort((a, b) => {
      const tsA = parseInt(a.split('_').pop() || '0')
      const tsB = parseInt(b.split('_').pop() || '0')
      return tsB - tsA
    })

    // 删除超过3次的旧记录
    sortedKeys.slice(3).forEach(k => localStorage.removeItem(k))
  }
}

// 清理指定试卷/章节的所有缓存
function clearLocalCacheFor(userId: string, examId?: string, chapterId?: string) {
  const identifier = examId || chapterId || 'temp'
  const prefix = `answer_record_${userId}_${identifier}_`
  const allKeys = Object.keys(localStorage).filter(k => k.startsWith(prefix))
  allKeys.forEach(k => localStorage.removeItem(k))
}
```

**网络失败重试机制**：
```typescript
async function saveWithRetry(data: AnswerRecord, maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await api.saveAnswerRecord(data)
      localStorage.setItem('last_sync_time', Date.now())
      return true
    } catch (error) {
      if (i === maxRetries - 1) {
        // 最后一次重试失败，保存到本地
        saveToLocalStorage(data)
        showWarning('网络异常，数据已保存到本地，将在网络恢复后自动同步')
        return false
      }
      // 等待30秒后重试
      await sleep(30000)
    }
  }
}
```

**用户提示**：
- 保存成功：无提示（静默保存）
- 保存失败：显示黄色警告条 "⚠️ 网络异常，数据已保存到本地"
- 同步成功：显示绿色提示 "✅ 数据已同步"

#### 1.3 离线缓存策略

**离线答题流程**：
```
1. 检测到网络断开
   ↓
2. 切换到离线模式（显示"离线答题"标识）
   ↓
3. 所有答题数据保存到 localStorage
   ↓
4. 定期检测网络状态（每30秒）
   ↓
5. 网络恢复后自动同步到服务器
   ↓
6. 同步成功后清理本地缓存
```

**冲突处理规则**：
- **时间戳优先**：以最新 `lastSaveTime` 的数据为准
- **合并策略**：如果本地和服务器都有数据，合并两边的答案（取并集）
- **用户确认**：数据冲突时弹窗让用户选择保留哪份数据

---

### 2. 答题数据结构

#### 2.1 核心数据模型

```typescript
/**
 * 答题记录主表
 * 存储用户的完整答题会话数据
 */
interface AnswerRecord {
  // ========== 基础标识 ==========
  id: string                    // 答题记录ID（UUID）
  userId: string                // 用户ID
  examType: 'chapter' | 'mock' | 'formal'  // 考试类型

  // ========== 试卷信息 ==========
  examId?: string               // 试卷ID（正式考试时必填）
  subjectId: string             // 科目ID
  chapterId?: string            // 章节ID（章节练习时必填）
  learningStageId?: string      // 学习阶段ID

  // ========== 试题列表 ==========
  questionIds: string[]         // 题目ID列表（按出题顺序）
  questionSnapshots: QuestionSnapshot[]  // 题目快照（核心字段！）

  // ========== 答题数据 ==========
  answers: Record<string, Answer>  // 用户答案 { questionId: Answer }
  timings: Record<string, number>  // 答题时间 { questionId: seconds }

  // ========== 状态标识 ==========
  status: 'in_progress' | 'paused' | 'submitted'  // 答题状态
  currentQuestionIndex: number  // 当前题目索引（0-based）

  // ========== 时间戳 ==========
  startTime: string             // 开始时间（ISO 8601）
  lastSaveTime: string          // 最后保存时间
  pausedAt?: string             // 暂停时间
  resumedAt?: string            // 恢复时间
  submitTime?: string           // 提交时间

  // ========== 成绩数据（提交后生成） ==========
  score?: number                // 总分
  totalScore?: number           // 满分
  correctCount?: number         // 正确题数
  wrongCount?: number           // 错误题数
  unansweredCount?: number      // 未答题数
  accuracy?: number             // 正确率（百分比）
}

/**
 * 单题答案记录
 * 存储用户对某道题的作答详情
 */
interface Answer {
  questionId: string            // 题目ID

  // 常规题答案
  userAnswer?: string | string[] // 用户答案（单选string，多选string[]）

  // 组合题答案（当题目类型为 'combination' 时使用）
  subAnswers?: SubAnswer[]      // 小问答案列表

  // 批改结果
  isCorrect?: boolean           // 是否正确（提交后判断，常规题使用）
  score?: number                // 实际得分（组合题需要累加小问得分）

  // 答题信息
  timeSpent: number             // 答题耗时（秒）
  answeredAt: string            // 作答时间（ISO 8601）
  changeCount?: number          // 修改次数（记录用户改答案的次数）
}

/**
 * 组合题小问答案
 * 用于存储组合题中每个小问的作答详情
 */
interface SubAnswer {
  subQuestionIndex: number      // 小问索引（0-based）
  userAnswer: string | string[] // 用户答案
  isCorrect?: boolean           // 是否正确（批改后）
  score?: number                // 该小问得分
  timeSpent: number             // 该小问耗时（秒）
}

/**
 * 题目快照
 * 核心字段，存储用户答题时的题目完整状态
 */
interface QuestionSnapshot {
  questionId: string            // 题目ID
  type: 'single' | 'multiple' | 'judgment' | 'uncertain' | 'essay' | 'combination'

  // 题目内容快照
  stem: string                  // 题干快照（含富文本）
  options?: QuestionOption[]    // 选项快照（客观题）
  answer: string | string[]     // 正确答案快照
  explanation: string           // 解析快照

  // 元数据快照
  difficulty: number            // 难度快照（1-5）
  score: number                 // 分值快照
  knowledgePointIds: string[]   // 知识点ID列表
  knowledgePointNames: string[] // 知识点名称快照

  // 组合题快照（type === 'combination' 时）
  mainStem?: string             // 案例背景快照
  subQuestions?: SubQuestionSnapshot[]  // 小问快照

  // 快照元信息
  snapshotTime: string          // 快照创建时间
  originalVersion?: number      // 原始题目版本号
}

/**
 * 小问快照（组合题）
 */
interface SubQuestionSnapshot {
  type: 'single' | 'multiple' | 'judgment' | 'essay'
  stem: string
  options?: QuestionOption[]
  answer: string | string[]
  explanation: string
  score: number
}
```

#### 2.2 关键字段说明

| 字段 | 类型 | 说明 | 重要性 |
|------|------|------|--------|
| `questionSnapshots` | `QuestionSnapshot[]` | **核心字段**！保存题目完整快照，防止后续修改影响历史记录 | ⭐⭐⭐⭐⭐ |
| `answers` | `Record<string, Answer>` | 用户作答记录，Key 为 questionId，Value 为答案对象 | ⭐⭐⭐⭐⭐ |
| `timings` | `Record<string, number>` | 每道题的答题时间统计（秒） | ⭐⭐⭐⭐ |
| `status` | `enum` | 区分"答题中"、"已暂停"、"已提交"三种状态 | ⭐⭐⭐⭐ |
| `currentQuestionIndex` | `number` | 当前题目索引，用于断点续答 | ⭐⭐⭐⭐ |
| `lastSaveTime` | `string` | 最后保存时间，用于冲突检测和数据合并 | ⭐⭐⭐⭐ |

#### 2.3 数据库索引建议

```sql
-- 答题记录表索引
CREATE INDEX idx_answer_record_user_status ON answer_records(userId, status);
CREATE INDEX idx_answer_record_exam ON answer_records(examId, status);
CREATE INDEX idx_answer_record_chapter ON answer_records(chapterId, status);
CREATE INDEX idx_answer_record_submit_time ON answer_records(submitTime);

-- 题目快照表索引（如果单独存储）
CREATE INDEX idx_question_snapshot_record ON question_snapshots(recordId);
CREATE INDEX idx_question_snapshot_question ON question_snapshots(questionId, snapshotTime);
```

---

### 3. 试题快照机制

#### 3.1 为什么需要快照？

快照机制是保证历史记录不被修改影响的核心技术手段：

| 问题场景 | 无快照的后果 | 有快照的解决方案 |
|---------|------------|---------------|
| 管理员修正答案 | 历史记录重新批改，成绩变化 | 使用快照答案批改，成绩不变 |
| 管理员修改选项 | 查看历史试卷时显示新选项，用户困惑 | 显示快照选项，还原原貌 |
| 管理员删除题目 | 历史记录缺失题目，无法完整复现 | 快照保留完整数据 |
| 管理员调整分值 | 历史成绩需要重新计算 | 使用快照分值，成绩不变 |

**核心原则**：用户答题时看到的是什么，历史记录就永远显示什么。

---

#### 3.2 快照内容清单

**必须保存的内容**：
- ✅ 题干原文（包括富文本、LaTeX 公式、图片 Base64）
- ✅ 选项原文（客观题，包括选项文本和图片）
- ✅ 正确答案（字符串或字符串数组）
- ✅ 试题解析（含富文本）
- ✅ 难度系数（1-5）
- ✅ 分值（score）
- ✅ 关联的知识点 ID 列表
- ✅ 关联的知识点名称列表（冗余存储，防止知识点被删除）
- ✅ 快照创建时间（用于追溯）
- ✅ 原始题目版本号（如果题库有版本管理）

**组合题额外保存**：
- ✅ 案例背景（mainStem）
- ✅ 每个小问的完整快照（type、stem、options、answer、explanation、score）

---

#### 3.3 快照创建时机

| 时机 | 触发条件 | 实现逻辑 |
|------|---------|---------|
| **开始答题** | 用户首次进入答题页面 | 为所有题目批量创建快照 |
| **动态添加题目** | 章节练习中新增题目 | 为新题目立即创建快照并追加到列表 |
| **断点续答** | 检测到快照缺失 | 补充创建缺失题目的快照（兜底逻辑） |

**快照创建流程**：
```typescript
async function createQuestionSnapshots(questions: Question[]): Promise<QuestionSnapshot[]> {
  return questions.map(q => ({
    questionId: q.id,
    type: q.type,
    stem: q.stem,
    options: q.options ? [...q.options] : undefined,  // 深拷贝
    answer: Array.isArray(q.answer) ? [...q.answer] : q.answer,
    explanation: q.explanation,
    difficulty: q.difficulty,
    score: q.score,
    knowledgePointIds: [...q.knowledgePointIds],
    knowledgePointNames: getKnowledgePointNames(q.knowledgePointIds),  // 查询名称
    mainStem: q.mainStem,
    subQuestions: q.subQuestions ? q.subQuestions.map(sq => ({...sq})) : undefined,
    snapshotTime: new Date().toISOString(),
    originalVersion: q.version
  }))
}
```

---

#### 3.4 快照存储策略

**存储位置**：
- 主表字段：`AnswerRecord.questionSnapshots`（JSONB 类型）
- 关系数据库：推荐使用 PostgreSQL 的 JSONB 类型
- NoSQL 数据库：直接存储 JSON 对象

**存储大小优化**：
- 图片使用 Base64 或对象存储 URL（推荐后者）
- 富文本压缩存储（gzip 压缩）
- 单条快照大小建议：< 100KB
- 整个 AnswerRecord 大小建议：< 5MB

**查询优化**：
```sql
-- 使用 JSONB 的 GIN 索引加速查询
CREATE INDEX idx_answer_record_snapshots_gin
ON answer_records USING GIN (questionSnapshots);

-- 查询某道题的所有历史快照
SELECT id, questionSnapshots
FROM answer_records
WHERE questionSnapshots @> '[{"questionId": "q-001"}]';
```

---

### 4. 断点续答规则

#### 4.1 会话恢复机制

**检测逻辑**：
```typescript
async function checkUnfinishedSession(
  userId: string,
  examId?: string,
  chapterId?: string
) {
  // 1. 查询服务器是否有未完成记录
  const serverRecord = await api.getUnfinishedRecord(userId)

  // 2. 查询本地缓存是否有未同步记录（使用正确的 Key 规则）
  const localRecord = getLatestLocalRecord(userId, examId, chapterId)

  // 3. 优先级：服务器 > 本地缓存
  const record = serverRecord || localRecord

  if (record && record.status === 'in_progress') {
    // 弹出确认对话框
    const shouldResume = await showConfirmDialog({
      title: '检测到未完成的练习',
      message: `您在 ${formatTime(record.lastSaveTime)} 暂停了一次答题，是否继续？`,
      confirmText: '继续答题',
      cancelText: '重新开始'
    })

    if (shouldResume) {
      return record  // 返回记录用于恢复
    } else {
      await api.deleteAnswerRecord(record.id)  // 删除旧记录
      // 同时清理本地缓存
      clearLocalCacheFor(userId, examId, chapterId)
      return null
    }
  }

  return null
}
```

**UI 提示示例**：
```
┌──────────────────────────────────────┐
│  🔄 检测到未完成的练习               │
├──────────────────────────────────────┤
│  您在 2024-11-11 10:30 暂停了一次   │
│  数学章节练习，已完成 15/30 题      │
│                                      │
│  是否继续上次的答题？                │
│                                      │
│  [ 重新开始 ]        [ 继续答题 ]  │
└──────────────────────────────────────┘
```

---

#### 4.2 数据恢复流程

**完整恢复步骤**：
```typescript
async function resumeAnswerSession(record: AnswerRecord) {
  // 1. 恢复题目列表（使用快照数据）
  const questions = record.questionSnapshots.map(snapshot => ({
    id: snapshot.questionId,
    type: snapshot.type,
    stem: snapshot.stem,
    options: snapshot.options,
    // ... 其他字段从快照恢复
  }))

  // 2. 恢复用户答案（填充到表单）
  const answers = record.answers
  questions.forEach((q, index) => {
    if (answers[q.id]) {
      fillAnswer(index, answers[q.id].userAnswer)
    }
  })

  // 3. 恢复当前题目位置
  const currentIndex = record.currentQuestionIndex
  scrollToQuestion(currentIndex)

  // 4. 恢复答题时间统计
  const timings = record.timings
  Object.keys(timings).forEach(qId => {
    setQuestionTimer(qId, timings[qId])
  })

  // 5. 恢复总计时器
  const elapsedTime = calculateElapsedTime(record.startTime, record.pausedAt)
  startTimer(elapsedTime)

  // 6. 更新状态为"答题中"
  await api.updateAnswerRecordStatus(record.id, 'in_progress')

  // 7. 清理本地缓存（已恢复到服务器，使用正确的清理函数）
  clearLocalCacheFor(record.userId, record.examId, record.chapterId)
}
```

---

#### 4.3 时间计算规则

**累计时间公式**：
```typescript
// 总答题时间 = 本次答题时间 + 历史累计时间
const totalTime = (currentTime - resumedAt) + previousElapsedTime

// 单题答题时间 = 累计停留时间
interface QuestionTiming {
  questionId: string
  startTime: number      // 首次进入该题的时间戳
  totalTime: number      // 累计停留时间（秒）
  pausedTime: number     // 暂停时的时间点
}

function calculateQuestionTime(timing: QuestionTiming): number {
  if (timing.pausedTime) {
    // 有暂停记录，累加历史时间
    return timing.totalTime + (Date.now() - timing.pausedTime) / 1000
  } else {
    // 无暂停，直接计算
    return (Date.now() - timing.startTime) / 1000
  }
}
```

**时间统计规则**：
- ✅ 每道题独立计时，切换题目时保存当前题的时间
- ✅ 暂停时记录暂停时间点，恢复时从暂停点继续
- ✅ 页面刷新后恢复计时器，时间累加（不重置）
- ✅ 答题卡显示每道题的答题耗时（提交后可见）

---

#### 4.4 断点续答完整流程图

```
┌─────────────────────────────────────────┐
│  用户进入答题页面                       │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  检查是否有未完成记录                   │
│  - 查询服务器 (status='in_progress')   │
│  - 查询本地缓存                         │
└─────────────┬───────────────────────────┘
              │
        有记录？─────► 否 ────► 开始新答题
              │
             是
              │
              ▼
┌─────────────────────────────────────────┐
│  弹出提示框                             │
│  "检测到未完成的练习，是否继续？"       │
└─────────────┬───────────────────────────┘
              │
        用户选择？
              │
         继续 │  重新开始
              ▼        │
┌─────────────────────┐│
│  恢复答题会话       ││
│  1. 加载快照数据    ││
│  2. 恢复用户答案    ││
│  3. 跳转到上次位置  ││
│  4. 恢复计时器      ││
└─────────────┬───────┘│
              │        │
              ▼        ▼
┌─────────────────────────────────────────┐
│  继续答题 / 开始新答题                  │
│  - 3分钟自动保存                        │
│  - 切题时保存                           │
│  - 提交时最终保存                       │
└─────────────────────────────────────────┘
```

---

#### 4.5 特殊情况处理

| 场景 | 检测逻辑 | 处理方案 |
|------|---------|---------|
| **试卷已删除** | 查询 `examId` 返回 404 | 提示"试卷已不存在"，清除断点数据，返回列表页 |
| **考试已结束** | `endTime < currentTime` | 提示"考试已结束，无法继续作答"，允许查看但不能修改答案 |
| **题目被删除** | 快照中的题目在题库中不存在 | 使用快照数据渲染题目，用户仍可继续作答 |
| **数据冲突** | 本地和服务器都有数据且时间不一致 | 以 `lastSaveTime` 最新的为准，或弹窗让用户选择 |
| **会话过期** | 距离上次保存超过 7 天 | 提示"会话已过期"，清除数据，不允许恢复 |

**数据冲突处理示例**：
```typescript
async function resolveConflict(localRecord: AnswerRecord, serverRecord: AnswerRecord) {
  // 1. 比较时间戳
  const localTime = new Date(localRecord.lastSaveTime).getTime()
  const serverTime = new Date(serverRecord.lastSaveTime).getTime()

  if (Math.abs(localTime - serverTime) < 5000) {
    // 时间差小于5秒，认为是同一份数据，取服务器版本
    return serverRecord
  }

  // 2. 时间差较大，让用户选择
  const choice = await showConflictDialog({
    localRecord,
    serverRecord,
    message: '检测到数据冲突，请选择保留哪份数据'
  })

  if (choice === 'local') {
    // 用本地数据覆盖服务器
    await api.updateAnswerRecord(localRecord)
    return localRecord
  } else {
    // 使用服务器数据，丢弃本地（使用正确的清理函数）
    clearLocalCacheFor(localRecord.userId, localRecord.examId, localRecord.chapterId)
    return serverRecord
  }
}
```

---

## 三、实施建议

### 后端 API 接口设计

```typescript
// 1. 创建答题会话
POST /api/answer-records
Body: {
  examType: 'chapter',
  subjectId: 's1',
  chapterId: 'ch-001',
  questionIds: ['q1', 'q2', 'q3']
}
Response: {
  id: 'record-uuid',
  questionSnapshots: [...],  // 自动生成快照
  startTime: '2024-11-11T10:00:00Z'
}

// 2. 保存答题进度（支持部分更新）
PATCH /api/answer-records/:id
Body: {
  answers: { 'q1': { userAnswer: 'A', timeSpent: 30 } },
  currentQuestionIndex: 1,
  status: 'in_progress',  // ✅ 必须：答题状态
  lastSaveTime: '2024-11-11T10:05:00Z'
}

// 2.1 保存组合题答案示例
PATCH /api/answer-records/:id
Body: {
  answers: {
    'q-combination-001': {
      questionId: 'q-combination-001',
      subAnswers: [
        { subQuestionIndex: 0, userAnswer: 'A', timeSpent: 30 },
        { subQuestionIndex: 1, userAnswer: ['A', 'C'], timeSpent: 45 },
        { subQuestionIndex: 2, userAnswer: '勾股定理', timeSpent: 120 }
      ],
      timeSpent: 195,
      answeredAt: '2024-11-11T10:15:00Z'
    }
  },
  currentQuestionIndex: 2,
  status: 'in_progress',
  lastSaveTime: '2024-11-11T10:15:00Z'
}

// 2.2 暂停答题
PATCH /api/answer-records/:id
Body: {
  status: 'paused',
  pausedAt: '2024-11-11T10:10:00Z',
  lastSaveTime: '2024-11-11T10:10:00Z'
}

// 2.3 恢复答题
PATCH /api/answer-records/:id
Body: {
  status: 'in_progress',
  resumedAt: '2024-11-11T10:15:00Z',
  lastSaveTime: '2024-11-11T10:15:00Z'
}

// 3. 查询未完成记录
GET /api/answer-records/unfinished?userId=xxx
Response: AnswerRecord | null

// 4. 提交试卷（最终保存 + 批改）
POST /api/answer-records/:id/submit
Response: {
  score: 85,
  correctCount: 17,
  wrongCount: 3,
  detailedResults: [...]
}

// 5. 检测章节题目变更（轮询或 WebSocket）
GET /api/chapters/:id/questions/checksum
Response: {
  checksum: 'abc123',  // 题目列表的哈希值
  newQuestions: ['q10', 'q11']  // 新增题目ID
}
```

---

### 前端实现要点

**Vue 3 Composition API 示例**：
```typescript
// composables/useAnswerSession.ts
export function useAnswerSession() {
  const currentRecord = ref<AnswerRecord | null>(null)
  const autoSaveTimer = ref<number | null>(null)

  // 开始答题会话
  async function startSession(examType: string, questionIds: string[]) {
    const record = await api.createAnswerRecord({
      examType,
      questionIds,
      // ...
    })
    currentRecord.value = record
    startAutoSave()
    return record
  }

  // 启动自动保存
  function startAutoSave() {
    autoSaveTimer.value = setInterval(() => {
      if (currentRecord.value) {
        saveProgress()
      }
    }, 3 * 60 * 1000)  // 3分钟
  }

  // 保存进度
  async function saveProgress() {
    if (!currentRecord.value) return

    // 更新最后保存时间
    currentRecord.value.lastSaveTime = new Date().toISOString()

    // 1. 先写入本地缓存（确保数据不丢失）
    saveToLocalStorageWithCleanup(currentRecord.value)

    // 2. 再尝试同步到服务器
    try {
      await api.updateAnswerRecord(currentRecord.value.id, {
        answers: currentRecord.value.answers,
        timings: currentRecord.value.timings,
        currentQuestionIndex: currentRecord.value.currentQuestionIndex,
        status: currentRecord.value.status,  // ✅ 新增 status 字段
        lastSaveTime: currentRecord.value.lastSaveTime
      })

      // 服务器保存成功，标记同步时间
      localStorage.setItem('last_sync_time', Date.now().toString())
    } catch (error) {
      console.error('服务器保存失败，数据已保存到本地缓存', error)
      showWarning('⚠️ 网络异常，数据已保存到本地，将在网络恢复后自动同步')
    }
  }

  // beforeunload 确保最终保存
  window.addEventListener('beforeunload', (e) => {
    if (currentRecord.value && currentRecord.value.status === 'in_progress') {
      // 同步写入本地缓存
      saveToLocalStorageWithCleanup(currentRecord.value)

      // 尝试使用 sendBeacon 发送最后的数据（异步但可靠）
      navigator.sendBeacon(
        `/api/answer-records/${currentRecord.value.id}/save`,
        JSON.stringify({
          answers: currentRecord.value.answers,
          timings: currentRecord.value.timings,
          currentQuestionIndex: currentRecord.value.currentQuestionIndex,
          status: 'paused',  // 退出时标记为暂停
          lastSaveTime: currentRecord.value.lastSaveTime
        })
      )
    }
  })

  // 断点续答
  async function resumeSession(userId: string) {
    const record = await checkUnfinishedSession(userId)
    if (record) {
      currentRecord.value = record
      startAutoSave()
      return record
    }
    return null
  }

  // 清理定时器
  onUnmounted(() => {
    if (autoSaveTimer.value) {
      clearInterval(autoSaveTimer.value)
    }
  })

  return {
    currentRecord,
    startSession,
    saveProgress,
    resumeSession
  }
}
```

---

### 测试用例

**单元测试清单**：
- ✅ 快照创建逻辑测试（包含富文本、组合题）
- ✅ 自动保存触发测试（定时、切题、退出）
- ✅ 保存失败重试机制测试
- ✅ 本地缓存读写测试
- ✅ 断点续答恢复测试（答案、时间、位置）
- ✅ 数据冲突解决测试
- ✅ 动态添加题目测试（快照追加）

**集成测试场景**：
1. 用户开始答题 → 答3题 → 刷新页面 → 断点续答 → 继续答题 → 提交
2. 用户答题中 → 管理员修改题目 → 用户提交 → 验证使用快照批改
3. 用户答题中 → 网络断开 → 离线答题 → 网络恢复 → 自动同步
4. 用户答题中 → 管理员添加新题 → 用户看到新题 → 继续答题

---

## 四、注意事项

### 性能优化

- **批量保存**：不要每次修改都调用 API，而是收集变更后批量保存
- **防抖处理**：用户快速切题时，只保存最后一次状态
- **懒加载快照**：历史试卷查看时按需加载快照数据（分页）
- **压缩传输**：快照数据使用 gzip 压缩后传输

### 安全性

- **权限校验**：保存答题记录时验证用户身份
- **防篡改**：答案数据加密传输（HTTPS）
- **防作弊**：记录答题过程中的异常行为（如切换标签页次数）
- **数据备份**：答题记录定期备份到冷存储

### 用户体验

- **保存状态提示**：显示"保存中..."、"已保存"等状态
- **网络状态监控**：实时显示网络连接状态
- **进度条展示**：答题卡显示已答/未答/标记题目
- **快捷键支持**：Ctrl+S 手动保存，方向键切题

---

## 五、修复历史

### v1.1 修复阻断性缺陷（2024-11-11）

本次修复解决了文档中的 4 个阻断性问题，确保答题规则的可实施性和数据一致性：

#### 1. ✅ 本地缓存 Key 规则统一
**问题**: 定义要求 `answer_record_${userId}_${examId}_${timestamp}`，但实际使用 `answer_record_${userId}`
**影响**: 无法区分不同试卷/章节，缓存误读或误删
**修复**:
- 新增 `generateCacheKey()` 函数（第120-125行）
- 新增 `getLatestLocalRecord()` 函数（第127-147行）
- 新增 `saveToLocalStorageWithCleanup()` 函数（第149-169行）
- 新增 `clearLocalCacheFor()` 函数（第171-177行）
- 更新 `checkUnfinishedSession()` 调用（第486-520行）
- 更新 `resumeAnswerSession()` 清理逻辑（第579行）
- 更新 `resolveConflict()` 清理逻辑（第701行）

#### 2. ✅ 保存顺序逻辑修正
**问题**: 规范要求"先本地后网络"，但代码先发网络请求，失败时丢数据
**影响**: 网络失败或 beforeunload 阻断时会丢失最新进度
**修复**:
- 调整 `saveProgress()` 函数（第827-852行）：先调用 `saveToLocalStorageWithCleanup()`，再发网络请求
- 增加 `beforeunload` 事件处理（第854-872行）：使用 `sendBeacon` 确保最终保存
- 更新错误提示文案，明确"数据已保存到本地"

#### 3. ✅ 组合题答案结构补充
**问题**: Answer 类型无法存储组合题的多个小问答案
**影响**: 前后端无法一致解析组合题答案，批改逻辑无法实现
**修复**:
- 修改 `Answer` 接口（第222-239行）：
  - `userAnswer` 改为可选
  - 增加 `subAnswers?: SubAnswer[]` 字段
  - 增加 `score?: number` 字段
- 新增 `SubAnswer` 接口（第241-251行）：定义小问答案结构
- 增加组合题保存示例（第737-755行）

#### 4. ✅ Status 字段全面补充
**问题**: 保存时没有传 status 字段，状态变化无法同步
**影响**: 暂停/恢复状态无法同步，断点续答和统计失真
**修复**:
- API 接口增加 status 字段（第733、753、760、768行）
- 新增暂停/恢复示例（第757-771行）
- `saveProgress()` 增加 status 传递（第842行）
- `beforeunload` 退出时标记为 'paused'（第867行）

---

## 六、后续优化方向

- [ ] 引入 WebSocket 实现实时同步，替代定时轮询
- [ ] 支持多设备答题同步（同一账号在手机和电脑上无缝切换）
- [ ] 引入差异化同步算法，只传输变更的答案数据
- [ ] 添加答题轨迹分析（记录用户修改答案的历史）
- [ ] 支持答题过程录像回放（供教师分析学生答题过程）

---

---

## 七、试卷预览功能需求

### 1. 功能概述

试卷预览功能提供试卷内容的完整预览，包括基础信息、题型统计和题目详情。用户可以在创建、编辑或管理试卷时快速预览试卷的整体内容和布局。

---

### 2. 功能入口

#### 2.1 触发方式

| 入口位置 | 触发操作 | 说明 |
|---------|---------|------|
| **试卷列表** | 点击"预览"操作 | 查看已创建的试卷内容 |
| **创建/编辑页面** | 点击"预览试卷"按钮 | 创建或编辑过程中预览当前内容 |
| **考试管理** | 点击"预览试卷"按钮 | 在发布考试前预览试卷 |

#### 2.2 权限控制

- ✅ 管理员：可预览所有试卷
- ✅ 教师：可预览本人创建的试卷
- ✅ 学生：考试开始后可预览试卷（只读模式）

---

### 3. 展示内容规范

#### 3.1 基础信息卡片

展示试卷的基本信息和统计数据：

**必填字段**：
- ✅ 试卷名称（完整展示）
- ✅ 考试时长（单位：分钟）
- ✅ 总分（必答题总分）
- ✅ 及格分

**统计信息**：
- ✅ 题目统计：必答 X题 / 选答 Y题
- ✅ 题型分布：单选(N题)、多选(N题)、判断(N题)、简答(N题)、组合(N题)

**样式规范**：
```css
背景：渐变卡片（#f8fafc → #ffffff）
边框：1px solid #e4eaf2
边角：圆角 12px
内边距：24px
```

---

#### 3.2 题目列表展示

**展示顺序**：按 `order` 字段升序排列

**每道题目包含**：

| 元素 | 样式规范 | 说明 |
|------|---------|------|
| **题号徽章** | 紫色渐变圆形，字体600 | 如"1"、"2"、"3" |
| **题型标签** | 彩色徽章，与题库管理一致 | 单选/多选/判断/简答/组合 |
| **分值** | 蓝色字体，显著标识 | 如"5分"、"10分" |
| **选答标记** | 橙色徽章 | 选答题显示"选答"标签 |
| **题干内容** | 支持富文本渲染 | 包含LaTeX公式、图片、表格 |
| **选项列表** | A/B/C/D 选项标识 | 仅客观题显示 |
| **参考答案** | 绿色背景区域 | 显示正确答案 |
| **试题解析** | 蓝色背景区域 | 显示解析内容 |

**样式示例**：
```css
/* 题号徽章 */
.question-number {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  font-weight: 600;
}

/* 答案区域 */
.answer-section {
  background: #ecfff2;
  border-left: 4px solid #2e8b57;
  padding: 12px 16px;
  margin: 16px 0;
}

/* 解析区域 */
.explanation-section {
  background: #e3f2fd;
  border-left: 4px solid #1976d2;
  padding: 12px 16px;
  margin: 16px 0;
}
```

---

#### 3.3 组合题特殊处理

组合题（`type: 'combination'`）需要特殊的展示结构：

**1. 案例背景独立展示**
```html
<div class="combination-background">
  <h4>【案例背景】</h4>
  <div class="case-content">{{ mainStem }}</div>
</div>
```

**2. 小问列表递归展示**

每个小问包含完整的题目结构：
- 小问序号（如"(1)"、"(2)"）
- 小问题干
- 小问选项（如果是客观题）
- 小问答案（独立的绿色背景）
- 小问解析（独立的蓝色背景）

**3. 小问题型限制**

组合题的小问支持以下题型：
- ✅ 单选题 (`single`)
- ✅ 多选题 (`multiple`)
- ✅ 判断题 (`judgment`)
- ✅ 简答题 (`essay`)
- ❌ **不支持不定项题型** (`uncertain`)

**样式规范**：
```css
.combination-background {
  background: #fff8e1;
  border: 2px dashed #ffa000;
  padding: 20px;
  margin-bottom: 24px;
}

.sub-question {
  margin-left: 20px;
  padding-left: 16px;
  border-left: 3px solid #e0e0e0;
}
```

---

### 4. 交互规范

#### 4.1 抽屉式展示

**容器类型**：使用 Vue Teleport 实现固定定位的抽屉组件

**尺寸规范**：
- 宽度：80%（最大 1200px）
- 高度：100vh（全屏高度）
- 位置：从右侧滑出
- 动画：slide-in 300ms ease-out

**关闭方式**：
- 点击遮罩层（黑色半透明，opacity: 0.5）
- 点击右上角关闭按钮（× 图标）
- 点击底部"确定"按钮
- 按下 ESC 键

#### 4.2 滚动与导航

**滚动行为**：
- 抽屉内容可滚动查看所有题目
- 滚动条样式：自定义样式，宽度 8px
- 平滑滚动：`scroll-behavior: smooth`

**导航辅助**：
- 顶部固定基础信息卡片（可选）
- 返回顶部按钮（滚动超过 300px 时显示）

---

### 5. 数据兼容规范

#### 5.1 数据来源优先级

试卷预览需要支持两种数据来源：

| 数据来源 | 说明 | 优先级 |
|---------|------|--------|
| **嵌入式试题** | ExamQuestion 中包含完整的 embedded 数据 | 🔴 最高 |
| **引用式试题** | 通过 questionId 从 questionStore 查询 | 🟡 降级方案 |

**数据获取逻辑**：
```typescript
function getQuestionData(examQuestion: ExamQuestion) {
  // 1. 优先使用嵌入数据
  if (examQuestion.embedded) {
    return examQuestion.embedded
  }

  // 2. 降级查询题库
  const question = questionStore.getQuestionById(examQuestion.questionId)
  if (question) {
    return question
  }

  // 3. 查询失败时的兜底处理
  return {
    stem: '【题目数据缺失】',
    error: true
  }
}
```

#### 5.2 缺失数据处理

| 场景 | 检测逻辑 | 处理方案 |
|------|---------|---------|
| **题目已删除** | `questionStore` 查询返回 null | 显示"【题目已删除】"占位符 |
| **图片加载失败** | `<img onerror>` 事件 | 显示占位图 + "图片加载失败"提示 |
| **富文本解析失败** | HTML 解析异常 | 降级显示纯文本 |
| **公式渲染失败** | KaTeX 渲染异常 | 显示 LaTeX 源码 |

---

### 6. 响应式设计

#### 6.1 桌面端（> 1024px）

```css
.exam-preview-drawer {
  width: 80%;
  max-width: 1200px;
}

.question-card {
  display: flex;
  gap: 24px;
}
```

#### 6.2 平板端（768px - 1024px）

```css
.exam-preview-drawer {
  width: 90%;
}

.question-card {
  flex-direction: column;
}
```

#### 6.3 移动端（< 768px）

```css
.exam-preview-drawer {
  width: 95%;
}

.question-number {
  width: 32px;
  height: 32px;
  font-size: 14px;
}

.basic-info-card {
  padding: 16px;
}
```

---

### 7. 性能优化

#### 7.1 懒加载策略

对于包含大量题目（> 50题）的试卷，采用虚拟滚动或分页加载：

**实施方案**：
- 首屏加载前 20 道题目
- 滚动到底部时加载下一批（每批 20 题）
- 保留已渲染题目，避免重复渲染

#### 7.2 图片优化

```typescript
// 图片懒加载
<img :src="imageUrl" loading="lazy" />

// 图片预加载（基础信息卡片中的图片）
const preloadImages = (urls: string[]) => {
  urls.forEach(url => {
    const img = new Image()
    img.src = url
  })
}
```

#### 7.3 渲染优化

- 使用 `v-memo` 优化列表渲染
- 组合题的小问列表使用 `v-show` 而非 `v-if`（避免重复渲染）
- 禁用不必要的动画效果

---

### 8. 技术实现要点

#### 8.1 核心组件

**文件路径**：`src/views/exam-management/components/ExamPreviewDrawer.vue`

**组件结构**：
```vue
<template>
  <Teleport to="body">
    <div v-if="visible" class="drawer-overlay" @click="close">
      <div class="drawer-panel" @click.stop>
        <!-- 关闭按钮 -->
        <button class="close-btn" @click="close">×</button>

        <!-- 基础信息卡片 -->
        <BasicInfoCard :exam-form="examForm" />

        <!-- 题目列表 -->
        <QuestionList :questions="processedQuestions" />

        <!-- 底部操作栏 -->
        <div class="drawer-footer">
          <button class="btn primary" @click="close">确定</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
```

#### 8.2 数据处理流程

```typescript
// 1. 获取试卷数据
const examForm = ref<ExamForm>(props.examForm)

// 2. 处理题目数据（合并嵌入数据和题库数据）
const processedQuestions = computed(() => {
  return examForm.value.questions.map(eq => {
    const questionData = eq.embedded || questionStore.getQuestionById(eq.questionId)
    return {
      ...eq,
      ...questionData,
      displayOrder: eq.order
    }
  })
})

// 3. 按 order 排序
const sortedQuestions = computed(() => {
  return [...processedQuestions.value].sort((a, b) => a.displayOrder - b.displayOrder)
})
```

#### 8.3 组合题渲染逻辑

```vue
<template v-if="question.type === 'combination'">
  <!-- 案例背景 -->
  <div class="combination-background">
    <h4>【案例背景】</h4>
    <div v-html="question.mainStem"></div>
  </div>

  <!-- 小问列表 -->
  <div
    v-for="(subQ, subIndex) in question.subQuestions"
    :key="subIndex"
    class="sub-question"
  >
    <h5>({{ subIndex + 1 }})</h5>
    <div v-html="subQ.stem"></div>

    <!-- 小问选项（客观题） -->
    <div v-if="isObjectiveType(subQ.type)" class="options">
      <div v-for="opt in subQ.options" :key="opt.key">
        {{ opt.key }}. {{ opt.text }}
      </div>
    </div>

    <!-- 小问答案 -->
    <div class="answer-section">
      <strong>答案：</strong>{{ formatAnswer(subQ.answer) }}
    </div>

    <!-- 小问解析 -->
    <div class="explanation-section">
      <strong>解析：</strong>{{ subQ.explanation }}
    </div>
  </div>
</template>
```

---

### 9. 验收标准

#### 9.1 功能完整性

- [ ] 基础信息卡片正确展示试卷名称、时长、总分、及格分
- [ ] 题目统计准确（必答题数、选答题数）
- [ ] 题型分布统计准确（各题型数量）
- [ ] 题目列表按 order 排序展示
- [ ] 题号、题型、分值正确展示
- [ ] 题干内容支持富文本渲染（LaTeX公式、图片）
- [ ] 选项列表正确展示（仅客观题）
- [ ] 参考答案正确展示（绿色背景）
- [ ] 试题解析正确展示（蓝色背景）

#### 9.2 组合题支持

- [ ] 案例背景独立展示（黄色背景）
- [ ] 小问列表正确递归展示
- [ ] 每个小问包含完整的题干、选项、答案、解析
- [ ] 小问序号正确（(1)、(2)、(3)...）
- [ ] 不支持不定项题型的限制已生效

#### 9.3 数据兼容性

- [ ] 支持嵌入式试题数据（embedded）
- [ ] 支持引用式试题数据（从 questionStore 查询）
- [ ] 优先使用嵌入数据，降级查询题库
- [ ] 题目缺失时显示占位符
- [ ] 图片加载失败时显示占位图

#### 9.4 交互体验

- [ ] 抽屉从右侧平滑滑出（300ms 动画）
- [ ] 点击遮罩层可关闭抽屉
- [ ] 点击关闭按钮可关闭抽屉
- [ ] 按 ESC 键可关闭抽屉
- [ ] 抽屉内容可滚动查看所有题目
- [ ] 滚动条样式符合设计规范

#### 9.5 响应式适配

- [ ] 桌面端（> 1024px）：抽屉宽度 80%，最大 1200px
- [ ] 平板端（768-1024px）：抽屉宽度 90%
- [ ] 移动端（< 768px）：抽屉宽度 95%，题目卡片垂直堆叠

#### 9.6 性能指标

- [ ] 首屏加载时间 < 1s（包含前 20 道题目）
- [ ] 滚动流畅度 60fps
- [ ] 大试卷（50+ 题目）支持虚拟滚动或分页加载
- [ ] 图片懒加载生效

---

### 10. 后续优化方向

- [ ] 支持打印试卷（导出 PDF）
- [ ] 支持分享试卷（生成分享链接）
- [ ] 支持全屏模式预览
- [ ] 支持答题卡导航（快速跳转到某道题）
- [ ] 支持题目搜索（按题号或关键词）
- [ ] 支持对比模式（对比修改前后的试卷差异）

---

**文档版本**: v1.2
**最后更新**: 2024-11-11（新增试卷预览功能需求）
**维护者**: 开发团队
