<template>
  <AppLayout title="题库系统学习阶段管理">
    <TabNavigation :tabs="tabs" :default-tab="'prototype'">
      <!-- 原型展示标签页 -->
      <template #prototype>
        <div class="tab-panel">
          <div class="prototype-wrapper">
            <SubjectTree
              :active-subject-id="activeSubject?.id"
              @subject-change="handleSubjectChange"
            />

            <LearningStageTable
              :active-subject="activeSubject"
              @add="openAddModal"
              @edit="openEditModal"
              @delete="openDeleteModal"
              @toggle-status="handleToggleStatus"
            />
          </div>
        </div>
      </template>

      <!-- 需求文档标签页 -->
      <template #requirements>
        <div class="tab-panel">
          <div class="requirements-header">
            <h2>学习阶段管理需求文档</h2>
            <p>详细的功能需求、业务规则和验收标准，确保学习阶段管理模块实现标准化。</p>
          </div>

          <div class="requirements-content">
            <section class="business-requirements">
              <h3>业务需求</h3>
              <div class="requirement-section">
                <h4>核心目标</h4>
                <ul>
                  <li>提供科学的学习路径规划功能</li>
                  <li>支持按科目组织学习阶段</li>
                  <li>灵活的阶段顺序调整能力</li>
                  <li>提供直观的阶段管理界面</li>
                </ul>
              </div>

              <div class="requirement-section">
                <h4>用户场景</h4>
                <ul>
                  <li>
                    <strong>创建学习阶段</strong>: 教学管理员为"财务战略管理"科目规划学习路径：预习阶段、课堂学习阶段、练习巩固阶段、复习冲刺阶段
                  </li>
                  <li>
                    <strong>调整阶段顺序</strong>: 根据教学计划调整，将"强化训练阶段"上移到"模拟考试阶段"之前，确保学习顺序合理
                  </li>
                  <li>
                    <strong>编辑阶段描述</strong>: 为每个阶段补充详细描述，帮助学生了解该阶段的学习目标和重点
                  </li>
                  <li>
                    <strong>删除过期阶段</strong>: 清理不再使用的学习阶段，保持课程体系整洁
                  </li>
                </ul>
              </div>

              <div class="requirement-section">
                <h4>业务规则</h4>
                <ul>
                  <li><strong>阶段名称唯一性</strong>: 同一科目下学习阶段名称不能重复，不同科目可重复</li>
                  <li><strong>自动排序</strong>: 新建阶段自动追加到末尾，系统自动分配排序号</li>
                  <li><strong>手动调序</strong>: 支持通过上下箭头调整阶段顺序，排序号自动重新分配</li>
                  <li><strong>描述选填</strong>: 阶段描述为可选字段，建议填写以提供更好的指导</li>
                  <li><strong>科目关联</strong>: 学习阶段必须隶属于某个科目，随科目变化而独立管理</li>
                </ul>
              </div>
            </section>

            <section class="functional-requirements">
              <h3>功能规格</h3>

              <table class="spec-table">
                <thead>
                  <tr>
                    <th width="15%">功能项</th>
                    <th width="40%">功能描述</th>
                    <th width="35%">交互规则</th>
                    <th width="10%">优先级</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>科目导航</td>
                    <td>左侧树形菜单分层展示项目和科目</td>
                    <td>
                      点击项目展开科目，点击科目加载学习阶段列表，当前选中科目高亮
                    </td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>阶段列表</td>
                    <td>表格展示学习阶段信息</td>
                    <td>
                      包含序号、阶段名称、阶段描述、创建人、创建时间、操作列
                    </td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>添加阶段</td>
                    <td>右上角【添加学习阶段】按钮触发弹窗</td>
                    <td>
                      字段：所属科目（只读）、阶段名称*、阶段描述；校验：名称必填、同科目下不重复
                    </td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>编辑阶段</td>
                    <td>阶段行【修改】按钮打开弹窗</td>
                    <td>
                      预填现有数据，允许修改名称和描述，执行重复校验
                    </td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>删除阶段</td>
                    <td>阶段行【删除】按钮触发确认弹窗</td>
                    <td>
                      二次确认后删除，删除后自动调整其他阶段的排序号
                    </td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>调整顺序</td>
                    <td>阶段行上下箭头按钮调整顺序</td>
                    <td>
                      点击上箭头与上一个交换，点击下箭头与下一个交换，首尾位置按钮禁用
                    </td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>状态筛选</td>
                    <td>筛选启用/禁用学习阶段</td>
                    <td>默认"启用"，实时更新列表</td>
                    <td>P1</td>
                  </tr>
                  <tr>
                    <td>空状态处理</td>
                    <td>无数据时显示提示信息</td>
                    <td>
                      未选择科目显示"请先从左侧选择一个科目"；科目下无阶段显示"暂无学习阶段数据"并提供添加按钮
                    </td>
                    <td>P1</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section class="data-constraints">
              <h3>字段约束</h3>
              <table class="constraint-table">
                <thead>
                  <tr>
                    <th width="20%">字段名</th>
                    <th width="15%">类型</th>
                    <th width="15%">长度限制</th>
                    <th width="25%">校验规则</th>
                    <th width="25%">示例</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>阶段名称</td>
                    <td>文本</td>
                    <td>1-50字符</td>
                    <td>必填、同科目下唯一</td>
                    <td>预习阶段、课堂学习阶段</td>
                  </tr>
                  <tr>
                    <td>阶段描述</td>
                    <td>文本</td>
                    <td>0-200字符</td>
                    <td>选填</td>
                    <td>课前预习，熟悉基础概念</td>
                  </tr>
                  <tr>
                    <td>排序序号</td>
                    <td>整数</td>
                    <td>≥1</td>
                    <td>自动分配，系统管理</td>
                    <td>1, 2, 3</td>
                  </tr>
                  <tr>
                    <td>创建人</td>
                    <td>文本</td>
                    <td>-</td>
                    <td>系统自动填充</td>
                    <td>张老师</td>
                  </tr>
                  <tr>
                    <td>创建时间</td>
                    <td>日期时间</td>
                    <td>-</td>
                    <td>系统自动填充</td>
                    <td>2025-01-05 09:00</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section class="acceptance-criteria">
              <h3>验收标准</h3>
              <table class="acceptance-criteria">
                <thead>
                  <tr>
                    <th width="20%">测试场景</th>
                    <th width="40%">操作步骤</th>
                    <th width="40%">预期结果</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>创建学习阶段</td>
                    <td>
                      1. 选择科目"财务战略管理"<br />
                      2. 点击【添加学习阶段】<br />
                      3. 输入名称"预习阶段"、描述"课前预习，熟悉基础概念"<br />
                      4. 点击【确定】
                    </td>
                    <td>
                      - 弹窗关闭<br />
                      - 学习阶段列表新增一条记录<br />
                      - 排序号自动为当前最大值+1<br />
                      - 提示"添加成功"
                    </td>
                  </tr>
                  <tr>
                    <td>重名校验</td>
                    <td>
                      1. 在同一科目下<br />
                      2. 尝试创建已存在的阶段名称"预习阶段"<br />
                      3. 点击【确定】
                    </td>
                    <td>
                      - 显示错误提示"该科目下已存在同名的学习阶段"<br />
                      - 不允许提交
                    </td>
                  </tr>
                  <tr>
                    <td>调整顺序</td>
                    <td>
                      1. 选择第3个阶段"练习巩固阶段"<br />
                      2. 点击上箭头按钮<br />
                      3. 观察列表变化
                    </td>
                    <td>
                      - "练习巩固阶段"上移到第2位<br />
                      - 原第2个阶段下移到第3位<br />
                      - 提示"排序调整成功"
                    </td>
                  </tr>
                  <tr>
                    <td>删除学习阶段</td>
                    <td>
                      1. 点击某个阶段的【删除】按钮<br />
                      2. 在确认弹窗中点击【确认删除】
                    </td>
                    <td>
                      - 该阶段从列表中移除<br />
                      - 后续阶段的排序号自动调整<br />
                      - 提示"删除成功"
                    </td>
                  </tr>
                  <tr>
                    <td>编辑学习阶段</td>
                    <td>
                      1. 点击某个阶段的【修改】按钮<br />
                      2. 修改名称为"深化学习阶段"<br />
                      3. 修改描述<br />
                      4. 点击【确定】
                    </td>
                    <td>
                      - 弹窗关闭<br />
                      - 列表中显示更新后的内容<br />
                      - 排序号不变<br />
                      - 提示"编辑成功"
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>
        </div>
      </template>

      <!-- 样式指南标签页 -->
      <template #style-guide>
        <div class="tab-panel">
          <div class="style-guide-header">
            <h2>学习阶段管理设计规范</h2>
            <p>统一的视觉风格和交互规范，确保用户体验的一致性。</p>
          </div>

          <div class="style-guide-content">
            <section class="color-system">
              <h3>配色方案</h3>
              <div class="color-palette">
                <div class="color-item">
                  <div class="color-sample" style="background: #0066cc"></div>
                  <div class="color-label">主色调</div>
                  <div class="color-value">#0066CC</div>
                  <div class="color-usage">按钮、链接、高亮</div>
                </div>
                <div class="color-item">
                  <div class="color-sample" style="background: #2c3e50"></div>
                  <div class="color-label">主文本</div>
                  <div class="color-value">#2C3E50</div>
                  <div class="color-usage">标题、正文</div>
                </div>
                <div class="color-item">
                  <div class="color-sample" style="background: #5a6c7d"></div>
                  <div class="color-label">次要文本</div>
                  <div class="color-value">#5A6C7D</div>
                  <div class="color-usage">辅助信息</div>
                </div>
                <div class="color-item">
                  <div class="color-sample" style="background: #e74c3c"></div>
                  <div class="color-label">危险操作</div>
                  <div class="color-value">#E74C3C</div>
                  <div class="color-usage">删除、错误</div>
                </div>
              </div>
            </section>

            <section class="typography">
              <h3>排版规范</h3>
              <table class="typography-table">
                <thead>
                  <tr>
                    <th>元素</th>
                    <th>字号</th>
                    <th>字重</th>
                    <th>行高</th>
                    <th>应用场景</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>页面标题</td>
                    <td>18px</td>
                    <td>600</td>
                    <td>1.5</td>
                    <td>学习阶段列表标题</td>
                  </tr>
                  <tr>
                    <td>表格表头</td>
                    <td>13px</td>
                    <td>600</td>
                    <td>1.2</td>
                    <td>列标题</td>
                  </tr>
                  <tr>
                    <td>表格内容</td>
                    <td>13px</td>
                    <td>400</td>
                    <td>1.4</td>
                    <td>数据单元格</td>
                  </tr>
                  <tr>
                    <td>按钮文字</td>
                    <td>13px</td>
                    <td>600</td>
                    <td>1</td>
                    <td>所有操作按钮</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section class="interaction-rules">
              <h3>交互规则</h3>
              <ul>
                <li><strong>悬停效果</strong>: 表格行悬停显示浅蓝色背景(#f0f7ff)</li>
                <li><strong>按钮状态</strong>: 悬停时上移1px并显示阴影</li>
                <li><strong>表单验证</strong>: 实时校验，错误信息显示在字段下方</li>
                <li><strong>操作反馈</strong>: Toast提示2秒后自动消失</li>
                <li><strong>二次确认</strong>: 删除等危险操作必须弹窗确认</li>
              </ul>
            </section>
          </div>
        </div>
      </template>
    </TabNavigation>

    <!-- 添加学习阶段弹窗 -->
    <AddLearningStageModal
      :visible="isAddModalVisible"
      :subject-name="activeSubject?.name || ''"
      @update:visible="isAddModalVisible = $event"
      @submit="handleAddSubmit"
    />

    <!-- 编辑学习阶段弹窗 -->
    <EditLearningStageModal
      :visible="isEditModalVisible"
      :subject-name="activeSubject?.name || ''"
      :stage="currentStage"
      @update:visible="isEditModalVisible = $event"
      @submit="handleEditSubmit"
    />

    <!-- 删除确认弹窗 -->
    <DeleteConfirmModal
      :visible="isDeleteModalVisible"
      :message="`确定要删除学习阶段「${currentStage?.name}」吗？`"
      @update:visible="isDeleteModalVisible = $event"
      @confirm="handleDeleteConfirm"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppLayout from '@/components/Layout/AppLayout.vue'
import TabNavigation from '@/components/Tab/TabNavigation.vue'
import SubjectTree from './components/SubjectTree.vue'
import LearningStageTable from './components/LearningStageTable.vue'
import AddLearningStageModal from './components/AddLearningStageModal.vue'
import EditLearningStageModal from './components/EditLearningStageModal.vue'
import DeleteConfirmModal from './components/DeleteConfirmModal.vue'
import { useLearningStageStore } from '@/stores/learningStage'
import { useToast } from '@/composables/useToast'
import type { SubjectTreeNode, LearningStage, LearningStageFormData } from './types'

const learningStageStore = useLearningStageStore()
const { showToast } = useToast()

// 标签页配置
const tabs = [
  { key: 'prototype', label: '原型展示', icon: '🎨' },
  { key: 'requirements', label: '需求文档', icon: '📋' },
  { key: 'style-guide', label: '样式指南', icon: '🎯' }
]

// 当前选中的科目（扩展包含 projectName）
const activeSubject = ref<{
  id: string
  name: string
  projectName: string
} | null>(null)

// 组件挂载时自动选中第一个项目的第一个科目
onMounted(() => {
  const firstProject = learningStageStore.projectTree[0]
  if (firstProject && firstProject.subjects.length > 0) {
    const firstSubject = firstProject.subjects[0]
    handleSubjectChange(firstSubject)
  }
})

// 当前操作的学习阶段
const currentStage = ref<LearningStage | null>(null)

// 弹窗显示状态
const isAddModalVisible = ref(false)
const isEditModalVisible = ref(false)
const isDeleteModalVisible = ref(false)

/**
 * 科目切换事件
 */
const handleSubjectChange = (subject: SubjectTreeNode) => {
  // 查找科目所属的项目
  const project = learningStageStore.projectTree.find(p =>
    p.subjects.some(s => s.id === subject.id)
  )

  activeSubject.value = {
    id: subject.id,
    name: subject.name,
    projectName: project?.name || ''
  }
}

/**
 * 打开添加弹窗
 */
const openAddModal = () => {
  if (!activeSubject.value) {
    showToast('请先选择科目', { type: 'error' })
    return
  }
  isAddModalVisible.value = true
}

/**
 * 打开编辑弹窗
 */
const openEditModal = (stage: LearningStage) => {
  currentStage.value = stage
  isEditModalVisible.value = true
}

/**
 * 打开删除确认弹窗
 */
const openDeleteModal = (stage: LearningStage) => {
  currentStage.value = stage
  isDeleteModalVisible.value = true
}

/**
 * 处理添加提交
 */
const handleAddSubmit = (data: LearningStageFormData) => {
  if (!activeSubject.value) return

  const result = learningStageStore.addLearningStage(activeSubject.value.id, data)

  if (result.success) {
    showToast('添加成功')
  } else {
    showToast(result.message || '添加失败', { type: 'error' })
  }
}

/**
 * 处理编辑提交
 */
const handleEditSubmit = (id: string, data: LearningStageFormData) => {
  const result = learningStageStore.updateLearningStage(id, data)

  if (result.success) {
    showToast('编辑成功')
  } else {
    showToast(result.message || '编辑失败', { type: 'error' })
  }
}

/**
 * 处理切换启用/禁用状态
 */
const handleToggleStatus = (stage: LearningStage) => {
  const result = learningStageStore.toggleLearningStageStatus(stage.id)

  if (result.success) {
    const newStatus = stage.status === 'active' ? '禁用' : '启用'
    showToast(`${newStatus}成功`)
  } else {
    showToast(result.message || '操作失败', { type: 'error' })
  }
}

/**
 * 处理删除确认
 */
const handleDeleteConfirm = () => {
  if (!currentStage.value) return

  const result = learningStageStore.deleteLearningStage(currentStage.value.id)

  if (result.success) {
    showToast('删除成功')
    isDeleteModalVisible.value = false
  } else {
    showToast(result.message || '删除失败', { type: 'error' })
  }
}
</script>

<style scoped>
/* 原型展示 */
.tab-panel {
  padding: 0;
}

.prototype-wrapper {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

/* 需求文档样式 */
.requirements-header,
.style-guide-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--panel-border);
}

