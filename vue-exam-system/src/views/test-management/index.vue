<template>
  <AppLayout title="题库系统 - 考试管理">
    <TabNavigation :tabs="tabs" :default-tab="'prototype'">
      <!-- 原型展示标签页 -->
      <template #prototype>
        <div class="tab-panel">
          <div class="prototype-wrapper">
            <div class="test-management-container">
              <!-- 筛选器 -->
              <TestFilter
                v-model="filter"
                @search="handleSearch"
                @reset="handleReset"
              />

              <!-- 操作按钮区 -->
              <div class="action-bar">
                <div class="action-left">
                  <button class="btn primary" @click="handleCreate">
                    ➕ 创建考试
                  </button>
                  <button
                    class="btn danger"
                    :disabled="selectedIds.length === 0"
                    @click="handleBatchDelete"
                  >
                    🗑️ 批量删除
                  </button>
                </div>
                <div class="action-right">
                  <span class="selection-count">
                    已选中 {{ selectedIds.length }} 项
                  </span>
                </div>
              </div>

              <!-- 考试表格 -->
              <TestTable
                :tests="paginatedData.data"
                v-model:selectedIds="selectedIds"
                @preview="handlePreview"
                @edit="handleEdit"
                @review="handleReview"
                @delete="handleDeleteSingle"
              />

              <!-- 分页器 -->
              <div v-if="paginatedData.total > 0" class="pagination">
                <div class="pagination-info">
                  共 {{ paginatedData.total }} 条记录,第 {{ paginatedData.currentPage }} / {{ paginatedData.totalPages }} 页
                </div>
                <div class="pagination-controls">
                  <button
                    class="pagination-btn"
                    :disabled="paginatedData.currentPage === 1"
                    @click="goToPage(paginatedData.currentPage - 1)"
                  >
                    上一页
                  </button>
                  <div class="page-numbers">
                    <button
                      v-for="page in visiblePages"
                      :key="page"
                      class="page-number"
                      :class="{ active: page === paginatedData.currentPage }"
                      @click="goToPage(page)"
                    >
                      {{ page }}
                    </button>
                  </div>
                  <button
                    class="pagination-btn"
                    :disabled="paginatedData.currentPage === paginatedData.totalPages"
                    @click="goToPage(paginatedData.currentPage + 1)"
                  >
                    下一页
                  </button>
                </div>
                <div class="pagination-size">
                  <label>每页显示</label>
                  <select v-model.number="pageSize" @change="handlePageSizeChange">
                    <option :value="10">10</option>
                    <option :value="20">20</option>
                    <option :value="50">50</option>
                  </select>
                  <span>条</span>
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
            <h2>考试管理需求文档</h2>
            <p>基于试卷创建考试实例,设置考试时间、类型和收费策略,支持审核流程管理。</p>
          </div>

          <div class="requirements-content">
            <section class="business-requirements">
              <h3>业务需求</h3>
              <div class="requirement-section">
                <h4>核心目标</h4>
                <ul>
                  <li>基于已有试卷创建考试实例,设置考试时间和收费策略</li>
                  <li>支持正式考试、模拟考试、练习测试、随堂测验四种类型</li>
                  <li>提供免费、基础、高级、VIP四档收费规则</li>
                  <li>实施简单审核流程:待审核 → 已审核/已驳回</li>
                  <li>支持多维度筛选和分页查询</li>
                  <li>已审核的考试受保护,不能删除</li>
                </ul>
              </div>

              <div class="requirement-section">
                <h4>用户场景</h4>
                <ul>
                  <li><strong>教师创建考试</strong>: 选择试卷,设置考试时间和时长,提交审核</li>
                  <li><strong>管理员审核</strong>: 查看待审核考试,审核通过或驳回并填写原因</li>
                  <li><strong>修改重提</strong>: 已驳回的考试可编辑后重新提交审核</li>
                  <li><strong>收费管理</strong>: 使用收费规则选择器，从10条预设规则中选择合适的收费模式（如免费、VIP会员、试卷通票等）</li>
                  <li><strong>考试查询</strong>: 按状态、类型、名称筛选考试列表</li>
                </ul>
              </div>

              <div class="requirement-section">
                <h4>业务规则</h4>
                <ul>
                  <li><strong>考试名称唯一性</strong>: 同科目下考试名称不能重复</li>
                  <li><strong>试卷关联</strong>: 必须选择该科目下已存在的试卷</li>
                  <li><strong>时间校验</strong>: 考试开始时间不能早于当前时间,结束时间必须晚于开始时间</li>
                  <li><strong>审核流程</strong>: 创建后默认待审核,审核通过后状态变为已审核,驳回后变为已驳回</li>
                  <li><strong>删除保护</strong>: 只能删除待审核或已驳回状态的考试,已审核考试不能删除</li>
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
                    <td>左侧树形菜单展示项目-科目层级</td>
                    <td>点击科目加载该科目下的考试列表</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>考试筛选</td>
                    <td>支持状态、考试类型、考试名称筛选</td>
                    <td>筛选项包括:审核状态(待审核/已审核/已驳回)、考试类型(四种)、考试名称模糊搜索</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>考试列表</td>
                    <td>表格展示考试摘要信息</td>
                    <td>包含:多选框、序号、考试名称、考试类型、收费规则、总分、及格分、考试时长、考试时间、创建时间、创建人、状态、操作列</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>创建考试</td>
                    <td>【创建考试】按钮跳转到创建页面</td>
                    <td>填写基础信息:考试名称、考试类型、收费规则、关联试卷、考试时间,保存后状态为"待审核"</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>编辑考试</td>
                    <td>点击【编辑】按钮跳转到编辑页面</td>
                    <td>预填现有数据,允许修改基础信息;已审核状态不可编辑</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>审核考试</td>
                    <td>点击【审核】按钮打开审核弹窗</td>
                    <td>选择审核通过或驳回,驳回需填写原因;只有待审核状态可审核</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>删除考试</td>
                    <td>单个删除和批量删除</td>
                    <td>二次确认后删除,已审核状态不能删除</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>预览考试</td>
                    <td>点击【预览】按钮查看考试详情</td>
                    <td>展示考试基础信息和关联的试卷内容</td>
                    <td>P1</td>
                  </tr>
                  <tr>
                    <td>分页功能</td>
                    <td>支持分页浏览考试列表</td>
                    <td>显示总记录数、页码、上一页/下一页、每页条数切换(10/20/50)</td>
                    <td>P0</td>
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
                    <td>考试名称</td>
                    <td>String</td>
                    <td>1-100字符</td>
                    <td>✓</td>
                    <td>科目内唯一</td>
                    <td>无</td>
                    <td>清晰描述考试用途</td>
                  </tr>
                  <tr>
                    <td>考试类型</td>
                    <td>Enum</td>
                    <td>4个选项</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>formal</td>
                    <td>正式/模拟/练习/随堂</td>
                  </tr>
                  <tr>
                    <td>收费规则</td>
                    <td>Enum</td>
                    <td>4个选项</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>free</td>
                    <td>免费/基础/高级/VIP</td>
                  </tr>
                  <tr>
                    <td>考试时长</td>
                    <td>Integer</td>
                    <td>1-600分钟</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>90</td>
                    <td>单位:分钟</td>
                  </tr>
                  <tr>
                    <td>考试时间</td>
                    <td>DateTime</td>
                    <td>未来时间</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>无</td>
                    <td>不能早于当前时间</td>
                  </tr>
                  <tr>
                    <td>关联试卷</td>
                    <td>String</td>
                    <td>试卷ID</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>无</td>
                    <td>下拉选择科目下的试卷</td>
                  </tr>
                  <tr>
                    <td>审核状态</td>
                    <td>Enum</td>
                    <td>3个状态</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>pending</td>
                    <td>待审核/已审核/已驳回</td>
                  </tr>
                  <tr>
                    <td>驳回原因</td>
                    <td>String</td>
                    <td>1-500字符</td>
                    <td>驳回时必填</td>
                    <td>无</td>
                    <td>无</td>
                    <td>审核驳回时记录</td>
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
                      <td>用户在考试管理页面,左侧树选中"财务战略管理"科目</td>
                      <td>右侧加载该科目的考试列表</td>
                      <td>应展示该科目下所有考试,包括考试名称、类型、收费规则等信息</td>
                    </tr>
                    <tr>
                      <td>AC-02</td>
                      <td>用户在筛选器中选择"状态=待审核"</td>
                      <td>点击【搜索】按钮</td>
                      <td>列表应仅显示待审核状态的考试</td>
                    </tr>
                    <tr>
                      <td>AC-03</td>
                      <td>用户点击【创建考试】按钮</td>
                      <td>跳转到考试创建页面,填写信息并保存</td>
                      <td>系统验证通过,考试创建成功,状态为"待审核",Toast提示"考试创建成功"</td>
                    </tr>
                    <tr>
                      <td>AC-04</td>
                      <td>用户尝试创建考试名称与已有考试重复的考试(同科目)</td>
                      <td>点击保存</td>
                      <td>系统提示"该考试名称已存在",拒绝保存</td>
                    </tr>
                    <tr>
                      <td>AC-05</td>
                      <td>管理员查看待审核考试,点击【审核】按钮</td>
                      <td>在弹窗中选择"审核通过",点击确定</td>
                      <td>考试状态变为"已审核",记录审核人和审核时间,Toast提示"审核成功"</td>
                    </tr>
                    <tr>
                      <td>AC-06</td>
                      <td>管理员审核考试,选择"驳回"</td>
                      <td>填写驳回原因"考试时长设置不合理",点击确定</td>
                      <td>考试状态变为"已驳回",记录驳回原因和审核人,Toast提示"考试已驳回"</td>
                    </tr>
                    <tr>
                      <td>AC-07</td>
                      <td>用户在考试列表中选中1个已审核考试</td>
                      <td>点击【删除】按钮,确认删除</td>
                      <td>系统提示"已审核的考试不能删除",拒绝操作</td>
                    </tr>
                    <tr>
                      <td>AC-08</td>
                      <td>用户在考试列表中选中2个待审核考试</td>
                      <td>点击【批量删除】按钮,确认删除</td>
                      <td>系统删除选中的2个考试,Toast提示"成功删除 2 个考试"</td>
                    </tr>
                    <tr>
                      <td>AC-09</td>
                      <td>用户编辑已驳回的考试</td>
                      <td>修改考试时长后保存</td>
                      <td>考试更新成功,状态仍为"已驳回",可重新提交审核</td>
                    </tr>
                    <tr>
                      <td>AC-10</td>
                      <td>用户尝试编辑已审核的考试</td>
                      <td>点击【编辑】按钮</td>
                      <td>系统提示"已审核的考试不能编辑",或跳转到只读预览页</td>
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
            <p>完整的设计系统、组件库和交互规范已统一整合到设计规范页面,请访问以获取详细信息。</p>
          </div>
        </div>
      </template>
    </TabNavigation>

    <!-- 删除确认弹窗 -->
    <DeleteConfirmModal
      :show="showDeleteModal"
      :is-batch="isBatchDelete"
      :count="deleteCount"
      @confirm="confirmDelete"
      @cancel="closeDeleteModal"
    />

    <!-- 审核弹窗 -->
    <ReviewModal
      :show="showReviewModal"
      @approve="handleApprove"
      @reject="handleReject"
      @cancel="closeReviewModal"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/Layout/AppLayout.vue'
