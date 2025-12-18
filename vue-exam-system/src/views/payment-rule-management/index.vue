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
                  <li><strong>适用对象过滤</strong>: 每个模板标注适用对象(试题/试卷/章节),编辑页面自动过滤不适用的模板</li>
                  <li><strong>只读字段</strong>: 模板编码、显示名称、适用对象、参数占位符、说明均为只读,仅支持修改启用状态和排序</li>
                  <li><strong>科目不配置规则</strong>: 科目仅作为组织结构和目录分类,不是实际的内容单元,因此不配置收费规则。章节是最合适的收费粒度,既有足够的内容价值,又保持了灵活性。如需整科目售卖,可通过商品套餐包含多个章节实现</li>
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
                    <td>题/卷/章</td>
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
                    <td>题/卷/章</td>
                    <td>{TIER=VIP}</td>
                    <td>启用</td>
                    <td>全站会员等级 ≥ VIP</td>
                  </tr>
                  <tr>
                    <td>T004</td>
                    <td>SVIP及以上</td>
                    <td>题/卷/章</td>
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
                    <td>题/卷/章</td>
                    <td>{START},{END}</td>
                    <td>启用</td>
                    <td>在时间窗口内开放</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <!-- 权限验证流程设计 -->
            <section class="permission-verification">
              <h3>权限验证流程设计</h3>

              <div class="requirement-section">
                <h4>验证时机与节点</h4>
                <table class="spec-table">
                  <thead>
                    <tr>
                      <th width="20%">验证节点</th>
                      <th width="25%">触发时机</th>
                      <th width="30%">验证内容</th>
                      <th width="25%">未授权处理</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>考试列表页</td>
                      <td>页面加载时</td>
                      <td>批量验证所有考试的访问权限</td>
                      <td>显示锁定图标,标注所需权限</td>
                    </tr>
                    <tr>
                      <td>进入考试</td>
                      <td>点击"开始考试"按钮时</td>
                      <td>验证考试级别的收费规则</td>
                      <td>弹窗提示购买,展示可选商品</td>
                    </tr>
                    <tr>
                      <td>加载试卷</td>
                      <td>考试初始化时</td>
                      <td>验证试卷级别的收费规则</td>
                      <td>根据规则展示部分题目或全部锁定</td>
                    </tr>
                    <tr>
                      <td>显示试题</td>
                      <td>渲染每道题目时</td>
                      <td>验证题目级别的收费规则</td>
                      <td>隐藏题目内容,显示购买提示</td>
                    </tr>
                    <tr>
                      <td>查看解析</td>
                      <td>提交答案后</td>
                      <td>验证解析查看权限</td>
                      <td>解析区域显示锁定,引导升级会员</td>
                    </tr>
                    <tr>
                      <td>访问知识点</td>
                      <td>点击知识点标签时</td>
                      <td>验证知识点关联内容的权限</td>
                      <td>显示知识点概要,详情需要权限</td>
                    </tr>
                    <tr>
                      <td>下载试卷</td>
                      <td>点击"下载PDF"按钮时</td>
                      <td>验证下载权限(通常需要VIP)</td>
                      <td>提示升级会员才能下载</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="requirement-section">
                <h4>验证逻辑流程</h4>
                <ol class="process-list">
                  <li><strong>用户身份识别</strong>
                    <ul>
                      <li>获取用户登录状态和用户ID</li>
                      <li>查询用户会员等级(普通/VIP/SVIP)</li>
                      <li>查询用户已购商品列表</li>
                    </ul>
                  </li>
                  <li><strong>内容规则获取</strong>
                    <ul>
                      <li>获取当前内容的收费规则编码</li>
                      <li>解析规则参数(如章节ID、试卷ID等)</li>
                      <li>检查规则是否在有效期内(限时规则)</li>
                    </ul>
                  </li>
                  <li><strong>权限匹配判断</strong>
                    <ul>
                      <li>T001(免费): 直接通过</li>
                      <li>T002(章节通票): 检查用户是否购买该章节通票</li>
                      <li>T003/T004(VIP/SVIP): 检查用户会员等级</li>
                      <li>T005(章节通票或VIP): 满足任一条件即可</li>
                      <li>T006(试卷专属票): 检查是否购买该试卷</li>
                      <li>T009(试看N题): 计算已查看题目数量</li>
                      <li>T010(限时开放): 检查当前时间是否在窗口内</li>
                    </ul>
                  </li>
                  <li><strong>缓存处理</strong>
                    <ul>
                      <li>验证结果缓存5分钟(减少数据库查询)</li>
                      <li>购买成功后立即清除相关缓存</li>
                      <li>会员升级后刷新全部权限缓存</li>
                    </ul>
                  </li>
                </ol>
              </div>

              <div class="requirement-section">
                <h4>API接口验证规范</h4>
                <table class="spec-table">
                  <thead>
                    <tr>
                      <th width="30%">API接口</th>
                      <th width="20%">验证级别</th>
                      <th width="50%">验证逻辑</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>GET /api/exams</td>
                      <td>列表级</td>
                      <td>返回所有考试,标注每个考试的权限状态</td>
                    </tr>
                    <tr>
                      <td>GET /api/exams/:id</td>
                      <td>实体级</td>
                      <td>无权限返回403,有权限返回完整数据</td>
                    </tr>
                    <tr>
                      <td>GET /api/papers/:id/questions</td>
                      <td>批量级</td>
                      <td>根据权限过滤题目列表,返回可见题目</td>
                    </tr>
                    <tr>
                      <td>POST /api/exams/:id/submit</td>
                      <td>操作级</td>
                      <td>验证是否有提交答案的权限</td>
                    </tr>
                    <tr>
                      <td>GET /api/questions/:id/analysis</td>
                      <td>字段级</td>
                      <td>根据权限决定是否返回解析字段</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- 商品体系与购买流程 -->
            <section class="product-system">
              <h3>商品体系与购买流程</h3>

              <div class="requirement-section">
                <h4>商品类型定义</h4>
                <table class="spec-table">
                  <thead>
                    <tr>
                      <th width="15%">商品类型</th>
                      <th width="20%">权益范围</th>
                      <th width="15%">有效期</th>
                      <th width="15%">价格区间</th>
                      <th width="35%">包含权限</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>VIP月卡</td>
                      <td>全站</td>
                      <td>30天</td>
                      <td>¥29-49</td>
                      <td>所有VIP标记的内容,无限次答题,查看解析</td>
                    </tr>
                    <tr>
                      <td>VIP季卡</td>
                      <td>全站</td>
                      <td>90天</td>
                      <td>¥79-99</td>
                      <td>同月卡,价格更优惠</td>
                    </tr>
                    <tr>
                      <td>VIP年卡</td>
                      <td>全站</td>
                      <td>365天</td>
                      <td>¥199-299</td>
                      <td>同月卡,赠送额外权益</td>
                    </tr>
                    <tr>
                      <td>SVIP年卡</td>
                      <td>全站</td>
                      <td>365天</td>
                      <td>¥399-599</td>
                      <td>所有内容访问,下载权限,专属客服</td>
                    </tr>
                    <tr>
                      <td>章节通票</td>
                      <td>单章节</td>
                      <td>永久</td>
                      <td>¥9.9-29.9</td>
                      <td>该章节下所有题目和子章节</td>
                    </tr>
                    <tr>
                      <td>试卷单次票</td>
                      <td>单试卷</td>
                      <td>7天</td>
                      <td>¥4.9-9.9</td>
                      <td>该试卷所有题目,可重复练习</td>
                    </tr>
                    <tr>
                      <td>知识点包</td>
                      <td>知识点集合</td>
                      <td>永久</td>
                      <td>¥19.9-49.9</td>
                      <td>相关知识点的所有题目</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="requirement-section">
                <h4>购买流程设计</h4>
                <ol class="process-list">
                  <li><strong>触发购买</strong>
                    <ul>
                      <li>访问受限内容时自动弹出购买提示</li>
                      <li>主动点击"升级VIP"按钮</li>
                      <li>试看额度用完时引导购买</li>
                    </ul>
                  </li>
                  <li><strong>商品选择</strong>
                    <ul>
                      <li>智能推荐:根据当前访问内容推荐最合适的商品</li>
                      <li>对比展示:同时展示多个可选方案的性价比</li>
                      <li>限时优惠:新用户首购优惠,节日促销等</li>
                    </ul>
                  </li>
                  <li><strong>支付流程</strong>
                    <ul>
                      <li>支付方式:支付宝、微信支付、银联</li>
                      <li>订单确认:显示商品信息、价格、有效期</li>
                      <li>发票开具:支持电子发票</li>
                    </ul>
                  </li>
                  <li><strong>权限生效</strong>
                    <ul>
                      <li>支付成功后立即生效(实时)</li>
                      <li>发送购买成功通知(站内信+邮件)</li>
                      <li>自动跳转到之前访问的内容</li>
                    </ul>
                  </li>
                </ol>
              </div>

              <div class="requirement-section">
                <h4>订单与权限管理</h4>
                <ul>
                  <li><strong>订单状态</strong>: 待支付 → 支付中 → 已支付 → 已生效 → 已过期</li>
                  <li><strong>自动续费</strong>: VIP会员支持自动续费,到期前3天提醒</li>
                  <li><strong>退款规则</strong>:
                    <ul>
                      <li>未使用:7天内无条件退款</li>
                      <li>已使用:按使用比例退款(VIP会员)</li>
                      <li>永久商品:使用后不支持退款</li>
                    </ul>
                  </li>
                  <li><strong>权限叠加</strong>: 购买多个商品时,权限自动叠加,有效期顺延</li>
                </ul>
              </div>
            </section>

            <!-- 规则组合与优先级 -->
            <section class="rule-combination">
              <h3>规则组合与优先级</h3>

              <div class="requirement-section">
                <h4>规则优先级定义</h4>
                <p>当多个规则同时存在时,按以下优先级处理(数字越小优先级越高):</p>
                <table class="spec-table">
                  <thead>
                    <tr>
                      <th width="15%">优先级</th>
                      <th width="20%">规则类型</th>
                      <th width="65%">说明</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>T001 免费</td>
                      <td>最高优先级,设置为免费后忽略其他所有规则</td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td>T010 限时开放</td>
                      <td>在时间窗口内,临时覆盖其他收费规则</td>
                    </tr>
                    <tr>
                      <td>3</td>
                      <td>T009 试看N题</td>
                      <td>允许部分访问,超出后应用其他规则</td>
                    </tr>
                    <tr>
                      <td>4</td>
                      <td>T004 SVIP及以上</td>
                      <td>最高会员等级要求</td>
                    </tr>
                    <tr>
                      <td>5</td>
                      <td>T003 VIP及以上</td>
                      <td>普通会员等级要求</td>
                    </tr>
                    <tr>
                      <td>6</td>
                      <td>T005 章节通票或VIP</td>
                      <td>组合规则,满足任一即可</td>
                    </tr>
                    <tr>
                      <td>7</td>
                      <td>T002 章节通票</td>
                      <td>单一付费规则</td>
                    </tr>
                    <tr>
                      <td>8</td>
                      <td>T006 试卷专属票</td>
                      <td>最具体的付费规则</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="requirement-section">
                <h4>规则继承关系</h4>
                <ul>
                  <li><strong>向下继承</strong>: 上级实体的规则自动应用到下级
                    <ul>
                      <li>章节 → 小节 → 试题</li>
                      <li>考试规则 → 试卷 → 试题</li>
                    </ul>
                  </li>
                  <li><strong>覆盖原则</strong>: 下级可以设置更严格的规则覆盖上级
                    <ul>
                      <li>章节设置VIP,试题可以设置SVIP(更严格)</li>
                      <li>章节设置VIP,试题不能设置免费(更宽松,无效)</li>
                    </ul>
                  </li>
                  <li><strong>组合策略</strong>: 多个规则来源时的处理
                    <ul>
                      <li>试题同时属于章节和知识点:取最宽松的规则</li>
                      <li>试卷包含不同规则的试题:试卷规则优先</li>
                    </ul>
                  </li>
                </ul>
              </div>

              <div class="requirement-section">
                <h4>典型场景示例</h4>
                <table class="spec-table">
                  <thead>
                    <tr>
                      <th width="20%">场景</th>
                      <th width="30%">规则配置</th>
                      <th width="50%">实际效果</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>新课程推广</td>
                      <td>章节:T010(限时3天) + T003(VIP)</td>
                      <td>前3天所有用户免费,之后仅VIP可访问</td>
                    </tr>
                    <tr>
                      <td>试用体验</td>
                      <td>试卷:T009(试看3题) + T006(试卷票)</td>
                      <td>可免费做前3题,继续需购买试卷票</td>
                    </tr>
                    <tr>
                      <td>会员专属</td>
                      <td>章节:T004(SVIP)</td>
                      <td>该章节仅SVIP会员可访问</td>
                    </tr>
                    <tr>
                      <td>灵活付费</td>
                      <td>章节:T005(通票或VIP)</td>
                      <td>用户可选择购买通票或升级VIP</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- 具体业务场景说明 -->
            <section class="business-scenarios">
              <h3>具体业务场景说明</h3>

              <div class="requirement-section">
                <h4>试看规则(T009)详细逻辑</h4>
                <ul>
                  <li><strong>题目计数方式</strong>:
                    <ul>
                      <li>按试卷中题目顺序计算,前N题指第1题到第N题</li>
                      <li>组合题按大题计数,1个组合题算1题(不管包含几个小问)</li>
                      <li>跳题不影响计数,只要查看过就计入已看数量</li>
                    </ul>
                  </li>
                  <li><strong>试看权限范围</strong>:
                    <ul>
                      <li>可查看题目内容和选项</li>
                      <li>可以提交答案并查看对错</li>
                      <li>不能查看答案解析(显示"购买后查看完整解析")</li>
                      <li>不能下载试卷</li>
                    </ul>
                  </li>
                  <li><strong>超出试看后</strong>:
                    <ul>
                      <li>第N+1题开始显示模糊处理或锁定图标</li>
                      <li>弹出购买提示:"试看已结束,购买后继续答题"</li>
                      <li>提供快捷购买入口</li>
                    </ul>
                  </li>
                </ul>
              </div>

              <div class="requirement-section">
                <h4>限时开放(T010)详细逻辑</h4>
                <ul>
                  <li><strong>时间窗口设置</strong>:
                    <ul>
                      <li>使用服务器时间,避免客户端修改时间绕过</li>
                      <li>支持设置开始时间和结束时间(精确到分钟)</li>
                      <li>可设置周期性开放(如每周末开放)</li>
                    </ul>
                  </li>
                  <li><strong>窗口期内权限</strong>:
                    <ul>
                      <li>所有用户都可以访问,无需登录(可配置)</li>
                      <li>享受完整权限,包括查看解析</li>
                      <li>可以下载和打印(如果原本支持)</li>
                    </ul>
                  </li>
                  <li><strong>窗口期结束后</strong>:
                    <ul>
                      <li>自动恢复原有收费规则</li>
                      <li>已经开始答题的用户可以完成当前考试(宽限期)</li>
                      <li>发送通知提醒用户限免即将结束</li>
                    </ul>
                  </li>
                </ul>
              </div>

              <div class="requirement-section">
                <h4>会员体系(T003/T004)详细逻辑</h4>
                <ul>
                  <li><strong>会员等级判定</strong>:
                    <ul>
                      <li>普通用户:未购买任何会员</li>
                      <li>VIP会员:购买VIP月卡/季卡/年卡且在有效期内</li>
                      <li>SVIP会员:购买SVIP年卡且在有效期内</li>
                    </ul>
                  </li>
                  <li><strong>权益继承关系</strong>:
                    <ul>
                      <li>SVIP包含VIP的所有权益</li>
                      <li>设置"VIP及以上"时,SVIP自动满足</li>
                      <li>设置"SVIP及以上"时,仅SVIP满足</li>
                    </ul>
                  </li>
                  <li><strong>会员专属功能</strong>:
                    <ul>
                      <li>VIP:无限答题、查看解析、错题本、学习报告</li>
                      <li>SVIP:包含VIP权益+下载试卷、导出错题、专属题库、1对1答疑</li>
                    </ul>
                  </li>
                </ul>
              </div>

              <div class="requirement-section">
                <h4>章节通票(T002)详细逻辑</h4>
                <ul>
                  <li><strong>通票范围</strong>:
                    <ul>
                      <li>包含该章节下的所有小节</li>
                      <li>包含该章节下的所有试题</li>
                      <li>新增的内容自动包含(动态更新)</li>
                    </ul>
                  </li>
                  <li><strong>有效期限</strong>:
                    <ul>
                      <li>永久有效(默认)</li>
                      <li>可设置有效期(如购买后180天)</li>
                    </ul>
                  </li>
                  <li><strong>组合购买优惠</strong>:
                    <ul>
                      <li>购买3个章节享受9折</li>
                      <li>购买5个章节享受8折</li>
                      <li>购买整个科目享受7折</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </section>

            <!-- 数据模型设计 -->
            <section class="data-model">
              <h3>数据模型设计</h3>

              <div class="requirement-section">
                <h4>用户权限表 (user_permissions)</h4>
                <table class="constraint-table">
                  <thead>
                    <tr>
                      <th width="20%">字段名</th>
                      <th width="15%">类型</th>
                      <th width="15%">约束</th>
                      <th width="50%">说明</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>id</td>
                      <td>String</td>
                      <td>主键</td>
                      <td>权限记录ID</td>
                    </tr>
                    <tr>
                      <td>user_id</td>
                      <td>String</td>
                      <td>非空,索引</td>
                      <td>用户ID</td>
                    </tr>
                    <tr>
                      <td>permission_type</td>
                      <td>Enum</td>
                      <td>非空</td>
                      <td>权限类型:vip/svip/chapter/paper/knowledge</td>
                    </tr>
                    <tr>
                      <td>resource_id</td>
                      <td>String</td>
                      <td>可空</td>
                      <td>资源ID(章节ID/试卷ID等,VIP类型时为空)</td>
                    </tr>
                    <tr>
                      <td>start_time</td>
                      <td>DateTime</td>
                      <td>非空</td>
                      <td>权限生效时间</td>
                    </tr>
                    <tr>
                      <td>end_time</td>
                      <td>DateTime</td>
                      <td>可空</td>
                      <td>权限失效时间(null表示永久)</td>
                    </tr>
                    <tr>
                      <td>order_id</td>
                      <td>String</td>
                      <td>非空</td>
                      <td>关联的订单ID</td>
                    </tr>
                    <tr>
                      <td>status</td>
                      <td>Enum</td>
                      <td>非空</td>
                      <td>状态:active/expired/refunded</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="requirement-section">
                <h4>商品订单表 (orders)</h4>
                <table class="constraint-table">
                  <thead>
                    <tr>
                      <th width="20%">字段名</th>
                      <th width="15%">类型</th>
                      <th width="15%">约束</th>
                      <th width="50%">说明</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>id</td>
                      <td>String</td>
                      <td>主键</td>
                      <td>订单ID</td>
                    </tr>
                    <tr>
                      <td>order_no</td>
                      <td>String</td>
                      <td>唯一,非空</td>
                      <td>订单号(显示给用户)</td>
                    </tr>
                    <tr>
                      <td>user_id</td>
                      <td>String</td>
                      <td>非空,索引</td>
                      <td>购买用户ID</td>
                    </tr>
                    <tr>
                      <td>product_id</td>
                      <td>String</td>
                      <td>非空</td>
                      <td>商品ID</td>
                    </tr>
                    <tr>
                      <td>product_name</td>
                      <td>String</td>
                      <td>非空</td>
                      <td>商品名称(冗余存储)</td>
                    </tr>
                    <tr>
                      <td>amount</td>
                      <td>Decimal</td>
                      <td>非空</td>
                      <td>订单金额</td>
                    </tr>
                    <tr>
                      <td>payment_method</td>
                      <td>Enum</td>
                      <td>可空</td>
                      <td>支付方式:alipay/wechat/unionpay</td>
                    </tr>
                    <tr>
                      <td>payment_time</td>
                      <td>DateTime</td>
                      <td>可空</td>
                      <td>支付时间</td>
                    </tr>
                    <tr>
                      <td>status</td>
                      <td>Enum</td>
                      <td>非空</td>
                      <td>订单状态:pending/paid/cancelled/refunded</td>
                    </tr>
                    <tr>
                      <td>created_at</td>
                      <td>DateTime</td>
                      <td>非空</td>
                      <td>创建时间</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="requirement-section">
                <h4>内容规则配置表 (content_rules)</h4>
                <table class="constraint-table">
                  <thead>
                    <tr>
                      <th width="20%">字段名</th>
                      <th width="15%">类型</th>
                      <th width="15%">约束</th>
                      <th width="50%">说明</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>id</td>
                      <td>String</td>
                      <td>主键</td>
                      <td>配置ID</td>
                    </tr>
                    <tr>
                      <td>content_type</td>
                      <td>Enum</td>
                      <td>非空</td>
                      <td>内容类型:question/paper/chapter</td>
                    </tr>
                    <tr>
                      <td>content_id</td>
                      <td>String</td>
                      <td>非空,索引</td>
                      <td>内容ID</td>
                    </tr>
                    <tr>
                      <td>rule_code</td>
                      <td>String</td>
                      <td>非空</td>
                      <td>规则编码(T001-T010)</td>
                    </tr>
                    <tr>
                      <td>rule_params</td>
                      <td>JSON</td>
                      <td>可空</td>
                      <td>规则参数(如试看数量、时间窗口等)</td>
                    </tr>
                    <tr>
                      <td>priority</td>
                      <td>Integer</td>
                      <td>非空</td>
                      <td>优先级(1-10,越小越高)</td>
                    </tr>
                    <tr>
                      <td>created_by</td>
                      <td>String</td>
                      <td>非空</td>
                      <td>创建人</td>
                    </tr>
                    <tr>
                      <td>created_at</td>
                      <td>DateTime</td>
                      <td>非空</td>
                      <td>创建时间</td>
                    </tr>
                  </tbody>
                </table>
              </div>
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
                    <td>可选值:question/exam/chapter,标注模板可用于哪些类型的内容</td>
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

    <!-- 启用/禁用确认弹窗 -->
    <ToggleStatusConfirmModal
      :visible="isToggleStatusModalVisible"
      :action-type="toggleActionType"
      :message="toggleMessage"
      entity-name="收费规则"
      @update:visible="isToggleStatusModalVisible = $event"
      @confirm="handleToggleStatusConfirm"
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
import ToggleStatusConfirmModal from '@/components/ToggleStatusConfirmModal.vue'
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

