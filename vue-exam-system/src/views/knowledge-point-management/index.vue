<template>
  <AppLayout title="题库系统知识点管理">
    <TabNavigation :tabs="tabs" :default-tab="'prototype'">
      <!-- 原型展示标签页 -->
      <template #prototype>
        <div class="tab-panel">
          <div class="prototype-wrapper">
            <SubjectTree :active-filter="activeFilter" @filter-change="handleFilterChange" />

            <KnowledgePointTable
              v-if="activeFilter.subjectId"
              :subject-id="activeFilter.subjectId"
              :subject-name="activeSubjectName"
              :project-name="activeProjectName"
              :knowledge-points="filteredKnowledgePoints"
              :status-filter="statusFilter"
              :is-add-enabled="isAddEnabled"
              @add-knowledge-point="openAddKnowledgePointModal"
              @edit-knowledge-point="openEditKnowledgePointModal"
              @delete-knowledge-point="openDeleteKnowledgePointModal"
              @toggle-status="openToggleStatusModal"
              @show-questions="openQuestionListModal"
              @update:status-filter="statusFilter = $event"
              @batch-enable="handleBatchEnable"
              @batch-disable="handleBatchDisable"
              @batch-delete="handleBatchDelete"
            />
          </div>
        </div>
      </template>

      <!-- 需求文档标签页 -->
      <template #requirements>
        <div class="tab-panel">
          <div class="requirements-header">
            <h2>知识点管理需求文档</h2>
            <p>详细的功能需求、业务规则和验收标准,确保知识点管理模块实现标准化。</p>
          </div>

          <div class="requirements-content">
            <section class="business-requirements">
              <h3>业务需求</h3>
              <div class="requirement-section">
                <h4>核心目标</h4>
                <ul>
                  <li>提供高效的知识点管理功能</li>
                  <li>支持知识点与章节的灵活关联</li>
                  <li>支持知识点与试题的双向关联</li>
                  <li>提供直观的树形导航和列表视图</li>
                </ul>
              </div>


              <div class="requirement-section">
                <h4>用户场景</h4>
                <ul>
                  <li><strong>创建知识点</strong>: 内容管理员为"财务战略管理"科目创建知识点(如"会计核算基本前提"、"会计信息质量要求"),建立知识体系</li>
                  <li><strong>章节关联</strong>: 将知识点"财务报表分析方法"关联到多个章节(如"第二章 财务报表分析"、"第五章 财务综合分析"),支持跨章节知识点</li>
                  <li><strong>试题关联查看</strong>: 点击知识点"现金流量管理"的试题数量,查看关联的10道试题,快速了解该知识点的试题覆盖情况</li>
                  <li><strong>删除保护提醒</strong>: 尝试删除已被20道试题引用的知识点时,系统提示关联情况,允许删除但清空试题的知识点关联</li>
                  <li><strong>知识点复用</strong>: 参考历史科目的知识点结构,快速创建新科目的知识点体系,提升内容组织效率</li>
                </ul>
              </div>


              <div class="requirement-section">
                <h4>业务规则</h4>
                <ul>
                  <li><strong>知识点名称唯一性</strong>: 同一科目下知识点名称不能重复,不同科目可重复</li>
                  <li><strong>章节关联灵活性</strong>: 允许知识点不关联任何章节(显示"未关联章节"),也允许关联多个章节(跨章节知识点)</li>
                  <li><strong>试题关联清理</strong>: 删除知识点时,自动清空所有关联试题的knowledgePointId字段,但不删除试题本身</li>
                  <li><strong>试题数量统计</strong>: 知识点列表实时显示关联的试题数量,点击数量可查看试题列表</li>
                  <li><strong>章节显示规则</strong>: 多个章节以"、"分隔显示,章节名称过长时截断并添加省略号,鼠标悬停显示完整名称</li>
                  <li><strong>删除二次确认</strong>: 删除知识点时必须二次确认,有试题关联时额外提示影响范围</li>
                  <li><strong>科目筛选规则</strong>: 左侧树形菜单选中科目后,右侧仅显示该科目的知识点,切换科目时列表实时更新</li>
                  <li><strong>禁用不删除数据</strong>: 禁用知识点不清空试题的knowledgePointIds字段,试题仍可正常查看和编辑</li>
                  <li><strong>状态筛选规则</strong>: 默认筛选器为"启用",禁用知识点不显示;切换筛选器为"全部"或"禁用"时可查看</li>
                  <li><strong>试题编辑限制</strong>: 试题编辑时,已禁用知识点显示"(已禁用)"后缀,可移除但不可新增关联</li>
                  <li><strong>启用操作无确认</strong>: 启用知识点无损操作,无需二次确认;禁用操作需二次确认并显示影响范围</li>
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
                    <td>点击项目展开科目,点击科目加载知识点列表,当前选中科目高亮</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>知识点列表</td>
                    <td>表格展示知识点信息</td>
                    <td>包含知识点名称、章、节、难易程度、出现频率、试题数量、创建时间、创建人、操作列</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>添加知识点</td>
                    <td>右上角【添加知识点】按钮触发弹窗</td>
                    <td>字段: 所属科目(只读)、知识点名称*、关联章节(可选,多选);校验: 名称必填、同科目下不重复</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>编辑知识点</td>
                    <td>知识点行【编辑】按钮打开弹窗</td>
                    <td>预填现有数据,允许修改名称和关联章节,执行重复校验</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>星级评分</td>
                    <td>为知识点设置难易程度和出现频率</td>
                    <td>两个字段均为1-5星评分,添加/编辑时通过点击星星选择,列表中以金色星星显示,只读模式</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>删除保护</td>
                    <td>删除知识点前检查是否有试题关联</td>
                    <td>若存在关联试题,提示"该知识点已被N道试题引用,删除后这些试题将失去知识点关联,确定继续吗?";允许删除</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>试题数量查看</td>
                    <td>点击试题数量可查看关联的试题列表</td>
                    <td>弹窗显示试题列表,包含题干、题型、章节、难度等信息</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>章/节拆分显示</td>
                    <td>表格拆分为"章"和"节"两列,分别显示关联的章节名称和小节名称</td>
                    <td>"章"列显示章节名称(用"、"分隔);"节"列显示所有小节名称(平铺,用"、"分隔);内容超过10个字显示"...",鼠标悬停显示完整内容;无关联显示"未关联章节"/"无小节"</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>章节选择交互</td>
                    <td>添加/编辑弹窗中选择关联章节</td>
                    <td>下拉多选框,支持搜索章节名称,支持全选/清空,最多显示50个章节</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>空状态提示</td>
                    <td>科目下无知识点时的友好提示</td>
                    <td>居中显示"暂无知识点"图标和文字,引导用户点击【添加知识点】按钮</td>
                    <td>P1</td>
                  </tr>
                  <tr>
                    <td>创建信息展示</td>
                    <td>显示知识点的创建时间和创建人</td>
                    <td>表格中显示"创建时间"和"创建人"列,支持按创建时间排序</td>
                    <td>P1</td>
                  </tr>
                  <tr>
                    <td>知识点搜索</td>
                    <td>在当前科目下搜索知识点</td>
                    <td>右上角搜索框,实时过滤知识点名称,支持模糊匹配</td>
                    <td>P2</td>
                  </tr>
                  <tr>
                    <td>启用/禁用知识点</td>
                    <td>操作列新增【启用/禁用】按钮</td>
                    <td>启用状态显示"禁用"按钮,点击后二次确认;禁用状态显示"启用"按钮,点击后直接执行;切换后刷新列表</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>状态筛选</td>
                    <td>右上角新增"启用状态"筛选下拉框</td>
                    <td>默认"启用",可选"全部/启用/禁用",实时更新列表</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>禁用影响提示</td>
                    <td>禁用前弹出确认提示,显示关联试题数量和影响范围</td>
                    <td>试题数量>0时显示详细影响,试题数量=0时简化提示</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>状态徽章显示</td>
                    <td>禁用知识点名称旁显示"已禁用"徽章</td>
                    <td>淡红色背景,深红色文字,圆角徽章</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>软删除操作</td>
                    <td>支持将知识点标记为已删除而不是物理删除</td>
                    <td>点击删除按钮后,知识点状态变为deleted,仍可查询;已删除知识点在列表中默认不显示,可通过筛选器查看;提供恢复功能;关联的试题仍可显示知识点名称但带"已删除"标签</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>标记过时操作</td>
                    <td>支持将知识点标记为已过时</td>
                    <td>操作列提供"标记过时"按钮;点击后知识点状态变为deprecated;已过时知识点仍可在试题管理时选择,但有警告提示</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>状态标签显示</td>
                    <td>在知识点列表和试卷中显示知识点状态标签</td>
                    <td>已删除知识点显示红色"已删除"标签;已过时知识点显示黄色"已过时"标签;禁用知识点显示灰色"已禁用"标签;状态标签显示在知识点名称右侧</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>恢复已删除知识点</td>
                    <td>支持恢复被软删除的知识点</td>
                    <td>在已删除知识点列表中,操作列提供"恢复"按钮;点击后知识点状态恢复为active;Toast提示"知识点已恢复";关联试题的"已删除"标签自动消失</td>
                    <td>P1</td>
                  </tr>
                  <tr>
                    <td>取消过时标记</td>
                    <td>支持取消知识点的过时标记</td>
                    <td>在已过时知识点列表中,操作列提供"取消过时"按钮;点击后知识点状态恢复为active;Toast提示"已取消过时标记"</td>
                    <td>P1</td>
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
                    <td>知识点名称</td>
                    <td>String</td>
                  <tr>
                    <td>难易程度</td>
                    <td>Integer</td>
                    <td>1-5星</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>3</td>
                    <td>1星(简单)到5星(困难),用金色星星显示</td>
                  </tr>
                  <tr>
                    <td>出现频率</td>
                    <td>Integer</td>
                    <td>1-5星</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>3</td>
                    <td>1星(低频)到5星(高频),用金色星星显示</td>
                  </tr>
                    <td>1-100字符</td>
                    <td>✓</td>
                    <td>科目内唯一</td>
                    <td>无</td>
                    <td>支持中文、英文、数字</td>
                  </tr>
                  <tr>
                    <td>章</td>
                    <td>Computed</td>
                    <td>基于chapterIds计算</td>
                    <td>✗</td>
                    <td>无</td>
                    <td>-</td>
                    <td>显示章节名称,用"、"分隔,超过10字显示"...",悬浮显示完整内容</td>
                  </tr>
                  <tr>
                    <td>节</td>
                    <td>Computed</td>
                    <td>基于chapterIds计算</td>
                    <td>✗</td>
                    <td>无</td>
                    <td>-</td>
                    <td>显示所有小节名称(平铺),用"、"分隔,超过10字显示"...",悬浮显示完整内容</td>
                  </tr>
                  <tr>
                    <td>关联章节ID列表</td>
                    <td>Array</td>
                    <td>0-N个章节ID</td>
                    <td>✗</td>
                    <td>无</td>
                    <td>[]</td>
                    <td>底层数据字段,允许不关联章节</td>
                  </tr>
                  <tr>
                    <td>试题关联</td>
                    <td>Reference</td>
                    <td>-</td>
                    <td>✗</td>
                    <td>无</td>
                    <td>-</td>
                    <td>通过试题的knowledgePointId字段关联</td>
                  </tr>
                  <tr>
                    <td>所属科目ID</td>
                    <td>String</td>
                    <td>固定格式</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>-</td>
                    <td>只读,从科目树获取</td>
                  </tr>
                  <tr>
                    <td>创建时间</td>
                    <td>DateTime</td>
                    <td>YYYY-MM-DD HH:mm:ss</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>系统当前时间</td>
                    <td>自动生成,不可编辑</td>
                  </tr>
                  <tr>
                    <td>创建人</td>
                    <td>String</td>
                    <td>1-50字符</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>当前登录用户</td>
                    <td>自动获取,不可编辑</td>
                  </tr>
                  <tr>
                    <td>更新时间</td>
                    <td>DateTime</td>
                    <td>YYYY-MM-DD HH:mm:ss</td>
                    <td>✗</td>
                    <td>无</td>
                    <td>null</td>
                    <td>编辑时自动更新</td>
                  </tr>
                  <tr>
                    <td>知识点ID</td>
                    <td>String</td>
                    <td>UUID格式</td>
                    <td>✓</td>
                    <td>全局唯一</td>
                    <td>自动生成</td>
                    <td>系统自动生成,不可修改</td>
                  </tr>
                  <tr>
                    <td>知识点状态</td>
                    <td>Enum</td>
                    <td>4种状态</td>
                    <td>✓</td>
                    <td>无</td>
                    <td>active</td>
                    <td>active(启用) / disabled(禁用) / deleted(已删除) / deprecated(已过时);已删除和已过时知识点默认不显示,可通过筛选器查看;不影响已关联试题的数据完整性</td>
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
                      <td>用户在知识点管理页面,左侧树选中"财务战略管理"科目</td>
                      <td>右侧显示该科目的知识点列表</td>
                      <td>应展示所有知识点,包括知识点名称、关联章节、试题数量、创建时间、创建人</td>
                    </tr>
                    <tr>
                      <td>AC-02</td>
                      <td>用户点击【添加知识点】按钮</td>
                      <td>输入"会计核算基本前提",选择关联章节,提交</td>
                      <td>系统验证通过,知识点列表新增该知识点,Toast提示成功</td>
                    </tr>
                    <tr>
                      <td>AC-03</td>
                      <td>科目下已存在知识点"财务报表分析方法"</td>
                      <td>用户尝试添加同名知识点</td>
                      <td>系统提示"该科目下已存在相同的知识点名称",拒绝添加</td>
                    </tr>
                    <tr>
                      <td>AC-04</td>
                      <td>知识点"现金流量管理"已被10道试题引用</td>
                      <td>用户尝试删除该知识点</td>
                      <td>系统提示"该知识点已被10道试题引用,删除后这些试题将失去知识点关联,确定继续吗?",允许删除</td>
                    </tr>
                    <tr>
                      <td>AC-05</td>
                      <td>知识点"财务报表分析方法"关联了3道试题</td>
                      <td>用户点击试题数量"3"</td>
                      <td>弹窗显示关联的3道试题,包含题干、题型、章节等信息</td>
                    </tr>
                    <tr>
                      <td>AC-06</td>
                      <td>用户删除知识点"现金流量管理"</td>
                      <td>确认删除操作</td>
                      <td>知识点被删除,所有关联该知识点的试题的knowledgePointId字段被清空</td>
                    </tr>
                    <tr>
                      <td>AC-07</td>
                      <td>用户编辑知识点"财务报表分析方法"</td>
                      <td>修改名称为"财务报表综合分析方法",增加关联章节</td>
                      <td>系统验证通过,知识点信息更新,Toast提示"知识点编辑成功"</td>
                    </tr>
                    <tr>
                      <td>AC-08</td>
                      <td>科目"财务战略管理"下已存在知识点"会计核算基本前提"</td>
                      <td>用户编辑其他知识点,修改名称为"会计核算基本前提"</td>
                      <td>系统提示"该科目下已存在相同的知识点名称",拒绝保存</td>
                    </tr>
                    <tr>
                      <td>AC-09</td>
                      <td>用户添加知识点</td>
                      <td>输入名称"财务分析基础",不选择关联章节,直接提交</td>
                      <td>系统验证通过,知识点添加成功,关联章节列显示"未关联章节"</td>
                    </tr>
                    <tr>
                      <td>AC-10</td>
                      <td>用户添加知识点</td>
                      <td>输入名称"跨章节知识点",选择3个关联章节,提交</td>
                      <td>系统验证通过,知识点添加成功,关联章节列显示"第一章 总论、第二章 预算管理、第三章 成本管理"</td>
                    </tr>
                    <tr>
                      <td>AC-11</td>
                      <td>科目"财务战略管理"下没有任何知识点</td>
                      <td>左侧树选中该科目</td>
                      <td>右侧表格显示空状态,居中显示"暂无知识点"图标和文字,引导用户点击【添加知识点】按钮</td>
                    </tr>
                    <tr>
                      <td>AC-12</td>
                      <td>知识点"会计核算基本前提"未被任何试题引用</td>
                      <td>用户尝试删除该知识点</td>
                      <td>系统提示"确定要删除知识点'会计核算基本前提'吗?删除后无法恢复",确认后删除成功</td>
                    </tr>
                    <tr>
                      <td>AC-13</td>
                      <td>用户在知识点列表中</td>
                      <td>在搜索框输入"财务报表"</td>
                      <td>列表实时过滤,仅显示名称包含"财务报表"的知识点,如"财务报表分析方法"、"财务报表综合分析"</td>
                    </tr>
                    <tr>
                      <td>AC-14</td>
                      <td>科目"财务战略管理"下有15个知识点</td>
                      <td>左侧树选中该科目</td>
                      <td>右侧表格显示15个知识点,包含知识点名称、关联章节、试题数量、创建时间、创建人列</td>
                    </tr>
                    <tr>
                      <td>AC-15</td>
                      <td>用户点击知识点"会计核算基本前提"的【编辑】按钮</td>
                      <td>弹窗预填现有数据</td>
                      <td>弹窗显示,所属科目只读,知识点名称和关联章节预填,可修改</td>
                    </tr>
                    <tr>
                      <td>AC-16</td>
                      <td>科目下有5个章节</td>
                      <td>用户添加知识点,打开章节关联下拉框</td>
                      <td>下拉框显示5个章节选项,支持多选,支持搜索章节名称,支持全选/清空</td>
                    </tr>
                    <tr>
                      <td>AC-17</td>
                      <td>用户删除知识点,该知识点关联了3个章节和5道试题</td>
                      <td>确认删除操作</td>
                      <td>知识点被删除,章节不受影响,5道试题的knowledgePointId字段被清空,试题本身不删除</td>
                    </tr>
                    <tr>
                      <td>AC-18</td>
                      <td>用户在知识点列表中</td>
                      <td>点击"创建时间"列的排序按钮</td>
                      <td>列表按创建时间升序/降序排序,最新创建的知识点排在前面(降序)或后面(升序)</td>
                    </tr>
                    <tr>
                      <td>AC-19</td>
                      <td>知识点"现金流量管理"已被10道试题引用,状态为"启用"</td>
                      <td>用户点击操作列【禁用】按钮,查看确认弹窗内容,点击【确认禁用】</td>
                      <td>弹窗显示"该知识点已被10道试题引用",确认后知识点状态变为"disabled",如果筛选器为"启用",该知识点从列表中消失,Toast提示"知识点已禁用",试题的knowledgePointIds数组不清空</td>
                    </tr>
                    <tr>
                      <td>AC-20</td>
                      <td>知识点"财务分析基础"未被任何试题引用,状态为"启用"</td>
                      <td>用户点击操作列【禁用】按钮,查看确认弹窗内容,点击【确认禁用】</td>
                      <td>弹窗显示简化提示,不显示试题数量,确认后知识点状态变为"disabled",Toast提示"知识点已禁用"</td>
                    </tr>
                    <tr>
                      <td>AC-21</td>
                      <td>知识点"税收优惠政策"状态为"禁用",当前筛选器为"全部"</td>
                      <td>用户点击操作列【启用】按钮</td>
                      <td>无二次确认弹窗,知识点状态立即变为"active","已禁用"徽章消失,Toast提示"知识点已启用"</td>
                    </tr>
                    <tr>
                      <td>AC-22</td>
                      <td>科目"财务战略管理"下有8个启用知识点,2个禁用知识点</td>
                      <td>左侧树选中该科目,页面加载完成</td>
                      <td>筛选器默认选中"启用",表格仅显示8个启用知识点,禁用知识点不显示</td>
                    </tr>
                    <tr>
                      <td>AC-27</td>
                      <td>用户打开添加知识点弹窗</td>
                      <td>难易程度和出现频率默认为3星,点击第5颗星,提交表单</td>
                      <td>知识点添加成功,列表中对应字段显示5颗金色实心星★</td>
                    </tr>
                    <tr>
                      <td>AC-28</td>
                      <td>用户打开编辑知识点弹窗</td>
                      <td>查看星级字段预填情况</td>
                      <td>难易程度和出现频率正确显示当前星级,可通过点击修改</td>
                    </tr>
                    <tr>
                      <td>AC-29</td>
                      <td>用户查看知识点列表</td>
                      <td>观察难易程度和出现频率列</td>
                      <td>所有知识点正确显示1-5颗金色星星,实心星表示评分,空心星☆占位,鼠标悬停无交互(只读模式)</td>
                    </tr>
                    <tr>
                      <td>AC-30</td>
                      <td>用户在添加/编辑弹窗中</td>
                      <td>鼠标悬停在第4颗星上,观察视觉反馈</td>
                      <td>前4颗星变为实心★(预览效果),移开鼠标后恢复到实际选中的星级</td>
                    </tr>
                    <tr>
                      <td>AC-23</td>
                      <td>用户在"财务战略管理"科目下,当前筛选器为"启用"</td>
                      <td>选择筛选器"禁用"</td>
                      <td>表格立即刷新,显示2个禁用知识点,启用知识点不显示,禁用知识点的名称旁显示"已禁用"徽章</td>
                    </tr>
                    <tr>
                      <td>AC-24</td>
                      <td>用户在"财务战略管理"科目下,当前筛选器为"启用"</td>
                      <td>选择筛选器"全部"</td>
                      <td>表格显示所有10个知识点(8个启用+2个禁用),禁用知识点的名称旁显示"已禁用"徽章,启用知识点正常显示</td>
                    </tr>
                    <tr>
                      <td>AC-25</td>
                      <td>试题Q001关联了已禁用知识点"财务报表分析方法"</td>
                      <td>用户在试题管理页面打开该试题编辑弹窗,查看知识点关联字段</td>
                      <td>关联列表显示"财务报表分析方法(已禁用)",可点击删除按钮移除关联,知识点下拉选择器不显示该已禁用知识点</td>
                    </tr>
                    <tr>
                      <td>AC-26</td>
                      <td>用户在"财务战略管理"科目下,筛选器为"启用",仅显示1个知识点</td>
                      <td>用户禁用该唯一知识点,确认禁用操作</td>
                      <td>该知识点从列表中消失,显示空状态提示"当前科目下没有启用的知识点",提示文案下方显示"可通过筛选器查看已禁用知识点"</td>
                    </tr>
                    <tr>
                      <td>AC-31</td>
                      <td>用户在知识点列表中点击某个知识点的【删除】按钮</td>
                      <td>确认软删除</td>
                      <td>知识点状态变为deleted,列表中该知识点消失,Toast提示"知识点已删除",知识点数据仍保留在数据库中;关联的试题仍可显示该知识点名称但带红色"已删除"标签</td>
                    </tr>
                    <tr>
                      <td>AC-32</td>
                      <td>用户在知识点列表中点击某个知识点的【标记过时】按钮</td>
                      <td>确认标记过时</td>
                      <td>知识点状态变为deprecated,知识点右侧显示黄色"已过时"标签,Toast提示"已标记为过时";该知识点仍可在试题管理时选择,但有警告提示</td>
                    </tr>
                    <tr>
                      <td>AC-33</td>
                      <td>用户在知识点列表筛选器中选择状态"已删除"</td>
                      <td>查看已删除知识点列表</td>
                      <td>列表显示所有已删除知识点,每个知识点右侧显示红色"已删除"标签,操作列提供【恢复】按钮</td>
                    </tr>
                    <tr>
                      <td>AC-34</td>
                      <td>用户在知识点列表筛选器中选择状态"已过时"</td>
                      <td>查看已过时知识点列表</td>
                      <td>列表显示所有已过时知识点,每个知识点右侧显示黄色"已过时"标签,操作列提供【取消过时】按钮</td>
                    </tr>
                    <tr>
                      <td>AC-35</td>
                      <td>用户在已删除知识点列表中点击某个知识点的【恢复】按钮</td>
                      <td>确认恢复</td>
                      <td>知识点状态恢复为active,知识点从已删除列表中消失,Toast提示"知识点已恢复";关联试题的红色"已删除"标签自动消失,知识点重新出现在正常列表中</td>
                    </tr>
                    <tr>
                      <td>AC-36</td>
                      <td>用户在已过时知识点列表中点击某个知识点的【取消过时】按钮</td>
                      <td>确认取消过时标记</td>
                      <td>知识点状态恢复为active,黄色"已过时"标签消失,Toast提示"已取消过时标记";试题管理中选择该知识点时不再有警告提示</td>
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

    <!-- 弹窗组件 -->
    <AddKnowledgePointModal
      :visible="addModalVisible"
      :active-subject="activeSubject"
      :active-node="activeNode"
      @update:visible="addModalVisible = $event"
      @submit="handleAddKnowledgePoint"
    />

    <EditKnowledgePointModal
      :visible="editModalVisible"
      :knowledge-point="editingKnowledgePoint"
      :active-node="activeNode"
      @update:visible="editModalVisible = $event"
      @submit="handleEditKnowledgePoint"
    />

    <DeleteConfirmModal
      :visible="deleteModalVisible"
      :title="deleteModalTitle"
      :message="deleteModalMessage"
      :error-message="deleteModalError"
      :confirm-button-text="deleteModalButtonText"
      @update:visible="deleteModalVisible = $event"
      @confirm="handleDeleteConfirm"
    />

    <QuestionListModal
      :visible="questionListModalVisible"
      :knowledge-point-id="selectedKnowledgePointId"
      :knowledge-point-name="selectedKnowledgePointName"
      @update:visible="questionListModalVisible = $event"
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
import { ref, computed, onMounted, watch } from 'vue'
import { useKnowledgePointStore } from '@/stores/knowledgePoint'
import { useChapterStore } from '@/stores/chapter'
import { useToast } from '@/composables/useToast'
import AppLayout from '@/components/Layout/AppLayout.vue'
import TabNavigation from '@/components/Tab/TabNavigation.vue'
import Toast from '@/components/Feedback/Toast.vue'
import SubjectTree from './components/SubjectTree.vue'
import KnowledgePointTable from './components/KnowledgePointTable.vue'
import AddKnowledgePointModal from './components/AddKnowledgePointModal.vue'
import EditKnowledgePointModal from './components/EditKnowledgePointModal.vue'
import DeleteConfirmModal from '@/views/category-management/components/DeleteConfirmModal.vue'
import QuestionListModal from './components/QuestionListModal.vue'
import type {
  KnowledgePoint,
  KnowledgePointFormData,
  SubjectTreeNode,
  FilterState
} from './types'

