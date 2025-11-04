<template>
  <AppLayout title="题库系统题型管理">
    <TabNavigation :tabs="tabs" :default-tab="'prototype'">
      <!-- 原型展示标签页 -->
      <template #prototype>
        <div class="tab-panel">
          <div class="prototype-wrapper">
            <SubjectTree :active-subject-id="activeSubject?.id" @subject-change="handleSubjectChange" />

            <TypeTable
              v-if="activeSubject"
              :types="currentTypes"
              :project-name="activeSubject.projectName"
              :subject-name="activeSubject.name"
              @add-type="openAddTypeModal"
              @edit-type="openEditTypeModal"
              @delete-type="openDeleteTypeModal"
              @toggle-status="handleToggleStatus"
            />
          </div>
        </div>
      </template>

      <!-- 需求文档标签页 -->
      <template #requirements>
        <div class="tab-panel">
          <div class="requirements-header">
            <h2>题型管理需求文档</h2>
            <p>详细的功能需求、业务规则和验收标准，确保题型管理模块满足科目级别的个性化配置需求。</p>
          </div>

          <div class="requirements-content">
            <section class="business-requirements">
              <h3>业务需求</h3>
              <div class="requirement-section">
                <h4>核心目标</h4>
                <ul>
                  <li>支持不同科目配置不同的题型集合</li>
                  <li>允许同一内部题型在不同科目使用不同的外部显示名称</li>
                  <li>确保科目级别的题型唯一性和排序唯一性</li>
                  <li>提供分页浏览和完整的CRUD操作</li>
                </ul>
              </div>


              <div class="requirement-section">
                <h4>用户场景</h4>
                <ul>
                  <li><strong>配置题型</strong>: 内容管理员为"财务战略管理"科目配置题型集合(如"单选题"、"多选题"、"判断题"、"简答题"),设置外部显示名称和排序</li>
                  <li><strong>自定义名称</strong>: 将内部题型"single"在科目A配置为"单项选择题",在科目B配置为"单选题",适应不同考试体系的命名习惯</li>
                  <li><strong>状态管理</strong>: 禁用过时的题型(如"不定项选择题"),保留历史数据但阻止新试题使用该题型</li>
                  <li><strong>删除保护</strong>: 尝试删除已被50道试题引用的题型时,系统提示无法删除,保护数据完整性</li>
                  <li><strong>排序调整</strong>: 调整题型显示顺序,确保常用题型排在前面,提升录题效率</li>
                </ul>
              </div>

              <div class="requirement-section">
                <h4>核心概念</h4>
                <ul>
                  <li><strong>内部题型名称</strong>: 系统内部唯一标识，如 single、multiple、judgment 等，用于技术层面的类型识别和数据存储</li>
                  <li><strong>外部显示名称</strong>: 面向用户的可读名称，如"单项选择题"、"多项选择题"等，同一内部题型可在不同科目下配置不同的外部名称</li>
                  <li><strong>科目级配置</strong>: 每个科目可独立配置自己的题型列表，实现个性化的题型管理策略</li>
                  <li><strong>三重唯一性</strong>: 在同一科目下，内部题型名称、外部显示名称和排序号均需保持唯一</li>
                </ul>
              </div>

            </section>

            <section class="functional-requirements">
              <h3>功能规格</h3>
              <table class="spec-table">
                <thead>
                  <tr>
                    <th width="20%">功能模块</th>
                    <th width="40%">功能描述</th>
                    <th width="40%">规则与约束</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>科目树形导航</td>
                    <td>显示项目-科目的树形结构，支持展开/收起操作，点击科目时切换右侧题型列表</td>
                    <td>• 展开状态持久化<br>• 默认选中第一个科目<br>• 树形层级不超过2级</td>
                  </tr>
                  <tr>
                    <td>题型列表展示</td>
                    <td>以表格形式展示选中科目的所有题型，包含内部名称、外部名称、描述、排序、状态等信息</td>
                    <td>• 按排序号升序排列<br>• 支持分页浏览（每页10条）<br>• 实时反映启用/禁用状态</td>
                  </tr>
                  <tr>
                    <td>新增题型</td>
                    <td>点击"新增题型"按钮打开弹窗，填写题型信息后提交，系统自动进行唯一性校验</td>
                    <td>• 内部名称限20字符，仅支持英文、数字、下划线<br>• 外部名称限50字符<br>• 描述信息限200字符<br>• 排序号自动递增，支持手动调整</td>
                  </tr>
                  <tr>
                    <td>编辑题型</td>
                    <td>点击题型行的"编辑"按钮，在弹窗中修改题型信息并保存</td>
                    <td>• 内部名称不可修改<br>• 外部名称、描述、排序号可修改<br>• 修改后的外部名称和排序号仍需满足唯一性</td>
                  </tr>
                  <tr>
                    <td>删除题型</td>
                    <td>点击题型行的"删除"按钮，弹出二次确认弹窗，确认后执行删除操作</td>
                    <td>• 删除前检查是否有试题引用该题型<br>• 若有引用则禁止删除并提示<br>• 删除操作不可撤销</td>
                  </tr>
                  <tr>
                    <td>内部名称唯一性校验</td>
                    <td>在新增题型时，校验内部名称在当前科目下是否已存在</td>
                    <td>• 大小写敏感<br>• 实时反馈校验结果<br>• 重复时阻止提交并提示</td>
                  </tr>
                  <tr>
                    <td>外部名称唯一性校验</td>
                    <td>在新增/编辑题型时，校验外部名称在当前科目下是否已存在</td>
                    <td>• 大小写不敏感<br>• 忽略前后空格<br>• 重复时阻止提交并提示</td>
                  </tr>
                  <tr>
                    <td>排序号唯一性校验</td>
                    <td>在新增/编辑题型时，校验排序号在当前科目下是否已被占用</td>
                    <td>• 必须为正整数<br>• 重复时阻止提交并提示<br>• 建议系统自动填充下一可用排序号</td>
                  </tr>
                  <tr>
                    <td>启用/禁用状态管理</td>
                    <td>点击题型行的"启用"/"禁用"按钮，切换题型的可用状态</td>
                    <td>• 禁用的题型在题库管理中不可选<br>• 状态切换立即生效<br>• 状态变更记录操作日志</td>
                  </tr>
                  <tr>
                    <td>分页浏览</td>
                    <td>当题型数量超过每页显示数量时，提供分页导航功能</td>
                    <td>• 每页固定显示10条<br>• 显示总条数和当前页码<br>• 支持跳转到首页/尾页/上一页/下一页</td>
                  </tr>
                </tbody>
              </table>

              <h4>字段约束</h4>
              <table class="constraint-table">
                <thead>
                  <tr>
                    <th width="20%">字段名称</th>
                    <th width="15%">类型</th>
                    <th width="15%">必填</th>
                    <th width="50%">约束规则</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>内部题型名称</td>
                    <td>文本</td>
                    <td>是</td>
                    <td>• 长度1-20字符<br>• 仅支持英文字母、数字、下划线<br>• 科目级唯一（大小写敏感）<br>• 新增后不可修改</td>
                  </tr>
                  <tr>
                    <td>外部显示名称</td>
                    <td>文本</td>
                    <td>是</td>
                    <td>• 长度1-50字符<br>• 科目级唯一（大小写不敏感）<br>• 去除前后空格后校验<br>• 支持中文、英文、数字、常见符号</td>
                  </tr>
                  <tr>
                    <td>描述信息</td>
                    <td>文本</td>
                    <td>否</td>
                    <td>• 长度0-200字符<br>• 用于说明题型的用途或特点<br>• 支持多行文本</td>
                  </tr>
                  <tr>
                    <td>排序号</td>
                    <td>整数</td>
                    <td>是</td>
                    <td>• 必须为正整数<br>• 科目级唯一<br>• 用于控制题型在列表中的显示顺序</td>
                  </tr>
                  <tr>
                    <td>状态</td>
                    <td>枚举</td>
                    <td>是</td>
                    <td>• 取值范围: active（启用）、disabled（禁用）<br>• 默认为active<br>• 禁用后在题库管理中不可选</td>
                  </tr>
                </tbody>
              </table>

              <h4>验收标准</h4>
              <div class="acceptance-criteria">
                <table>
                  <thead>
                    <tr>
                      <th width="15%">测试场景</th>
                      <th width="85%">验收条件</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>AC-01</td>
                      <td>
                        <strong>Given</strong> 用户已进入题型管理页面<br>
                        <strong>When</strong> 用户点击左侧科目树中的某个科目<br>
                        <strong>Then</strong> 右侧应展示该科目配置的所有题型，按排序号升序排列，并显示内部名称、外部名称、描述、排序、状态等信息
                      </td>
                    </tr>
                    <tr>
                      <td>AC-02</td>
                      <td>
                        <strong>Given</strong> 用户已选中科目A<br>
                        <strong>When</strong> 用户点击"新增题型"按钮，填写内部名称"single"、外部名称"单项选择题"、描述"每题只有一个正确答案"、排序号1，然后提交<br>
                        <strong>Then</strong> 系统应成功保存题型，并在题型列表中显示新增的题型，同时弹出成功提示
                      </td>
                    </tr>
                    <tr>
                      <td>AC-03</td>
                      <td>
                        <strong>Given</strong> 科目A下已存在内部名称为"single"的题型<br>
                        <strong>When</strong> 用户再次尝试新增内部名称为"single"的题型<br>
                        <strong>Then</strong> 系统应阻止提交，并提示"该科目下已存在相同的内部题型名称"
                      </td>
                    </tr>
                    <tr>
                      <td>AC-04</td>
                      <td>
                        <strong>Given</strong> 科目A下存在题型T1，且该题型已被10道试题引用<br>
                        <strong>When</strong> 用户尝试删除题型T1<br>
                        <strong>Then</strong> 系统应阻止删除，并提示"该题型已被10道试题引用，无法删除"
                      </td>
                    </tr>
                    <tr>
                      <td>AC-05</td>
                      <td>
                        <strong>Given</strong> 科目A下存在题型T1，状态为"启用"<br>
                        <strong>When</strong> 用户点击"禁用"按钮<br>
                        <strong>Then</strong> 题型T1的状态应变更为"禁用"，列表中的状态标签同步更新，且在题库管理中无法选择该题型
                      </td>
                    </tr>
                    <tr>
                      <td>AC-06</td>
                      <td>
                        <strong>Given</strong> 科目A下已存在外部名称为"单项选择题"的题型<br>
                        <strong>When</strong> 用户尝试新增外部名称为"单项选择题"(忽略大小写和空格)的题型<br>
                        <strong>Then</strong> 系统应阻止提交，并提示"该科目下已存在相同的外部显示名称"
                      </td>
                    </tr>
                    <tr>
                      <td>AC-07</td>
                      <td>
                        <strong>Given</strong> 科目A下已存在排序号为1的题型<br>
                        <strong>When</strong> 用户尝试新增排序号为1的题型<br>
                        <strong>Then</strong> 系统应阻止提交，并提示"该排序号已被占用，请使用其他排序号"
                      </td>
                    </tr>
                    <tr>
                      <td>AC-08</td>
                      <td>
                        <strong>Given</strong> 科目A下存在题型T1<br>
                        <strong>When</strong> 用户点击"编辑"按钮，修改外部名称和描述，然后提交<br>
                        <strong>Then</strong> 系统应成功更新题型信息，Toast提示"题型编辑成功"，内部名称保持不变
                      </td>
                    </tr>
                    <tr>
                      <td>AC-09</td>
                      <td>
                        <strong>Given</strong> 科目A下存在题型T1，状态为"禁用"<br>
                        <strong>When</strong> 用户点击"启用"按钮<br>
                        <strong>Then</strong> 题型T1的状态应变更为"启用"，列表中的状态标签同步更新，该题型在题库管理中可选
                      </td>
                    </tr>
                    <tr>
                      <td>AC-10</td>
                      <td>
                        <strong>Given</strong> 科目A下存在12个题型，当前每页显示10条<br>
                        <strong>When</strong> 用户点击第2页<br>
                        <strong>Then</strong> 应显示第11-12条题型，分页信息更新为"第 2 / 2 页"
                      </td>
                    </tr>
                    <tr>
                      <td>AC-11</td>
                      <td>
                        <strong>Given</strong> 科目A和科目B分别配置了不同的题型<br>
                        <strong>When</strong> 用户在左侧树中切换科目<br>
                        <strong>Then</strong> 右侧题型列表应实时切换，显示对应科目的题型，各科目的题型配置互不影响
                      </td>
                    </tr>
                    <tr>
                      <td>AC-12</td>
                      <td>
                        <strong>Given</strong> 科目A下没有任何题型<br>
                        <strong>When</strong> 左侧树选中该科目<br>
                        <strong>Then</strong> 右侧表格显示空状态，提示"暂无题型配置"，引导用户点击【新增题型】按钮
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </template>

      <!-- 样式指南标签页 -->
      <template #style-guide>
        <div class="tab-panel">
          <div class="style-guide-header">
            <h2>查看完整设计规范</h2>
            <p>完整的设计系统、组件库和交互规范已统一整合到设计规范页面，请访问以获取详细信息。</p>
          </div>
        </div>
      </template>
    </TabNavigation>

    <!-- 弹窗组件 -->
    <AddTypeModal
      v-if="activeSubject"
      :visible="addTypeModalVisible"
      :subject-id="activeSubject.id"
      :subject-name="activeSubject.name"
      :project-id="activeSubject.projectId"
      :project-name="activeSubject.projectName"
      :default-order="getNextTypeOrder()"
      @update:visible="addTypeModalVisible = $event"
      @submit="handleAddType"
    />

    <EditTypeModal
      :visible="editTypeModalVisible"
      :type="editingType"
      @update:visible="editTypeModalVisible = $event"
      @submit="handleEditType"
    />

    <DeleteConfirmModal
      :visible="deleteModalVisible"
      :title="deleteModalTitle"
      :message="deleteModalMessage"
      :error-message="deleteModalError"
      @update:visible="deleteModalVisible = $event"
      @confirm="handleDeleteConfirm"
    />

    <!-- Toast提示 -->
    <Toast
      :visible="toastVisible"
      :message="toastMessage"
      :type="toastType"
      @close="toastVisible = false"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuestionTypeStore } from '@/stores/questionType'