// 启用/禁用确认弹窗相关状态
const isToggleStatusModalVisible = ref(false)
const toggleActionType = ref<'enable' | 'disable'>('enable')
const toggleMessage = ref('')
const toggleRule = ref<PaymentRule | null>(null)

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
 * 处理切换状态 - 显示确认弹窗
 */
function handleToggleStatus(template: PaymentRule) {
  toggleRule.value = template

  if (template.status === 'active') {
    // 禁用收费规则
    toggleActionType.value = 'disable'
    toggleMessage.value = `确认要禁用收费规则【${template.displayName}】吗？`
  } else {
    // 启用收费规则
    toggleActionType.value = 'enable'
    toggleMessage.value = `确认要启用收费规则【${template.displayName}】吗？`
  }

  isToggleStatusModalVisible.value = true
}

/**
 * 确认切换启用/禁用状态
 */
function handleToggleStatusConfirm() {
  try {
    if (!toggleRule.value) return

    ruleStore.toggleRuleStatus(toggleRule.value.id)
    const newStatus = toggleRule.value.status === 'active' ? '禁用' : '启用'
    showToast(`已${newStatus}收费规则`)
    isToggleStatusModalVisible.value = false
  } catch (error) {
    showToast(error instanceof Error ? error.message : '状态切换失败', { type: 'error' })
  }
}
</script>

<style scoped>
.tab-panel {
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

/* 新增章节样式 */
.permission-verification,
.product-system,
.rule-combination,
.business-scenarios,
.data-model {
  margin-bottom: 48px;
}

.process-list {
  list-style: decimal;
  padding-left: 24px;
}

.process-list > li {
  color: var(--primary-text);
  font-weight: 600;
  margin-bottom: 16px;
  line-height: 1.8;
}

.process-list ul {
  list-style: none;
  padding-left: 20px;
  margin-top: 8px;
}

.process-list ul li {
  color: var(--secondary-text);
  font-weight: normal;
  margin-bottom: 8px;
  position: relative;
  padding-left: 16px;
}

.process-list ul li::before {
  content: '•';
  color: var(--accent);
  font-weight: bold;
  position: absolute;
  left: 0;
}

.requirement-section p {
  color: var(--secondary-text);
  font-size: 15px;
  line-height: 1.8;
  margin-bottom: 16px;
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
