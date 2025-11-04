<template>
  <AppLayout title="题库系统 - 试卷管理">
    <TabNavigation :tabs="tabs" :default-tab="'prototype'">
      <!-- 原型展示标签页 -->
      <template #prototype>
        <div class="tab-panel">
          <div class="prototype-wrapper">
            <div class="exam-management-container">
              <!-- 左侧: 项目-科目树 -->
              <div class="left-sidebar">
                <SubjectTree
                  :active-subject-id="activeSubject?.id"
                  @subject-change="handleSubjectChange"
                />
              </div>

              <!-- 右侧: 筛选器 + 操作按钮 + 表格 -->
              <div class="right-content">
                <!-- 筛选器 -->
                <ExamFilter
                  v-model="filter"
                  :active-subject-id="activeSubject?.id"
                  @search="handleSearch"
                  @reset="handleReset"
                />

                <!-- 操作按钮区 -->
                <div class="action-bar">
                  <div class="action-left">
                    <button class="btn primary" @click="handleCreate">
                      ➕ 创建试卷
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

                <!-- 试卷表格 -->
                <ExamTable
                  :exams="paginatedData.data"
                  v-model:selectedIds="selectedIds"
                  @preview="handlePreview"
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
            <h2>试卷管理需求文档</h2>
            <p>试卷的创建、编辑、查询和删除功能,支持选题组卷和非必答题设置。</p>
          </div>

          <div class="requirements-content">
            <section class="business-requirements">
              <h3>业务需求</h3>
              <div class="requirement-section">
                <h4>核心目标</h4>
                <ul>
                  <li>支持选题组卷,可自定义试题分值和顺序</li>
                  <li>支持设置非必答题(选答题),灵活控制试卷总分</li>
                  <li>提供试卷的全生命周期管理(创建、编辑、启用/禁用、删除)</li>
                  <li>支持多维度筛选和分页查询</li>
                  <li>提供题型导航和批量操作,提升组卷效率</li>
                  <li>实时统计试题数量和分数,确保试卷配置合理</li>
                  <li><strong>支持试卷预览,在保存前可查看完整试卷内容和答案解析</strong></li>
                </ul>
              </div>

              <div class="requirement-section">
                <h4>用户场景</h4>
                <ul>
                  <li><strong>教师组卷</strong>: 根据教学大纲和知识点,从题库中筛选试题,设置分值和难度分布,生成考试试卷</li>
                  <li><strong>模拟考试</strong>: 参考历年真题,组合多种题型,设置合理的考试时长和及格分,创建模拟测试</li>
                  <li><strong>阶段测评</strong>: 针对特定章节或知识点,选择相关试题,设置选答题增加灵活性</li>
                  <li><strong>试卷复用</strong>: 编辑已有试卷,调整试题或分值,快速生成新版本试卷</li>
                  <li><strong>试卷维护</strong>: 根据试题反馈,调整试题顺序或分值,禁用过时试卷</li>
                  <li><strong>试卷预览</strong>: 创建或编辑试卷时,点击预览按钮查看完整试卷,包括所有题目、答案和解析,确保试卷配置正确后再保存</li>
                </ul>
              </div>


              <div class="requirement-section">
                <h4>业务规则</h4>
                <ul>
                  <li><strong>试卷名称唯一性</strong>: 同科目下试卷名称不能重复</li>
                  <li><strong>总分计算</strong>: 仅统计必答题分值,选答题不计入总分</li>
                  <li><strong>及格分约束</strong>: 及格分必须 ≤ 总分,总分变化时自动调整及格分(如超出)</li>
                  <li><strong>考试时长</strong>: 单位为分钟,必须 ≥ 1,默认90分钟</li>
                  <li><strong>试题数量</strong>: 至少包含1道试题,建议不超过200题</li>
                  <li><strong>选答题比例</strong>: 建议选答题不超过总题数的30%,确保考试公平性</li>
                  <li><strong>防重复选择</strong>: 已添加到试卷的试题在选题弹窗中不可重复选择</li>
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
                    <td>点击科目加载该科目下的试卷列表</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>试卷筛选</td>
                    <td>支持状态、创建时间、试卷名称筛选</td>
                    <td>筛选项包括: 状态(启用/禁用)、创建时间范围、试卷名称模糊搜索</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>试卷列表</td>
                    <td>表格展示试卷摘要信息</td>
                    <td>包含: 多选框、序号、试卷名称、总分、及格分、创建时间、创建人、状态、操作列</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>创建试卷</td>
                    <td>【创建试卷】按钮跳转到创建页面</td>
                    <td>选题组卷: 填写基础信息 → 选择试题 → 设置分值和顺序 → 保存</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>编辑试卷</td>
                    <td>点击【编辑】按钮跳转到编辑页面</td>
                    <td>预填现有数据,允许修改基础信息、调整试题、重新计算总分</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>预览试卷</td>
                    <td>在创建/编辑页面点击【预览试卷】按钮,以Drawer形式展示试卷详情</td>
                    <td>从右侧滑出抽屉,展示试卷名称、时长、总分、及格分、题目统计、所有题目的题干/选项/答案/解析;选答题显示橙色标识;点击确定按钮关闭抽屉</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>删除试卷</td>
                    <td>单个删除和批量删除</td>
                    <td>二次确认后删除,支持批量操作</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>分页功能</td>
                    <td>支持分页浏览试卷列表</td>
                    <td>显示总记录数、页码、上一页/下一页、每页条数切换(10/20/50)</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>选题弹窗</td>
                    <td>提供试题筛选和批量选择功能</td>
                    <td>支持7个维度筛选(章节、来源、年份、知识点、题型、难度、级别);支持分页和批量选择;已添加试题显示为禁用状态不可重复选择</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>题型导航</td>
                    <td>左侧面板展示各题型统计和快速定位</td>
                    <td>按题型分组显示题目数量和总分;点击题型快速滚动到对应试题;支持批量设置该题型所有试题的分值;支持题型整体上移/下移</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>试题卡片管理</td>
                    <td>右侧面板展示已添加的试题列表</td>
                    <td>显示题号、题型、题干、选项(客观题);支持设置单题分值(1-100分);支持标记为选答题(⭐图标);支持单题上移/下移;支持删除试题;支持展开/收起答案和解析</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>基础信息表单</td>
                    <td>横向展示试卷基础信息和实时统计</td>
                    <td>第一行:试卷名称(1-100字符);第二行:考试时长(≥1分钟)、分数设置(及格分/总分);第三行:统计信息(必答题数、选答题数、所属项目和科目)</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>实时总分计算</td>
                    <td>根据必答题分值自动计算总分</td>
                    <td>仅统计isOptional=false的试题分值;试题分值或选答状态变化时自动重算;总分超过及格分时自动调整及格分</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>答案预览</td>
                    <td>支持在试题卡片中展开查看答案和解析</td>
                    <td>点击【查看答案】按钮展开;显示参考答案和试题解析;再次点击收起</td>
                    <td>P1</td>
                  </tr>
                  <tr>
                    <td>试题顺序调整</td>
                    <td>支持单题和题型整体的顺序调整</td>
                    <td>单题:点击⬆️/⬇️按钮上移/下移一位;题型整体:在题型导航中点击上移/下移,该题型所有试题整体移动到前一题型/后一题型位置</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>批量设置分值</td>
                    <td>在题型导航中批量设置该题型所有试题的分值</td>
                    <td>点击题型卡片的【批量设置分值】;输入分值后,该题型所有试题分值统一更新;实时重算总分</td>
                    <td>P1</td>
                  </tr>
                  <tr>
                    <td>表单验证</td>
                    <td>保存前进行完整性和合法性校验</td>
                    <td>验证试卷名称必填;验证至少包含1道试题;验证及格分≤总分;验证试卷名称在同科目下唯一</td>
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
                    <td>试卷名称</td>
                    <td>String</td>
                    <td>1-100字符</td>
                    <td>✓</td>
                    <td>科目内唯一</td>
                    <td>无</td>
                    <td>清晰描述试卷用途</td>
                  </tr>
                  <tr>
                    <td>所属科目</td>
                    <td>String</td>
                    <td>-</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>无</td>
                    <td>关联科目ID</td>
                  </tr>
                  <tr>
                    <td>考试时长</td>
                    <td>Integer</td>
                    <td>≥ 1</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>90</td>
                    <td>单位:分钟</td>
                  </tr>
                  <tr>
                    <td>总分</td>
                    <td>Integer</td>
                    <td>自动计算</td>
                    <td>-</td>
                    <td>无</td>
                    <td>0</td>
                    <td>仅统计必答题</td>
                  </tr>
                  <tr>
                    <td>及格分</td>
                    <td>Integer</td>
                    <td>≤ 总分</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>60</td>
                    <td>手动设置</td>
                  </tr>
                  <tr>
                    <td>试题分值</td>
                    <td>Integer</td>
                    <td>> 0</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>无</td>
                    <td>每题可单独设置</td>
                  </tr>
                  <tr>
                    <td>是否选答</td>
                    <td>Boolean</td>
                    <td>-</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>false</td>
                    <td>选答题不计入总分</td>
                  </tr>
                  <tr>
                    <td>试题数量</td>
                    <td>Integer</td>
                    <td>1-200题</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>0</td>
                    <td>建议不超过200题</td>
                  </tr>
                  <tr>
                    <td>单题分值</td>
                    <td>Integer</td>
                    <td>1-100分</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>根据题型</td>
                    <td>单选5分、多选10分、判断5分、不定项10分、简答20分、组合50分</td>
                  </tr>
                  <tr>
                    <td>选答题比例</td>
                    <td>Float</td>
                    <td>≤ 30%</td>
                    <td>-</td>
                    <td>无</td>
                    <td>-</td>
                    <td>建议性约束,确保考试公平性</td>
                  </tr>
                  <tr>
                    <td>题型排序</td>
                    <td>Integer</td>
                    <td>1-N</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>自动生成</td>
                    <td>试题顺序,支持手动调整和题型整体移动</td>
                  </tr>
                  <tr>
                    <td>预览模式</td>
                    <td>String</td>
                    <td>-</td>
                    <td>-</td>
                    <td>无</td>
                    <td>drawer</td>
                    <td>固定使用Drawer抽屉形式展示预览</td>
                  </tr>
                  <tr>
                    <td>答案显示</td>
                    <td>Boolean</td>
                    <td>-</td>
                    <td>-</td>
                    <td>无</td>
                    <td>true</td>
                    <td>预览时始终显示答案和解析</td>
                  </tr>
                </tbody>
              </table>

              <h4 style="margin-top: 48px; font-size: 18px; font-weight: 600; color: var(--accent);">访问控制业务需求</h4>

              <div class="requirement-section" style="margin-top: 24px;">
                <h4>核心目标</h4>
                <ul>
                  <li>为试卷资源提供访问控制机制,支持免费、付费、VIP等多种权限模式</li>
                  <li>通过收费规则实现标准化的权限管理,确保配置的一致性</li>
                  <li>在试卷编辑页面提供访问规则选择器,方便运营人员配置</li>
                </ul>
              </div>

              <div class="requirement-section">
                <h4>用户场景</h4>
                <ul>
                  <li><strong>场景1 - 新试卷创建:</strong> 教研人员在创建试卷时,需要设置该试卷的访问规则,例如设置为"免费"供所有用户练习,或设置为"VIP及以上"限制给付费用户</li>
                  <li><strong>场景2 - 试卷编辑:</strong> 运营人员在编辑试卷时,可以修改访问规则,例如将原本免费的模拟试卷升级为"SVIP及以上",提升会员价值</li>
                  <li><strong>场景3 - 试卷专属票:</strong> 为重要考试设置"试卷专属票",用户需要单独购买该试卷的访问权限才能作答</li>
                </ul>
              </div>

              <div class="requirement-section">
                <h4>业务规则</h4>
                <ul>
                  <li><strong>默认规则:</strong> 新创建的试卷默认访问规则为"免费"(T001),所有用户均可访问</li>
                  <li><strong>规则优先级:</strong> 试卷自身的访问规则优先级最高,不受章节或科目规则影响</li>
                  <li><strong>参数必填性:</strong> 选择"试卷专属票"(T006)时,必须填写试卷ID参数(自动设置为当前试卷)</li>
                  <li><strong>规则变更影响:</strong> 修改试卷访问规则后,立即生效,影响学员端的访问权限判断</li>
                  <li><strong>不适用规则:</strong> 试卷不支持"章节通票"(T002)、"课程视频票"(T007)、"学科VIP"(T008)、"试看N题"(T009)规则</li>
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
                    <td>试卷编辑页-规则选择器</td>
                    <td>在试卷编辑页面提供访问规则选择组件</td>
                    <td>包含收费规则下拉框和动态参数输入框;下拉框显示适用于试卷的收费规则(从收费规则管理获取);选择模板后,动态显示对应的参数输入框</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>收费规则下拉框</td>
                    <td>展示所有适用于试卷的收费规则</td>
                    <td>下拉选项格式: "T001 - 免费"; 仅显示 applicableTo 包含 'exam' 且 status 为 'active' 的模板; 按 order 字段降序排列; <strong>不显示 T002/T007/T008/T009</strong></td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>动态参数输入</td>
                    <td>根据选择的收费规则,动态显示参数输入框</td>
                    <td>T006(试卷专属票): 自动填充当前试卷ID,只读显示; T010(限时开放): 显示开始时间和结束时间选择器; 其他模板: 不显示参数输入</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>参数必填校验</td>
                    <td>保存试卷时校验参数完整性</td>
                    <td>如果选择了需要参数的收费规则,但未填写参数,提示"请填写完整的访问规则参数";校验通过后才允许保存</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>访问规则显示</td>
                    <td>在试卷列表中显示访问规则信息</td>
                    <td>列表新增"访问规则"列,显示收费规则的 displayName,如"免费"、"VIP及以上";鼠标悬停显示完整规则信息(包含参数)</td>
                    <td>P1</td>
                  </tr>
                  <tr>
                    <td>规则参数回显</td>
                    <td>编辑试卷时正确回显已设置的访问规则</td>
                    <td>收费规则下拉框选中当前规则;参数输入框填充已保存的参数值</td>
                    <td>P0</td>
                  </tr>
                </tbody>
              </table>

              <h4 style="margin-top: 48px; font-size: 16px; font-weight: 600; color: var(--accent);">访问规则原型描述</h4>

              <div class="prototype-description" style="margin-top: 16px; padding: 20px; background: #f8fafc; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.8;">
                <strong style="color: var(--accent);">【试卷编辑页 - 访问控制区域】</strong><br/><br/>

                ┌─────────────────────────────────────────────────────────┐<br/>
                │ <strong>访问控制设置</strong>                                          │<br/>
                ├─────────────────────────────────────────────────────────┤<br/>
                │                                                         │<br/>
                │  收费规则: ┌──────────────────────────────┐ [*必填] │<br/>
                │                │ T001 - 免费              ▼  │         │<br/>
                │                └──────────────────────────────┘         │<br/>
                │                                                         │<br/>
                │  <em style="color: #666;">(当选择 T006 - 试卷专属票时)</em>                      │<br/>
                │  试卷ID:       ┌──────────────────────────────┐         │<br/>
                │                │ exam-2025-001 (只读)     🔒 │         │<br/>
                │                └──────────────────────────────┘         │<br/>
                │                <em style="color: #999;">自动设置为当前试卷ID</em>                  │<br/>
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

                <strong style="color: var(--accent);">【试卷列表显示访问规则】</strong><br/><br/>

                ┌────┬─────────────────┬──────┬────────┬────────────┐<br/>
                │ 选 │ 试卷名称        │ 总分 │ 及格分 │ 访问规则   │<br/>
                ├────┼─────────────────┼──────┼────────┼────────────┤<br/>
                │ ☑  │ 2024年模拟考试  │ 100  │ 60     │ 免费       │<br/>
                │ ☐  │ VIP专属练习卷   │ 150  │ 90     │ VIP及以上  │<br/>
                │ ☐  │ 期末冲刺试卷    │ 120  │ 72     │ 试卷专属票 │<br/>
                └────┴─────────────────┴──────┴────────┴────────────┘<br/>
                                                       <em style="color: #666;">↑ 鼠标悬停显示详细参数</em>
              </div>

              <h4 style="margin-top: 32px; font-size: 16px; font-weight: 600; color: var(--accent);">访问控制字段约束</h4>
              <table class="spec-table constraint-table" style="margin-top: 16px;">
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
                  <tr style="background: #fff8dc;">
                    <td><strong>收费规则ID</strong></td>
                    <td>String</td>
                    <td>收费规则ID</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>t001</td>
                    <td>从收费规则管理选择,默认"免费"(t001);仅显示 applicableTo 包含 'exam' 且状态为 'active' 的模板;<strong>不支持 T002/T007/T008/T009</strong></td>
                  </tr>
                  <tr style="background: #fff8dc;">
                    <td><strong>访问规则参数</strong></td>
                    <td>Object</td>
                    <td>视规则而定</td>
                    <td>视规则而定</td>
                    <td>无</td>
                    <td>{}</td>
                    <td><strong>T006:</strong> examId (必填,自动设置为当前试卷ID); <strong>T010:</strong> startTime + endTime (必填,结束时间&gt;开始时间)</td>
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
                      <td>AC-E01</td>
                      <td>用户在试卷编辑页面,收费规则选择"T001 - 免费"</td>
                      <td>保存试卷</td>
                      <td>试卷保存成功,paymentRuleId 为 't001',无需填写参数</td>
                    </tr>
                    <tr>
                      <td>AC-E02</td>
                      <td>用户在试卷编辑页面,选择"T006 - 试卷专属票"</td>
                      <td>查看参数输入区域</td>
                      <td>试卷ID输入框自动填充当前试卷的ID,且为只读状态,用户无法修改</td>
                    </tr>
                    <tr>
                      <td>AC-E03</td>
                      <td>用户在试卷编辑页面,选择"T010 - 限时开放"</td>
                      <td>设置开始时间"2025-01-01 00:00",结束时间"2025-12-31 23:59",点击保存</td>
                      <td>试卷保存成功,paymentRuleParams 包含 startTime 和 endTime</td>
                    </tr>
                    <tr>
                      <td>AC-E04</td>
                      <td>用户在试卷编辑页面,选择"T010 - 限时开放"</td>
                      <td>设置开始时间"2025-01-01 00:00",结束时间"2025-01-01 00:00"(相等),点击保存</td>
                      <td>系统提示"结束时间必须大于开始时间",拒绝保存</td>
                    </tr>
                    <tr>
                      <td>AC-E05</td>
                      <td>用户打开试卷编辑页的收费规则下拉框</td>
                      <td>查看可选收费规则</td>
                      <td>下拉框显示 T001/T003/T004/T005/T006/T010,<strong>不显示 T002/T007/T008/T009</strong></td>
                    </tr>
                    <tr>
                      <td>AC-E06</td>
                      <td>用户编辑一份已设置"T003 - VIP及以上"的试卷</td>
                      <td>打开编辑页</td>
                      <td>收费规则下拉框选中"T003 - VIP及以上",无参数输入框</td>
                    </tr>
                    <tr>
                      <td>AC-E07</td>
                      <td>用户在试卷列表中查看某份试卷,访问规则为"试卷专属票"</td>
                      <td>鼠标悬停在"访问规则"列</td>
                      <td>显示Tooltip,内容为"试卷专属票 - 需购买: exam-2025-001"</td>
                    </tr>
                    <tr>
                      <td>AC-E08</td>
                      <td>收费规则管理中"T003 - VIP及以上"被禁用</td>
                      <td>用户打开试卷编辑页的规则下拉框</td>
                      <td>下拉框中不显示"T003 - VIP及以上"选项</td>
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
                      <td>用户在试卷管理页面,左侧树选中"财务战略管理"科目</td>
                      <td>右侧加载该科目的试卷列表</td>
                      <td>应展示该科目下所有试卷,包括试卷名称、总分、及格分等信息</td>
                    </tr>
                    <tr>
                      <td>AC-02</td>
                      <td>用户在筛选器中选择"状态=启用"</td>
                      <td>点击【搜索】按钮</td>
                      <td>列表应仅显示启用状态的试卷</td>
                    </tr>
                    <tr>
                      <td>AC-03</td>
                      <td>用户点击【创建试卷】按钮</td>
                      <td>跳转到试卷创建页面,完成选题和分值设置后保存</td>
                      <td>系统验证通过,试卷保存成功,Toast提示"试卷创建成功"</td>
                    </tr>
                    <tr>
                      <td>AC-04</td>
                      <td>用户在试卷列表中选中2份试卷</td>
                      <td>点击【批量删除】按钮,确认删除</td>
                      <td>系统删除选中的2份试卷,Toast提示"成功删除 2 份试卷"</td>
                    </tr>
                    <tr>
                      <td>AC-05</td>
                      <td>用户创建试卷,选择了5道试题,其中1道标记为选答题</td>
                      <td>保存试卷</td>
                      <td>总分仅统计4道必答题,选答题不计入总分</td>
                    </tr>
                    <tr>
                      <td>AC-06</td>
                      <td>用户尝试创建试卷名称与已有试卷重复的试卷(同科目)</td>
                      <td>点击保存</td>
                      <td>系统提示"该试卷名称已存在",拒绝保存</td>
                    </tr>
                    <tr>
                      <td>AC-07</td>
                      <td>用户在创建试卷页面点击【选择试题】按钮</td>
                      <td>在选题弹窗中按章节和题型筛选,选择3道单选题,点击确定</td>
                      <td>选题弹窗关闭,右侧试题列表显示新增的3道单选题,每题默认5分</td>
                    </tr>
                    <tr>
                      <td>AC-08</td>
                      <td>用户已添加5道试题到试卷</td>
                      <td>点击第3题的【标记为选答】按钮(⭐图标)</td>
                      <td>该题卡片显示选答标记,总分自动减去该题分值,统计信息更新为"必答4题/选答1题"</td>
                    </tr>
                    <tr>
                      <td>AC-09</td>
                      <td>试卷中有多种题型(单选、多选、简答),各3道</td>
                      <td>在题型导航中点击"单选题"卡片的【批量设置分值】,输入8分</td>
                      <td>所有单选题分值更新为8分,总分重新计算,Toast提示"成功设置3道单选题的分值为8分"</td>
                    </tr>
                    <tr>
                      <td>AC-10</td>
                      <td>试卷中单选题在第4-6题位置</td>
                      <td>在题型导航中点击"单选题"的【上移】按钮</td>
                      <td>单选题整体移动到第1-3题位置,题号自动重新编号,Toast提示"单选题已上移"</td>
                    </tr>
                    <tr>
                      <td>AC-11</td>
                      <td>用户选中第5题</td>
                      <td>点击试题卡片的【上移】按钮(⬆️)</td>
                      <td>第5题与第4题位置互换,题号自动调整</td>
                    </tr>
                    <tr>
                      <td>AC-12</td>
                      <td>用户在试题卡片中点击【查看答案】按钮</td>
                      <td>答案区域展开,显示参考答案和试题解析</td>
                      <td>答案和解析完整展示,按钮文字变为"收起答案",再次点击可收起</td>
                    </tr>
                    <tr>
                      <td>AC-13</td>
                      <td>用户尝试保存试卷,但试卷名称为空</td>
                      <td>点击【保存试卷】按钮</td>
                      <td>系统拦截保存,Toast提示"请检查基础信息",试卷名称输入框显示错误提示"试卷名称不能为空"</td>
                    </tr>
                    <tr>
                      <td>AC-14</td>
                      <td>用户尝试保存试卷,但未添加任何试题</td>
                      <td>点击【保存试卷】按钮</td>
                      <td>系统拦截保存,Toast提示"请至少添加一道试题"</td>
                    </tr>
                    <tr>
                      <td>AC-15</td>
                      <td>用户设置及格分为80分,但必答题总分仅为70分</td>
                      <td>点击【保存试卷】按钮</td>
                      <td>系统拦截保存,Toast提示"及格分不能超过总分(70分)"</td>
                    </tr>
                    <tr>
                      <td>AC-16</td>
                      <td>用户在选题弹窗中已选择试题A</td>
                      <td>试卷中已包含试题A,再次打开选题弹窗</td>
                      <td>试题A在列表中显示为禁用状态(灰色),复选框不可勾选,防止重复添加</td>
                    </tr>
                    <tr>
                      <td>AC-17</td>
                      <td>用户编辑已有试卷</td>
                      <td>点击【编辑】按钮进入编辑页面</td>
                      <td>基础信息预填现有数据,试题列表完整展示,可修改分值、选答状态和顺序</td>
                    </tr>
                    <tr>
                      <td>AC-18</td>
                      <td>用户调整试题分值,必答题总分从100分增加到120分,但及格分仍为60分</td>
                      <td>系统实时重算总分</td>
                      <td>总分更新为120分,及格分保持60分不变(未超出限制)</td>
                    </tr>
                    <tr>
                      <td>AC-19</td>
                      <td>用户调整试题分值,必答题总分从100分减少到50分,但及格分设置为60分</td>
                      <td>系统实时重算总分</td>
                      <td>总分更新为50分,及格分自动调整为50分,基础信息表单显示警告</td>
                    </tr>
                    <tr>
                      <td>AC-20</td>
                      <td>试卷中有10道试题,用户将最后1题标记为选答</td>
                      <td>选答题比例为10%</td>
                      <td>系统正常保存,统计信息显示"必答9题/选答1题"</td>
                    </tr>
                    <tr>
                      <td>AC-21</td>
                      <td>用户在创建试卷页面已添加5道试题并填写基础信息</td>
                      <td>点击【预览试卷】按钮</td>
                      <td>从右侧滑出抽屉,展示试卷名称、考试时长、总分、及格分、试题统计和所有题目的完整信息</td>
                    </tr>
                    <tr>
                      <td>AC-22</td>
                      <td>用户在预览抽屉中查看试卷</td>
                      <td>查看题目详情</td>
                      <td>每道题显示题号、题型标签、分值、题干、选项(客观题)、正确答案和解析;选答题显示橙色"选答题"标识</td>
                    </tr>
                    <tr>
                      <td>AC-23</td>
                      <td>预览抽屉已打开</td>
                      <td>点击【确定】按钮</td>
                      <td>抽屉关闭,返回编辑状态,试卷数据不变</td>
                    </tr>
                    <tr>
                      <td>AC-24</td>
                      <td>用户在创建试卷页面,试题数量为0</td>
                      <td>尝试点击【预览试卷】按钮</td>
                      <td>按钮处于禁用状态,无法点击</td>
                    </tr>
                    <tr>
                      <td>AC-25</td>
                      <td>试卷中包含组合题</td>
                      <td>在预览抽屉中查看组合题</td>
                      <td>显示大题干(案例背景),然后依次显示每个小问的题号、题干、选项、答案和解析</td>
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
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/Layout/AppLayout.vue'
import TabNavigation from '@/components/Tab/TabNavigation.vue'
import SubjectTree from '@/views/chapter-management/components/SubjectTree.vue'
import ExamFilter from './components/ExamFilter.vue'
import ExamTable from './components/ExamTable.vue'
import DeleteConfirmModal from './components/DeleteConfirmModal.vue'
import { useExamStore } from '@/stores/exam'
import { useProjectStore } from '@/stores/project'
import { useLearningStageStore } from '@/stores/learningStage'
import { useToast } from '@/composables/useToast'
import type { ExamFilter as ExamFilterType } from './types'

