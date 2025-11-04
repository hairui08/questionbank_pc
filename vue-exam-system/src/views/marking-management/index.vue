<template>
  <AppLayout title="题库系统阅卷管理">
    <TabNavigation :tabs="tabs" :active-tab="activeTab" @change="activeTab = $event">
      <!-- 原型展示标签页 -->
      <template #prototype>
        <div class="prototype-content">
          <div class="content-layout">
            <!-- 左侧: 项目科目树 -->
            <div class="left-sidebar">
              <ProjectSubjectTree @select="handleTreeSelect" />
            </div>

            <!-- 右侧: 筛选器 + 表格 + 分页 -->
            <div class="right-content">
              <!-- 筛选器 -->
              <MarkingFilter
                v-model:filter="filter"
                @search="handleSearch"
              />

              <!-- 表格 -->
              <MarkingTable
                :records="paginatedRecords.records"
                :page="currentPage"
                :page-size="pageSize"
                @assign="handleAssign"
                @mark="handleMark"
                @progress="handleProgress"
                @score="handleScore"
              />

              <!-- 分页 -->
              <div class="pagination">
                <div class="pagination-info">
                  共 {{ paginatedRecords.total }} 条记录
                </div>
                <div class="pagination-controls">
                  <button
                    class="page-btn"
                    :disabled="currentPage === 1"
                    @click="currentPage--"
                  >
                    上一页
                  </button>
                  <span class="page-info">
                    第 {{ currentPage }} / {{ totalPages }} 页
                  </span>
                  <button
                    class="page-btn"
                    :disabled="currentPage === totalPages"
                    @click="currentPage++"
                  >
                    下一页
                  </button>
                  <select v-model.number="pageSize" class="page-size-select">
                    <option :value="10">10条/页</option>
                    <option :value="20">20条/页</option>
                    <option :value="50">50条/页</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 需求文档标签页 -->
      <template #requirements>
        <div class="tab-panel">
          <div class="requirements-header">
            <h2>阅卷管理需求文档</h2>
            <p>详细的功能需求、业务规则和验收标准,确保阅卷管理模块实现标准化的批阅流程。</p>
          </div>

          <div class="requirements-content">
            <section class="business-requirements">
              <h3>业务需求</h3>
              <div class="requirement-section">
                <h4>核心目标</h4>
                <ul>
                  <li>提供高效的考试批阅任务分配和管理功能</li>
                  <li>支持多种批阅模式,适应不同考试场景</li>
                  <li>实时跟踪批阅进度,确保按时完成批阅工作</li>
                  <li>提供完整的成绩统计和分析功能</li>
                </ul>
              </div>


              <div class="requirement-section">
                <h4>用户场景</h4>
                <ul>
                  <li><strong>浏览考试列表</strong>: 管理员通过左侧项目科目树筛选考试,右侧表格显示考试详情和状态</li>
                  <li><strong>分配批阅任务</strong>: 待批阅考试点击【分配任务】,选择评卷教师,支持按题目或按学生分配</li>
                  <li><strong>进入批阅界面</strong>: 批阅中考试点击【进入批阅】,教师逐题评分并填写评语</li>
                  <li><strong>监控批阅进度</strong>: 管理员点击【查看进度】,实时查看已批阅和未批阅数量</li>
                  <li><strong>查看成绩统计</strong>: 批阅完成后点击【查看成绩】,查看平均分、及格率等统计数据</li>
                </ul>
              </div>


              <div class="requirement-section">
                <h4>业务规则</h4>
                <ul>
                  <li><strong>状态流转规则</strong>: 草稿 → 待批阅 → 批阅中 → 已完成,状态单向流转不可逆</li>
                  <li><strong>分配约束</strong>: 待批阅状态才能分配任务,已分配任务不可重复分配</li>
                  <li><strong>批阅权限</strong>: 仅被分配的评卷教师可以批阅对应的试卷或题目</li>
                  <li><strong>进度计算</strong>: 进度 = 已批阅数量 / 总数量 × 100%,实时更新</li>
                  <li><strong>完成判定</strong>: 所有试卷批阅完成后,考试状态自动更新为"已完成"</li>
                  <li><strong>成绩可见性</strong>: 仅"已完成"状态的考试可以查看成绩统计</li>
                  <li><strong>及格线设定</strong>: 及格分数 = 试卷总分 × 60%,可在试卷创建时自定义</li>
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
                    <td>项目科目树</td>
                    <td>左侧树状导航展示项目和科目</td>
                    <td>支持展开/折叠,显示考试统计数量,点击筛选右侧表格</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>筛选器组</td>
                    <td>按状态、类型、名称筛选考试</td>
                    <td>下拉选择+文本输入,点击【搜索】刷新,点击【重置】清空</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>考试列表表格</td>
                    <td>展示考试的10列信息</td>
                    <td>序号、名称、类型、组卷方式、时长、总分、及格分、人数、状态、操作</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>动态操作按钮</td>
                    <td>根据考试状态显示不同操作</td>
                    <td>草稿:无操作; 待批阅:分配任务; 批阅中:进入批阅+查看进度; 已完成:查看成绩</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>分配任务弹窗</td>
                    <td>选择分配模式和评卷教师</td>
                    <td>单选(按题目/按学生),多选教师列表,确认后更新状态</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>批阅详情界面</td>
                    <td>教师批阅试卷的工作界面</td>
                    <td>显示题目、答案、评分框、评语框,支持保存和提交</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>进度查看弹窗</td>
                    <td>展示批阅进度统计</td>
                    <td>进度条+数量统计(总份数、已批阅、未批阅),实时刷新</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>成绩统计弹窗</td>
                    <td>展示成绩汇总和排名</td>
                    <td>统计卡片(平均分、最高分、最低分、及格率)+学生成绩列表</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>分页控件</td>
                    <td>表格分页导航</td>
                    <td>上一页、下一页、页码、每页条数选择(10/20/50)</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>成绩导出</td>
                    <td>导出Excel格式成绩单</td>
                    <td>成绩弹窗中点击【导出成绩】,生成Excel文件下载</td>
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
                    <td>考试名称</td>
                    <td>String</td>
                    <td>4-50字符</td>
                    <td>✓</td>
                    <td>项目+科目内唯一</td>
                    <td>无</td>
                    <td>支持中文、英文、数字</td>
                  </tr>
                  <tr>
                    <td>考试类型</td>
                    <td>Enum</td>
                    <td>定时考试/练习模式</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>定时考试</td>
                    <td>影响批阅流程</td>
                  </tr>
                  <tr>
                    <td>考试状态</td>
                    <td>Enum</td>
                    <td>草稿/待批阅/批阅中/已完成</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>草稿</td>
                    <td>单向流转</td>
                  </tr>
                  <tr>
                    <td>试卷总分</td>
                    <td>Integer</td>
                    <td>1-1000</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>100</td>
                    <td>所有题目分值总和</td>
                  </tr>
                  <tr>
                    <td>及格分数</td>
                    <td>Integer</td>
                    <td>1-总分</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>总分×60%</td>
                    <td>判定及格的分数线</td>
                  </tr>
                  <tr>
                    <td>参与人数</td>
                    <td>Integer</td>
                    <td>≥0</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>0</td>
                    <td>参加考试的学生数量</td>
                  </tr>
                  <tr>
                    <td>评卷教师ID</td>
                    <td>String</td>
                    <td>UUID格式</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>无</td>
                    <td>分配的教师唯一标识</td>
                  </tr>
                  <tr>
                    <td>分配模式</td>
                    <td>Enum</td>
                    <td>按题目/按学生</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>按题目</td>
                    <td>决定批阅任务分配方式</td>
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
                      <td>用户打开阅卷管理页面</td>
                      <td>页面加载完成</td>
                      <td>左侧显示项目科目树,右侧显示筛选器和考试列表,默认显示所有待批阅考试</td>
                    </tr>
                    <tr>
                      <td>AC-02</td>
                      <td>用户在左侧树点击某个科目</td>
                      <td>选择科目节点</td>
                      <td>右侧表格立即筛选出该科目下的所有考试,其他筛选条件保持不变</td>
                    </tr>
                    <tr>
                      <td>AC-03</td>
                      <td>用户在状态下拉框选择"批阅中"</td>
                      <td>点击【搜索】按钮</td>
                      <td>表格仅显示批阅中状态的考试,分页重置到第一页</td>
                    </tr>
                    <tr>
                      <td>AC-04</td>
                      <td>考试状态为"待批阅"</td>
                      <td>点击操作列【分配任务】按钮</td>
                      <td>弹出分配任务弹窗,显示分配模式选项和教师列表</td>
                    </tr>
                    <tr>
                      <td>AC-05</td>
                      <td>用户在分配任务弹窗中选择"按题目分配"</td>
                      <td>勾选教师"张三"和"李四",点击【确认分配】</td>
                      <td>系统提示"任务分配成功",弹窗关闭,考试状态更新为"批阅中",操作按钮变为"进入批阅+查看进度"</td>
                    </tr>
                    <tr>
                      <td>AC-06</td>
                      <td>考试状态为"批阅中"</td>
                      <td>点击【查看进度】按钮</td>
                      <td>弹出进度弹窗,显示进度条、总份数30、已批阅15、未批阅15,进度50%</td>
                    </tr>
                    <tr>
                      <td>AC-07</td>
                      <td>考试状态为"已完成"</td>
                      <td>点击【查看成绩】按钮</td>
                      <td>弹出成绩统计弹窗,显示平均分75、最高分95、最低分45、及格率80%,下方展示学生成绩排名列表</td>
                    </tr>
                    <tr>
                      <td>AC-08</td>
                      <td>用户在成绩统计弹窗中</td>
                      <td>点击【导出成绩】按钮</td>
                      <td>浏览器下载名为"考试名称_成绩单_日期.xlsx"的Excel文件,包含所有学生成绩数据</td>
                    </tr>
                    <tr>
                      <td>AC-09</td>
                      <td>考试状态为"草稿"</td>
                      <td>查看操作列</td>
                      <td>操作列显示"-"或"暂无操作",无可点击按钮</td>
                    </tr>
                    <tr>
                      <td>AC-10</td>
                      <td>考试列表共50条记录,每页显示10条</td>
                      <td>点击分页控件的【下一页】按钮</td>
                      <td>页码从"第1页"变为"第2页",表格显示第11-20条记录</td>
                    </tr>
                    <tr>
                      <td>AC-11</td>
                      <td>用户在分页控件选择"20条/页"</td>
                      <td>下拉框变更</td>
                      <td>表格每页显示20条记录,页码重置到第1页,总页数从5页变为3页</td>
                    </tr>
                    <tr>
                      <td>AC-12</td>
                      <td>用户点击【重置】按钮</td>
                      <td>清空所有筛选条件</td>
                      <td>状态、类型、名称筛选框重置为默认值,左侧树选中状态保持,表格显示该科目下所有考试</td>
                    </tr>
                    <tr>
                      <td>AC-13</td>
                      <td>考试状态为"批阅中",当前进度80%</td>
                      <td>教师完成最后一份试卷批阅</td>
                      <td>进度自动更新为100%,考试状态自动变更为"已完成",操作按钮变为"查看成绩"</td>
                    </tr>
                    <tr>
                      <td>AC-14</td>
                      <td>用户在分配任务弹窗中未勾选任何教师</td>
                      <td>点击【确认分配】按钮</td>
                      <td>系统提示"请至少选择一位评卷教师",拒绝提交</td>
                    </tr>
                    <tr>
                      <td>AC-15</td>
                      <td>左侧树某个科目下无任何考试</td>
                      <td>点击该科目节点</td>
                      <td>右侧表格显示空状态,提示"暂无考试数据"</td>
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
        <div class="style-guide-content">
          <div class="doc-section">
            <h2>阅卷管理样式规范</h2>

            <h3>1. 色彩系统</h3>
            <div class="color-grid">
              <div class="color-item">
                <div class="color-swatch" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"></div>
                <div class="color-name">紫色渐变</div>
                <div class="color-usage">表头、分配任务按钮</div>
              </div>
              <div class="color-item">
                <div class="color-swatch" style="background: linear-gradient(180deg, #4f77ff 0%, #2f57e3 100%)"></div>
                <div class="color-name">蓝色渐变</div>
                <div class="color-usage">进入批阅按钮、主要操作</div>
              </div>
              <div class="color-item">
                <div class="color-swatch" style="background: linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)"></div>
                <div class="color-name">橙色渐变</div>
                <div class="color-usage">查看进度按钮</div>
              </div>
              <div class="color-item">
                <div class="color-swatch" style="background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%)"></div>
                <div class="color-name">绿色渐变</div>
                <div class="color-usage">查看成绩按钮</div>
              </div>
            </div>

            <h3>2. 状态徽章</h3>
            <div class="badge-grid">
              <div class="badge-item">
                <span class="status-badge status-draft">草稿</span>
                <div class="badge-desc">灰色 (#909399)</div>
              </div>
              <div class="badge-item">
                <span class="status-badge status-pending">待批阅</span>
                <div class="badge-desc">橙色 (#e6a23c)</div>
              </div>
              <div class="badge-item">
                <span class="status-badge status-marking">批阅中</span>
                <div class="badge-desc">蓝色 (#409eff)</div>
              </div>
              <div class="badge-item">
                <span class="status-badge status-completed">已完成</span>
                <div class="badge-desc">绿色 (#67c23a)</div>
              </div>
            </div>

            <h3>3. 布局规范</h3>
            <ul>
              <li><strong>左右分栏</strong>: 左侧树状菜单宽度 280px,右侧内容区域自适应</li>
              <li><strong>间距</strong>: 组件间距 20px,内边距 20px</li>
              <li><strong>圆角</strong>: 面板圆角 8px,按钮圆角 4px</li>
              <li><strong>阴影</strong>: 卡片阴影 0 2px 8px rgba(0,0,0,0.05)</li>
            </ul>

            <h3>4. 表格样式</h3>
            <ul>
              <li><strong>表头</strong>: 紫色渐变背景,白色文字</li>
              <li><strong>行高</strong>: 表头 42px,数据行 40px</li>
              <li><strong>悬停效果</strong>: 行背景变为浅蓝色 (#f0f7ff)</li>
              <li><strong>边框</strong>: 1px solid #d8d8d8</li>
            </ul>

            <h3>5. 交互反馈</h3>
            <ul>
              <li><strong>按钮悬停</strong>: 提升阴影,向上移动 1px</li>
              <li><strong>输入框聚焦</strong>: 蓝色边框 + 浅蓝色外发光</li>
              <li><strong>过渡动画</strong>: 所有状态变化使用 0.2s ease 过渡</li>
            </ul>
          </div>
        </div>
      </template>
    </TabNavigation>

    <!-- 弹窗组件 -->
    <AssignTaskModal
      :is-open="assignModalOpen"
      :exam-id="currentExamId"
      @close="assignModalOpen = false"
      @submit="handleAssignSubmit"
    />

    <MarkingDetailModal
      :is-open="markModalOpen"
      :exam-id="currentExamId"
      @close="markModalOpen = false"
    />

    <ProgressModal
      :is-open="progressModalOpen"
      :exam-id="currentExamId"
      @close="progressModalOpen = false"
    />

    <ScoreModal
      :is-open="scoreModalOpen"
      :exam-id="currentExamId"
      @close="scoreModalOpen = false"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AppLayout from '@/components/Layout/AppLayout.vue'
import TabNavigation from '@/components/Tab/TabNavigation.vue'
import ProjectSubjectTree from './components/ProjectSubjectTree.vue'
import MarkingFilter from './components/MarkingFilter.vue'
import MarkingTable from './components/MarkingTable.vue'
import AssignTaskModal from './components/AssignTaskModal.vue'
import MarkingDetailModal from './components/MarkingDetailModal.vue'
import ProgressModal from './components/ProgressModal.vue'
import ScoreModal from './components/ScoreModal.vue'
import { useMarkingStore } from '@/stores/marking'
import { useToast } from '@/composables/useToast'
import type { MarkingFilter as MarkingFilterType, AssignTaskData } from './types'

// Stores & Composables
const markingStore = useMarkingStore()
const { showToast } = useToast()

// 标签页配置
const tabs = [
  { key: 'prototype', label: '原型展示', icon: '🎨' },
  { key: 'requirements', label: '需求文档', icon: '📋' },
  { key: 'style-guide', label: '样式指南', icon: '🎯' }
]
const activeTab = ref('prototype')

// 筛选条件
const filter = ref<MarkingFilterType>({})

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 分页数据
const paginatedRecords = computed(() => {
  return markingStore.getPaginatedRecords(filter.value, currentPage.value, pageSize.value)
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(paginatedRecords.value.total / pageSize.value) || 1
})

// 监听分页参数变化,重置到第一页
watch([pageSize], () => {
  currentPage.value = 1
})

// 弹窗状态
const assignModalOpen = ref(false)
const markModalOpen = ref(false)
const progressModalOpen = ref(false)
const scoreModalOpen = ref(false)
const currentExamId = ref<string | null>(null)

/**
 * 处理树节点选择
 */
const handleTreeSelect = (projectId: string, subjectId: string) => {
  filter.value.projectId = projectId
  filter.value.subjectId = subjectId
  currentPage.value = 1
}

/**
 * 处理搜索
 */
const handleSearch = () => {
  currentPage.value = 1
}

/**
 * 处理分配任务
 */
const handleAssign = (examId: string) => {
  currentExamId.value = examId
  assignModalOpen.value = true
}

/**
 * 处理分配任务提交
 */
const handleAssignSubmit = (data: AssignTaskData) => {
  const success = markingStore.assignTask(data)
  if (success) {
    showToast('任务分配成功', { type: 'success' })
    assignModalOpen.value = false
  } else {
    showToast('任务分配失败', { type: 'error' })
  }
}

/**
 * 处理进入批阅
 */
const handleMark = (examId: string) => {
  currentExamId.value = examId
  markModalOpen.value = true
}

/**
 * 处理查看进度
 */
const handleProgress = (examId: string) => {
  currentExamId.value = examId
  progressModalOpen.value = true
}

/**
 * 处理查看成绩
 */
const handleScore = (examId: string) => {
  currentExamId.value = examId
  scoreModalOpen.value = true
}
</script>

<style scoped>
/* 原型展示内容 */
.prototype-content {
  height: 100%;
}

.content-layout {
  display: flex;
  gap: 20px;
  height: 100%;
}

/* 左侧边栏 */
.left-sidebar {
  width: 280px;
  flex-shrink: 0;
}

/* 右侧内容 */
.right-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 16px 20px;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
}

.pagination-info {
  font-size: 13px;
  color: var(--secondary-text);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-btn {
  height: 32px;
  padding: 0 16px;
  border: 1px solid var(--panel-border);
  border-radius: 4px;
  font-size: 13px;
  color: var(--primary-text);
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 13px;
  color: var(--primary-text);
}

.page-size-select {
  height: 32px;
  padding: 0 8px;
  border: 1px solid var(--panel-border);
  border-radius: 4px;
  font-size: 13px;
  color: var(--primary-text);
  background: #ffffff;
  cursor: pointer;
}

/* 需求文档和样式指南内容 */
.requirements-content,
.style-guide-content {
  padding: 40px;
  background: var(--panel-bg);
}

.doc-section {
  max-width: 900px;
  margin: 0 auto;
}

.doc-section h2 {
  margin: 0 0 32px 0;
  font-size: 28px;
  font-weight: 600;
  color: var(--primary-text);
  border-bottom: 2px solid var(--accent);
  padding-bottom: 12px;
}

.doc-section h3 {
  margin: 32px 0 16px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-text);
}

.doc-section p {
  margin: 0 0 16px 0;
  font-size: 14px;
  line-height: 1.8;
  color: var(--secondary-text);
}

.doc-section ul {
  margin: 0 0 24px 0;
  padding-left: 24px;
}

.doc-section li {
  margin-bottom: 12px;
  font-size: 14px;
  line-height: 1.8;
  color: var(--secondary-text);
}

.doc-table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0 24px 0;
  font-size: 13px;
}

.doc-table th,
.doc-table td {
  padding: 12px;
  border: 1px solid var(--table-border);
  text-align: left;
}

.doc-table th {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-weight: 600;
}

.doc-table td {
  color: var(--secondary-text);
}

/* 色彩系统 */
.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin: 24px 0;
}

.color-item {
  text-align: center;
}

.color-swatch {
  height: 80px;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.color-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-text);
  margin-bottom: 4px;
}

.color-usage {
  font-size: 12px;
  color: var(--secondary-text);
}

/* 徽章系统 */
.badge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
  margin: 24px 0;
}

.badge-item {
  text-align: center;
  padding: 20px;
  background: var(--row-hover);
  border-radius: 8px;
}

.status-badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 12px;
}

.status-badge.status-draft {
  background-color: #909399;
  color: #ffffff;
}

.status-badge.status-pending {
  background-color: #e6a23c;
  color: #ffffff;
}

.status-badge.status-marking {
  background-color: #409eff;
  color: #ffffff;
}

.status-badge.status-completed {
  background-color: #67c23a;
  color: #ffffff;
}

.badge-desc {
  font-size: 12px;
  color: var(--secondary-text);
}

/* 需求文档样式 */
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
</style>
