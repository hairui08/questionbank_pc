<template>
  <AppLayout title="题库系统章节管理">
    <TabNavigation :tabs="tabs" :default-tab="'prototype'">
      <!-- 原型展示标签页 -->
      <template #prototype>
        <div class="tab-panel">
          <div class="prototype-wrapper">
            <SubjectTree :active-subject-id="activeSubject?.id" @subject-change="handleSubjectChange" />

            <ChapterTable
              v-if="activeSubject"
              :subject-id="activeSubject.id"
              :subject-name="activeSubject.name"
              :project-name="getProjectName(activeSubject.projectId)"
              @add-chapter="openAddChapterModal"
              @edit-chapter="openEditChapterModal"
              @delete-chapter="openDeleteChapterModal"
              @toggle-chapter-status="handleToggleChapterStatus"
              @add-section="openAddSectionModal"
              @edit-section="openEditSectionModal"
              @delete-section="openDeleteSectionModal"
              @toggle-section-status="handleToggleSectionStatus"
            />
          </div>
        </div>
      </template>

      <!-- 需求文档标签页 -->
      <template #requirements>
        <div class="tab-panel">
          <div class="requirements-header">
            <h2>章节管理需求文档</h2>
            <p>详细的功能需求、业务规则和验收标准，确保章节管理模块实现标准化。</p>
          </div>

          <div class="requirements-content">
            <section class="business-requirements">
              <h3>业务需求</h3>
              <div class="requirement-section">
                <h4>核心目标</h4>
                <ul>
                  <li>提供高效的章节、小节管理功能</li>
                  <li>支持多层级的项目-科目-章-节管理结构</li>
                  <li>确保数据的一致性和操作的可追溯性</li>
                  <li>提供直观的树形导航和列表视图</li>
                </ul>
              </div>


              <div class="requirement-section">
                <h4>用户场景</h4>
                <ul>
                  <li><strong>创建章节</strong>: 内容管理员为"财务战略管理"科目创建章节结构(如"第一章 总论"、"第二章 预算管理"),设置排序</li>
                  <li><strong>添加小节</strong>: 在章节下添加多个小节(如"第一节 预算的基本概念"、"第二节 预算编制方法"),完善知识体系</li>
                  <li><strong>删除保护</strong>: 尝试删除有小节的章节时,系统提示先删除小节,保护数据完整性</li>
                  <li><strong>状态管理</strong>: 禁用过期章节,保留历史数据但标记为不可用,小节可独立管理状态</li>
                  <li><strong>章节复用</strong>: 参考历史科目的章节结构,快速创建新科目的章节体系</li>
                </ul>
              </div>


              <div class="requirement-section">
                <h4>业务规则</h4>
                <ul>
                  <li><strong>章节名称唯一性</strong>: 同一科目下章节名称不能重复,不同科目可重复</li>
                  <li><strong>小节名称唯一性</strong>: 同一章节下小节名称不能重复,不同章节可重复</li>
                  <li><strong>删除保护</strong>: 章节下有小节时不可删除,必须先删除所有小节</li>
                  <li><strong>状态独立性</strong>: 章节和小节的状态独立管理,禁用章节不影响小节的独立编辑</li>
                  <li><strong>排序规则</strong>: 排序字段必须为正整数(1-999),默认自动递增,用户可手动调整</li>
                  <li><strong>展开交互</strong>: 点击章节行展开/收起小节列表,支持多个章节同时展开</li>
                  <li><strong>筛选规则</strong>: 状态筛选默认"启用",实时更新列表,不影响小节的独立显示</li>
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
                    <td>树形导航</td>
                    <td>左侧树形菜单分层展示项目和科目</td>
                    <td>点击项目展开科目，点击科目加载章节列表，当前选中科目高亮</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>章节列表</td>
                    <td>表格展示章节信息</td>
                    <td>包含选择、章节名称、状态、排序、操作列，点击章节行展开/收起小节</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>添加章节</td>
                    <td>右上角【添加章】按钮触发弹窗</td>
                    <td>字段：所属科目（只读）、章节名称*、状态、排序*；校验：名称必填、同科目下不重复、排序正整数</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>添加小节</td>
                    <td>章节行【添加小节】按钮触发弹窗</td>
                    <td>字段：所属章节（只读）、小节名称*、状态、排序*；校验：名称必填、同章节下不重复、排序正整数</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>删除保护</td>
                    <td>删除章节前检查是否有小节</td>
                    <td>若存在小节，提示"该章节下存在N个小节，请先删除小节"，拒绝删除；无小节时二次确认后删除</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>状态管理</td>
                    <td>章节和小节均支持启用/禁用</td>
                    <td>禁用的章节不影响小节的独立编辑，状态变更立即生效</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>编辑功能</td>
                    <td>章节/小节行【编辑】按钮打开弹窗</td>
                    <td>预填现有数据，允许修改名称、状态、排序，执行重复校验和排序校验</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>空状态处理</td>
                    <td>无数据时显示提示信息</td>
                    <td>科目下无章节显示"暂无章节数据，点击右上角【添加章】创建"；章节下无小节显示"该章节暂无小节"</td>
                    <td>P1</td>
                  </tr>
                  <tr>
                    <td>状态筛选</td>
                    <td>筛选启用/禁用章节</td>
                    <td>默认"启用"，实时更新列表</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>批量操作</td>
                    <td>复选框预留批量操作入口</td>
                    <td>后续扩展批量启用、禁用、调整排序功能</td>
                    <td>P2</td>
                  </tr>
                </tbody>
              </table>

              <h4 style="margin-top: 32px; font-size: 16px; font-weight: 600; color: var(--accent);">字段约束规则</h4>
              <table class="spec-table constraint-table">
                <thead>
                  <tr>
                    <th width="12%">字段名称</th>
                    <th width="12%">数据类型</th>
                    <th width="15%">长度/范围</th>
                    <th width="8%">必填</th>
                    <th width="13%">唯一性约束</th>
                    <th width="12%">默认值</th>
                    <th width="28%">备注</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>章节名称</td>
                    <td>String</td>
                    <td>1-50字符</td>
                    <td>✓</td>
                    <td>科目内唯一</td>
                    <td>无</td>
                    <td>支持中文、英文、数字</td>
                  </tr>
                  <tr>
                    <td>章节状态</td>
                    <td>Enum</td>
                    <td>启用/禁用</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>启用</td>
                    <td>不影响小节独立编辑</td>
                  </tr>
                  <tr>
                    <td>章节排序</td>
                    <td>Integer</td>
                    <td>1-999</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>自动递增</td>
                    <td>正整数</td>
                  </tr>
                  <tr>
                    <td>小节名称</td>
                    <td>String</td>
                    <td>1-50字符</td>
                    <td>✓</td>
                    <td>章节内唯一</td>
                    <td>无</td>
                    <td>支持中文、英文、数字</td>
                  </tr>
                  <tr>
                    <td>小节状态</td>
                    <td>Enum</td>
                    <td>启用/禁用</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>启用</td>
                    <td>可独立管理</td>
                  </tr>
                  <tr>
                    <td>小节排序</td>
                    <td>Integer</td>
                    <td>1-999</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>自动递增</td>
                    <td>正整数</td>
                  </tr>
                </tbody>
              </table>

              <div class="acceptance-criteria">
                <h4>验收标准</h4>
                <table class="spec-table">
                  <thead>
                    <tr>
                      <th width="8%">场景</th>
                      <th width="30%">Given (前置条件)</th>
                      <th width="25%">When (操作)</th>
                      <th width="37%">Then (预期结果)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>AC-01</td>
                      <td>用户在章节管理页面，左侧树选中"财务战略管理"科目</td>
                      <td>右侧显示该科目的章节列表</td>
                      <td>应展示所有章节，包括章节名称、状态、排序，支持点击展开小节</td>
                    </tr>
                    <tr>
                      <td>AC-02</td>
                      <td>用户点击"第二章 预算管理"章节行</td>
                      <td>章节行展开</td>
                      <td>应显示该章下的所有小节列表，以内嵌面板形式呈现</td>
                    </tr>
                    <tr>
                      <td>AC-03</td>
                      <td>用户点击【添加章】按钮</td>
                      <td>输入"第四章 风险管理"，排序4，提交</td>
                      <td>系统验证通过，章节列表新增该章，Toast提示成功</td>
                    </tr>
                    <tr>
                      <td>AC-04</td>
                      <td>"第二章 预算管理"下有3个小节</td>
                      <td>用户尝试删除该章</td>
                      <td>系统提示"该章节下存在3个小节，请先删除小节"，拒绝删除</td>
                    </tr>
                    <tr>
                      <td>AC-05</td>
                      <td>用户在"第二章"展开状态下点击【添加小节】</td>
                      <td>输入"第四节 预算考核"，排序4，提交</td>
                      <td>小节列表新增该节，自动按排序显示，章节保持展开状态</td>
                    </tr>
                    <tr>
                      <td>AC-06</td>
                      <td>用户打开章节管理页面</td>
                      <td>页面加载完成</td>
                      <td>筛选下拉框默认选中"启用"，仅显示启用状态的章节</td>
                    </tr>
                    <tr>
                      <td>AC-07</td>
                      <td>用户在筛选下拉框中选择"禁用"</td>
                      <td>筛选项变更</td>
                      <td>章节列表应立即更新，仅显示禁用状态的章节及其小节行</td>
                    </tr>
                    <tr>
                      <td>AC-08</td>
                      <td>科目下已存在章节"第一章 总论"</td>
                      <td>用户尝试编辑另一章节名称为"第一章 总论"</td>
                      <td>系统提示"该科目下已存在相同的章节名称",拒绝保存</td>
                    </tr>
                    <tr>
                      <td>AC-09</td>
                      <td>章节"第二章 预算管理"下已存在小节"第一节 预算基本概念"</td>
                      <td>用户尝试编辑另一小节名称为"第一节 预算基本概念"</td>
                      <td>系统提示"该章节下已存在相同的小节名称",拒绝保存</td>
                    </tr>
                    <tr>
                      <td>AC-10</td>
                      <td>用户编辑章节"第二章 预算管理"</td>
                      <td>修改排序从2调整为1后保存</td>
                      <td>章节排序更新成功,列表按新排序显示,Toast提示"章节编辑成功"</td>
                    </tr>
                    <tr>
                      <td>AC-11</td>
                      <td>用户编辑小节"第一节 预算基本概念"</td>
                      <td>修改排序从1调整为3后保存</td>
                      <td>小节排序更新成功,章节下小节按新排序显示,Toast提示"小节编辑成功"</td>
                    </tr>
                    <tr>
                      <td>AC-12</td>
                      <td>章节"第二章 预算管理"状态为启用</td>
                      <td>用户点击章节行【启用/禁用】按钮</td>
                      <td>章节状态切换为"禁用",Toast提示"章节已禁用",小节仍可正常编辑</td>
                    </tr>
                    <tr>
                      <td>AC-13</td>
                      <td>小节"第一节 预算基本概念"状态为启用</td>
                      <td>用户点击小节行【启用/禁用】按钮</td>
                      <td>小节状态切换为"禁用",Toast提示"小节已禁用"</td>
                    </tr>
                    <tr>
                      <td>AC-14</td>
                      <td>章节"第三章 财务分析"下没有小节</td>
                      <td>用户点击章节行【删除】按钮,确认删除</td>
                      <td>章节删除成功,列表中移除该章节,Toast提示"章节删除成功"</td>
                    </tr>
                    <tr>
                      <td>AC-15</td>
                      <td>小节"第二节 预算编制方法"</td>
                      <td>用户点击小节行【删除】按钮,确认删除</td>
                      <td>小节删除成功,章节下移除该小节,Toast提示"小节删除成功"</td>
                    </tr>
                    <tr>
                      <td>AC-16</td>
                      <td>科目下没有任何章节</td>
                      <td>右侧章节列表加载</td>
                      <td>显示空状态提示"暂无章节数据，点击右上角【添加章】创建"</td>
                    </tr>
                    <tr>
                      <td>AC-17</td>
                      <td>章节"第二章 预算管理"下没有小节</td>
                      <td>展开该章节</td>
                      <td>小节面板显示"该章节暂无小节",提示用户点击【添加小节】创建</td>
                    </tr>
                    <tr>
                      <td>AC-18</td>
                      <td>用户在左侧树中选中科目"财务战略管理"</td>
                      <td>左侧树节点高亮</td>
                      <td>当前选中科目高亮显示,右侧加载该科目的章节列表</td>
                    </tr>
                    <tr>
                      <td>AC-19</td>
                      <td>用户添加章节时设置排序为0</td>
                      <td>点击保存</td>
                      <td>系统提示"排序必须为正整数(1-999)",拒绝保存</td>
                    </tr>
                    <tr>
                      <td>AC-20</td>
                      <td>用户在筛选下拉框中选择"全部"</td>
                      <td>筛选项变更</td>
                      <td>章节列表应立即更新,显示所有状态的章节(启用和禁用)</td>
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
    <AddChapterModal
      :visible="addChapterModalVisible"
      :project-id="activeSubject?.projectId || ''"
      :project-name="getProjectName(activeSubject?.projectId || '')"
      :subject-id="activeSubject?.id || ''"
      :subject-name="activeSubject?.name || ''"
      :default-order="getNextChapterOrder()"
      @update:visible="addChapterModalVisible = $event"
      @submit="handleAddChapter"
    />

    <EditChapterModal
      :visible="editChapterModalVisible"
      :chapter="editingChapter"
      @update:visible="editChapterModalVisible = $event"
      @submit="handleEditChapter"
    />

    <AddSectionModal
      :visible="addSectionModalVisible"
      :chapter-id="addingSectionChapter?.id || ''"
      :chapter-name="addingSectionChapter?.name || ''"
      :default-order="getNextSectionOrder(addingSectionChapter?.id || '')"
      @update:visible="addSectionModalVisible = $event"
      @submit="handleAddSection"
    />

    <EditSectionModal
      :visible="editSectionModalVisible"
      :section="editingSection"
      @update:visible="editSectionModalVisible = $event"
      @submit="handleEditSection"
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
import { useChapterStore } from '@/stores/chapter'
import { useToast } from '@/composables/useToast'
import AppLayout from '@/components/Layout/AppLayout.vue'
import TabNavigation from '@/components/Tab/TabNavigation.vue'
import Toast from '@/components/Feedback/Toast.vue'
import SubjectTree from './components/SubjectTree.vue'
import ChapterTable from './components/ChapterTable.vue'
import AddChapterModal from './components/AddChapterModal.vue'
import EditChapterModal from './components/EditChapterModal.vue'
import AddSectionModal from './components/AddSectionModal.vue'
import EditSectionModal from './components/EditSectionModal.vue'
import DeleteConfirmModal from './components/DeleteConfirmModal.vue'
import type {
  Chapter,
  Section,
  ChapterFormData,
  SectionFormData,
  SubjectTreeNode
} from './types'

