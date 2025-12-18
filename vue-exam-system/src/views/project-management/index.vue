<template>
  <AppLayout title="题库系统项目管理">
    <TabNavigation :tabs="tabs" :default-tab="'prototype'">
      <!-- 原型展示标签页 -->
      <template #prototype>
        <div class="tab-panel">
          <section class="table-shell">
            <div class="table-header">
              <div class="filter-group">
                <label for="status-filter">启用状态：</label>
                <select id="status-filter" v-model="statusFilter">
                  <option value="all">全部</option>
                  <option value="active">启用</option>
                  <option value="disabled">禁用</option>
                </select>
              </div>
              <div class="action-group">
                <button class="btn primary" @click="openAddProjectModal">
                  + 新增项目
                </button>
                <button class="btn secondary" @click="toggleAllProjects">
                  {{ allExpanded ? '全部收起' : '全部展开' }}
                </button>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>序号</th>
                  <th>项目名称</th>
                  <th>状态</th>
                  <th>排序</th>
                  <th>添加时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(project, index) in filteredProjects" :key="project.id">
                  <tr
                    class="project-row"
                    :class="{
                      'is-expanded': expandedProjects.has(project.id)
                    }"
                    @click="toggleProject(project.id)"
                  >
                    <td @click.stop>
                      {{ index + 1 }}
                    </td>
                    <td>
                      <div class="project-cell">
                        <a class="link" href="#">{{ project.name }}</a>
                      </div>
                    </td>
                    <td>
                      <span
                        class="status"
                        :class="project.status === 'active' ? 'is-active' : 'is-disabled'"
                      >
                        {{ project.status === 'active' ? '启用' : '禁用' }}
                      </span>
                    </td>
                    <td>{{ project.order }}</td>
                    <td>{{ project.createdAt }}</td>
                    <td @click.stop>
                      <div class="action-group">
                        <button
                          class="btn icon-btn"
                          :disabled="index === 0"
                          @click="moveProjectUp(index)"
                          title="上移"
                        >
                          ↑
                        </button>
                        <button
                          class="btn icon-btn"
                          :disabled="index === filteredProjects.length - 1"
                          @click="moveProjectDown(index)"
                          title="下移"
                        >
                          ↓
                        </button>
                        <button
                          class="btn primary"
                          :disabled="project.status === 'disabled'"
                          @click="openAddSubjectModal(project)"
                        >
                          添加科目
                        </button>
                        <button class="btn secondary" @click="openEditProjectModal(project)">编辑</button>
                        <button
                          class="btn secondary"
                          @click="handleToggleProjectStatus(project)"
                        >
                          {{ project.status === 'active' ? '禁用' : '启用' }}
                        </button>
                      </div>
                    </td>
                  </tr>

                  <!-- 科目列表行 -->
                  <tr
                    v-if="expandedProjects.has(project.id)"
                    class="subject-row is-visible"
                  >
                    <td colspan="6">
                      <div class="subject-inline-panel">
                        <header>
                          {{ project.name }}科目
                          <span>整行点击控制折叠 · 仅展开一个项目</span>
                        </header>
                        <div class="subject-list">
                          <div
                            v-for="subject in getProjectSubjects(project.id)"
                            :key="subject.id"
                            class="subject-item"
                            :class="{
                              'is-dragging': draggedSubjectId === subject.id,
                              'is-drag-over': dragOverSubjectId === subject.id
                            }"
                            draggable="true"
                            @dragstart="handleSubjectDragStart($event, subject.id)"
                            @dragover="handleSubjectDragOver($event, subject.id)"
                            @dragleave="handleSubjectDragLeave"
                            @drop="handleSubjectDrop($event, subject.id)"
                            @dragend="handleSubjectDragEnd"
                          >
                            <div class="meta">
                              <strong>{{ subject.name }}</strong>
                              <span>
                                {{ subject.status === 'active' ? '启用' : '禁用' }} ·
                                排序 {{ subject.order }}
                              </span>
                            </div>
                            <div class="actions">
                              <button class="btn secondary" @click="openEditSubjectModal(subject)">编辑</button>
                              <button
                                class="btn secondary"
                                @click="handleToggleSubjectStatus(subject)"
                              >
                                {{ subject.status === 'active' ? '禁用' : '启用' }}
                              </button>
                            </div>
                          </div>
                          <div v-if="getProjectSubjects(project.id).length === 0" class="empty-state">
                            暂无科目
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </section>
        </div>
      </template>

      <!-- 需求文档标签页 -->
      <template #requirements>
        <div class="tab-panel">
          <div class="requirements-header">
            <h2>项目需求文档</h2>
            <p>详细的功能需求、业务规则和验收标准，确保项目管理模块实现标准化。</p>
          </div>

          <div class="requirements-content">
            <section class="business-requirements">
              <h3>业务需求</h3>
              <div class="requirement-section">
                <h4>核心目标</h4>
                <ul>
                  <li>提供高效的题库系统项目管理功能</li>
                  <li>支持多层级的项目-科目管理结构</li>
                  <li>确保数据的一致性和操作的可追溯性</li>
                  <li>提供直观的用户界面和流畅的交互体验</li>
                </ul>
              </div>

              <div class="requirement-section">
                <h4>用户场景</h4>
                <ul>
                  <li><strong>创建新项目</strong>: 系统管理员创建新的考试项目(如"注册会计师考试"),设置基本信息(名称、状态、排序)</li>
                  <li><strong>添加科目</strong>: 在项目下添加多个科目(如"会计"、"审计"、"财务成本管理"),为每个科目设置独立的状态和排序</li>
                  <li><strong>状态管理</strong>: 禁用过期项目,保留历史数据但阻止新增科目,启用当年项目开放所有操作</li>
                  <li><strong>批量维护</strong>: 勾选项目复选框后,使用批量操作工具条一次调整多个项目的状态或排序</li>
                  <li><strong>项目复用</strong>: 参考历史项目结构,创建新年度项目并快速添加相同科目</li>
                </ul>
              </div>

              <div class="requirement-section">
                <h4>核心数据流</h4>
                <ul>
                  <li><strong>创建项目流程</strong>: 点击【新增项目】→ 填写项目名称、状态、排序 → 校验唯一性 → 保存成功并添加到列表顶部</li>
                  <li><strong>添加科目流程</strong>: 点击项目行【添加科目】按钮 → 填写科目名称、状态、排序 → 校验唯一性(项目内) → 保存成功并自动展开该项目显示新科目</li>
                  <li><strong>状态管理流程</strong>: 禁用项目后【添加】按钮变灰,提示"项目已禁用,无法新增科目",但保留编辑和查看功能</li>
                  <li><strong>唯一性校验</strong>: 项目名称全局唯一,科目名称项目内唯一,保存时自动检查</li>
                  <li><strong>折叠交互</strong>: 点击项目行展开/收起科目列表,仅展开一个项目(单选模式),提供全部展开/收起快捷按钮</li>
                  <li><strong>批量操作流程</strong>: 勾选一个及以上项目→ 批量操作工具条激活 → 选择批量启用/禁用/排序 → 二次确认后批量更新状态或排序</li>
                  <li><strong>删除项目流程</strong>: 点击操作列【删除】→ 弹出二次确认弹窗 → 确认后级联删除项目及其所有科目,取消则保持不变</li>
                </ul>
              </div>

              <div class="requirement-section">
                <h4>业务规则</h4>
                <ul>
                  <li><strong>项目名称唯一性</strong>: 全局范围内项目名称不能重复</li>
                  <li><strong>科目名称唯一性</strong>: 同一项目下科目名称不能重复,不同项目可重复</li>
                  <li><strong>状态约束</strong>: 禁用项目不可新增科目,但可编辑现有科目和项目信息</li>
                  <li><strong>排序规则</strong>: 排序字段必须为正整数(>0),默认自动递增,用户可手动调整</li>
                  <li><strong>批量操作约束</strong>: 批量操作仅对选中项目生效,混合启用/禁用时按所选操作统一处理,执行前需弹出确认提示</li>
                  <li><strong>删除保护</strong>: 操作列提供【删除】按钮,点击后弹出二次确认;确认后级联删除该项目及其下所有科目</li>
                  <li><strong>折叠模式</strong>: 默认仅展开一个项目,点击其他项目时自动收起当前展开项</li>
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
                    <td>项目表格</td>
                    <td>动态添加项目名称的可滚动表格</td>
                    <td>包含序号、项目名称、状态、排序、添加时间、操作列</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>状态筛选</td>
                    <td>筛选启用/禁用项目</td>
                    <td>默认"全部"，实时更新列表</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>折叠交互</td>
                    <td>点击行展开/收起科目列表</td>
                    <td>默认仅展开一个项目，点击其他项目时自动收起当前项目；提供【全部展开/全部收起】按钮进行全局切换</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>批量操作</td>
                    <td>批量启用、禁用、调整排序</td>
                    <td>勾选项目复选框后激活顶部批量工具条;支持统一启用/禁用或输入排序值,提交前弹出确认并提示影响范围</td>
                    <td>P1</td>
                  </tr>
                  <tr>
                    <td>状态标签</td>
                    <td>区分启用/禁用状态</td>
                    <td>禁用项目保留编辑但屏蔽新增</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>项目操作</td>
                    <td>添加、编辑按钮</td>
                    <td>添加触发新增科目，编辑维护项目信息</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>项目删除</td>
                    <td>操作列提供删除入口并提示风险</td>
                    <td>点击【删除】弹出确认弹窗;确认后删除项目及其所有科目,取消则不做变更</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>新增科目流程</td>
                    <td>新增科目弹窗校验</td>
                    <td>名称唯一、状态可调、排序正整数</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>新增项目流程</td>
                    <td>新增项目入口</td>
                    <td>验证名称唯一性，设置默认值，成功后添加到列表</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>科目管理</td>
                    <td>科目面板操作按钮</td>
                    <td>提供编辑、启用/禁用、排序，不显示新增</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>布局与滚动</td>
                    <td>横向滚动支持</td>
                    <td>折叠面板不影响右侧内容对齐</td>
                    <td>P1</td>
                  </tr>
                </tbody>
              </table>

              <h4>字段约束规则</h4>
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
                    <td>项目名称</td>
                    <td>String</td>
                    <td>4-20字符</td>
                    <td>✓</td>
                    <td>全局唯一</td>
                    <td>无</td>
                    <td>支持中文、英文、数字</td>
                  </tr>
                  <tr>
                    <td>项目状态</td>
                    <td>Enum</td>
                    <td>启用/禁用</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>启用</td>
                    <td>禁用项目不可新增科目</td>
                  </tr>
                  <tr>
                    <td>排序</td>
                    <td>Integer</td>
                    <td>&gt;0</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>自动递增</td>
                    <td>正整数</td>
                  </tr>
                  <tr>
                    <td>添加时间</td>
                    <td>DateTime</td>
                    <td>标准时间戳</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>系统时间</td>
                    <td>YYYY-MM-DD HH:mm</td>
                  </tr>
                  <tr>
                    <td>科目名称</td>
                    <td>String</td>
                    <td>1-30字符</td>
                    <td>✓</td>
                    <td>项目内唯一</td>
                    <td>无</td>
                    <td>支持中文、英文、数字</td>
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
                      <td>用户打开项目管理页面</td>
                      <td>页面加载完成</td>
                      <td>筛选下拉框默认选中"全部"，显示所有状态的项目</td>
                    </tr>
                    <tr>
                      <td>AC-02</td>
                      <td>用户在筛选下拉框中选择"禁用"</td>
                      <td>筛选项变更</td>
                      <td>项目列表应立即更新，仅显示禁用状态的项目及其科目行</td>
                    </tr>
                    <tr>
                      <td>AC-03</td>
                      <td>用户在项目管理页面</td>
                      <td>点击项目行</td>
                      <td>应展开对应科目列表，其他项目自动收起</td>
                    </tr>
                    <tr>
                      <td>AC-04</td>
                      <td>用户点击"添加"按钮</td>
                      <td>填写科目信息并提交</td>
                      <td>系统应验证数据并反馈结果，成功时更新列表</td>
                    </tr>
                    <tr>
                      <td>AC-05</td>
                      <td>项目状态为禁用</td>
                      <td>用户尝试添加科目</td>
                      <td>添加按钮应为禁用状态，并显示相应提示</td>
                    </tr>
                    <tr>
                      <td>AC-06</td>
                      <td>用户点击【新增项目】按钮</td>
                      <td>输入项目名称"注册会计师考试",但该名称已存在</td>
                      <td>系统提示"项目名称已存在，请使用不同的名称",拒绝保存</td>
                    </tr>
                    <tr>
                      <td>AC-07</td>
                      <td>用户在项目"会计职称考试"下添加科目</td>
                      <td>输入科目名称"会计实务",但该项目下已存在同名科目</td>
                      <td>系统提示"该项目下已存在相同的科目名称",拒绝保存</td>
                    </tr>
                    <tr>
                      <td>AC-08</td>
                      <td>用户在项目"会计职称考试"下添加科目"会计实务"</td>
                      <td>另一个项目"注册会计师考试"也可以添加科目"会计实务"</td>
                      <td>系统允许保存,科目名称仅在项目内唯一,不同项目可重复</td>
                    </tr>
                    <tr>
                      <td>AC-09</td>
                      <td>用户禁用项目"2024年会计职称考试"</td>
                      <td>项目状态变为"禁用",【添加】按钮变灰</td>
                      <td>项目行显示禁用状态,鼠标悬停【添加】按钮提示"项目已禁用,无法新增科目",但【编辑】按钮保持可用</td>
                    </tr>
                    <tr>
                      <td>AC-10</td>
                      <td>用户点击项目行【编辑】按钮</td>
                      <td>修改项目名称或状态后保存</td>
                      <td>项目信息更新成功,Toast提示"项目已成功编辑"</td>
                    </tr>
                    <tr>
                      <td>AC-11</td>
                      <td>科目"财务成本管理"状态为启用</td>
                      <td>用户点击科目行【启用/禁用】按钮</td>
                      <td>科目状态切换为"禁用",Toast提示"科目已禁用"</td>
                    </tr>
                    <tr>
                      <td>AC-12</td>
                      <td>用户点击右上角【全部展开】按钮</td>
                      <td>当前已收起所有项目</td>
                      <td>所有项目行展开显示科目列表,按钮文字变为"全部收起"</td>
                    </tr>
                    <tr>
                      <td>AC-13</td>
                      <td>用户添加科目时设置排序为0</td>
                      <td>点击保存</td>
                      <td>系统提示"排序必须为正整数(>0)",拒绝保存</td>
                    </tr>
                    <tr>
                      <td>AC-15</td>
                      <td>科目下无任何科目</td>
                      <td>展开项目行</td>
                      <td>科目面板显示"暂无科目",提示用户点击【添加】按钮创建</td>
                    </tr>
                    <tr>
                      <td>AC-16</td>
                      <td>用户在筛选下拉框中选择"全部"</td>
                      <td>筛选项变更</td>
                      <td>项目列表应立即更新,显示所有状态的项目(启用和禁用)</td>
                    </tr>
                    <tr>
                      <td>AC-17</td>
                      <td>用户点击项目行【删除】按钮</td>
                      <td>在确认弹窗中点击确认</td>
                      <td>项目及其所有科目被删除,列表刷新并提示"项目已删除"</td>
                    </tr>
                    <tr>
                      <td>AC-18</td>
                      <td>用户点击项目行【删除】按钮</td>
                      <td>在确认弹窗中点击取消</td>
                      <td>项目及科目保持不变,弹窗关闭</td>
                    </tr>
                    <tr>
                      <td>AC-19</td>
                      <td>至少勾选两个项目</td>
                      <td>点击批量操作工具条中的"批量启用"并在确认弹窗中点击确认</td>
                      <td>所有选中项目状态更新为启用,并提示"批量启用成功"</td>
                    </tr>
                    <tr>
                      <td>AC-20</td>
                      <td>未勾选任何项目</td>
                      <td>尝试点击批量操作工具条按钮</td>
                      <td>批量操作按钮保持禁用,并提示"请先选择项目"</td>
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
            <p>完整的设计系统、组件库和交互规范已统一整合到设计规范页面。</p>
          </div>
          <div class="style-guide-content">
            <router-link to="/design-guidelines" class="btn primary">
              访问设计规范页面 →
            </router-link>
          </div>
        </div>
      </template>
    </TabNavigation>

    <!-- 新增/编辑项目弹窗 -->
    <AddProjectModal
      v-model:visible="addProjectModalVisible"
      :editing-project="editingProject"
      @submit="handleAddProject"
    />

    <!-- 新增/编辑科目弹窗 -->
    <AddSubjectModal
      v-model:visible="addSubjectModalVisible"
      :project-id="selectedProjectId"
      :project-name="selectedProjectName"
      :editing-subject="editingSubject"
      @submit="handleAddSubject"
    />

    <!-- 启用/禁用确认弹窗 -->
    <ToggleStatusConfirmModal
      :visible="isToggleStatusModalVisible"
      :action-type="toggleActionType"
      :message="toggleMessage"
      :entity-name="toggleEntityType === 'project' ? '项目' : '科目'"
      @update:visible="isToggleStatusModalVisible = $event"
      @confirm="handleToggleStatusConfirm"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AppLayout from '@/components/Layout/AppLayout.vue'