const knowledgePointStore = useKnowledgePointStore()
const chapterStore = useChapterStore()
const { toastVisible, toastMessage, toastType, showToast } = useToast()

// 标签页配置
const tabs = [
  { key: 'prototype', label: '原型展示', icon: '🎨' },
  { key: 'requirements', label: '需求文档', icon: '📋' },
  { key: 'style-guide', label: '样式指南', icon: '🎯' }
]

// 当前激活的筛选器（科目/章/节）
const activeFilter = ref<FilterState>({
  type: 'subject',
  id: '',
  subjectId: ''
})

// 当前激活的节点（包含完整信息）
const activeNode = ref<{
  type: 'subject' | 'chapter' | 'section'
  id: string
  name: string
  chapterId?: string
  chapterName?: string
  subjectId: string
} | null>(null)

// 添加按钮是否启用 - 只有点击章节后才启用
const isAddEnabled = computed(() => {
  return activeFilter.value.type === 'chapter' || activeFilter.value.type === 'section'
})

// 状态筛选（默认显示全部）
const statusFilter = ref<string>('all')

// 切换科目时重置状态筛选，确保默认展示全部数据
watch(
  () => activeFilter.value.subjectId,
  (newSubjectId, oldSubjectId) => {
    if (newSubjectId !== oldSubjectId) {
      statusFilter.value = 'all'
    }
  }
)

