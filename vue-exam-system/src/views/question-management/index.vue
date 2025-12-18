<template>
  <AppLayout title="题库系统 - 试题管理">
    <TabNavigation :tabs="tabs" :default-tab="'prototype'">
      <!-- 原型展示标签页 -->
      <template #prototype>
        <div class="tab-panel">
          <div class="prototype-wrapper">
            <div class="question-management-container">
              <!-- 树形导航面板 -->
              <SubjectTree 
                @filter-change="handleFilterChange" 
                :filter="filter"
                v-model:active-node-id="activeNodeId"
              />
              
              <!-- 主内容区: 筛选器 + 操作按钮 + 表格 -->
              <div class="main-content">
                <!-- 筛选器 -->
                <QuestionFilter
                  v-model="filter"
                  @search="handleSearch"
                  @reset="handleReset"
                />

                <!-- 操作按钮区 -->
                <div class="action-bar">
                  <div class="action-left">
                    <button class="btn primary" @click="handleAdd">
                      ➕ 添加试题
                    </button>
                    <button class="btn secondary" @click="handleIntelligentInput">
                      🤖 智能录题
                    </button>
                    <button
                      class="btn warning"
                      :disabled="selectedIds.length === 0"
                      @click="handleBatchDisable"
                    >
                      🚫 批量禁用
                    </button>
                    <button
                      class="btn danger"
                      :disabled="selectedIds.length === 0"
                      @click="handleBatchDelete"
                    >
                      🗑️ 批量删除
                    </button>
                    <button class="btn secondary" @click="toggleViewMode">
                      {{ viewMode === 'table' ? '📋 预览模式' : '📊 表格模式' }}
                    </button>
                  </div>
                  <div class="action-right">
                    <span class="selection-count">
                      已选中 {{ selectedIds.length }} 项
                    </span>
                  </div>
                </div>

                <!-- 试题表格 -->
                <QuestionTable
                  v-if="viewMode === 'table'"
                  :questions="paginatedData.data"
                  v-model:selectedIds="selectedIds"
                  @edit="handleEdit"
                  @delete="handleDeleteSingle"
                  @toggle-status="handleToggleStatus"
                />

                <!-- 试题预览 -->
                <QuestionPreview
                  v-else
                  :questions="paginatedData.data"
                  @edit="handleEdit"
                  @delete="handleDeleteSingle"
                />

                <!-- 分页器 -->
                <div v-if="paginatedData.total > 0" class="pagination">
                  <div class="pagination-info">
                    共 {{ paginatedData.total }} 条记录，第 {{ paginatedData.currentPage }} / {{ paginatedData.totalPages }} 页
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
        </div>
      </template>

      <!-- 需求文档标签页 -->
      <template #requirements>
        <div class="tab-panel">
          <div class="requirements-header">
            <h2> 试题管理需求文档</h2>
            <p>详细的功能需求、业务规则和验收标准，确保试题管理模块实现标准化。</p>
          </div>

          <div class="requirements-content">
            <section class="business-requirements">
              <h3>业务需求</h3>
              <div class="requirement-section">
                <h4>核心目标</h4>
                <ul>
                  <li>提供高效的试题录入、编辑、查询和管理功能</li>
                  <li>支持 5 种题型(单选、多选、判断、简答、组合题)的全生命周期管理</li>
                  <li>确保试题数据的完整性、唯一性和可追溯性</li>
                  <li>提供灵活的筛选和分页功能,满足海量试题的管理需求</li>
                  <li>支持试题的状态管理(启用/禁用),灵活控制试题的可用性</li>
                  <li>提供表格模式和预览模式,满足不同场景的查看需求</li>
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
                    <td>点击科目加载该科目下的试题列表,当前选中科目高亮</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>试题筛选</td>
                    <td>支持 7 个维度的筛选条件</td>
                    <td>筛选项包括:试题来源、年份、知识点、题型、试题难度、试题级别、收费规则;支持重置</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>试题列表</td>
                    <td>表格展示试题摘要信息</td>
                    <td>包含选择框、题干内容(截取前50字)、题型、关联章节、关联知识点、试题难度、收费规则、操作时间、操作人、操作列</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>添加试题</td>
                    <td>【添加试题】按钮跳转到录题页面</td>
                    <td>支持 5 种题型的完整录入(单选、多选、判断、简答、组合题),包括题干、选项、答案、解析等必填字段</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>编辑试题</td>
                    <td>点击【编辑】按钮跳转到编辑页面</td>
                    <td>预填现有数据,允许修改所有字段,执行唯一性校验</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>查看详情</td>
                    <td>点击【详情】按钮弹出详情弹窗</td>
                    <td>展示试题完整信息,包括基本信息、题干、选项、答案、解析、元数据</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>删除试题</td>
                    <td>单个删除和批量删除</td>
                    <td>单个删除:点击【删除】按钮,二次确认后删除;批量删除:选中多个试题后点击【批量删除】</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>分页功能</td>
                    <td>支持分页浏览试题列表</td>
                    <td>显示总记录数、当前页/总页数、上一页/下一页按钮、页码跳转、每页条数切换(10/20/50)</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>智能录题</td>
                    <td>【智能录题】按钮触发AI辅助录入</td>
                    <td>支持文本识别、批量导入、自动解析等功能(预留)</td>
                    <td>P2</td>
                  </tr>
                  <tr>
                    <td>试题唯一性</td>
                    <td>同科目同章节下题干内容唯一</td>
                    <td>添加/编辑时校验题干是否重复,重复则提示"该题干已存在"</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>视图模式切换</td>
                    <td>支持表格模式和预览模式切换</td>
                    <td>表格模式:紧凑展示,适合快速浏览和批量操作;预览模式:完整展示试题内容,适合审核和详细查看</td>
                    <td>P1</td>
                  </tr>
                  <tr>
                    <td>试题状态管理</td>
                    <td>支持启用/禁用状态切换</td>
                    <td>禁用后试题在组卷时不可选,但仍可在管理页面查询和编辑;表格中提供状态切换按钮</td>
                    <td>P1</td>
                  </tr>
                  <tr>
                    <td>知识点筛选联动</td>
                    <td>筛选器知识点下拉根据科目动态加载</td>
                    <td>选择科目后自动加载该科目的知识点列表;未选科目时禁用知识点筛选;知识点从 knowledgePointStore 动态获取</td>
                    <td>P1</td>
                  </tr>
                  <tr>
                    <td>收费规则筛选</td>
                    <td>支持按收费规则筛选试题</td>
                    <td>筛选器提供免费/基础/高级三档收费规则选项;用于会员内容管理和权限控制</td>
                    <td>P1</td>
                  </tr>
                  <tr>
                    <td>批量选择</td>
                    <td>支持通过复选框批量选择试题</td>
                    <td>勾选表头复选框全选当前页;单独勾选某行选中该试题;已选数量显示在操作栏右侧</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>操作记录跟踪</td>
                    <td>记录试题的操作人和操作时间</td>
                    <td>创建和编辑时自动记录当前登录用户ID和操作时间</td>
                    <td>P1</td>
                  </tr>
                  <tr>
                    <td>试题来源标签显示</td>
                    <td>在试题列表中显示试题来源标签</td>
                    <td>若试题来源为试卷,则显示蓝色"来源:XXX试卷"标签;鼠标悬停显示来源试卷详细信息;来源标签显示在题干右侧</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>软删除操作</td>
                    <td>支持将试题标记为已删除而不是物理删除</td>
                    <td>点击删除按钮后,试题状态变为deleted,仍可查询;已删除试题在列表中默认不显示,可通过筛选器查看;提供恢复功能</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>标记过时操作</td>
                    <td>支持将试题标记为已过时</td>
                    <td>表格操作列提供"标记过时"按钮;点击后试题状态变为deprecated;已过时试题仍可在组卷时选择,但有警告提示</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>状态标签显示</td>
                    <td>在试题列表中显示试题状态标签</td>
                    <td>已删除试题显示红色"已删除"标签;已过时试题显示黄色"已过时"标签;禁用试题显示灰色"已禁用"标签;状态标签显示在题干右侧</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>恢复已删除试题</td>
                    <td>支持恢复被软删除的试题</td>
                    <td>在已删除试题列表中,操作列提供"恢复"按钮;点击后试题状态恢复为active;Toast提示"试题已恢复"</td>
                    <td>P1</td>
                  </tr>
                  <tr>
                    <td>取消过时标记</td>
                    <td>支持取消试题的过时标记</td>
                    <td>在已过时试题列表中,操作列提供"取消过时"按钮;点击后试题状态恢复为active;Toast提示"已取消过时标记"</td>
                    <td>P1</td>
                  </tr>
                </tbody>
              </table>

              <h4 style="margin-top: 48px; font-size: 18px; font-weight: 600; color: var(--accent);">访问控制业务需求</h4>

              <div class="requirement-section" style="margin-top: 24px;">
                <h4>核心目标</h4>
                <ul>
                  <li>为试题资源提供灵活的访问控制机制,支持免费、付费、VIP等多种权限模式</li>
                  <li>通过收费规则实现标准化的权限管理,降低配置复杂度</li>
                  <li>支持单个试题编辑和批量试题的访问规则设置,提升运营效率</li>
                  <li>确保访问规则配置的一致性和可维护性</li>
                </ul>
              </div>

              <div class="requirement-section">
                <h4>用户场景</h4>
                <ul>
                  <li><strong>场景1 - 新试题录入:</strong> 教研人员在添加试题时,需要设置该试题的访问规则,例如设置为"免费"让所有用户可访问,或设置为"VIP及以上"限制给付费用户</li>
                  <li><strong>场景2 - 试题编辑:</strong> 运营人员在编辑试题时,可以修改访问规则,例如将原本免费的试题升级为"VIP及以上",或者设置"试看N题"让前3道免费</li>
                  <li><strong>场景3 - 批量设置:</strong> 运营人员需要将某个章节下的50道试题统一设置为"章节通票",通过批量操作一次性完成配置</li>
                  <li><strong>场景4 - 限时开放:</strong> 为配合营销活动,运营人员需要将部分高级试题设置为"限时开放",在指定时间段内免费访问</li>
                </ul>
              </div>

              <div class="requirement-section">
                <h4>业务规则</h4>
                <ul>
                  <li><strong>默认规则:</strong> 新创建的试题默认访问规则为"免费"(T001),所有用户均可访问</li>
                  <li><strong>规则优先级:</strong> 试题自身的访问规则优先级最高,不受章节或科目规则影响</li>
                  <li><strong>参数必填性:</strong> 选择需要参数的收费规则时,相关参数字段必须填写,例如选择"章节通票"必须指定章节ID</li>
                  <li><strong>批量操作约束:</strong> 批量设置访问规则时,如果某些试题已被试卷引用,仍可正常修改其访问规则(不影响已发布的试卷)</li>
                  <li><strong>规则变更影响:</strong> 修改试题访问规则后,立即生效,影响学员端的访问权限判断</li>
                </ul>
              </div>

              <h4 style="margin-top: 48px; font-size: 16px; font-weight: 600; color: var(--accent);">访问控制功能规格</h4>
              <table class="spec-table" style="margin-top: 16px;">
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
                    <td>试题编辑页-规则选择器</td>
                    <td>在试题编辑页面提供访问规则选择组件</td>
                    <td>包含收费规则下拉框和动态参数输入框;下拉框显示适用于试题的收费规则(从收费规则管理获取);选择模板后,动态显示对应的参数输入框</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>收费规则下拉框</td>
                    <td>展示所有适用于试题的收费规则</td>
                    <td>下拉选项格式: "T001 - 免费"; 仅显示 applicableTo 包含 'question' 且 status 为 'active' 的模板; 按 order 字段降序排列</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>动态参数输入</td>
                    <td>根据选择的收费规则,动态显示参数输入框</td>
                    <td>T002(章节通票): 显示章节选择下拉框; T006(试卷专属票): 显示试卷选择下拉框; T009(试看N题): 显示试看题数输入框; T010(限时开放): 显示开始时间和结束时间选择器; 其他模板: 不显示参数输入</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>参数必填校验</td>
                    <td>保存试题时校验参数完整性</td>
                    <td>如果选择了需要参数的收费规则,但未填写参数,提示"请填写完整的访问规则参数";校验通过后才允许保存</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>批量设置访问规则</td>
                    <td>支持对多个试题批量设置访问规则</td>
                    <td>在试题管理列表页,勾选多个试题后,点击【批量设置访问规则】按钮;弹出访问规则选择对话框,选择收费规则和填写参数;确认后批量更新选中试题的访问规则</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>批量操作确认</td>
                    <td>批量设置前显示影响范围</td>
                    <td>弹窗顶部显示"将对 N 道试题设置访问规则";确认按钮文案为"确认设置 (N道)";取消按钮为"取消"</td>
                    <td>P1</td>
                  </tr>
                  <tr>
                    <td>访问规则显示</td>
                    <td>在试题列表中显示访问规则信息</td>
                    <td>列表新增"访问规则"列,显示收费规则的 displayName,如"免费"、"VIP及以上";鼠标悬停显示完整规则信息(包含参数)</td>
                    <td>P1</td>
                  </tr>
                  <tr>
                    <td>规则参数回显</td>
                    <td>编辑试题时正确回显已设置的访问规则</td>
                    <td>收费规则下拉框选中当前规则;参数输入框填充已保存的参数值;章节/试卷下拉框回显对应的名称</td>
                    <td>P0</td>
                  </tr>
                </tbody>
              </table>

              <h4 style="margin-top: 48px; font-size: 16px; font-weight: 600; color: var(--accent);">访问规则原型描述</h4>

              <div class="prototype-description" style="margin-top: 16px; padding: 20px; background: #f8fafc; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.8;">
                <strong style="color: var(--accent);">【试题编辑页 - 访问控制区域】</strong><br/><br/>

                ┌─────────────────────────────────────────────────────────┐<br/>
                │ <strong>访问控制设置</strong>                                          │<br/>
                ├─────────────────────────────────────────────────────────┤<br/>
                │                                                         │<br/>
                │  收费规则: ┌──────────────────────────────┐ [*必填] │<br/>
                │                │ T001 - 免费              ▼  │         │<br/>
                │                └──────────────────────────────┘         │<br/>
                │                                                         │<br/>
                │  <em style="color: #666;">(当选择 T002 - 章节通票时)</em>                       │<br/>
                │  所属章节:     ┌──────────────────────────────┐         │<br/>
                │                │ 第一章 - 财务战略基础    ▼  │         │<br/>
                │                └──────────────────────────────┘         │<br/>
                │                                                         │<br/>
                │  <em style="color: #666;">(当选择 T009 - 试看N题时)</em>                        │<br/>
                │  试看题数:     ┌──────────┐ 道                         │<br/>
                │                │    3     │                             │<br/>
                │                └──────────┘                             │<br/>
                │                                                         │<br/>
                │  <em style="color: #666;">(当选择 T010 - 限时开放时)</em>                        │<br/>
                │  开始时间:     ┌────────────────────┐                   │<br/>
                │                │ 2025-01-01 00:00  │ 📅               │<br/>
                │                └────────────────────┘                   │<br/>
                │  结束时间:     ┌────────────────────┐                   │<br/>
                │                │ 2025-12-31 23:59  │ 📅               │<br/>
                │                └────────────────────┘                   │<br/>
                │                                                         │<br/>
                └─────────────────────────────────────────────────────────┘<br/><br/>

                <strong style="color: var(--accent);">【试题管理列表页 - 批量设置访问规则】</strong><br/><br/>

                ┌─────────────────────────────────────────────────────────┐<br/>
                │ 操作栏:                                                 │<br/>
                │  [➕ 添加试题] [🤖 智能录题] [🗑️ 批量删除]              │<br/>
                │  <strong>[🔐 批量设置访问规则]</strong> (已选中 5 项)                 │<br/>
                └─────────────────────────────────────────────────────────┘<br/><br/>

                <strong style="color: var(--accent);">【批量设置访问规则弹窗】</strong><br/><br/>

                ┌─────────────────────────────────────────────────────────┐<br/>
                │                批量设置访问规则                         │<br/>
                │                                                         │<br/>
                │  将对 <strong>5</strong> 道试题设置访问规则                           │<br/>
                ├─────────────────────────────────────────────────────────┤<br/>
                │                                                         │<br/>
                │  收费规则: ┌──────────────────────────────┐         │<br/>
                │                │ T003 - VIP及以上         ▼  │         │<br/>
                │                └──────────────────────────────┘         │<br/>
                │                                                         │<br/>
                │  <em style="color: #666;">(根据选择的规则动态显示参数输入框)</em>              │<br/>
                │                                                         │<br/>
                │                        [取消]  [确认设置 (5道)]         │<br/>
                └─────────────────────────────────────────────────────────┘<br/><br/>

                <strong style="color: var(--accent);">【试题列表显示访问规则】</strong><br/><br/>

                ┌──────┬──────────────┬────────┬────────┬────────────┐<br/>
                │ 选择 │ 题干内容     │ 题型   │ 难度   │ 访问规则   │<br/>
                ├──────┼──────────────┼────────┼────────┼────────────┤<br/>
                │  ☑   │ 某企业2023.. │ 单选题 │ 中等   │ 免费       │<br/>
                │  ☐   │ 下列关于财.. │ 多选题 │ 困难   │ VIP及以上  │<br/>
                │  ☐   │ 财务报表分.. │ 判断题 │ 简单   │ 章节通票   │<br/>
                └──────┴──────────────┴────────┴────────┴────────────┘<br/>
                       <em style="color: #666;">↑ 鼠标悬停显示详细参数信息</em>
              </div>

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
                    <td>题干内容</td>
                    <td>String</td>
                    <td>1-5000字符</td>
                    <td>✓</td>
                    <td>科目+章节内唯一</td>
                    <td>无</td>
                    <td>支持富文本(预留)</td>
                  </tr>
                  <tr>
                    <td>题型</td>
                    <td>Enum</td>
                    <td>5种题型</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>无</td>
                    <td><strong>仅支持:</strong> single/multiple/judgment/essay/combination <br/><strong>不支持 uncertain (不定项)</strong></td>
                  </tr>
                  <tr>
                    <td>试题来源</td>
                    <td>Enum</td>
                    <td>3种来源</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>official</td>
                    <td>official/simulation/custom</td>
                  </tr>
                  <tr>
                    <td>所属年份</td>
                    <td>String</td>
                    <td>4位数字</td>
                    <td>×</td>
                    <td>无</td>
                    <td>当前年份</td>
                    <td>格式: YYYY</td>
                  </tr>
                  <tr>
                    <td>试题级别</td>
                    <td>Enum</td>
                    <td>3种级别</td>
                    <td>×</td>
                    <td>无</td>
                    <td>basic</td>
                    <td>basic/intermediate/advanced</td>
                  </tr>
                  <tr>
                    <td>试题难度</td>
                    <td>Enum</td>
                    <td>3种难度</td>
                    <td>×</td>
                    <td>无</td>
                    <td>easy</td>
                    <td>easy/medium/hard</td>
                  </tr>
                  <tr style="background: #fff8dc;">
                    <td><strong>收费规则ID</strong></td>
                    <td>String</td>
                    <td>收费规则ID</td>
                    <td>×</td>
                    <td>无</td>
                    <td>t001</td>
                    <td>从收费规则管理选择，默认"免费"(t001)；仅显示 applicableTo 包含 'question' 且状态为 'active' 的规则</td>
                  </tr>
                  <tr>
                    <td>选项内容</td>
                    <td>String</td>
                    <td>1-500字符/选项</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>无</td>
                    <td>客观题2-10个选项</td>
                  </tr>
                  <tr>
                    <td>试题解析</td>
                    <td>String</td>
                    <td>1-3000字符</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>无</td>
                    <td>建议包含解题思路</td>
                  </tr>
                  <tr>
                    <td>案例背景</td>
                    <td>String</td>
                    <td>1-5000字符</td>
                    <td>×</td>
                    <td>无</td>
                    <td>无</td>
                    <td>仅组合题必填</td>
                  </tr>
                  <tr>
                    <td>小问数量</td>
                    <td>Integer</td>
                    <td>≥1</td>
                    <td>×</td>
                    <td>无</td>
                    <td>无</td>
                    <td>仅组合题,建议3-8个</td>
                  </tr>
                  <tr>
                    <td>知识点关联</td>
                    <td>Array</td>
                    <td>0-N个</td>
                    <td>×</td>
                    <td>无</td>
                    <td>[]</td>
                    <td>支持多知识点关联;优先选择同科目知识点;支持跨科目关联(不推荐)</td>
                  </tr>
                  <tr>
                    <td>试题状态</td>
                    <td>Enum</td>
                    <td>4种状态</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>active</td>
                    <td>active(启用) / disabled(禁用) / deleted(已删除) / deprecated(已过时);已删除和已过时试题默认不显示,可通过筛选器查看</td>
                  </tr>
                  <tr>
                    <td>试题来源类型</td>
                    <td>Enum</td>
                    <td>2种来源</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>library</td>
                    <td>library(题库录入) / exam(试卷同步);试卷同步的试题会显示来源标签</td>
                  </tr>
                  <tr>
                    <td>来源试卷ID</td>
                    <td>String</td>
                    <td>试卷ID</td>
                    <td>×</td>
                    <td>无</td>
                    <td>null</td>
                    <td>仅当来源类型为exam时有值;记录试题来源于哪张试卷</td>
                  </tr>
                  <tr>
                    <td>删除时间</td>
                    <td>DateTime</td>
                    <td>ISO 8601格式</td>
                    <td>×</td>
                    <td>无</td>
                    <td>null</td>
                    <td>仅当状态为deleted时有值;记录软删除时间</td>
                  </tr>
                  <tr>
                    <td>标记过时时间</td>
                    <td>DateTime</td>
                    <td>ISO 8601格式</td>
                    <td>×</td>
                    <td>无</td>
                    <td>null</td>
                    <td>仅当状态为deprecated时有值;记录标记过时的时间</td>
                  </tr>
                  <tr style="background: #fff8dc;">
                    <td><strong>收费规则ID</strong></td>
                    <td>String</td>
                    <td>收费规则ID</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>t001</td>
                    <td>从收费规则管理选择,默认"免费"(t001);仅显示 applicableTo 包含 'question' 且状态为 'active' 的模板</td>
                  </tr>
                  <tr style="background: #fff8dc;">
                    <td><strong>访问规则参数</strong></td>
                    <td>Object</td>
                    <td>视规则而定</td>
                    <td>视规则而定</td>
                    <td>无</td>
                    <td>{}</td>
                    <td><strong>T002:</strong> chapterId (必填); <strong>T006:</strong> examId (必填); <strong>T009:</strong> trialCount (必填,≥1); <strong>T010:</strong> startTime + endTime (必填,结束时间&gt;开始时间)</td>
                  </tr>
                </tbody>
              </table>

              <h4 style="margin-top: 48px; font-size: 16px; font-weight: 600; color: var(--accent);">访问控制验收标准</h4>
              <div class="acceptance-criteria" style="margin-top: 16px;">
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
                      <td>AC-A01</td>
                      <td>用户在试题编辑页面,收费规则选择"T001 - 免费"</td>
                      <td>保存试题</td>
                      <td>试题保存成功,paymentRuleId 为 't001',无需填写参数</td>
                    </tr>
                    <tr>
                      <td>AC-A02</td>
                      <td>用户在试题编辑页面,选择"T002 - 章节通票"</td>
                      <td>未填写章节ID,点击保存</td>
                      <td>系统提示"请填写完整的访问规则参数",拒绝保存,焦点定位到章节选择下拉框</td>
                    </tr>
                    <tr>
                      <td>AC-A03</td>
                      <td>用户在试题编辑页面,选择"T002 - 章节通票"并选择"第一章"</td>
                      <td>点击保存</td>
                      <td>试题保存成功,paymentRuleId 为 't002',paymentRuleParams.chapterId 为选中章节的ID</td>
                    </tr>
                    <tr>
                      <td>AC-A04</td>
                      <td>用户在试题编辑页面,选择"T009 - 试看N题"</td>
                      <td>输入试看题数"3",点击保存</td>
                      <td>试题保存成功,paymentRuleParams.trialCount 为 3</td>
                    </tr>
                    <tr>
                      <td>AC-A05</td>
                      <td>用户在试题编辑页面,选择"T010 - 限时开放"</td>
                      <td>设置开始时间"2025-01-01 00:00",结束时间"2025-01-01 00:00"(相等),点击保存</td>
                      <td>系统提示"结束时间必须大于开始时间",拒绝保存</td>
                    </tr>
                    <tr>
                      <td>AC-A06</td>
                      <td>用户在试题管理列表页,勾选5道试题</td>
                      <td>点击【批量设置访问规则】按钮</td>
                      <td>弹出访问规则选择对话框,顶部显示"将对 5 道试题设置访问规则"</td>
                    </tr>
                    <tr>
                      <td>AC-A07</td>
                      <td>用户在批量设置对话框中选择"T003 - VIP及以上"</td>
                      <td>点击【确认设置 (5道)】按钮</td>
                      <td>批量更新成功,Toast提示"成功设置 5 道试题的访问规则",列表刷新,选中的5道试题的"访问规则"列显示"VIP及以上"</td>
                    </tr>
                    <tr>
                      <td>AC-A08</td>
                      <td>用户在试题列表中查看某道试题,访问规则为"章节通票"</td>
                      <td>鼠标悬停在"访问规则"列</td>
                      <td>显示Tooltip,内容为"章节通票 - 需购买: 第一章 财务战略基础"</td>
                    </tr>
                    <tr>
                      <td>AC-A09</td>
                      <td>用户编辑一道已设置"T002 - 章节通票(第一章)"的试题</td>
                      <td>打开编辑页</td>
                      <td>收费规则下拉框选中"T002 - 章节通票",章节下拉框显示"第一章 - 财务战略基础"</td>
                    </tr>
                    <tr>
                      <td>AC-A10</td>
                      <td>用户在批量设置对话框中选择"T009 - 试看N题"</td>
                      <td>未填写试看题数,点击【确认设置】</td>
                      <td>系统提示"请填写完整的访问规则参数",拒绝保存,焦点定位到试看题数输入框</td>
                    </tr>
                    <tr>
                      <td>AC-A11</td>
                      <td>收费规则管理中"T003 - VIP及以上"被禁用</td>
                      <td>用户打开试题编辑页的规则下拉框</td>
                      <td>下拉框中不显示"T003 - VIP及以上"选项</td>
                    </tr>
                    <tr>
                      <td>AC-A12</td>
                      <td>用户在试题列表筛选器中添加"访问规则"筛选项</td>
                      <td>选择"VIP及以上",点击搜索</td>
                      <td>列表仅显示访问规则为"VIP及以上"的试题</td>
                    </tr>
                  </tbody>
                </table>
              </div>

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
                      <td>用户在试题管理页面,左侧树选中"财务战略管理"科目</td>
                      <td>右侧加载该科目的试题列表</td>
                      <td>应展示该科目下所有试题,包括题干摘要、题型、章节等信息</td>
                    </tr>
                    <tr>
                      <td>AC-02</td>
                      <td>用户在筛选器中选择"试题来源=历年真题,年份=2024"</td>
                      <td>点击【搜索】按钮</td>
                      <td>列表应仅显示符合条件的试题,筛选条件保持选中状态</td>
                    </tr>
                    <tr>
                      <td>AC-03</td>
                      <td>用户点击【添加试题】按钮</td>
                      <td>跳转到试题录入页面,填写单选题信息并提交</td>
                      <td>系统验证通过,试题保存成功,返回列表页,Toast提示"试题添加成功"</td>
                    </tr>
                    <tr>
                      <td>AC-04</td>
                      <td>用户在试题列表中选中3条试题</td>
                      <td>点击【批量删除】按钮,确认删除</td>
                      <td>系统删除选中的3条试题,Toast提示"成功删除 3 道试题",列表刷新</td>
                    </tr>
                    <tr>
                      <td>AC-05</td>
                      <td>用户点击某道试题的【详情】按钮</td>
                      <td>详情弹窗打开</td>
                      <td>应展示试题完整信息,包括基本信息、题干、选项、答案、解析、操作时间(含时分秒)等</td>
                    </tr>
                    <tr>
                      <td>AC-06</td>
                      <td>用户点击某道试题的【编辑】按钮</td>
                      <td>跳转到试题编辑页面,修改题干内容并保存</td>
                      <td>系统验证通过,试题更新成功,Toast提示"试题编辑成功",列表刷新</td>
                    </tr>
                    <tr>
                      <td>AC-07</td>
                      <td>试题列表共50条数据,当前每页显示20条</td>
                      <td>用户点击第2页</td>
                      <td>列表应显示第21-40条数据,分页信息更新为"第 2 / 3 页"</td>
                    </tr>
                    <tr>
                      <td>AC-08</td>
                      <td>用户尝试添加题干内容与已有试题重复的单选题</td>
                      <td>点击保存</td>
                      <td>系统提示"该题干已存在,请修改后重试",拒绝保存</td>
                    </tr>
                    <tr>
                      <td>AC-09</td>
                      <td>用户在表格模式下点击【📋 预览模式】按钮</td>
                      <td>视图切换</td>
                      <td>应切换到预览模式,显示试题完整内容(题干、选项、答案、解析),按钮文字变为【📊 表格模式】</td>
                    </tr>
                    <tr>
                      <td>AC-10</td>
                      <td>用户在试题列表中勾选5道试题</td>
                      <td>点击【批量删除】按钮</td>
                      <td>弹出确认对话框"确认删除选中的 5 道试题?",确认后删除,Toast提示"成功删除 5 道试题"</td>
                    </tr>
                    <tr>
                      <td>AC-11</td>
                      <td>试题列表共100条数据,当前每页显示20条,用户在第3页</td>
                      <td>切换每页显示为50条</td>
                      <td>应重新加载数据,显示第1页,列表显示前50条数据</td>
                    </tr>
                    <tr>
                      <td>AC-12</td>
                      <td>用户在左侧树中点击"财务战略管理"科目</td>
                      <td>科目切换</td>
                      <td>右侧筛选器的科目自动设置为"财务战略管理",加载该科目下的所有试题,分页重置为第1页</td>
                    </tr>
                    <tr>
                      <td>AC-13</td>
                      <td>用户在筛选器中选择科目"财务战略管理"</td>
                      <td>知识点下拉框激活</td>
                      <td>知识点下拉框应自动加载并仅显示该科目下的知识点列表,如"会计核算基本前提"、"财务报表分析方法"等</td>
                    </tr>
                    <tr>
                      <td>AC-14</td>
                      <td>用户在添加试题页面输入题干"某企业2023年营业收入为5000万元..."</td>
                      <td>该题干已存在于同科目同章节,点击保存</td>
                      <td>系统应提示"该题干已存在,请修改后重试",拒绝保存,焦点定位到题干输入框</td>
                    </tr>
                    <tr>
                      <td>AC-15</td>
                      <td>用户在试题列表中点击某试题的【禁用】按钮</td>
                      <td>试题状态切换为 disabled</td>
                      <td>试题行显示灰色,状态标签变为"已禁用",该试题在组卷时不可选;按钮文字变为【启用】</td>
                    </tr>
                    <tr>
                      <td>AC-16</td>
                      <td>用户在筛选器中选择收费规则"高级"</td>
                      <td>点击搜索</td>
                      <td>列表应仅显示收费规则为 premium 的试题,筛选条件显示"收费规则: 高级"</td>
                    </tr>
                    <tr>
                      <td>AC-17</td>
                      <td>用户在试题列表中查看某道从试卷同步而来的试题</td>
                      <td>查看试题来源标签</td>
                      <td>题干右侧显示蓝色"来源:2024年财务战略管理期末考试"标签,鼠标悬停显示试卷详细信息(试卷ID、创建时间等)</td>
                    </tr>
                    <tr>
                      <td>AC-18</td>
                      <td>用户在试题列表中点击某道试题的【删除】按钮</td>
                      <td>确认软删除</td>
                      <td>试题状态变为deleted,列表中该试题消失,Toast提示"试题已删除",试题数据仍保留在数据库中</td>
                    </tr>
                    <tr>
                      <td>AC-19</td>
                      <td>用户在试题列表中点击某道试题的【标记过时】按钮</td>
                      <td>确认标记过时</td>
                      <td>试题状态变为deprecated,试题右侧显示黄色"已过时"标签,Toast提示"已标记为过时",试题仍可在组卷时选择但有警告</td>
                    </tr>
                    <tr>
                      <td>AC-20</td>
                      <td>用户在试题列表筛选器中选择状态"已删除"</td>
                      <td>查看已删除试题列表</td>
                      <td>列表显示所有已删除试题,每道试题右侧显示红色"已删除"标签,操作列提供【恢复】按钮</td>
                    </tr>
                    <tr>
                      <td>AC-21</td>
                      <td>用户在试题列表筛选器中选择状态"已过时"</td>
                      <td>查看已过时试题列表</td>
                      <td>列表显示所有已过时试题,每道试题右侧显示黄色"已过时"标签,操作列提供【取消过时】按钮</td>
                    </tr>
                    <tr>
                      <td>AC-22</td>
                      <td>用户在已删除试题列表中点击某道试题的【恢复】按钮</td>
                      <td>确认恢复</td>
                      <td>试题状态恢复为active,试题从已删除列表中消失,Toast提示"试题已恢复",试题重新出现在正常列表中</td>
                    </tr>
                    <tr>
                      <td>AC-23</td>
                      <td>用户在已过时试题列表中点击某道试题的【取消过时】按钮</td>
                      <td>确认取消过时标记</td>
                      <td>试题状态恢复为active,黄色"已过时"标签消失,Toast提示"已取消过时标记",试题恢复正常状态</td>
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

    <!-- 启用/禁用确认弹窗 -->
    <ToggleStatusConfirmModal
      v-if="showToggleStatusModal && toggleStatusTarget"
      :show="showToggleStatusModal"
      :item-name="toggleStatusTarget.name"
      :current-status="toggleStatusTarget.currentStatus"
      item-type="试题"
      @confirm="handleToggleStatusConfirm"
      @cancel="showToggleStatusModal = false"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/Layout/AppLayout.vue'