import TabNavigation from '@/components/Tab/TabNavigation.vue'
import AddProjectModal from './components/AddProjectModal.vue'
import AddSubjectModal from './components/AddSubjectModal.vue'
import ToggleStatusConfirmModal from '@/components/ToggleStatusConfirmModal.vue'
import { useProjectStore } from '@/stores/project'
import { useToast } from '@/composables/useToast'
import type { Project, Subject, ProjectFormData, SubjectFormData } from './types'

const tabs = [
  { key: 'prototype', label: '原型展示', icon: '🎨' },
  { key: 'requirements', label: '需求文档', icon: '📋' },
  { key: 'style-guide', label: '样式指南', icon: '🎯' }
]

const projectStore = useProjectStore()
const { showToast } = useToast()

// 状态筛选
const statusFilter = ref('all')

// 展开的项目
const expandedProjects = ref<Set<string>>(new Set())

// 全部展开状态
const allExpanded = ref(false)

// 科目拖拽相关状态
const draggedSubjectId = ref<string | null>(null)
const dragOverSubjectId = ref<string | null>(null)

// 弹窗状态
const addProjectModalVisible = ref(false)
const addSubjectModalVisible = ref(false)
const selectedProjectId = ref('')
const selectedProjectName = ref('')

// 编辑状态
const editingProject = ref<Project | null>(null)
const editingSubject = ref<Subject | null>(null)