import { useToast } from '@/composables/useToast'
import AppLayout from '@/components/Layout/AppLayout.vue'
import TabNavigation from '@/components/Tab/TabNavigation.vue'
import Toast from '@/components/Feedback/Toast.vue'
import SubjectTree from './components/SubjectTree.vue'
import TypeTable from './components/TypeTable.vue'
import AddTypeModal from './components/AddTypeModal.vue'
import EditTypeModal from './components/EditTypeModal.vue'
import DeleteConfirmModal from '@/views/chapter-management/components/DeleteConfirmModal.vue'
import type {
  QuestionType,
  QuestionTypeFormData,
  SubjectTreeNode
} from './types'

const questionTypeStore = useQuestionTypeStore()
const { toastVisible, toastMessage, toastType, showToast } = useToast()

// 标签页配置
const tabs = [
  { key: 'prototype', label: '原型展示', icon: '🎨' },
  { key: 'requirements', label: '需求文档', icon: '📋' },
  { key: 'style-guide', label: '样式指南', icon: '🎯' }
]

// 当前选中的科目
const activeSubject = ref<SubjectTreeNode | null>(null)

// 弹窗控制
const addTypeModalVisible = ref(false)
const editTypeModalVisible = ref(false)
const deleteModalVisible = ref(false)