// 当前科目名称（用于表格显示）
const activeSubjectName = computed(() => {
  if (!activeFilter.value.subjectId) return ''
  const projects = knowledgePointStore.projectTreeWithChapters
  for (const project of projects) {
    const subject = project.subjects.find(s => s.id === activeFilter.value.subjectId)
    if (subject) return subject.name
  }
  return ''
})

// 当前项目名称（用于表格显示）
const activeProjectName = computed(() => {
  if (!activeFilter.value.subjectId) return ''
  const projects = knowledgePointStore.projectTreeWithChapters
  for (const project of projects) {
    const subject = project.subjects.find(s => s.id === activeFilter.value.subjectId)
    if (subject) return project.name
  }
  return ''
})

// 当前选中的科目对象（用于传递给弹窗组件）
const activeSubject = computed<SubjectTreeNode | null>(() => {
  if (!activeFilter.value.subjectId) return null
  const projects = knowledgePointStore.projectTreeWithChapters
  for (const project of projects) {
    const subject = project.subjects.find(s => s.id === activeFilter.value.subjectId)
    if (subject) {
      return {
        id: subject.id,
        projectId: subject.projectId,
        projectName: project.name,
        name: subject.name,
        chapters: subject.chapters
      }
    }
  }
  return null
})

// 弹窗控制
const addModalVisible = ref(false)
const editModalVisible = ref(false)
const deleteModalVisible = ref(false)
const questionListModalVisible = ref(false)