// 启用/禁用确认弹窗相关状态
const isToggleStatusModalVisible = ref(false)
const toggleActionType = ref<'enable' | 'disable'>('enable')
const toggleMessage = ref('')
const toggleEntityType = ref<'project' | 'subject'>('project')
const pendingToggleProject = ref<Project | null>(null)
const pendingToggleSubject = ref<Subject | null>(null)

// 筛选后的项目列表
const filteredProjects = computed(() => {
  let projects = projectStore.projects
  if (statusFilter.value !== 'all') {
    projects = projects.filter(p => p.status === statusFilter.value)
  }
  // 按order排序
  return [...projects].sort((a, b) => a.order - b.order)
})

// 获取项目的科目列表
const getProjectSubjects = (projectId: string) => {
  return projectStore.getSubjectsByProjectId(projectId)
}

// 切换项目展开状态
const toggleProject = (projectId: string) => {
  if (expandedProjects.value.has(projectId)) {
    expandedProjects.value.delete(projectId)
  } else {
    // 只展开当前项目，收起其他项目
    expandedProjects.value.clear()
    expandedProjects.value.add(projectId)
  }
}

// 全部展开/收起
const toggleAllProjects = () => {
  if (allExpanded.value) {
    expandedProjects.value.clear()
  } else {
    filteredProjects.value.forEach(p => expandedProjects.value.add(p.id))
  }
  allExpanded.value = !allExpanded.value
}