// 编辑状态
const editingType = ref<QuestionType | null>(null)

// 删除确认状态
const deleteModalTitle = ref('')
const deleteModalMessage = ref('')
const deleteModalError = ref('')
const deletingType = ref<QuestionType | null>(null)

/**
 * 当前科目的题型列表
 */
const currentTypes = computed(() => {
  if (!activeSubject.value) return []
  return questionTypeStore.getQuestionTypesBySubject(activeSubject.value.id).value
})

/**
 * 初始化：选中第一个科目
 */
onMounted(() => {
  const firstProject = questionTypeStore.projectTree[0]
  if (firstProject && firstProject.subjects.length > 0) {
    activeSubject.value = firstProject.subjects[0]
  }
})

/**
 * 科目切换事件
 */
const handleSubjectChange = (subject: SubjectTreeNode) => {
  activeSubject.value = subject
}

/**
 * 获取下一个题型排序号
 */
const getNextTypeOrder = (): number => {
  if (!activeSubject.value) return 1
  const types = questionTypeStore.getQuestionTypesBySubject(activeSubject.value.id).value
  return types.length > 0 ? Math.max(...types.map((t) => t.order)) + 1 : 1
}

/**
 * 打开添加题型弹窗
 */
const openAddTypeModal = () => {
  addTypeModalVisible.value = true
}