import TabNavigation from '@/components/Tab/TabNavigation.vue'
import TestFilter from './components/TestFilter.vue'
import TestTable from './components/TestTable.vue'
import DeleteConfirmModal from './components/DeleteConfirmModal.vue'
import ReviewModal from './components/ReviewModal.vue'
import { useTestStore } from '@/stores/test'
import { useToast } from '@/composables/useToast'
import type { TestFilter as TestFilterType } from './types'

const router = useRouter()
const testStore = useTestStore()
const { showToast } = useToast()

// 标签页配置
const tabs = [
  { key: 'prototype', label: '原型展示', icon: '🎨' },
  { key: 'requirements', label: '需求文档', icon: '📋' },
  { key: 'style-guide', label: '样式指南', icon: '🎯' }
]

// 筛选条件
const filter = ref<TestFilterType>({})

// 分页参数
const currentPage = ref(1)
const pageSize = ref(20)

// 已选中的考试ID列表
const selectedIds = ref<string[]>([])

// 弹窗状态
const showDeleteModal = ref(false)
const isBatchDelete = ref(false)
const deleteTargetIds = ref<string[]>([])

const showReviewModal = ref(false)
const reviewTargetId = ref('')

// 计算属性: 分页数据
const paginatedData = computed(() => {
  return testStore.getPaginatedTests(filter.value, currentPage.value, pageSize.value)
})