// 上移项目
const moveProjectUp = (index: number) => {
  if (index === 0) return  // 首项无法上移

  const currentProject = filteredProjects.value[index]
  const prevProject = filteredProjects.value[index - 1]

  // 调用 store 方法交换 order
  projectStore.reorderProjects(currentProject.id, prevProject.id)
  showToast('项目已上移')
}

// 下移项目
const moveProjectDown = (index: number) => {
  if (index === filteredProjects.value.length - 1) return  // 末项无法下移

  const currentProject = filteredProjects.value[index]
  const nextProject = filteredProjects.value[index + 1]

  // 调用 store 方法交换 order
  projectStore.reorderProjects(currentProject.id, nextProject.id)
  showToast('项目已下移')
}

// 上移科目
const moveSubjectUp = (projectId: string, subjectIndex: number) => {
  const subjects = getProjectSubjects(projectId)
  if (subjectIndex === 0) return  // 首项无法上移

  const currentSubject = subjects[subjectIndex]
  const prevSubject = subjects[subjectIndex - 1]

  // 调用 store 方法交换 order
  projectStore.reorderSubjects(currentSubject.id, prevSubject.id)
  showToast('科目已上移')
}

// 下移科目
const moveSubjectDown = (projectId: string, subjectIndex: number) => {
  const subjects = getProjectSubjects(projectId)
  if (subjectIndex === subjects.length - 1) return  // 末项无法下移

  const currentSubject = subjects[subjectIndex]
  const nextSubject = subjects[subjectIndex + 1]

  // 调用 store 方法交换 order
  projectStore.reorderSubjects(currentSubject.id, nextSubject.id)
  showToast('科目已下移')
}

