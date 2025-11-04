<template>
  <AppLayout title="题库系统收费规则管理">
    <TabNavigation :tabs="tabs" :default-tab="'prototype'">
      <!-- 原型展示标签页 -->
      <template #prototype>
        <div class="tab-panel">
          <div class="prototype-wrapper">
            <RuleTemplateTable
              @edit-template="openEditModal"
              @toggle-status="handleToggleStatus"
            />
          </div>
        </div>
      </template>

      <!-- 需求文档标签页 -->
      <template #requirements>
        <div class="tab-panel">
          <div class="requirements-header">
            <h2>收费规则管理需求文档</h2>
            <p>管理收费与权限收费规则,支持启用/禁用和排序,为试题、试卷、章节等内容提供统一的访问控制规则。</p>
          </div>

          <div class="requirements-content">
            <section class="business-requirements">
              <h3>业务需求</h3>
              <div class="requirement-section">
                <h4>核心目标</h4>
                <ul>
                  <li>提供10条预设的收费收费规则,支持免费、会员、通票、限时等多种访问控制方式</li>
                  <li>支持模板的启用/禁用和排序管理,影响下拉选项的显示顺序</li>
                  <li>确保收费规则与内容实体(试题/试卷/章节/科目)的正确关联</li>
                  <li>提供清晰的参数说明和适用对象标注</li>
                </ul>
              </div>

              <div class="requirement-section">
                <h4>用户场景</h4>
                <ul>
                  <li><strong>查看收费规则</strong>: 管理员查看系统预设的10条收费规则,了解每个模板的适用对象和参数要求</li>
                  <li><strong>启用/禁用模板</strong>: 根据业务需要,启用或禁用特定规则(如禁用"学科VIP"规则),已禁用的规则不会出现在编辑页面的下拉选项中</li>
                  <li><strong>调整显示顺序</strong>: 通过排序值调整规则在下拉列表中的显示顺序,常用规则排在前面</li>
                  <li><strong>理解规则含义</strong>: 通过"说明"列和"参数占位"列,快速理解每个规则的作用和所需参数</li>
                </ul>
              </div>

              <div class="requirement-section">
                <h4>业务规则</h4>
                <ul>
                  <li><strong>固定模板数量</strong>: 系统预设10条收费规则(T001-T010),不支持新增或删除模板</li>
                  <li><strong>编码唯一性</strong>: 每个模板编码(如T001、T002)全局唯一且不可修改</li>
                  <li><strong>启用状态影响</strong>: 禁用的模板不会出现在内容编辑页面的规则下拉选项中,但已设置该规则的内容仍保留规则</li>
                  <li><strong>排序规则</strong>: 排序值越大,在下拉选项中越靠前;默认值为10-100的倍数</li>
                  <li><strong>适用对象过滤</strong>: 每个模板标注适用对象(试题/试卷/章节/科目),编辑页面自动过滤不适用的模板</li>
                  <li><strong>只读字段</strong>: 模板编码、显示名称、适用对象、参数占位符、说明均为只读,仅支持修改启用状态和排序</li>
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
                    <td>模板列表</td>
                    <td>表格展示所有10条收费规则</td>
                    <td>包含编码、名称、适用对象、参数占位、启用状态、说明、排序、操作列,默认按排序值降序显示</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>启用/禁用</td>
                    <td>切换模板的启用状态</td>
                    <td>点击"启用/禁用"按钮即时切换,已禁用的模板不在编辑页下拉选项中显示</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>编辑排序</td>
                    <td>修改模板的排序值</td>
                    <td>点击"编辑"按钮打开弹窗,仅可修改排序值,保存后列表自动重新排序</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>状态标识</td>
                    <td>直观显示启用/禁用状态</td>
                    <td>启用状态显示绿色标签,禁用状态显示灰色标签</td>
                    <td>P1</td>
                  </tr>
                  <tr>
                    <td>适用对象标签</td>
                    <td>显示模板适用的对象类型</td>
                    <td>如"题/卷/章/科"表示适用于试题、试卷、章节、科目四种对象</td>
                    <td>P1</td>
                  </tr>
                </tbody>
              </table>

              <h4>收费规则清单</h4>
              <table class="spec-table">
                <thead>
                  <tr>
                    <th width="10%">编码</th>
                    <th width="15%">显示名称</th>
                    <th width="20%">适用对象</th>
                    <th width="15%">参数占位</th>
                    <th width="10%">默认状态</th>
                    <th width="30%">说明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>T001</td>
                    <td>免费</td>
                    <td>题/卷/章/科</td>
                    <td>-</td>
                    <td>启用</td>
                    <td>无需任何权限,所有用户可访问</td>
                  </tr>
                  <tr>
                    <td>T002</td>
                    <td>章节通票</td>
                    <td>题/章</td>
                    <td>{CHAPTER}</td>
                    <td>启用</td>
                    <td>需购买本章节通票</td>
                  </tr>
                  <tr>
                    <td>T003</td>
                    <td>VIP及以上</td>
                    <td>题/卷/章/科</td>
                    <td>{TIER=VIP}</td>
                    <td>启用</td>
                    <td>全站会员等级 ≥ VIP</td>
                  </tr>
                  <tr>
                    <td>T004</td>
                    <td>SVIP及以上</td>
                    <td>题/卷/章/科</td>
                    <td>{TIER=SVIP}</td>
                    <td>启用</td>
                    <td>全站会员等级 ≥ SVIP</td>
                  </tr>
                  <tr>
                    <td>T005</td>
                    <td>章节通票 或 VIP</td>
                    <td>题/章</td>
                    <td>{CHAPTER},{VIP}</td>
                    <td>启用</td>
                    <td>本章节通票或VIP会员任一满足</td>
                  </tr>
                  <tr>
                    <td>T006</td>
                    <td>试卷专属票</td>
                    <td>卷</td>
                    <td>{PAPER}</td>
                    <td>启用</td>
                    <td>购买本试卷即可作答</td>
                  </tr>
                  <tr>
                    <td>T007</td>
                    <td>课程视频票</td>
                    <td>(预留)</td>
                    <td>{COURSE}</td>
                    <td>禁用</td>
                    <td>购买本课程即可观看(预留)</td>
                  </tr>
                  <tr>
                    <td>T008</td>
                    <td>学科VIP(局部)</td>
                    <td>题/章</td>
                    <td>{PROJECT},{SUBJECT}</td>
                    <td>禁用</td>
                    <td>仅在某项目/科目下 ≥ VIP(可选上线)</td>
                  </tr>
                  <tr>
                    <td>T009</td>
                    <td>试看N题</td>
                    <td>题/卷</td>
                    <td>{FREE_TRY=N}</td>
                    <td>启用</td>
                    <td>可先做N题,后续需权限</td>
                  </tr>
                  <tr>
                    <td>T010</td>
                    <td>限时开放</td>
                    <td>题/卷/章/科</td>
                    <td>{START},{END}</td>
                    <td>启用</td>
                    <td>在时间窗口内开放</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section class="data-constraints">
              <h3>字段约束</h3>
              <table class="constraint-table">
                <thead>
                  <tr>
                    <th width="20%">字段</th>
                    <th width="15%">类型</th>
                    <th width="15%">约束</th>
                    <th width="50%">说明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>模板编码</td>
                    <td>String</td>
                    <td>只读,全局唯一</td>
                    <td>格式:T001-T010,系统预设不可修改</td>
                  </tr>
                  <tr>
                    <td>显示名称</td>
                    <td>String</td>
                    <td>只读</td>
                    <td>1-20字符,如"免费"、"VIP及以上"</td>
                  </tr>
                  <tr>
                    <td>适用对象</td>
                    <td>Array&lt;String&gt;</td>
                    <td>只读</td>
                    <td>可选值:question/exam/chapter/subject,标注模板可用于哪些类型的内容</td>
                  </tr>
                  <tr>
                    <td>参数占位符</td>
                    <td>String</td>
                    <td>只读</td>
                    <td>如"{CHAPTER}"、"{FREE_TRY=N}",用于说明所需参数</td>
                  </tr>
                  <tr>
                    <td>说明</td>
                    <td>String</td>
                    <td>只读</td>
                    <td>1-200字符,人类可读的规则说明</td>
                  </tr>
                  <tr>
                    <td>启用状态</td>
                    <td>Enum</td>
                    <td>active/disabled</td>
                    <td>可编辑,禁用后不在下拉选项中显示</td>
                  </tr>
                  <tr>
                    <td>排序值</td>
                    <td>Number</td>
                    <td>1-999,正整数</td>
                    <td>可编辑,值越大越靠前,默认10-100</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section class="acceptance-criteria">
              <h3>验收标准</h3>
              <table class="acceptance-criteria">
                <thead>
                  <tr>
                    <th width="5%">#</th>
                    <th width="30%">测试场景</th>
                    <th width="35%">操作步骤</th>
                    <th width="30%">预期结果</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>查看模板列表</td>
                    <td>打开收费规则管理页面</td>
                    <td>显示10条收费规则,按排序值降序排列,包含所有必要字段</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>禁用模板</td>
                    <td>点击"学科VIP"规则的"禁用"按钮</td>
                    <td>状态标签变为灰色"禁用",试题编辑页的规则下拉选项中不再显示该规则</td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>启用模板</td>
                    <td>点击已禁用规则的"启用"按钮</td>
                    <td>状态标签变为绿色"启用",试题编辑页的规则下拉选项中重新显示该规则</td>
                  </tr>
                  <tr>
                    <td>4</td>
                    <td>修改排序</td>
                    <td>编辑"免费"规则,将排序值从100改为50,保存</td>
                    <td>列表自动重新排序,"免费"规则的显示位置发生变化</td>
                  </tr>
                  <tr>
                    <td>5</td>
                    <td>只读字段保护</td>
                    <td>尝试编辑模板的显示名称或适用对象</td>
                    <td>编辑弹窗中这些字段为只读状态或不可编辑</td>
                  </tr>
                  <tr>
                    <td>6</td>
                    <td>状态持久化</td>
                    <td>禁用一个规则后,刷新页面</td>
                    <td>规则的禁用状态保持,不会恢复为启用</td>
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
            <h2>查看完整设计规范</h2>
            <p>完整的设计系统、组件库和样式指南已统一整合到设计规范页面，确保全站视觉一致性。</p>
            <router-link to="/design-guidelines" class="view-guidelines-btn">
              前往设计规范页面 →
            </router-link>
          </div>
        </div>
      </template>
    </TabNavigation>

    <!-- 编辑弹窗 -->
    <EditRuleTemplateModal
      v-if="editModalVisible"
      :visible="editModalVisible"
      :template="currentTemplate"
      @update:visible="editModalVisible = $event"
      @submit="handleEditTemplate"
    />

    <!-- Toast 提示 -->
    <Toast :visible="toastVisible" :message="toastMessage" :type="toastType" />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePaymentRuleStore } from '@/stores/paymentRule'