import TabNavigation from '@/components/Tab/TabNavigation.vue'
import QuestionFilter from './components/QuestionFilter.vue'
import QuestionTable from './components/QuestionTable.vue'
import QuestionPreview from './components/QuestionPreview.vue'
import DeleteConfirmModal from './components/DeleteConfirmModal.vue'
import ToggleStatusConfirmModal from '@/components/ToggleStatusConfirmModal.vue'
import SubjectTree from '@/views/question-management/components/SubjectTree.vue'
import { useQuestionStore } from '@/stores/question'
import { useChapterStore } from '@/stores/chapter'
import { useToast } from '@/composables/useToast'
import type { QuestionFilter as QuestionFilterType } from './types'

const router = useRouter()
const questionStore = useQuestionStore()
const chapterStore = useChapterStore()
const { showToast } = useToast()

// 标签页配置
const tabs = [
  { key: 'prototype', label: '原型展示', icon: '🎨' },
  { key: 'requirements', label: '需求文档', icon: '📋' },
  { key: 'style-guide', label: '样式指南', icon: '🎯' }
]

// 当前选中的科目
const activeSubject = ref<{ id: string; name: string } | null>(null)

// 当前显示选中背景的节点ID
const activeNodeId = ref<string>('')

// 筛选条件（默认只显示启用的试题）
const filter = ref<QuestionFilterType>({ status: 'active' })