/**
 * 处理添加题型
 */
const handleAddType = (data: QuestionTypeFormData) => {
  try {
    questionTypeStore.addQuestionType(data)
    showToast('题型添加成功', { type: 'success' })
  } catch (error) {
    showToast((error as Error).message, { type: 'error' })
  }
}

/**
 * 打开编辑题型弹窗
 */
const openEditTypeModal = (type: QuestionType) => {
  editingType.value = type
  editTypeModalVisible.value = true
}

/**
 * 处理编辑题型
 */
const handleEditType = (typeId: string, updates: Partial<QuestionTypeFormData>) => {
  try {
    questionTypeStore.updateQuestionType(typeId, updates)
    showToast('题型编辑成功', { type: 'success' })
  } catch (error) {
    showToast((error as Error).message, { type: 'error' })
  }
}

/**
 * 打开删除题型确认弹窗
 */
const openDeleteTypeModal = (type: QuestionType) => {
  deletingType.value = type
  deleteModalTitle.value = '确认删除题型'
  deleteModalMessage.value = `确定要删除题型"${type.displayName}"吗？删除后无法恢复。`
  deleteModalError.value = ''
  deleteModalVisible.value = true
}

/**
 * 处理删除确认
 */
const handleDeleteConfirm = () => {
  if (!deletingType.value) return

  try {
    questionTypeStore.deleteQuestionType(deletingType.value.id)
    showToast('题型删除成功', { type: 'success' })
    deleteModalVisible.value = false
  } catch (error) {
    deleteModalError.value = (error as Error).message
  }
}