// 计算属性: 可见页码
const visiblePages = computed(() => {
  const total = paginatedData.value.totalPages
  const current = paginatedData.value.currentPage
  const pages: number[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push(-1)
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push(-1)
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push(-1)
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push(-1)
      pages.push(total)
    }
  }

  return pages
})

// 删除数量
const deleteCount = computed(() => deleteTargetIds.value.length)

// 监听筛选条件变化,重置分页
watch(filter, () => {
  currentPage.value = 1
  selectedIds.value = []
}, { deep: true })

// 搜索
function handleSearch() {
  currentPage.value = 1
  selectedIds.value = []
}

// 重置
function handleReset() {
  filter.value = {}
  currentPage.value = 1
  selectedIds.value = []
}

// 创建考试
function handleCreate() {
  router.push('/test-management/create')
}

// 预览考试
function handlePreview(id: string) {
  showToast('预览功能即将上线', { type: 'success' })
  console.log('Preview test:', id)
}

// 编辑考试
function handleEdit(id: string) {
  const test = testStore.getTestById.value(id)
  if (test?.status === 'approved') {
    showToast('已审核的考试不能编辑', { type: 'error' })
    return
  }
  router.push(`/test-management/edit/${id}`)
}

// 审核考试
function handleReview(id: string) {
  reviewTargetId.value = id
  showReviewModal.value = true
}