// 科目拖拽开始
const handleSubjectDragStart = (e: DragEvent, subjectId: string) => {
  draggedSubjectId.value = subjectId
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
  }
}

// 科目拖拽悬停
const handleSubjectDragOver = (e: DragEvent, subjectId: string) => {
  e.preventDefault()
  dragOverSubjectId.value = subjectId
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move'
  }
}

// 科目拖拽离开
const handleSubjectDragLeave = () => {
  dragOverSubjectId.value = null
}

// 科目放置
const handleSubjectDrop = (e: DragEvent, targetSubjectId: string) => {
  e.preventDefault()
  if (!draggedSubjectId.value || draggedSubjectId.value === targetSubjectId) {
    draggedSubjectId.value = null
    dragOverSubjectId.value = null
    return
  }

  // 调用 store 方法交换 order
  projectStore.reorderSubjects(draggedSubjectId.value, targetSubjectId)

  // 重置拖拽状态
  draggedSubjectId.value = null
  dragOverSubjectId.value = null
}

// 科目拖拽结束
const handleSubjectDragEnd = () => {
  draggedSubjectId.value = null
  dragOverSubjectId.value = null
}

// 打开新增项目弹窗
const openAddProjectModal = () => {
  editingProject.value = null
  addProjectModalVisible.value = true
}