// 编辑状态
const editingKnowledgePoint = ref<KnowledgePoint | null>(null)

// 删除/禁用确认状态
const deleteModalTitle = ref('')
const deleteModalMessage = ref('')
const deleteModalError = ref('')
const deleteModalButtonText = ref('确认删除')
const deletingKnowledgePoint = ref<KnowledgePoint | null>(null)
const confirmActionType = ref<'delete' | 'disable'>('delete')

// 试题列表弹窗状态
const selectedKnowledgePointId = ref('')
const selectedKnowledgePointName = ref('')

/**
 * 当前科目的知识点列表（根据筛选器类型精确筛选）
 */
const currentKnowledgePoints = computed(() => {
  if (!activeFilter.value.subjectId) return []

  const allKps = knowledgePointStore.getKnowledgePointsBySubject(activeFilter.value.subjectId).value

  // 根据筛选器类型进行精确筛选
  if (activeFilter.value.type === 'subject') {
    // 选择科目：显示该科目下所有知识点
    return allKps
  } else if (activeFilter.value.type === 'chapter') {
    // 选择章：仅显示关联到该章的知识点
    const filterSectionId = getFilterSectionId(activeFilter.value.id, activeFilter.value.type)
    if (!filterSectionId) return []
    return allKps.filter(kp => kp.chapterIds?.includes(filterSectionId))
  } else if (activeFilter.value.type === 'section') {
    // 选择子节：显示关联到该子节所属章的知识点
    const filterSectionId = getFilterSectionId(activeFilter.value.id, activeFilter.value.type)
    if (!filterSectionId) return []
    return allKps.filter(kp => kp.chapterIds?.includes(filterSectionId))
  }

  return []
})