const chapterStore = useChapterStore()
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
const addChapterModalVisible = ref(false)
const editChapterModalVisible = ref(false)
const addSectionModalVisible = ref(false)
const editSectionModalVisible = ref(false)
const deleteModalVisible = ref(false)

// 编辑状态
const editingChapter = ref<Chapter | null>(null)
const editingSection = ref<Section | null>(null)
const addingSectionChapter = ref<Chapter | null>(null)

// 删除确认状态
const deleteModalTitle = ref('')
const deleteModalMessage = ref('')
const deleteModalError = ref('')
const deletingType = ref<'chapter' | 'section'>('chapter')
const deletingTarget = ref<Chapter | Section | null>(null)

/**
 * 初始化：选中第一个科目
 */
onMounted(() => {
  const firstProject = chapterStore.projectTree[0]
  if (firstProject && firstProject.subjects.length > 0) {
    handleSubjectChange(firstProject.subjects[0])
  }
})

/**
 * 获取项目名称
 */
const getProjectName = (projectId: string): string => {
  const project = chapterStore.projectTree.find((p) => p.id === projectId)
  return project?.name || ''
}

/**
 * 科目切换事件
 */
const handleSubjectChange = (subject: SubjectTreeNode) => {
  activeSubject.value = subject
}

/**
 * 获取下一个章节排序号
 */