// 打开编辑项目弹窗
const openEditProjectModal = (project: Project) => {
  editingProject.value = project
  addProjectModalVisible.value = true
}

// 打开新增科目弹窗
const openAddSubjectModal = (project: Project) => {
  editingSubject.value = null
  selectedProjectId.value = project.id
  selectedProjectName.value = project.name
  addSubjectModalVisible.value = true
}

// 打开编辑科目弹窗
const openEditSubjectModal = (subject: Subject) => {
  editingSubject.value = subject
  selectedProjectId.value = subject.projectId
  selectedProjectName.value = subject.projectName
  addSubjectModalVisible.value = true
}

// 处理新增/编辑项目
const handleAddProject = (data: ProjectFormData) => {
  if (editingProject.value) {
    // 编辑模式
    projectStore.updateProject(editingProject.value.id, data)
    showToast(`项目"${data.name}"已成功编辑。`)
    editingProject.value = null
  } else {
    // 新增模式
    projectStore.addProject(data)
    showToast(`项目"${data.name}"已成功创建。`)
  }
}

// 处理新增/编辑科目
const handleAddSubject = (data: SubjectFormData) => {
  if (editingSubject.value) {
    // 编辑模式
    projectStore.updateSubject(editingSubject.value.id, data)
    showToast(`科目"${data.name}"已成功编辑。`)
    editingSubject.value = null
  } else {
    // 新增模式
    projectStore.addSubject(data)
    showToast('新增科目成功，已同步至对应项目。')
    // 自动展开该项目
    expandedProjects.value.clear()
    expandedProjects.value.add(data.projectId)
  }
}