import { useToast } from '@/composables/useToast'
import type { PaymentRule } from '@/views/payment-rule-management/types'
import AppLayout from '@/components/Layout/AppLayout.vue'
import TabNavigation from '@/components/Tab/TabNavigation.vue'
import RuleTemplateTable from './components/RuleTemplateTable.vue'
import EditRuleTemplateModal from './components/EditRuleTemplateModal.vue'
import Toast from '@/components/Feedback/Toast.vue'

const ruleStore = usePaymentRuleStore()
const { toastVisible, toastMessage, toastType, showToast } = useToast()

const tabs = [
  { key: 'prototype', label: '原型展示', icon: '🎨' },
  { key: 'requirements', label: '需求文档', icon: '📋' },
  { key: 'style-guide', label: '样式指南', icon: '🎯' }
]

// 编辑弹窗相关
const editModalVisible = ref(false)
const currentTemplate = ref<PaymentRule | null>(null)

/**
 * 打开编辑弹窗
 */
function openEditModal(template: PaymentRule) {
  currentTemplate.value = template
  editModalVisible.value = true
}

/**
 * 处理编辑模板
 */
function handleEditTemplate(data: { order: number }) {
  try {
    if (!currentTemplate.value) return

    ruleStore.updateRuleOrder(currentTemplate.value.id, data.order)
    showToast('排序更新成功')
    editModalVisible.value = false
  } catch (error) {
    showToast(error instanceof Error ? error.message : '排序更新失败', { type: 'error' })
  }
}