const getNextChapterOrder = (): number => {
  if (!activeSubject.value) return 1
  const chapters = chapterStore.getChaptersBySubject(activeSubject.value.id).value
  return chapters.length > 0 ? Math.max(...chapters.map((c) => c.order)) + 1 : 1
}

/**
 * 获取下一个小节排序号
 */
const getNextSectionOrder = (chapterId: string): number => {
  const sections = chapterStore.getSectionsByChapter(chapterId).value
  return sections.length > 0 ? Math.max(...sections.map((s) => s.order)) + 1 : 1
}

/**
 * 打开添加章节弹窗
 */
const openAddChapterModal = () => {
  addChapterModalVisible.value = true
}

/**
 * 处理添加章节
 */
const handleAddChapter = (data: ChapterFormData) => {
  try {
    chapterStore.addChapter(data)
    showToast('章节添加成功', { type: 'success' })
  } catch (error) {
    showToast((error as Error).message, { type: 'error' })
  }
}

/**
 * 打开编辑章节弹窗
 */
const openEditChapterModal = (chapter: Chapter) => {
  editingChapter.value = chapter
  editChapterModalVisible.value = true
}

/**
 * 处理编辑章节
 */
const handleEditChapter = (chapterId: string, updates: Partial<ChapterFormData>) => {
  try {
    chapterStore.updateChapter(chapterId, updates)
    showToast('章节编辑成功', { type: 'success' })
  } catch (error) {
    showToast((error as Error).message, { type: 'error' })
  }
}