// 切换项目状态 - 显示确认弹窗
const handleToggleProjectStatus = (project: Project) => {
  toggleEntityType.value = 'project'
  pendingToggleProject.value = project

  if (project.status === 'active') {
    // 禁用项目
    toggleActionType.value = 'disable'
    toggleMessage.value = `确定要禁用项目「${project.name}」吗？\n\n禁用后将无法新增科目。`
  } else {
    // 启用项目
    toggleActionType.value = 'enable'
    toggleMessage.value = `确定要启用项目「${project.name}」吗？`
  }

  isToggleStatusModalVisible.value = true
}

// 切换科目状态 - 显示确认弹窗
const handleToggleSubjectStatus = (subject: Subject) => {
  toggleEntityType.value = 'subject'
  pendingToggleSubject.value = subject

  if (subject.status === 'active') {
    // 禁用科目
    toggleActionType.value = 'disable'
    toggleMessage.value = `确定要禁用科目「${subject.name}」吗？`
  } else {
    // 启用科目
    toggleActionType.value = 'enable'
    toggleMessage.value = `确定要启用科目「${subject.name}」吗？`
  }

  isToggleStatusModalVisible.value = true
}

// 确认切换启用/禁用状态
const handleToggleStatusConfirm = () => {
  let result

  if (toggleEntityType.value === 'project' && pendingToggleProject.value) {
    result = projectStore.toggleProjectStatus(pendingToggleProject.value.id)
    if (result.success) {
      const action = pendingToggleProject.value.status === 'active' ? '禁用' : '启用'
      showToast(`项目已${action}`)
      isToggleStatusModalVisible.value = false
    } else {
      showToast(result.message || '操作失败', { type: 'error' })
    }
  } else if (toggleEntityType.value === 'subject' && pendingToggleSubject.value) {
    result = projectStore.toggleSubjectStatus(pendingToggleSubject.value.id)
    if (result.success) {
      const action = pendingToggleSubject.value.status === 'active' ? '禁用' : '启用'
      showToast(`科目已${action}`)
      isToggleStatusModalVisible.value = false
    } else {
      showToast(result.message || '操作失败', { type: 'error' })
    }
  }
}
</script>