/**
 * 处理切换状态
 */
function handleToggleStatus(template: PaymentRule) {
  try {
    ruleStore.toggleRuleStatus(template.id)
    const newStatus = template.status === 'active' ? '禁用' : '启用'
    showToast(`已${newStatus}收费规则`)
  } catch (error) {
    showToast(error instanceof Error ? error.message : '状态切换失败', { type: 'error' })
  }
}
</script>

<style scoped>
.tab-panel {
  padding: 24px;
  background-color: var(--panel-bg);
  min-height: calc(100vh - 120px);
}

.prototype-wrapper {
  max-width: 1400px;
  margin: 0 auto;
}

/* 需求文档样式 */
.requirements-header {
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--panel-border);
}

.requirements-header h2 {
  color: var(--primary-text);
  font-size: 28px;
  margin-bottom: 8px;
}

.requirements-header p {
  color: var(--secondary-text);
  font-size: 16px;
  line-height: 1.6;
}

.requirements-content {
  max-width: 1200px;
}

.requirements-content section {
  margin-bottom: 48px;
}

.requirements-content h3 {
  color: var(--primary-text);
  font-size: 24px;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--accent);
}

.requirement-section {
  margin-bottom: 32px;
}

.requirement-section h4 {
  color: var(--primary-text);
  font-size: 18px;
  margin-bottom: 16px;
}