/**
 * 根据状态筛选的知识点列表
 */
const filteredKnowledgePoints = computed(() => {
  if (statusFilter.value === 'all') {
    return currentKnowledgePoints.value
  }
  return currentKnowledgePoints.value.filter(kp => kp.status === statusFilter.value)
})

/**
 * 根据子节ID查找所属的section ID
 */
function findSectionIdBySubSection(subSectionId: string): string | null {
  // 首先检查是否是子节ID，确保 subSections.value 存在
  if (!chapterStore.subSections.value) {
    return null
  }
  
  const subSection = chapterStore.subSections.value.find(ss => ss.id === subSectionId)
  if (subSection) {
    // 如果是子节，返回其父section的ID
    return subSection.sectionId
  }
  
  return null
}

/**
 * 根据章节或子节ID查找最终用于筛选的section ID
 */
function getFilterSectionId(id: string, filterType: 'subject' | 'chapter' | 'section'): string | null {
  if (filterType === 'section') {
    // 检查是否是子节ID
    const sectionId = findSectionIdBySubSection(id)
    if (sectionId) {
      return sectionId
    }
  }
  return id
}

/**
 * 初始化: 选中第一个科目
 */
onMounted(() => {
  const firstProject = knowledgePointStore.projectTreeWithChapters[0]
  if (firstProject && firstProject.subjects.length > 0) {
    const firstSubject = firstProject.subjects[0]
    activeFilter.value = {
      type: 'subject',
      id: firstSubject.id,
      subjectId: firstSubject.id
    }
  }
})