// 分页参数
const currentPage = ref(1)
const pageSize = ref(20)

// 已选中的试题ID列表
const selectedIds = ref<string[]>([])

// 视图模式: table 表格模式 | preview 预览模式
const viewMode = ref<'table' | 'preview'>('table')

// 弹窗状态
const showDeleteModal = ref(false)
const isBatchDelete = ref(false)
const deleteTargetIds = ref<string[]>([])

// 启用/禁用确认弹窗
const showToggleStatusModal = ref(false)
const toggleStatusTarget = ref<{ id: string; name: string; currentStatus: 'active' | 'disabled' } | null>(null)

// 计算属性：分页数据
const paginatedData = computed(() => {
  return questionStore.getPaginatedQuestions(filter.value, currentPage.value, pageSize.value)
})

// 计算属性：可见页码
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
      pages.push(-1) // 省略号占位符
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

// 科目切换 - 目前未使用
function handleSubjectChange(subject: { id: string; name: string } | null) {
  activeSubject.value = subject
}

// 处理树形面板筛选变化
function handleFilterChange(filterState: any) {
  // 先保存当前状态，用于判断是否需要取消选中
  const currentFilter = { ...filter.value }
  let shouldUpdate = false
  
  // 判断当前节点是否已经被选中
  const currentNodeId = activeNodeId.value
  // 获取当前类型对应的ID键名（处理subsection的特殊情况）
  let currentTypeKey = ''
  if (filterState.type === 'subsection') {
    currentTypeKey = 'subSectionId'
  } else {
    currentTypeKey = filterState.type + 'Id'
  }
  const isCurrentlySelected = currentNodeId === filterState[currentTypeKey]
  
  if (isCurrentlySelected) {
    // 已经选中，取消选中
    activeNodeId.value = ''
    // 重置层级筛选条件，但保留其他筛选条件
    filter.value = {
      ...filter.value, // 保留原来的属性
      projectId: '',
      subjectId: '',
      chapterId: '',
      sectionId: '',
      subSectionId: '',
      paperId: ''
    }
    shouldUpdate = true
  } else {
    // 未选中，设置当前点击节点的选中状态
    // 将当前点击节点的ID保存到activeNodeId中
    activeNodeId.value = filterState[currentTypeKey]
    // 将完整的层级信息保存到filter对象中，用于添加页面跳转，保留其他筛选条件
    filter.value = {
      ...filter.value, // 保留原来的属性
      projectId: filterState.projectId || '',
      subjectId: filterState.subjectId || '',
      chapterId: filterState.chapterId || '',
      sectionId: filterState.sectionId || '',
      subSectionId: filterState.subSectionId || '',
      paperId: filterState.paperId || ''
    }
    shouldUpdate = true
  }
  
  // 只有当状态发生变化时，才重置分页和选择
  if (shouldUpdate) {
    currentPage.value = 1
    selectedIds.value = []
  }
}