/**
 * 打开删除章节确认弹窗
 */
const openDeleteChapterModal = (chapter: Chapter) => {
  deletingType.value = 'chapter'
  deletingTarget.value = chapter
  deleteModalTitle.value = '确认删除章节'
  deleteModalMessage.value = `确定要删除章节"${chapter.name}"吗？`
  deleteModalError.value = ''
  deleteModalVisible.value = true
}

/**
 * 切换章节状态
 */
const handleToggleChapterStatus = (chapter: Chapter) => {
  try {
    chapterStore.toggleChapterStatus(chapter.id)
    const newStatus = chapter.status === 'active' ? '禁用' : '启用'
    showToast(`章节已${newStatus}`, { type: 'success' })
  } catch (error) {
    showToast((error as Error).message, { type: 'error' })
  }
}

/**
 * 打开添加小节弹窗
 */
const openAddSectionModal = (chapter: Chapter) => {
  addingSectionChapter.value = chapter
  addSectionModalVisible.value = true
}

/**
 * 处理添加小节
 */
const handleAddSection = (data: SectionFormData) => {
  try {
    chapterStore.addSection(data)
    showToast('小节添加成功', { type: 'success' })
  } catch (error) {
    showToast((error as Error).message, { type: 'error' })
  }
}

/**
 * 打开编辑小节弹窗
 */