// 批量删除
function handleBatchDelete() {
  if (selectedIds.value.length === 0) {
    showToast('请先选择要删除的考试', { type: 'error' })
    return
  }
  isBatchDelete.value = true
  deleteTargetIds.value = [...selectedIds.value]
  showDeleteModal.value = true
}

// 单个删除
function handleDeleteSingle(id: string) {
  isBatchDelete.value = false
  deleteTargetIds.value = [id]
  showDeleteModal.value = true
}

// 确认删除
function confirmDelete() {
  try {
    if (isBatchDelete.value) {
      testStore.deleteTestsBatch(deleteTargetIds.value)
      showToast(`成功删除 ${deleteTargetIds.value.length} 个考试`, { type: 'success' })
      selectedIds.value = []
    } else {
      testStore.deleteTest(deleteTargetIds.value[0])
      showToast('考试删除成功', { type: 'success' })
    }
    closeDeleteModal()
  } catch (error: any) {
    showToast(error.message || '删除失败', { type: 'error' })
  }
}

// 关闭删除弹窗
function closeDeleteModal() {
  showDeleteModal.value = false
  deleteTargetIds.value = []
}

// 审核通过
function handleApprove() {
  try {
    testStore.approveTest(reviewTargetId.value)
    showToast('审核成功', { type: 'success' })
    closeReviewModal()
  } catch (error: any) {
    showToast(error.message || '审核失败', { type: 'error' })
  }
}

// 驳回
function handleReject(reason: string) {
  try {
    testStore.rejectTest(reviewTargetId.value, reason)
    showToast('考试已驳回', { type: 'success' })
    closeReviewModal()
  } catch (error: any) {
    showToast(error.message || '驳回失败', { type: 'error' })
  }
}

// 关闭审核弹窗
function closeReviewModal() {
  showReviewModal.value = false
  reviewTargetId.value = ''
}

// 跳转页码
function goToPage(page: number) {
  if (page < 1 || page > paginatedData.value.totalPages) return
  currentPage.value = page
}

// 每页条数变化
function handlePageSizeChange() {
  currentPage.value = 1
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
  padding: 0;
}

.test-management-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: calc(100vh - 240px);
}

/* 操作按钮区 */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  padding: 16px 20px;
}

.action-left {
  display: flex;
  gap: 12px;
}

.action-right {
  font-size: 14px;
  color: var(--secondary-text);
}

.selection-count {
  font-weight: 600;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn.primary {
  background: linear-gradient(180deg, #4f77ff 0%, #2f57e3 100%);
  color: #ffffff;
  border-color: #375edf;
  box-shadow: 0 2px 6px rgba(79, 119, 255, 0.3);
}

.btn.primary:hover {
  background: linear-gradient(180deg, #4b6ee6 0%, #264acc 100%);
}

.btn.danger {
  background: linear-gradient(180deg, #ef5350 0%, #d32f2f 100%);
  color: #ffffff;
  border-color: #c62828;
}

.btn.danger:hover:not(:disabled) {
  background: linear-gradient(180deg, #e53935 0%, #c62828 100%);
}

.btn.danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 分页器 */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  padding: 16px 20px;
}

.pagination-info {
  font-size: 14px;
  color: var(--secondary-text);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  padding: 6px 16px;
  border-radius: 6px;
  border: 1px solid var(--panel-border);
  background: #ffffff;
  color: var(--primary-text);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--row-hover);
  border-color: var(--accent);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-number {
  min-width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid var(--panel-border);
  background: #ffffff;
  color: var(--primary-text);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-number:hover {
  background: var(--row-hover);
  border-color: var(--accent);
}

.page-number.active {
  background: linear-gradient(180deg, #4f77ff 0%, #2f57e3 100%);
  color: #ffffff;
  border-color: #375edf;
}

.pagination-size {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--primary-text);
}

.pagination-size select {
  padding: 6px 12px;
  border: 1px solid var(--panel-border);
  border-radius: 6px;
  font-size: 14px;
  background: #ffffff;
  cursor: pointer;
}

.pagination-size select:focus {
  outline: none;
  border-color: var(--accent);
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

</style>