// 搜索
function handleSearch() {
  currentPage.value = 1
  selectedIds.value = []
}

// 重置
function handleReset() {
  filter.value = activeSubject.value ? { subjectId: activeSubject.value.id, status: 'active' } : { status: 'active' }
  currentPage.value = 1
  selectedIds.value = []
}

// 添加试题
function handleAdd() {
  // 获取当前选中的完整层级信息
  const currentProjectId = filter.value.projectId || ''
  const currentSubjectId = filter.value.subjectId || ''
  const currentChapterId = filter.value.chapterId || ''
  const currentSectionId = filter.value.sectionId || ''
  const currentSubSectionId = filter.value.subSectionId || ''
  const currentPaperId = filter.value.paperId || ''
  
  // 构建路由参数，包含完整层级信息
  // 无论当前选中哪个层级，都将所有父级节点的ID添加到参数中
  const query: { 
    projectId?: string; 
    subjectId?: string; 
    chapterId?: string; 
    sectionId?: string; 
    subSectionId?: string; 
    paperId?: string 
  } = {}
  
  // 始终包含所有层级的ID，即使是父级节点
  if (currentProjectId) query.projectId = currentProjectId
  if (currentSubjectId) query.subjectId = currentSubjectId
  if (currentChapterId) query.chapterId = currentChapterId
  if (currentSectionId) query.sectionId = currentSectionId
  if (currentSubSectionId) query.subSectionId = currentSubSectionId
  if (currentPaperId) query.paperId = currentPaperId
  
  router.push({
    path: '/question-management/add',
    query
  })
}