const openEditSectionModal = (section: Section) => {
  editingSection.value = section
  editSectionModalVisible.value = true
}

/**
 * 处理编辑小节
 */
const handleEditSection = (sectionId: string, updates: Partial<SectionFormData>) => {
  try {
    chapterStore.updateSection(sectionId, updates)
    showToast('小节编辑成功', { type: 'success' })
  } catch (error) {
    showToast((error as Error).message, { type: 'error' })
  }
}

/**
 * 打开删除小节确认弹窗
 */
const openDeleteSectionModal = (section: Section) => {
  deletingType.value = 'section'
  deletingTarget.value = section
  deleteModalTitle.value = '确认删除小节'
  deleteModalMessage.value = `确定要删除小节"${section.name}"吗？`
  deleteModalError.value = ''
  deleteModalVisible.value = true
}

/**
 * 切换小节状态
 */
const handleToggleSectionStatus = (section: Section) => {
  try {
    chapterStore.toggleSectionStatus(section.id)
    const newStatus = section.status === 'active' ? '禁用' : '启用'
    showToast(`小节已${newStatus}`, { type: 'success' })
  } catch (error) {
    showToast((error as Error).message, { type: 'error' })
  }
}

/**
 * 处理删除确认
 */
const handleDeleteConfirm = () => {
  if (!deletingTarget.value) return

  try {
    if (deletingType.value === 'chapter') {
      chapterStore.deleteChapter(deletingTarget.value.id)
      showToast('章节删除成功', { type: 'success' })
      deleteModalVisible.value = false
    } else {
      chapterStore.deleteSection(deletingTarget.value.id)
      showToast('小节删除成功', { type: 'success' })
      deleteModalVisible.value = false
    }
  } catch (error) {
    // 如果删除失败（比如章节下有小节），显示错误信息但保持弹窗打开
    deleteModalError.value = (error as Error).message
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

.section-description {
  margin: 0;
  color: var(--primary-text);
  line-height: 1.6;
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

.acceptance-criteria h4 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: var(--accent);
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