/**
 * 筛选器切换事件（科目/章/节）
 */
const handleFilterChange = (filter: FilterState) => {
  activeFilter.value = filter
  
  // 更新activeNode信息
  const projects = knowledgePointStore.projectTreeWithChapters
  let nodeInfo = null
  
  if (filter.type === 'subject') {
    // 科目节点
    for (const project of projects) {
      const subject = project.subjects.find(s => s.id === filter.id)
      if (subject) {
        nodeInfo = {
          type: 'subject',
          id: subject.id,
          name: subject.name,
          subjectId: subject.id
        }
        break
      }
    }
  } else if (filter.type === 'chapter') {
    // 章节节点
    for (const project of projects) {
      for (const subject of project.subjects) {
        const chapter = subject.chapters.find(ch => ch.id === filter.id)
        if (chapter) {
          nodeInfo = {
            type: 'chapter',
            id: chapter.id,
            name: chapter.name,
            subjectId: subject.id
          }
          break
        }
      }
      if (nodeInfo) break
    }
  } else if (filter.type === 'section') {
    // 小节节点
    for (const project of projects) {
      for (const subject of project.subjects) {
        for (const chapter of subject.chapters) {
          const section = chapter.sections.find(sec => sec.id === filter.id)
          if (section) {
            nodeInfo = {
              type: 'section',
              id: section.id,
              name: section.name,
              chapterId: chapter.id,
              chapterName: chapter.name,
              subjectId: subject.id
            }
            break
          }
        }
        if (nodeInfo) break
      }
      if (nodeInfo) break
    }
  }
  
  activeNode.value = nodeInfo
}