// 智能录题
function handleIntelligentInput() {
  showToast('智能录题功能即将上线', { type: 'success' })
}

// 切换视图模式
function toggleViewMode() {
  viewMode.value = viewMode.value === 'table' ? 'preview' : 'table'
  // 切换模式时清空选择
  if (viewMode.value === 'preview') {
    selectedIds.value = []
  }
}

// 批量禁用
function handleBatchDisable() {
  if (selectedIds.value.length === 0) {
    showToast('请先选择要禁用的试题', { type: 'error' })
    return
  }

  // 确认对话框
  if (!confirm(`确定要禁用选中的 ${selectedIds.value.length} 个试题吗？`)) {
    return
  }

  // 批量切换状态为禁用
  selectedIds.value.forEach(id => {
    questionStore.toggleQuestionStatus(id, 'disabled')
  })

  showToast(`成功禁用 ${selectedIds.value.length} 个试题`, { type: 'success' })
  selectedIds.value = []
}

// 批量删除
function handleBatchDelete() {
  if (selectedIds.value.length === 0) {
    showToast('请先选择要删除的试题', { type: 'error' })
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

// 编辑
function handleEdit(id: string) {
  router.push(`/question-management/edit/${id}`)
}

// 处理启用/禁用
function handleToggleStatus(id: string) {
  const question = questionStore.getQuestionById(id)
  if (!question) return

  toggleStatusTarget.value = {
    id,
    name: question.stem,
    currentStatus: question.status
  }

  // 如果是禁用操作，显示确认弹窗
  if (question.status === 'active') {
    showToggleStatusModal.value = true
  } else {
    // 启用操作直接执行
    handleToggleStatusConfirm()
  }
}

// 确认启用/禁用
function handleToggleStatusConfirm() {
  if (!toggleStatusTarget.value) return

  questionStore.toggleQuestionStatus(toggleStatusTarget.value.id)

  const action = toggleStatusTarget.value.currentStatus === 'active' ? '禁用' : '启用'
  showToast(`试题已${action}`)

  showToggleStatusModal.value = false
  toggleStatusTarget.value = null
}

// 确认删除
function confirmDelete() {
  if (isBatchDelete.value) {
    questionStore.deleteQuestionsBatch(deleteTargetIds.value)
    showToast(`成功删除 ${deleteTargetIds.value.length} 道试题`, { type: 'success' })
    selectedIds.value = []
  } else {
    questionStore.deleteQuestion(deleteTargetIds.value[0])
    showToast('试题删除成功', { type: 'success' })
  }
  closeDeleteModal()
}

// 关闭删除弹窗
function closeDeleteModal() {
  showDeleteModal.value = false
  deleteTargetIds.value = []
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

.question-management-container {
  display: flex;
  gap: 24px;
  min-height: calc(100vh - 240px);
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
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

.btn.secondary {
  background: #ffffff;
  color: var(--accent);
  border-color: rgba(0, 102, 204, 0.4);
}

.btn.secondary:hover {
  background: rgba(0, 102, 204, 0.08);
}

.btn.warning {
  background: linear-gradient(180deg, #ffa726 0%, #fb8c00 100%);
  color: #ffffff;
  border-color: #f57c00;
}

.btn.warning:hover:not(:disabled) {
  background: linear-gradient(180deg, #ff9800 0%, #f57c00 100%);
}

.btn.warning:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

@media (max-width: 768px) {
  .question-management-container {
    grid-template-columns: 1fr;
  }
}
</style>