const router = useRouter()
const examStore = useExamStore()
const projectStore = useProjectStore()
const learningStageStore = useLearningStageStore()
const { showToast } = useToast()

// 标签页配置
const tabs = [
  { key: 'prototype', label: '原型展示', icon: '🎨' },
  { key: 'requirements', label: '需求文档', icon: '📋' },
  { key: 'style-guide', label: '样式指南', icon: '🎯' }
]

// 当前选中的科目
const activeSubject = ref<{ id: string; name: string } | null>(null)

// 筛选条件
const filter = ref<ExamFilterType>({})

// 分页参数
const currentPage = ref(1)
const pageSize = ref(20)

// 已选中的试卷ID列表
const selectedIds = ref<string[]>([])

// 弹窗状态
const showDeleteModal = ref(false)
const isBatchDelete = ref(false)
const deleteTargetIds = ref<string[]>([])

// 计算属性: 分页数据
const paginatedData = computed(() => {
  return examStore.getPaginatedExams(filter.value, currentPage.value, pageSize.value)
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

// 监听科目变化,重置筛选条件和分页
watch(activeSubject, (newSubject) => {
  if (newSubject) {
    filter.value.subjectId = newSubject.id
    currentPage.value = 1
    selectedIds.value = []
  }
})

// 监听筛选条件变化,重置分页
watch(filter, () => {
  currentPage.value = 1
  selectedIds.value = []
}, { deep: true })

// 科目切换
function handleSubjectChange(subject: { id: string; name: string } | null) {
  activeSubject.value = subject
}

// 搜索
function handleSearch() {
  currentPage.value = 1
  selectedIds.value = []
}

// 重置
function handleReset() {
  filter.value = activeSubject.value ? { subjectId: activeSubject.value.id } : {}
  currentPage.value = 1
  selectedIds.value = []
}

// 创建试卷
function handleCreate() {
  if (!activeSubject.value) {
    showToast('请先选择科目', { type: 'error' })
    return
  }

  // 获取项目ID
  const subject = projectStore.subjects.find(s => s.id === activeSubject.value?.id)
  if (!subject) {
    showToast('科目信息错误', { type: 'error' })
    return
  }

  router.push({
    path: '/exam-management/create',
    state: {
      subjectId: activeSubject.value.id,
      projectId: subject.projectId
    }
  })
}

// 预览试卷
function handlePreview(id: string) {
  showToast('预览功能即将上线', { type: 'success' })
  console.log('Preview exam:', id)
}

// 编辑试卷
function handleEdit(id: string) {
  router.push(`/exam-management/edit/${id}`)
}

// 批量删除
function handleBatchDelete() {
  if (selectedIds.value.length === 0) {
    showToast('请先选择要删除的试卷', { type: 'error' })
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
  if (isBatchDelete.value) {
    examStore.deleteExamsBatch(deleteTargetIds.value)
    showToast(`成功删除 ${deleteTargetIds.value.length} 份试卷`, { type: 'success' })
    selectedIds.value = []
  } else {
    examStore.deleteExam(deleteTargetIds.value[0])
    showToast('试卷删除成功', { type: 'success' })
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

// 页面初始化：默认选中第一个项目的第一个科目
onMounted(() => {
  const firstProject = projectStore.projects[0]
  if (firstProject) {
    const firstSubject = projectStore.subjects.find(s => s.projectId === firstProject.id)
    if (firstSubject) {
      activeSubject.value = { id: firstSubject.id, name: firstSubject.name }
    }
  }
})
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

.exam-management-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
  min-height: calc(100vh - 240px);
}

.left-sidebar {
  align-self: stretch;
}

.right-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

@media (max-width: 768px) {
  .exam-management-container {
    grid-template-columns: 1fr;
  }
}
</style>