/**
 * 打开添加知识点弹窗
 */
const openAddKnowledgePointModal = () => {
  if (!activeFilter.value.subjectId) {
    showToast('请先选择科目', { type: 'error' })
    return
  }
  addModalVisible.value = true
}

/**
 * 处理添加知识点
 */
const handleAddKnowledgePoint = (data: KnowledgePointFormData) => {
  try {
    knowledgePointStore.addKnowledgePoint(data)
    showToast('知识点添加成功', { type: 'success' })
  } catch (error) {
    showToast((error as Error).message, { type: 'error' })
  }
}

/**
 * 打开编辑知识点弹窗
 */
const openEditKnowledgePointModal = (kp: KnowledgePoint) => {
  editingKnowledgePoint.value = kp
  editModalVisible.value = true
}

/**
 * 处理编辑知识点
 */
const handleEditKnowledgePoint = (id: string, updates: Partial<KnowledgePointFormData>) => {
  try {
    knowledgePointStore.updateKnowledgePoint(id, updates)
    showToast('知识点编辑成功', { type: 'success' })
  } catch (error) {
    showToast((error as Error).message, { type: 'error' })
  }
}

/**
 * 打开删除知识点确认弹窗
 */
const openDeleteKnowledgePointModal = (kp: KnowledgePoint) => {
  confirmActionType.value = 'delete'
  deletingKnowledgePoint.value = kp
  deleteModalTitle.value = '确认删除知识点'
  deleteModalMessage.value = `确定要删除知识点"${kp.name}"吗？`
  deleteModalButtonText.value = '确认删除'
  deleteModalError.value = ''
  deleteModalVisible.value = true
}