/**
 * 切换题型状态
 */
const handleToggleStatus = (type: QuestionType) => {
  try {
    questionTypeStore.toggleQuestionTypeStatus(type.id)
    const newStatus = type.status === 'active' ? '禁用' : '启用'
    showToast(`题型已${newStatus}`, { type: 'success' })
  } catch (error) {
    showToast((error as Error).message, { type: 'error' })
  }
}
</script>

<style scoped>
.tab-panel {
  padding: 32px;
  animation: fade-in 0.3s ease;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.prototype-wrapper {
  display: flex;
  gap: 24px;
}

.requirements-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--panel-border);
}

.requirements-header h2 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-text);
}

.requirements-header p {
  margin: 0;
  color: var(--secondary-text);
  line-height: 1.6;
}

.requirements-content {
  display: grid;
  gap: 32px;
}

.business-requirements,
.functional-requirements {
  background: linear-gradient(180deg, #fafcfe 0%, #ffffff 100%);
  border: 1px solid #e4eaf2;
  border-radius: 12px;
  padding: 24px;
}

.business-requirements h3,
.functional-requirements h3 {
  margin: 0 0 20px;
  font-size: 18px;
  font-weight: 600;
  color: var(--accent);
}

.requirement-section {
  margin-bottom: 20px;
}

.requirement-section h4 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-text);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.requirement-section ul {
  margin: 0;
  padding-left: 20px;
  color: var(--primary-text);
  line-height: 1.6;
}

.requirement-section ul li strong {
  color: var(--accent);
}

.section-description {
  margin: 0;
  color: var(--primary-text);
  line-height: 1.6;
}

.functional-requirements h4 {
  margin: 32px 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-text);
}

.spec-table,
.constraint-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.spec-table thead,
.constraint-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.spec-table th,
.constraint-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.spec-table td,
.constraint-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e4eaf2;
  color: var(--primary-text);
  font-size: 14px;
  line-height: 1.6;
  vertical-align: top;
}

.spec-table tbody tr:last-child td,
.constraint-table tbody tr:last-child td {
  border-bottom: none;
}

.spec-table tbody tr:hover,
.constraint-table tbody tr:hover {
  background: #f8fafc;
}

.acceptance-criteria {
  margin-top: 16px;
}

.acceptance-criteria table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.acceptance-criteria thead {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.acceptance-criteria th {
  padding: 12px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.acceptance-criteria td {
  padding: 16px;
  border-bottom: 1px solid #e4eaf2;
  color: var(--primary-text);
  font-size: 14px;
  line-height: 1.8;
  vertical-align: top;
}

.acceptance-criteria tbody tr:last-child td {
  border-bottom: none;
}

.acceptance-criteria tbody tr:hover {
  background: #f8fafc;
}

.acceptance-criteria strong {
  color: var(--accent);
  font-weight: 600;
}

.style-guide-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--panel-border);
}

.style-guide-header h2 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-text);
}

.style-guide-header p {
  margin: 0;
  color: var(--secondary-text);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .prototype-wrapper {
    flex-direction: column;
  }
}
</style>