<style scoped>
.tab-panel {
}

.table-shell {
  background: var(--panel-bg);
  border-radius: 12px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--panel-border);
}

.table-header {
  padding: 16px 24px;
  border-bottom: 1px solid #eaecee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-weight: 600;
  font-size: 13px;
}

.filter-group select {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #cdd5e0;
  font-size: 13px;
  cursor: pointer;
}

.action-group {
  display: flex;
  gap: 8px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: linear-gradient(180deg, #fafafa 0%, #f2f2f2 100%);
  border-bottom: 1px solid var(--table-border);
}

th,
td {
  padding: 14px 24px;
  text-align: left;
  border-bottom: 1px solid var(--table-border);
  white-space: nowrap;
}

th {
  font-weight: 600;
  color: var(--secondary-text);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 12px;
}

.project-row {
  transition: all 0.2s ease;
  cursor: default;
  border-left: 3px solid transparent;
}

.project-row:hover {
  background-color: var(--row-hover);
  border-left: 3px solid var(--accent);
  box-shadow: 0 2px 8px rgba(0, 102, 204, 0.1);
  transform: translateX(2px);
}

.project-row.is-expanded {
  background-color: #edf4ff;
  border-left: 3px solid var(--accent);
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.15);
}

.project-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.project-cell::before {
  content: "▶";
  font-size: 12px;
  color: var(--accent);
  font-weight: 600;
  transition: transform 0.3s ease;
  margin-right: 4px;
}

.project-row.is-expanded .project-cell::before {
  transform: rotate(90deg);
}

.link {
  color: var(--accent);
  cursor: pointer;
  text-decoration: none;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.link:hover {
  color: var(--accent-hover);
  background-color: rgba(0, 102, 204, 0.08);
}

.subject-row {
  background-color: #f9fbff;
}

.subject-row td {
  padding: 0 24px 24px;
}

.subject-inline-panel {
  margin-top: -8px;
  background: #ffffff;
  border: 1px dashed rgba(0, 102, 204, 0.4);
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.05);
  display: grid;
  gap: 16px;
}

.subject-inline-panel header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: var(--accent);
}

.subject-inline-panel header span {
  font-size: 12px;
  color: var(--secondary-text);
  font-weight: normal;
}

.subject-list {
  display: grid;
  gap: 12px;
}

.subject-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid #e4eaf2;
  border-radius: 6px;
  background: linear-gradient(180deg, #fafcfe 0%, #ffffff 100%);
}

.subject-item .meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.subject-item .meta strong {
  font-size: 14px;
  color: var(--primary-text);
}

.subject-item .meta span {
  font-size: 12px;
  color: var(--secondary-text);
}

.subject-item .actions {
  display: flex;
  gap: 8px;
}

.subject-item {
  cursor: move;
  transition: all 0.2s ease;
}

.subject-item.is-dragging {
  opacity: 0.5;
  border: 2px dashed #ccc;
  cursor: grabbing;
}

.subject-item.is-drag-over {
  border-left: 3px solid var(--accent);
  background-color: #e8f4ff;
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: var(--secondary-text);
}

.requirements-header,
.style-guide-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--panel-border);
}

.requirements-header h2,
.style-guide-header h2 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
}

.requirements-header p,
.style-guide-header p {
  margin: 0;
  color: var(--secondary-text);
  line-height: 1.6;
}

.style-guide-content {
  text-align: center;
  padding: 60px 40px;
}

/* 需求文档样式 */
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

.functional-requirements h4 {
  margin: 24px 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-text);
}

/* 规格表格样式 */
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

/* 箭头按钮样式 */
.btn.icon-btn {
  min-width: 32px;
  padding: 6px 8px;
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
}

.btn.icon-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .prototype-wrapper {
    flex-direction: column;
  }
}
</style>