/**
 * 处理删除/禁用确认
 */
const handleDeleteConfirm = () => {
  if (!deletingKnowledgePoint.value) return

  try {
    if (confirmActionType.value === 'delete') {
      knowledgePointStore.deleteKnowledgePoint(deletingKnowledgePoint.value.id)
      showToast('知识点删除成功', { type: 'success' })
    } else {
      handleToggleStatus(deletingKnowledgePoint.value)
    }
    deleteModalVisible.value = false
  } catch (error) {
    deleteModalError.value = (error as Error).message
  }
}

/**
 * 打开启用/禁用确认弹窗
 */
const openToggleStatusModal = (kp: KnowledgePoint) => {
  // 如果是启用操作,直接执行
  if (kp.status === 'disabled') {
    handleToggleStatus(kp)
    return
  }

  // 如果是禁用操作,显示确认弹窗
  confirmActionType.value = 'disable'
  deletingKnowledgePoint.value = kp
  deleteModalTitle.value = '确认禁用知识点'
  deleteModalMessage.value = `确定要禁用知识点"${kp.name}"吗？`
  deleteModalButtonText.value = '确认禁用'
  deleteModalError.value = ''
  deleteModalVisible.value = true
}

/**
 * 处理状态切换
 */
const handleToggleStatus = (kp: KnowledgePoint) => {
  try {
    knowledgePointStore.toggleKnowledgePointStatus(kp.id)
    const message = kp.status === 'active' ? '知识点已禁用' : '知识点已启用'
    showToast(message, { type: 'success' })
  } catch (error) {
    showToast((error as Error).message, { type: 'error' })
  }
}

/**
 * 打开试题列表弹窗
 */
const openQuestionListModal = (knowledgePointId: string) => {
  const kp = knowledgePointStore.getKnowledgePointById(knowledgePointId)
  if (kp) {
    selectedKnowledgePointId.value = knowledgePointId
    selectedKnowledgePointName.value = kp.name
    questionListModalVisible.value = true
  }
}

/**
 * 批量启用
 */
const handleBatchEnable = (ids: string[]) => {
  try {
    knowledgePointStore.batchToggleStatus(ids, 'active')
    showToast(`已成功启用 ${ids.length} 个知识点`, { type: 'success' })
  } catch (error) {
    showToast((error as Error).message, { type: 'error' })
  }
}

/**
 * 批量禁用
 */
const handleBatchDisable = (ids: string[]) => {
  // TODO: 添加确认弹窗
  try {
    knowledgePointStore.batchToggleStatus(ids, 'disabled')
    showToast(`已成功禁用 ${ids.length} 个知识点`, { type: 'success' })
  } catch (error) {
    showToast((error as Error).message, { type: 'error' })
  }
}

/**
 * 批量删除
 */
const handleBatchDelete = (ids: string[]) => {
  // TODO: 添加确认弹窗
  try {
    knowledgePointStore.batchDelete(ids)
    showToast(`已成功删除 ${ids.length} 个知识点`, { type: 'success' })
  } catch (error) {
    showToast((error as Error).message, { type: 'error' })
  }
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