.requirement-section ul {
  list-style: none;
  padding-left: 0;
}

.requirement-section ul li {
  color: var(--secondary-text);
  font-size: 15px;
  line-height: 1.8;
  margin-bottom: 12px;
  padding-left: 24px;
  position: relative;
}

.requirement-section ul li::before {
  content: '•';
  color: var(--accent);
  font-weight: bold;
  position: absolute;
  left: 8px;
}

.requirement-section ul li strong {
  color: var(--primary-text);
  font-weight: 600;
}

/* 表格样式 */
.spec-table,
.constraint-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.spec-table thead,
.constraint-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.spec-table th,
.constraint-table th {
  color: #ffffff;
  font-weight: 600;
  text-align: left;
  padding: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 13px;
}

.spec-table tbody tr,
.constraint-table tbody tr {
  border-bottom: 1px solid var(--table-border);
  transition: background-color 0.2s ease;
}

.spec-table tbody tr:hover,
.constraint-table tbody tr:hover {
  background-color: var(--row-hover);
}

.spec-table td,
.constraint-table td {
  padding: 14px 16px;
  color: var(--secondary-text);
  font-size: 14px;
  line-height: 1.6;
}

.acceptance-criteria {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.acceptance-criteria thead {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.acceptance-criteria th {
  color: #ffffff;
  font-weight: 600;
  text-align: left;
  padding: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 13px;
}

.acceptance-criteria tbody tr {
  border-bottom: 1px solid var(--table-border);
  transition: background-color 0.2s ease;
}

.acceptance-criteria tbody tr:hover {
  background-color: var(--row-hover);
}

.acceptance-criteria td {
  padding: 14px 16px;
  color: var(--secondary-text);
  font-size: 14px;
  line-height: 1.6;
}

/* 样式指南样式 */
.style-guide-header {
  text-align: center;
  padding: 80px 24px;
}

.style-guide-header h2 {
  color: var(--primary-text);
  font-size: 32px;
  margin-bottom: 16px;
}

.style-guide-header p {
  color: var(--secondary-text);
  font-size: 18px;
  margin-bottom: 32px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.view-guidelines-btn {
  display: inline-block;
  padding: 14px 32px;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
}

.view-guidelines-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 102, 204, 0.4);
}
</style>