.requirements-header h2,
.style-guide-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary-text);
  margin-bottom: 12px;
}

.requirements-header p,
.style-guide-header p {
  font-size: 16px;
  color: var(--secondary-text);
  line-height: 1.6;
}

.requirements-content,
.style-guide-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

section {
  margin-bottom: 48px;
}

section h3 {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-text);
  margin: 0 0 24px;
  padding-bottom: 12px;
  border-bottom: 3px solid var(--accent);
}

.requirement-section {
  margin-bottom: 32px;
}

.requirement-section h4 {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-text);
  margin: 0 0 16px;
}

.requirement-section ul {
  margin: 0;
  padding-left: 24px;
}

.requirement-section li {
  margin-bottom: 12px;
  line-height: 1.8;
  color: var(--secondary-text);
}

.requirement-section li strong {
  color: var(--primary-text);
  font-weight: 600;
}

/* 表格样式 */
.spec-table,
.constraint-table,
.acceptance-criteria,
.typography-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  overflow: hidden;
}

.spec-table thead,
.constraint-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.acceptance-criteria thead {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.typography-table thead {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.spec-table th,
.constraint-table th,
.acceptance-criteria th,
.typography-table th {
  padding: 16px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.spec-table td,
.constraint-table td,
.acceptance-criteria td,
.typography-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: var(--primary-text);
  line-height: 1.6;
}

.spec-table tbody tr:hover,
.constraint-table tbody tr:hover,
.acceptance-criteria tbody tr:hover,
.typography-table tbody tr:hover {
  background-color: #f8f9fa;
}

/* 样式指南 */
.color-palette {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.color-item {
  text-align: center;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.color-sample {
  width: 100%;
  height: 80px;
  border-radius: 6px;
  margin-bottom: 12px;
}

.color-label {
  font-weight: 600;
  font-size: 14px;
  color: var(--primary-text);
  margin-bottom: 4px;
}

.color-value {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: var(--secondary-text);
  margin-bottom: 8px;
}

.color-usage {
  font-size: 12px;
  color: var(--secondary-text);
}

.interaction-rules ul {
  margin: 20px 0 0;
  padding-left: 24px;
}

.interaction-rules li {
  margin-bottom: 12px;
  line-height: 1.8;
  color: var(--secondary-text);
}

.interaction-rules li strong {
  color: var(--primary-text);
  font-weight: 600;
}
</style>
