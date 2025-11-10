<template>
  <div class="student-page">
    <aside class="sidebar">
      <div class="brand-block">
        <div class="brand-logo">领</div>
        <div class="brand-info">
          <span class="brand-name">领匠教育</span>
          <span class="brand-desc">学员学习中心</span>
        </div>
      </div>

      <nav class="sidebar-menu">
        <button class="menu-item is-active">
          <i class="menu-icon">📚</i>
          <span>我的题库</span>
        </button>
      </nav>

      <div class="sidebar-card">
        <div class="qr-placeholder">QR</div>
        <p>扫码登录 APP<br />海量课程免费体验 7 天</p>
      </div>
    </aside>

    <main class="main-area">
      <TabNavigation :tabs="tabs" :default-tab="'prototype'">
        <!-- 原型展示标签页 -->
        <template #prototype>
          <div class="tab-content">
            <!-- 项目和科目筛选 -->
            <section class="filter-section">
        <label class="filter-label">
          项目：
          <select
            v-model="activeProjectId"
            class="project-select"
            @change="handleProjectChange"
          >
            <option
              v-for="project in projects"
              :key="project.id"
              :value="project.id"
            >
              {{ project.name }}
            </option>
          </select>
        </label>

        <div class="subject-tabs" v-if="subjectOptions.length">
          <button
            v-for="subject in subjectOptions"
            :key="subject.id"
            class="subject-tab"
            :class="{ 'is-active': subject.id === activeSubjectId }"
            @click="selectSubject(subject.id)"
          >
            {{ subject.name }}
            <span v-if="subject.badge" class="subject-badge">{{ subject.badge }}</span>
          </button>
        </div>
      </section>

      <!-- 个人数据 -->
      <section class="summary-section">
        <div class="stat-grid">
          <article
            v-for="stat in currentSurface.stats"
            :key="stat.id"
            class="stat-item"
            @click="handleStatClick(stat)"
          >
            <div class="stat-icon">{{ stat.icon }}</div>
            <div class="stat-meta">
              <span class="stat-title">{{ stat.title }}</span>
              <span class="stat-value">{{ stat.value }}</span>
            </div>
          </article>
        </div>
      </section>

      <!-- 练习导航 -->
      <section class="practice-nav">
        <button
          v-for="entry in currentSurface.practiceEntries"
          :key="entry.key"
          class="practice-item"
          :class="{ 'is-active': entry.key === activePracticeKey, 'is-vip': entry.vip }"
          @click="activatePractice(entry.key)"
        >
          <span class="practice-icon">{{ entry.icon }}</span>
          <span class="practice-label">{{ entry.label }}</span>
          <span v-if="entry.badge" class="practice-badge">{{ entry.badge }}</span>
        </button>
      </section>

      <!-- 资源面板 -->
      <section class="resource-panel">
        <header class="resource-header" v-if="statPreview">
          <div class="stat-preview">
            <strong>{{ statPreview.title }}</strong>
            <span>{{ statPreview.description }}</span>
          </div>
        </header>

        <div class="resource-list">
          <!-- 树形结构：章节练习 -->
          <template v-if="activePracticeKey === 'chapter'">
            <div class="chapter-tree">
              <article
                v-for="chapter in chapterTree"
                :key="chapter.id"
                class="chapter-card"
              >
                <div class="chapter-row">
                  <div class="chapter-main">
                    <button
                      class="chapter-toggle"
                      :aria-label="isChapterExpanded(chapter.id) ? '收起章节' : '展开章节'"
                      @click="toggleChapter(chapter.id)"
                    >
                      <span
                        class="chapter-toggle-icon"
                        :class="{ expanded: isChapterExpanded(chapter.id) }"
                      />
                    </button>
                    <div class="chapter-title">
                      <span class="chapter-order">{{ chapter.order }}</span>
                      <span class="chapter-name">{{ chapter.title }}</span>
                    </div>
                  </div>

                  <!-- 右侧：统计 + 单按钮（根据做题进度） -->
                  <div class="chapter-extra">
                    <div class="chapter-meta">
                      正确率：<strong>{{ chapter.accuracy }}%</strong>
                      <span class="meta-split">|</span>
                      已做/总题：<strong>{{ chapter.done }}/{{ chapter.total }}</strong>
                    </div>
                    <div class="chapter-actions">
                      <button
                        v-if="chapter.done === 0"
                        class="btn btn-primary"
                        @click="startExam()"
                      >做题</button>
                      <button
                        v-else-if="chapter.done < chapter.total"
                        class="btn btn-secondary"
                        @click="redoByChapter(chapter.title)"
                      >继续</button>
                      <button
                        v-else
                        class="btn btn-danger"
                        @click="redoByChapter(chapter.title)"
                      >重做</button>
                    </div>
                  </div>
                </div>

                <transition name="chapter-slide">
                  <div v-if="isChapterExpanded(chapter.id)" class="chapter-sections">
                    <div
                      v-for="sec in chapter.sections"
                      :key="sec.id"
                      class="section-row"
                    >
                      <div class="section-info" @click="selectChapterNode({ title: sec.title })">
                        <span class="section-dot"></span>
                        <span class="section-name">{{ sec.title }}</span>
                      </div>

                      <div class="section-meta">
                        正确率：<strong>{{ sec.accuracy || 0 }}%</strong>
                        <span class="meta-split">|</span>
                        已做/总题：<strong>{{ (sec.done || 0) }}/{{ (sec.total || 0) }}</strong>
                      </div>

                      <div class="section-actions">
                        <button
                          v-if="(sec.done || 0) === 0"
                          class="btn btn-primary"
                          @click="startExam()"
                        >做题</button>
                        <button
                          v-else-if="(sec.done || 0) < (sec.total || 0)"
                          class="btn btn-secondary"
                          @click="redoByChapter(sec.title)"
                        >继续</button>
                        <button
                          v-else
                          class="btn btn-danger"
                          @click="redoByChapter(sec.title)"
                        >重做</button>
                      </div>
                    </div>
                  </div>
                </transition>
              </article>
            </div>

            <p v-if="!chapterTree.length" class="empty-state">
              当前入口暂无试卷或练习，稍后再来看看吧～
            </p>
          </template>

          <template v-else>
            <!-- 非章节练习：使用分页后的数据 -->
            <article
              v-for="item in pagedResourceItems"
              :key="item.id"
              class="resource-item"
            >
              <div class="resource-main">
                <div class="resource-title">{{ item.title }}</div>
                <div class="resource-subtitle">{{ item.subtitle }}</div>
              </div>
              <div class="resource-actions">
                <button class="primary-link" @click="handleStartExam(item)">{{ item.action }}</button>
              </div>
            </article>

            <!-- 替换为通用分页组件 -->
            <Pagination
              v-if="showPagination && totalItems > 0"
              :current-page="currentPage"
              :total="totalItems"
              :page-size="pageSize"
              @page-change="handlePageChange"
              @size-change="handlePageSizeChange"
            />

            <p v-if="!resourceItems.length" class="empty-state">
              当前入口暂无试卷或练习，稍后再来看看吧～
            </p>
          </template>
        </div>
          </section>
          </div>
        </template>

        <!-- 需求文档标签页 -->
        <template #requirements>
          <div class="tab-content requirements-tab">
            <div class="requirements-header">
              <h2>我的题库需求文档</h2>
              <p>详细的功能需求、业务规则和验收标准，确保学员端题库系统实现标准化。</p>
            </div>

            <div class="requirements-content">
              <section class="business-requirements">
                <h3>业务需求</h3>

                <div class="requirement-section">
                  <h4>核心目标</h4>
                  <ul>
                    <li>为学员提供集中化的题库练习管理入口,支持跨项目、跨科目的题库访问</li>
                    <li>提供多维度的学习数据统计,帮助学员实时掌握备考进度和薄弱环节</li>
                    <li>支持多种练习模式(章节练习、历年真题、考前冲刺、入学测试),满足不同学习阶段需求</li>
                    <li>打造直观友好的学员界面,降低学习门槛,提升用户体验</li>
                  </ul>
                </div>

                <div class="requirement-section">
                  <h4>用户场景</h4>
                  <ul>
                    <li><strong>选择备考项目</strong>: 学员通过项目下拉菜单选择当前备考的考试项目(如"注册会计师"、"中级会计师"等),系统自动加载该项目下的所有科目</li>
                    <li><strong>科目切换练习</strong>: 在科目标签页中快速切换不同科目(如"会计"、"审计"、"税法"),每个科目独立展示统计数据和练习入口</li>
                    <li><strong>查看学习数据</strong>: 点击统计卡片(做题记录、收藏题目、错题本)查看详细的学习数据分析,了解自己的备考状态</li>
                    <li><strong>选择练习模式</strong>: 根据学习阶段选择合适的练习模式 - 基础阶段使用章节练习夯实知识点,冲刺阶段做历年真题和模拟卷</li>
                    <li><strong>开始做题</strong>: 点击试卷卡片上的"开始做题"或"继续练习"按钮,进入答题界面进行练习</li>
                    <li><strong>VIP权益识别</strong>: VIP会员可以看到专属练习资源的会员标识,非会员看到升级提示</li>
                  </ul>
                </div>

                <div class="requirement-section">
                  <h4>核心数据流</h4>
                  <ul>
                    <li><strong>项目切换流程</strong>: 选择项目下拉框 → 加载该项目的所有科目 → 自动选中第一个科目 → 刷新统计数据和练习入口 → 重置练习模式为"章节练习"</li>
                    <li><strong>科目切换流程</strong>: 点击科目标签页 → 加载该科目的统计数据(做题记录/收藏/错题) → 刷新练习入口 → 保持当前练习模式不变</li>
                    <li><strong>练习模式切换</strong>: 点击练习导航按钮(章节/真题/冲刺/测试) → 加载对应的试卷列表 → 清空统计预览状态 → 显示试卷卡片</li>
                    <li><strong>统计查看流程</strong>: 点击统计卡片 → 在资源面板顶部显示统计预览信息 → 下方列表保持当前练习模式的试卷</li>
                    <li><strong>试卷生成逻辑</strong>: 系统根据科目ID和练习类型动态生成试卷列表,章节练习生成20个章节专项练习,历年真题生成20年真题卷,考前冲刺生成20套模拟卷,入学测试生成20套诊断测试</li>
                  </ul>
                </div>

                <div class="requirement-section">
                  <h4>业务规则</h4>
                  <ul>
                    <li><strong>项目-科目联动</strong>: 切换项目时,科目标签页自动更新为该项目下的科目列表,默认选中第一个科目</li>
                    <li><strong>数据统计规则</strong>: 统计数据按科目维度独立统计,切换科目时实时更新统计卡片的数值</li>
                    <li><strong>练习模式优先级</strong>: 默认优先展示"章节练习"模式,建议学员从基础开始逐步提升</li>
                    <li><strong>试卷排序规则</strong>: 章节练习按章节顺序排序,历年真题按年份倒序,冲刺卷和测试卷按套数顺序</li>
                    <li><strong>做题进度标识</strong>: 已做过的试卷显示"继续练习",未做过的显示"开始做题"</li>
                    <li><strong>VIP标识规则</strong>: 部分练习资源(如考前冲刺卷)标记为VIP专属,非会员看到会员标识提示升级</li>
                    <li><strong>空状态处理</strong>: 当选中的科目暂无试卷资源时,显示友好的空状态提示"当前入口暂无试卷或练习,稍后再来看看吧～"</li>
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
                      <td>项目筛选器</td>
                      <td>下拉选择当前备考的考试项目</td>
                      <td>选中项目后自动加载该项目下的所有科目,科目标签页自动切换到第一个科目</td>
                      <td>P0</td>
                    </tr>
                    <tr>
                      <td>科目标签页</td>
                      <td>横向标签页展示项目下的所有科目</td>
                      <td>点击科目标签切换当前科目,选中科目高亮显示橙色下划线,同时刷新统计数据和练习资源</td>
                      <td>P0</td>
                    </tr>
                    <tr>
                      <td>统计数据卡片</td>
                      <td>展示做题记录、收藏题目、错题本三类统计数据</td>
                      <td>卡片布局采用图标+标题+数值的形式,支持点击查看详细统计信息,悬停时卡片微微上浮并显示阴影</td>
                      <td>P0</td>
                    </tr>
                    <tr>
                      <td>练习导航</td>
                      <td>提供章节练习、历年真题、考前冲刺、入学测试四种练习模式入口</td>
                      <td>采用胶囊按钮布局,选中模式高亮显示橙色背景,VIP专属模式显示会员标识(虚线边框)</td>
                      <td>P0</td>
                    </tr>
                    <tr>
                      <td>试卷列表</td>
                      <td>根据选中的练习模式动态加载对应的试卷资源</td>
                      <td>卡片式布局,展示试卷标题、副标题(题目数量/时间/难度)、元数据(参考人数/更新时间)和操作按钮</td>
                      <td>P0</td>
                    </tr>
                    <tr>
                      <td>试卷操作按钮</td>
                      <td>支持开始做题、继续练习、查看解析、下载等操作</td>
                      <td>主按钮采用橙色渐变设计,次要操作使用文字链接样式,悬停时显示操作提示</td>
                      <td>P0</td>
                    </tr>
                    <tr>
                      <td>空状态提示</td>
                      <td>当前模式无试卷时显示友好提示</td>
                      <td>居中显示灰色文字提示"当前入口暂无试卷或练习,稍后再来看看吧～"</td>
                      <td>P1</td>
                    </tr>
                    <tr>
                      <td>用户面板</td>
                      <td>显示当前登录用户信息和会员等级</td>
                      <td>包含用户头像、用户名、会员等级和"会员续费"按钮,固定在页面右上角</td>
                      <td>P1</td>
                    </tr>
                    <tr>
                      <td>侧边导航菜单</td>
                      <td>提供学员端各功能模块的入口</td>
                      <td>包含我的课程、我的题库(高亮)、我的问答、学习记录、笔记、资料、更新进度七个菜单项</td>
                      <td>P0</td>
                    </tr>
                    <tr>
                      <td>品牌区块</td>
                      <td>展示领匠教育品牌标识和学习中心标签</td>
                      <td>位于侧边栏顶部,包含品牌logo、品牌名称和描述文字</td>
                      <td>P2</td>
                    </tr>
                    <tr>
                      <td>二维码卡片</td>
                      <td>引导学员扫码下载APP</td>
                      <td>位于侧边栏底部,包含二维码占位图和引导文案"扫码登录APP,海量课程免费体验7天"</td>
                      <td>P2</td>
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
                      <td>项目ID</td>
                      <td>String</td>
                      <td>-</td>
                      <td>✓</td>
                      <td>全局唯一</td>
                      <td>无</td>
                      <td>系统生成的唯一标识符</td>
                    </tr>
                    <tr>
                      <td>项目名称</td>
                      <td>String</td>
                      <td>2-20字符</td>
                      <td>✓</td>
                      <td>无</td>
                      <td>无</td>
                      <td>如"注册会计师"、"中级会计师"</td>
                    </tr>
                    <tr>
                      <td>科目ID</td>
                      <td>String</td>
                      <td>-</td>
                      <td>✓</td>
                      <td>全局唯一</td>
                      <td>无</td>
                      <td>系统生成的唯一标识符</td>
                    </tr>
                    <tr>
                      <td>科目名称</td>
                      <td>String</td>
                      <td>2-30字符</td>
                      <td>✓</td>
                      <td>项目内唯一</td>
                      <td>无</td>
                      <td>如"会计"、"审计"、"税法"</td>
                    </tr>
                    <tr>
                      <td>试卷标题</td>
                      <td>String</td>
                      <td>5-100字符</td>
                      <td>✓</td>
                      <td>科目内唯一</td>
                      <td>无</td>
                      <td>如"第1章·会计政策变更专项练习"</td>
                    </tr>
                    <tr>
                      <td>试卷副标题</td>
                      <td>String</td>
                      <td>10-200字符</td>
                      <td>✓</td>
                      <td>无</td>
                      <td>无</td>
                      <td>展示题目数量、时间、难度等元信息</td>
                    </tr>
                    <tr>
                      <td>做题记录数</td>
                      <td>Integer</td>
                      <td>≥0</td>
                      <td>✓</td>
                      <td>无</td>
                      <td>0</td>
                      <td>已完成的试卷套数</td>
                    </tr>
                    <tr>
                      <td>收藏题目数</td>
                      <td>Integer</td>
                      <td>≥0</td>
                      <td>✓</td>
                      <td>无</td>
                      <td>0</td>
                      <td>收藏的题目数量</td>
                    </tr>
                    <tr>
                      <td>错题数量</td>
                      <td>Integer</td>
                      <td>≥0</td>
                      <td>✓</td>
                      <td>无</td>
                      <td>0</td>
                      <td>错题本中的题目数量</td>
                    </tr>
                    <tr>
                      <td>练习模式</td>
                      <td>Enum</td>
                      <td>chapter/realExam/sprint/entrance</td>
                      <td>✓</td>
                      <td>无</td>
                      <td>chapter</td>
                      <td>四种练习模式之一</td>
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
                        <td>学员首次进入我的题库页面</td>
                        <td>页面加载完成</td>
                        <td>默认选中第一个项目("高级会计师"),第一个科目("高级会计实务"),练习模式为"章节练习",显示对应的统计数据和试卷列表</td>
                      </tr>
                      <tr>
                        <td>AC-02</td>
                        <td>学员在项目下拉框中选择"注册会计师"</td>
                        <td>点击下拉框选择项目</td>
                        <td>科目标签页更新为注册会计师的6个科目("会计"、"审计"、"财务成本管理"、"公司战略与风险管理"、"经济法"、"税法"),自动选中"会计"科目</td>
                      </tr>
                      <tr>
                        <td>AC-03</td>
                        <td>学员已选择"注册会计师"项目</td>
                        <td>点击科目标签页中的"税法"</td>
                        <td>"税法"科目高亮显示橙色下划线,统计数据更新为税法科目的数据,试卷列表刷新为税法科目的章节练习试卷</td>
                      </tr>
                      <tr>
                        <td>AC-04</td>
                        <td>学员在"会计"科目页面</td>
                        <td>点击统计卡片"做题记录"</td>
                        <td>资源面板顶部显示统计预览信息"做题记录 - 最近7天完成X套",下方试卷列表保持当前练习模式(章节练习)不变</td>
                      </tr>
                      <tr>
                        <td>AC-05</td>
                        <td>学员当前在"章节练习"模式</td>
                        <td>点击练习导航中的"历年真题"</td>
                        <td>练习导航按钮"历年真题"高亮显示橙色背景,试卷列表刷新为历年真题试卷(按年份倒序),统计预览信息清空</td>
                      </tr>
                      <tr>
                        <td>AC-06</td>
                        <td>学员在"历年真题"试卷列表中</td>
                        <td>点击试卷卡片上的"开始做题"按钮</td>
                        <td>跳转到答题页面,开始该套真题的练习(具体答题页面由后续功能实现)</td>
                      </tr>
                      <tr>
                        <td>AC-07</td>
                        <td>学员查看统计卡片"我的收藏"</td>
                        <td>鼠标悬停在卡片上</td>
                        <td>卡片微微上浮(-1px),显示轻微阴影效果,提示可点击查看详情</td>
                      </tr>
                      <tr>
                        <td>AC-08</td>
                        <td>学员在"考前冲刺"模式</td>
                        <td>查看试卷卡片</td>
                        <td>VIP专属试卷的练习导航按钮显示虚线边框,非会员悬停时提示升级会员</td>
                      </tr>
                      <tr>
                        <td>AC-09</td>
                        <td>学员切换到暂无试卷资源的科目</td>
                        <td>选择该科目并切换练习模式</td>
                        <td>试卷列表区域显示空状态提示"当前入口暂无试卷或练习,稍后再来看看吧～"</td>
                      </tr>
                      <tr>
                        <td>AC-10</td>
                        <td>学员在侧边导航菜单</td>
                        <td>点击"我的题库"菜单项</td>
                        <td>"我的题库"菜单项高亮显示橙色背景和左侧橙色指示条,其他菜单项恢复默认样式</td>
                      </tr>
                      <tr>
                        <td>AC-11</td>
                        <td>学员查看用户面板</td>
                        <td>检查用户信息和会员等级</td>
                        <td>用户面板显示用户头像(橙色渐变圆角方块)、用户名"领匠学员"、会员等级"尊享版"和橙色渐变的"会员续费"按钮</td>
                      </tr>
                      <tr>
                        <td>AC-12</td>
                        <td>学员查看章节练习试卷列表</td>
                        <td>滚动查看所有试卷</td>
                        <td>显示20个章节专项练习试卷,每个试卷标题格式为"第X章·[主题]专项练习",副标题展示题目数量和当前正确率</td>
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
          <div class="tab-content style-guide-tab">
            <div class="requirements-header">
              <h2>学员端样式指南</h2>
              <p>学员端专属的设计系统和视觉规范，与管理端区分并保持品牌一致性。</p>
            </div>

            <div class="requirements-content">
              <section class="style-section">
                <h3>品牌色彩系统</h3>
                <p class="section-desc">学员端采用温暖的橙色系作为主题色,营造积极向上的学习氛围,与管理端的蓝色系形成区分。</p>

                <div class="color-grid">
                  <div class="color-item">
                    <div class="color-swatch" style="background: #ff6f3c;"></div>
                    <div class="color-info">
                      <strong>主品牌色 (Brand Primary)</strong>
                      <code>#ff6f3c</code>
                      <p>用于主要按钮、强调文本、选中状态</p>
                    </div>
                  </div>

                  <div class="color-item">
                    <div class="color-swatch" style="background: #ff8a55;"></div>
                    <div class="color-info">
                      <strong>品牌色悬停 (Brand Primary Hover)</strong>
                      <code>#ff8a55</code>
                      <p>用于按钮和交互元素的悬停状态</p>
                    </div>
                  </div>

                  <div class="color-item">
                    <div class="color-swatch" style="background: #d23e1c;"></div>
                    <div class="color-info">
                      <strong>品牌深色 (Brand Deep)</strong>
                      <code>#d23e1c</code>
                      <p>用于渐变结束、强调重点</p>
                    </div>
                  </div>

                  <div class="color-item">
                    <div class="color-swatch" style="background: #fff1eb;"></div>
                    <div class="color-info">
                      <strong>品牌浅色 (Brand Secondary)</strong>
                      <code>#fff1eb</code>
                      <p>用于背景、卡片装饰</p>
                    </div>
                  </div>

                  <div class="color-item">
                    <div class="color-swatch" style="background: #333333;"></div>
                    <div class="color-info">
                      <strong>主文本色 (Text Primary)</strong>
                      <code>#333333</code>
                      <p>用于标题、正文主要内容</p>
                    </div>
                  </div>

                  <div class="color-item">
                    <div class="color-swatch" style="background: #808080;"></div>
                    <div class="color-info">
                      <strong>次要文本色 (Text Secondary)</strong>
                      <code>#808080</code>
                      <p>用于辅助说明、次要信息</p>
                    </div>
                  </div>
                </div>
              </section>

              <section class="style-section">
                <h3>字体系统</h3>
                <p class="section-desc">使用微软雅黑作为主字体,确保中文显示效果清晰舒适。</p>

                <table class="spec-table">
                  <thead>
                    <tr>
                      <th width="20%">级别</th>
                      <th width="15%">字号</th>
                      <th width="15%">字重</th>
                      <th width="50%">用途</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>H1 主标题</td>
                      <td>24px</td>
                      <td>600</td>
                      <td>页面主标题("我的题库")</td>
                    </tr>
                    <tr>
                      <td>H2 大标题</td>
                      <td>20px</td>
                      <td>600</td>
                      <td>区块标题、强调内容</td>
                    </tr>
                    <tr>
                      <td>H3 中标题</td>
                      <td>16px</td>
                      <td>600</td>
                      <td>卡片标题、小节标题</td>
                    </tr>
                    <tr>
                      <td>正文大</td>
                      <td>14px</td>
                      <td>500</td>
                      <td>试卷标题、按钮文字</td>
                    </tr>
                    <tr>
                      <td>正文标准</td>
                      <td>13px</td>
                      <td>400</td>
                      <td>正文内容、描述文字</td>
                    </tr>
                    <tr>
                      <td>正文小</td>
                      <td>12px</td>
                      <td>400</td>
                      <td>辅助说明、元数据</td>
                    </tr>
                    <tr>
                      <td>微小文本</td>
                      <td>11px</td>
                      <td>400</td>
                      <td>时间戳、版权信息</td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section class="style-section">
                <h3>间距系统</h3>
                <p class="section-desc">采用8px基础单位的间距体系,确保视觉节奏一致。</p>

                <table class="spec-table">
                  <thead>
                    <tr>
                      <th width="20%">间距值</th>
                      <th width="80%">用途</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>8px</td>
                      <td>最小间距,用于紧密排列的元素(如图标与文字间距)</td>
                    </tr>
                    <tr>
                      <td>12px</td>
                      <td>小间距,用于卡片内部元素间距</td>
                    </tr>
                    <tr>
                      <td>16px</td>
                      <td>标准间距,用于常规元素间距(如统计卡片之间)</td>
                    </tr>
                    <tr>
                      <td>20px</td>
                      <td>中等间距,用于区块内容间距</td>
                    </tr>
                    <tr>
                      <td>24px</td>
                      <td>大间距,用于主要区块之间(如页面边距)</td>
                    </tr>
                    <tr>
                      <td>32px</td>
                      <td>超大间距,用于重要区域分隔</td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section class="style-section">
                <h3>圆角系统</h3>
                <p class="section-desc">学员端使用更大的圆角值,营造柔和友好的视觉体验。</p>

                <table class="spec-table">
                  <thead>
                    <tr>
                      <th width="20%">圆角值</th>
                      <th width="80%">应用场景</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>8px</td>
                      <td>小型元素(标签、徽章)</td>
                    </tr>
                    <tr>
                      <td>10px</td>
                      <td>统计卡片内部元素</td>
                    </tr>
                    <tr>
                      <td>12px</td>
                      <td>标准卡片、按钮、输入框</td>
                    </tr>
                    <tr>
                      <td>14px</td>
                      <td>试卷卡片、资源卡片</td>
                    </tr>
                    <tr>
                      <td>16px</td>
                      <td>大型容器、区块面板</td>
                    </tr>
                    <tr>
                      <td>18px</td>
                      <td>资源面板、主要内容区</td>
                    </tr>
                    <tr>
                      <td>20px</td>
                      <td>侧边栏容器</td>
                    </tr>
                    <tr>
                      <td>999px</td>
                      <td>胶囊按钮(练习导航、会员续费按钮)</td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section class="style-section">
                <h3>核心组件样式</h3>

                <h4>统计卡片 (Stat Card)</h4>
                <ul class="component-specs">
                  <li><strong>布局</strong>: 图标(32x32px) + 标题 + 数值,横向排列</li>
                  <li><strong>背景</strong>: 白色,1px浅灰边框</li>
                  <li><strong>圆角</strong>: 12px</li>
                  <li><strong>悬停效果</strong>: 向上浮动(-1px) + 阴影增强</li>
                  <li><strong>图标区</strong>: 橙色渐变背景,10px圆角</li>
                </ul>

                <h4>练习导航按钮 (Practice Button)</h4>
                <ul class="component-specs">
                  <li><strong>形状</strong>: 胶囊形(border-radius: 999px)</li>
                  <li><strong>默认状态</strong>: 浅灰背景(#f8f9fb) + 1px边框</li>
                  <li><strong>选中状态</strong>: 橙色半透明背景 + 橙色边框 + 加粗文字</li>
                  <li><strong>VIP标识</strong>: 虚线边框(border-style: dashed)</li>
                </ul>

                <h4>试卷卡片 (Resource Card)</h4>
                <ul class="component-specs">
                  <li><strong>布局</strong>: 横向排列,左侧内容区 + 右侧操作按钮</li>
                  <li><strong>内容层次</strong>: 标题(14px粗体) + 副标题(12px灰色) + 元数据(11px更浅灰色)</li>
                  <li><strong>圆角</strong>: 14px</li>
                  <li><strong>悬停效果</strong>: 背景变浅 + 阴影增强</li>
                </ul>

                <h4>主操作按钮 (Primary Button)</h4>
                <ul class="component-specs">
                  <li><strong>背景</strong>: 橙色渐变(#ff7b50 → #ff4d3a)</li>
                  <li><strong>形状</strong>: 胶囊形(border-radius: 999px)</li>
                  <li><strong>阴影</strong>: 0 12px 24px rgba(255, 94, 66, 0.25)</li>
                  <li><strong>悬停效果</strong>: 渐变加深 + 阴影增强 + 向上浮动(-1px)</li>
                </ul>

                <h4>侧边导航菜单 (Menu Item)</h4>
                <ul class="component-specs">
                  <li><strong>默认状态</strong>: 透明背景 + 左侧无指示条</li>
                  <li><strong>悬停状态</strong>: 浅橙色背景(rgba(255, 111, 60, 0.08)) + 左侧指示条高度60%</li>
                  <li><strong>选中状态</strong>: 橙色背景(rgba(255, 111, 60, 0.12)) + 左侧指示条高度70% + 加粗文字</li>
                  <li><strong>左侧指示条</strong>: 4px宽橙色竖条,使用高度变化动画</li>
                </ul>
              </section>

              <section class="style-section">
                <h3>与管理端的差异</h3>

                <table class="spec-table">
                  <thead>
                    <tr>
                      <th width="25%">设计元素</th>
                      <th width="35%">学员端(橙色系)</th>
                      <th width="35%">管理端(蓝色系)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>主品牌色</td>
                      <td>橙色 #ff6f3c</td>
                      <td>蓝色 #0066cc</td>
                    </tr>
                    <tr>
                      <td>圆角大小</td>
                      <td>更大(12-20px),柔和友好</td>
                      <td>适中(8-12px),专业简洁</td>
                    </tr>
                    <tr>
                      <td>卡片阴影</td>
                      <td>较深(0 12px 24px),立体感强</td>
                      <td>较浅(0 4px 12px),扁平简洁</td>
                    </tr>
                    <tr>
                      <td>按钮样式</td>
                      <td>胶囊形,渐变背景,强阴影</td>
                      <td>矩形,纯色背景,轻阴影</td>
                    </tr>
                    <tr>
                      <td>导航菜单</td>
                      <td>侧边栏固定,左侧指示条动画</td>
                      <td>顶部导航栏,图标+文字</td>
                    </tr>
                    <tr>
                      <td>整体风格</td>
                      <td>温暖活泼,适合学习场景</td>
                      <td>冷静专业,适合管理场景</td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section class="style-section">
                <h3>响应式设计</h3>

                <table class="spec-table">
                  <thead>
                    <tr>
                      <th width="20%">断点</th>
                      <th width="30%">视口宽度</th>
                      <th width="50%">布局调整</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>桌面</td>
                      <td>&gt; 1366px</td>
                      <td>侧边栏240px + 主内容区自适应,统计卡片3列网格</td>
                    </tr>
                    <tr>
                      <td>平板</td>
                      <td>980px - 1366px</td>
                      <td>侧边栏收起到顶部横向布局,统计卡片保持3列</td>
                    </tr>
                    <tr>
                      <td>移动</td>
                      <td>&lt; 768px</td>
                      <td>侧边栏横向折叠,统计卡片单列布局,科目标签页换行</td>
                    </tr>
                  </tbody>
                </table>
              </section>
            </div>
          </div>
        </template>
      </TabNavigation>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import TabNavigation from '@/components/Tab/TabNavigation.vue'
import Pagination from '@/components/Pagination/Pagination.vue'

type PracticeKey =
  | 'chapter'
  | 'realExam'
  | 'sprint'
  | 'entrance'

interface SubjectOption {
  id: string
  name: string
  badge?: string
  tone?: 'primary' | 'success' | 'warning' | 'info'
}

interface ProjectOption {
  id: string
  name: string
  subjects: SubjectOption[]
}

interface StatBlock {
  id: string
  icon: string
  title: string
  value: string
  description: string
}

interface PracticeEntry {
  key: PracticeKey
  icon: string
  label: string
  vip?: boolean
  badge?: string
}

interface ResourceItem {
  id: string
  title: string
  subtitle: string
  participants?: string
  updatedAt?: string
  action: string
  canDownload?: boolean
  canReview?: boolean
}

interface PracticeResources {
  items: ResourceItem[]
}

interface SubjectSurface {
  stats: StatBlock[]
  practiceEntries: PracticeEntry[]
  resourceConfig: Record<PracticeKey, PracticeResources>
}

// 三标签页配置
const tabs = [
  { key: 'prototype', label: '原型展示', icon: '🎨' },
  { key: 'requirements', label: '需求文档', icon: '📋' },
  { key: 'style-guide', label: '样式指南', icon: '🎯' }
]

const basePracticeEntries: PracticeEntry[] = [
  { key: 'chapter', icon: '📘', label: '章节练习' },
  { key: 'realExam', icon: '📜', label: '历年真题' },
  { key: 'sprint', icon: '⚡', label: '考前冲刺' },
  { key: 'entrance', icon: '🎯', label: '入学测试' }
]

// 章节主题库（通用）
const chapterTopics = [
  '会计政策变更', '资产减值', '金融工具', '长期股权投资', '企业合并',
  '合并报表', '收入确认', '所得税会计', '政府补助', '租赁',
  '股份支付', '每股收益', '财务报表分析', '或有事项', '债务重组',
  '非货币性资产交换', '外币折算', '会计差错更正', '资产负债表日后事项', '其他综合收益'
]

// 生成试卷数据的工厂函数
function generatePapers(subjectId: string, subjectName: string, practiceKey: PracticeKey): ResourceItem[] {
  const papers: ResourceItem[] = []
  const count = 20

  switch (practiceKey) {
    case 'chapter':
      // 章节练习：第X章 · [主题]专项练习
      for (let i = 0; i < count; i++) {
        const topic = chapterTopics[i % chapterTopics.length]
        const totalQuestions = 30 + Math.floor(Math.random() * 50)
        papers.push({
          id: `${subjectId}-ch-${i + 1}`,
          title: `第${i + 1}章 · ${topic}专项练习`,
          subtitle: `正确率：0%已做/总题：0/${totalQuestions}`,
          action: i % 4 === 0 ? '继续练习' : '开始做题',
          canReview: true
        })
      }
      break

    case 'realExam':
      // 历年真题：[年份]年真题卷
      const startYear = 2024
      for (let i = 0; i < count; i++) {
        const year = startYear - i
        papers.push({
          id: `${subjectId}-real-${year}`,
          title: `${year} 年${subjectName}真题卷`,
          subtitle: `正确率：0%已做/总题：0/12`,
          action: i === 0 ? '再做一次' : '开始做题',
          canDownload: true,
          canReview: true
        })
      }
      break

    case 'sprint':
      // 考前冲刺：考前冲刺模拟卷（第X套）
      for (let i = 0; i < count; i++) {
        papers.push({
          id: `${subjectId}-sprint-${i + 1}`,
          title: `考前冲刺模拟卷（第${i + 1}套）`,
          subtitle: `正确率：0%已做/总题：0/12`,
          action: '开始做题',
          canDownload: true
        })
      }
      break

    case 'entrance':
      // 入学测试：入学诊断测试（第X套）
      for (let i = 0; i < count; i++) {
        papers.push({
          id: `${subjectId}-entrance-${i + 1}`,
          title: `入学诊断测试（第${i + 1}套）`,
          subtitle: `正确率：0%已做/总题：0/12`,
          action: '开始测试',
          canReview: true
        })
      }
      break
  }

  return papers
}

const projects: ProjectOption[] = [
  {
    id: 'senior-accountant',
    name: '高级会计师',
    subjects: [
      { id: 'senior-acc-practice', name: '高级会计实务' },
      { id: 'senior-acc-case', name: '案例分析' }
    ]
  },
  {
    id: 'senior-economist',
    name: '高级经济师',
    subjects: [
      { id: 'senior-eco-basic', name: '经济基础知识（高级）' },
      { id: 'senior-eco-practice', name: '专业知识与实务' }
    ]
  },
  {
    id: 'senior-auditor',
    name: '高级审计师',
    subjects: [
      { id: 'senior-audit-practice', name: '审计理论与实务' }
    ]
  },
  {
    id: 'mid-accountant',
    name: '中级会计师',
    subjects: [
      { id: 'mid-acc-practice', name: '中级会计实务' },
      { id: 'mid-acc-finance', name: '财务管理' },
      { id: 'mid-acc-law', name: '经济法' }
    ]
  },
  {
    id: 'mid-economist',
    name: '中级经济师',
    subjects: [
      { id: 'mid-eco-basic', name: '经济基础知识（中级）' },
      { id: 'mid-eco-practice', name: '专业知识与实务' }
    ]
  },
  {
    id: 'cpa',
    name: '注册会计师',
    subjects: [
      { id: 'cpa-accounting', name: '会计' },
      { id: 'cpa-audit', name: '审计' },
      { id: 'cpa-finance', name: '财务成本管理' },
      { id: 'cpa-strategy', name: '公司战略与风险管理' },
      { id: 'cpa-law', name: '经济法' },
      { id: 'cpa-tax', name: '税法' }
    ]
  }
]

// 创建资源配置（为指定科目生成所有练习模块的试卷）
function createResourceConfig(subjectId: string, subjectName: string): Record<PracticeKey, PracticeResources> {
  const config = {} as Record<PracticeKey, PracticeResources>
  basePracticeEntries.forEach((entry) => {
    config[entry.key] = {
      items: generatePapers(subjectId, subjectName, entry.key)
    }
  })
  return config
}

// 为所有科目创建资源配置映射
const allSubjectConfigs: Record<string, Record<PracticeKey, PracticeResources>> = {
  // 高级会计师
  'senior-acc-practice': createResourceConfig('senior-acc-practice', '高级会计实务'),
  'senior-acc-case': createResourceConfig('senior-acc-case', '案例分析'),

  // 高级经济师
  'senior-eco-basic': createResourceConfig('senior-eco-basic', '经济基础知识（高级）'),
  'senior-eco-practice': createResourceConfig('senior-eco-practice', '专业知识与实务'),

  // 高级审计师
  'senior-audit-practice': createResourceConfig('senior-audit-practice', '审计理论与实务'),

  // 中级会计师
  'mid-acc-practice': createResourceConfig('mid-acc-practice', '中级会计实务'),
  'mid-acc-finance': createResourceConfig('mid-acc-finance', '财务管理'),
  'mid-acc-law': createResourceConfig('mid-acc-law', '经济法'),

  // 中级经济师
  'mid-eco-basic': createResourceConfig('mid-eco-basic', '经济基础知识（中级）'),
  'mid-eco-practice': createResourceConfig('mid-eco-practice', '专业知识与实务'),

  // 注册会计师
  'cpa-accounting': createResourceConfig('cpa-accounting', '会计'),
  'cpa-audit': createResourceConfig('cpa-audit', '审计'),
  'cpa-finance': createResourceConfig('cpa-finance', '财务成本管理'),
  'cpa-strategy': createResourceConfig('cpa-strategy', '公司战略与风险管理'),
  'cpa-law': createResourceConfig('cpa-law', '经济法'),
  'cpa-tax': createResourceConfig('cpa-tax', '税法')
}

// 默认空配置
const defaultResourceConfig: Record<PracticeKey, PracticeResources> = {
  chapter: { items: [] },
  realExam: { items: [] },
  sprint: { items: [] },
  entrance: { items: [] }
}

// 创建科目数据配置
function createSubjectSurface(subjectId: string, hasData: boolean = false): SubjectSurface {
  return {
    stats: hasData
      ? [
          { id: 'records', icon: '📝', title: '做题记录', value: `${50 + Math.floor(Math.random() * 200)} 套`, description: `最近 7 天完成 ${2 + Math.floor(Math.random() * 5)} 套` },
          { id: 'favorite', icon: '⭐', title: '我的收藏', value: `${20 + Math.floor(Math.random() * 80)} 题`, description: `新增收藏 ${1 + Math.floor(Math.random() * 10)} 题` },
          { id: 'wrong', icon: '⚠️', title: '我的错题', value: `${10 + Math.floor(Math.random() * 40)} 题`, description: `错误率 ${15 + Math.floor(Math.random() * 20)}%，较上周${Math.random() > 0.5 ? '下降' : '上升'}` }
        ]
      : [
          { id: 'records', icon: '📝', title: '做题记录', value: '-', description: '尚未开始练习' },
          { id: 'favorite', icon: '⭐', title: '我的收藏', value: '-', description: '收藏题目随时复习' },
          { id: 'wrong', icon: '⚠️', title: '我的错题', value: '-', description: '暂无错题记录' }
        ],
    practiceEntries: basePracticeEntries,
    resourceConfig: allSubjectConfigs[subjectId] || defaultResourceConfig
  }
}

const subjectSurfaces: Record<string, SubjectSurface> = {
  default: createSubjectSurface('default', false),

  // 高级会计师
  'senior-acc-practice': createSubjectSurface('senior-acc-practice', true),
  'senior-acc-case': createSubjectSurface('senior-acc-case', true),

  // 高级经济师
  'senior-eco-basic': createSubjectSurface('senior-eco-basic', true),
  'senior-eco-practice': createSubjectSurface('senior-eco-practice', true),

  // 高级审计师
  'senior-audit-practice': createSubjectSurface('senior-audit-practice', true),

  // 中级会计师
  'mid-acc-practice': createSubjectSurface('mid-acc-practice', true),
  'mid-acc-finance': createSubjectSurface('mid-acc-finance', true),
  'mid-acc-law': createSubjectSurface('mid-acc-law', true),

  // 中级经济师
  'mid-eco-basic': createSubjectSurface('mid-eco-basic', true),
  'mid-eco-practice': createSubjectSurface('mid-eco-practice', true),

  // 注册会计师
  'cpa-accounting': createSubjectSurface('cpa-accounting', true),
  'cpa-audit': createSubjectSurface('cpa-audit', true),
  'cpa-finance': createSubjectSurface('cpa-finance', true),
  'cpa-strategy': createSubjectSurface('cpa-strategy', true),
  'cpa-law': createSubjectSurface('cpa-law', true),
  'cpa-tax': createSubjectSurface('cpa-tax', true)
}

const activeProjectId = ref(projects[0].id)
const activeSubjectId = ref(projects[0].subjects[0].id)
const activePracticeKey = ref<PracticeKey>('chapter')
const statPreview = ref<StatBlock | null>(null)

const activeProject = computed(() => {
  return projects.find((project) => project.id === activeProjectId.value) ?? projects[0]
})

const subjectOptions = computed(() => activeProject.value.subjects)

const currentSurface = computed<SubjectSurface>(() => {
  return subjectSurfaces[activeSubjectId.value] ?? subjectSurfaces.default
})

const resourceItems = computed<ResourceItem[]>(() => {
  const config = currentSurface.value.resourceConfig[activePracticeKey.value]
  return config?.items ?? []
})
const totalItems = computed(() => resourceItems.value.length || 0)

// 分页状态（仅用于非章节练习）
const pageSize = ref(10)
const currentPage = ref(1)

// 哪些模式展示分页：历年真题、考前冲刺、入学测试
const showPagination = computed(() =>
  ['realExam', 'sprint', 'entrance'].includes(activePracticeKey.value)
)

// 总页数与分页数据
const pageCount = computed(() => {
  if (!showPagination.value) return 1
  const total = resourceItems.value.length || 0
  return Math.max(1, Math.ceil(total / pageSize.value))
})

const pagedResourceItems = computed<ResourceItem[]>(() => {
  if (!showPagination.value) return resourceItems.value
  const start = (currentPage.value - 1) * pageSize.value
  return resourceItems.value.slice(start, start + pageSize.value)
})

// 分页操作（通用分页组件回调）
function handlePageChange(page: number) {
  const safe = Math.min(Math.max(1, page), pageCount.value)
  currentPage.value = safe
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
function handlePageSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
}

// 练习模式或资源列表变化时重置到第一页
watch([activePracticeKey, resourceItems], () => {
  if (showPagination.value) currentPage.value = 1
})

watch(activeProjectId, () => {
  const firstSubject = projects
    .find((project) => project.id === activeProjectId.value)
    ?.subjects[0]
  if (firstSubject) {
    activeSubjectId.value = firstSubject.id
  }
})

watch(activeSubjectId, () => {
  syncPracticeState()
})

watch(currentSurface, () => {
  syncPracticeState()
})

function syncPracticeState() {
  const surface = currentSurface.value
  if (surface.practiceEntries.length) {
    activePracticeKey.value = surface.practiceEntries[0].key
  } else {
    activePracticeKey.value = 'chapter'
  }
  statPreview.value = null
}

function selectProject(projectId: string) {
  if (projectId === activeProjectId.value) return
  activeProjectId.value = projectId
}

function handleProjectChange() {
  // v-model已经更新了activeProjectId，这里只需要触发后续逻辑
  // watch会自动处理科目的更新
}

function selectSubject(subjectId: string) {
  activeSubjectId.value = subjectId
}

function handleStatClick(stat: StatBlock) {
  // 如果是做题记录卡片,跳转到答题记录页面
  if (stat.id === 'records') {
    router.push({ name: 'StudentExamRecords' })
    return
  }

  // 如果是我的错题卡片,跳转到错题列表页面
  if (stat.id === 'wrong') {
    router.push({ name: 'StudentWrongQuestions' })
    return
  }

  // 如果是我的收藏卡片,跳转到收藏列表页面
  if (stat.id === 'favorite') {
    router.push({ name: 'StudentFavorites' })
    return
  }

  // 其他卡片保持原有行为
  statPreview.value = stat
}

function activatePractice(key: PracticeKey) {
  if (activePracticeKey.value === key) return
  activePracticeKey.value = key
  statPreview.value = null
}

// 路由实例
const router = useRouter()

// 处理开始答题
function handleStartExam(item: ResourceItem) {
  // 跳转到答题页面
  router.push({
    name: 'StudentExam',
    params: { id: item.id }
  })
}

// 统一入口：开始做题（章节或小节）
// 无需参数，后续可扩展为接受试卷ID或标题
const startExam = () => {
  router.push('/student/exam/senior-acc-practice-real-2024')
}

// 章节练习树相关逻辑
interface ChapterSection { id: string; title: string }
interface ChapterNode {
  id: string
  order: string
  title: string
  sections: ChapterSection[]
  total: number
  done: number
  accuracy: number
}

// 展开状态
const expandedChapterIds = ref<Set<string>>(new Set())
const isChapterExpanded = (id: string) => expandedChapterIds.value.has(id)
function toggleChapter(id: string) {
  const next = new Set(expandedChapterIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expandedChapterIds.value = next
}

const activeChapterTitle = ref('')

function selectChapterNode(node: { title?: string }) {
  activeChapterTitle.value = node.title || ''
  // 可在此联动统计预览或跳转，当前保持样式展示
}

function redoByChapter(title: string) {
  activeChapterTitle.value = title
  // 在此处可以接入答题页面路由跳转
}

function analysisByChapter(title: string) {
  activeChapterTitle.value = title
  // 在此处可以接入解析页面路由跳转
}

// 将章节练习的 ResourceItem 转换为树形章节结构
const chapterTree = computed<ChapterNode[]>(() => {
  if (activePracticeKey.value !== 'chapter') return []
  const list = resourceItems.value
  return list.slice(0, 6).map((item, idx) => {
    const order = `第${idx + 1}章`
    const parsedTitle = item.title
      .replace(/^第\d+章\s*·\s*/, '')
      .replace(/专项练习$/, '') || item.title

    const sections: ChapterSection[] = [
      { id: `${item.id}-sec-1`, title: '第一节 社会工作的内涵' },
      { id: `${item.id}-sec-2`, title: '第二节 社会工作的基本原则' },
      { id: `${item.id}-sec-3`, title: '第三节 社会工作的主要领域' }
    ]

    // 从生成试卷时的 totalQuestions 构造统计（示例：正确率=0、已做=0）
    // 如果后端返回真实统计，替换为接口数据即可
    const totalMatch = item.subtitle.match(/总题：0\/(\d+)/)
    const total = totalMatch ? Number(totalMatch[1]) : 0

    return {
      id: item.id,
      order,
      title: parsedTitle,
      sections,
      total,
      done: 0,
      accuracy: 0
    }
  })
})

// 当切换科目或模式时重置展开状态
watch([activeSubjectId, activePracticeKey], () => {
  expandedChapterIds.value = new Set()
  activeChapterTitle.value = ''
})

syncPracticeState()
</script>

<style scoped>
:root {
  color-scheme: light;
}

.student-page {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
  background: #f4f5f7;
  color: var(--text-primary);
  --brand-primary: #ff6f3c;
  --brand-primary-hover: #ff8a55;
  --brand-secondary: #fff1eb;
  --brand-deep: #d23e1c;
  --text-primary: #333333;
  --text-secondary: #808080;
  --accent: var(--brand-primary);
  --student-primary: #ff443d;
  --student-primary-dark: #e63a33;
  --primary-text: #2c3e50;
  --secondary-text: #5a6c7d;
  --card-border: #e4eaf2;
}

.sidebar {
  margin: 24px 0 24px 24px;
  padding: 24px 20px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 18px 36px rgba(17, 36, 80, 0.08);
  border: 1px solid #f2f3f7;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ff8a3d 0%, #ff5545 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  box-shadow: 0 8px 18px rgba(255, 111, 60, 0.3);
}

.brand-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-name {
  font-size: 16px;
  font-weight: 600;
  color: #ff5c3c;
}

.brand-desc {
  font-size: 12px;
  color: var(--text-secondary);
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.menu-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px 10px 20px;
  border-radius: 12px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.menu-item::before {
  content: '';
  position: absolute;
  left: -16px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 0;
  border-radius: 2px;
  background: var(--brand-primary);
  transition: height 0.2s ease;
}

.menu-item:hover {
  background: rgba(255, 111, 60, 0.08);
  color: var(--brand-primary);
}

.menu-item:hover::before {
  height: 60%;
}

.menu-item.is-active {
  color: var(--brand-primary);
  font-weight: 600;
  background: rgba(255, 111, 60, 0.12);
  box-shadow: inset 0 0 0 1px rgba(255, 111, 60, 0.12);
}

.menu-item.is-active::before {
  height: 70%;
}

.menu-icon {
  font-size: 15px;
}

.sidebar-card {
  position: fixed;
  bottom: 60px;
  left: 58px;
  padding: 14px 12px;
  border-radius: 14px;
  border: 1px solid rgba(255, 111, 60, 0.12);
  background: #fff8f4;
  text-align: center;
  color: var(--brand-primary);
  font-size: 12px;
  line-height: 1.5;
  box-shadow: 0 12px 24px rgba(255, 111, 60, 0.1);
}

.qr-placeholder {
  width: 84px;
  height: 84px;
  margin: 0 auto 12px;
  border-radius: 12px;
  border: 1px dashed rgba(255, 111, 60, 0.35);
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--brand-primary);
}

.main-area {
  margin: 24px 24px 24px 16px;
  max-width: 990px;
  display: flex;
  flex-direction: column;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 22px;
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.main-header h1 {
  margin: 0 0 6px;
  font-size: 24px;
  font-weight: 600;
}

.main-header p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 13px;
}

.user-panel {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid var(--card-border);
  box-shadow: 0 12px 24px rgba(17, 36, 80, 0.08);
}

.user-avatar {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ff8060 0%, #ff4c3b 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  box-shadow: 0 10px 20px rgba(255, 111, 60, 0.25);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

.user-info strong {
  color: var(--text-primary);
  font-size: 14px;
}

.user-action {
  margin-left: auto;
  padding: 8px 18px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #ff7b50 0%, #ff4d3a 100%);
  box-shadow: 0 12px 24px rgba(255, 94, 66, 0.25);
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-action:hover {
  background: linear-gradient(135deg, var(--brand-primary-hover) 0%, #ff4d3a 100%);
}

.filter-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 18px 20px;
  /* box-shadow: 0 -2px 14px 0 rgba(0,0,0,.06);*/
  box-shadow: 0 6px 24px rgba(17, 36, 80, 0.06); 
  border: 1px solid #e4eaf2;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

.project-select {
  padding: 8px 32px 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #ffffff;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L2 4h8z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  min-width: 140px;
}

.project-select:hover {
  border-color: var(--brand-primary);
}

.project-select:focus {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px rgba(255, 111, 60, 0.1);
}

.subject-tabs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  flex: 1;
}

.subject-tab {
  padding: 10px 24px;
  background: #ffffff;
  border: 1px solid var(--card-border);
  border-radius: 8px;
  font-size: 14px;
  color: var(--primary-text);
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  position: relative;
}

.subject-tab:hover:not(.is-active) {
  background: #f8f9fb;
  border-color: #d0d5dd;
}

.subject-tab.is-active {
  background: rgba(255, 68, 61, 0.12);
  border-color: var(--student-primary);
  color: var(--student-primary);
  font-weight: 600;
}

.subject-tab.is-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 16px;
  right: 16px;
  height: 3px;
  background: var(--student-primary);
  border-radius: 2px 2px 0 0;
}

.subject-badge {
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  color: #ff783f;
  background: rgba(255, 120, 63, 0.15);
}

.summary-section {
  display: flex;
  flex-direction: column;
}

.stat-grid {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e4eaf2;
  box-shadow: 0 6px 10px rgba(17, 36, 80, 0.06);
  padding: 12px 18px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 50px;
}

.stat-item:hover {
  border-color: rgba(0, 0, 0, 0.12);
  background: #fafafa;
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
}

.stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(255, 111, 60, 0.12) 0%, rgba(255, 136, 96, 0.12) 100%);
  color: var(--brand-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.stat-meta {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.stat-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
}

.stat-value {
  font-size: 15px;
  font-weight: 700;
  color: var(--brand-primary);
  margin-left: auto;
  white-space: nowrap;
}


.practice-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 20px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 6px 24px rgba(17, 36, 80, 0.06);
  border: 1px solid #e4eaf2;
}

.practice-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  background: #f8f9fb;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.practice-item:hover {
  border-color: rgba(255, 111, 60, 0.3);
  color: var(--brand-primary);
}

.practice-item.is-active {
  border-color: rgba(255, 111, 60, 0.55);
  background: rgba(255, 111, 60, 0.1);
  color: var(--brand-primary);
  font-weight: 600;
}

.practice-item.is-vip {
  border-style: dashed;
}

.practice-icon {
  font-size: 14px;
}

.practice-badge {
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  color: #ff783f;
  background: rgba(255, 120, 63, 0.18);
}

.resource-panel {
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 6px 24px rgba(17, 36, 80, 0.06);
  border: 1px solid #e4eaf2;
  padding: 18px 22px 22px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.resource-header {
  padding: 0 0 12px 0;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--card-border);
}

.stat-preview {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: var(--text-secondary);
}

.stat-preview strong {
  color: var(--brand-primary);
  font-size: 14px;
  font-weight: 600;
}

.resource-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 18px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #ffffff;
  transition: all 0.2s ease;
}

.resource-item:hover {
  border-color: rgba(0, 0, 0, 0.12);
  background: #fafafa;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
}

.resource-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.resource-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.resource-subtitle {
  font-size: 12px;
  color: var(--text-secondary);
}

.resource-meta {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: var(--text-secondary);
}

.resource-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.text-link {
  padding: 0;
  border: none;
  background: transparent;
  color: var(--brand-primary);
  font-size: 12px;
  cursor: pointer;
}

.primary-link {
  padding: 8px 18px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #ff7b50 0%, #ff4d3a 100%);
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(255, 94, 66, 0.25);
  transition: all 0.2s ease;
}

.primary-link:hover {
  background: linear-gradient(135deg, #ff5722 0%, #e64a19 100%);
  box-shadow: 0 14px 28px rgba(255, 87, 34, 0.35);
  transform: translateY(-1px);
}

.empty-state {
  margin: 24px 0 0;
  text-align: center;
  font-size: 12px;
  color: var(--text-secondary);
}

@media (max-width: 1366px) {
  .stat-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 980px) {
  .student-page {
    grid-template-columns: 1fr;
  }

  .sidebar {
    margin: 0 24px;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    border-radius: 16px;
  }

  .sidebar-menu {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
    flex: 1;
  }

  .sidebar-card {
    display: none;
  }

  .main-area {
    margin: 24px;
  }
}

@media (max-width: 768px) {
  .main-area {
    margin: 20px;
    padding: 0;
  }

  .stat-grid {
    grid-template-columns: 1fr;
  }

  .practice-nav {
    justify-content: center;
  }

  .filter-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-label {
    font-size: 13px;
    width: 100%;
  }

  .project-select {
    width: 100%;
    min-width: auto;
  }

  .subject-tabs {
    width: 100%;
  }
}

/* 需求文档和样式指南标签页样式 */
.requirements-tab,
.style-guide-tab {
  padding: 32px;
  background: #ffffff;
  border-radius: 16px;
  margin: 0;
}

.requirements-header {
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(255, 111, 60, 0.15);
}

.requirements-header h2 {
  margin: 0 0 12px;
  font-size: 28px;
  font-weight: 700;
  color: var(--brand-primary);
  background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-deep) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.requirements-header p {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.requirements-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.placeholder-text {
  padding: 60px 20px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
  background: #fafafa;
  border-radius: 12px;
  border: 1px dashed rgba(255, 111, 60, 0.3);
}

/* 业务需求区域 */
.business-requirements,
.functional-requirements {
  margin-top: 24px;
}

.business-requirements h3,
.functional-requirements h3 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(255, 111, 60, 0.2);
}

.requirement-section {
  margin-bottom: 24px;
}

.requirement-section h4,
.functional-requirements h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--brand-primary);
  margin-bottom: 12px;
}

.requirement-section ul {
  margin: 0;
  padding-left: 24px;
}

.requirement-section li {
  margin-bottom: 10px;
  line-height: 1.7;
  color: var(--text-primary);
}

.requirement-section li strong {
  color: var(--brand-primary);
  font-weight: 600;
}

/* 表格样式 - 紫色渐变表头(功能规格、字段约束) */
.spec-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.spec-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.spec-table th {
  padding: 14px 16px;
  text-align: left;
  color: #ffffff;
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: none;
}

.spec-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  color: var(--text-primary);
  font-size: 13px;
  line-height: 1.6;
}

.spec-table tbody tr:last-child td {
  border-bottom: none;
}

.spec-table tbody tr:hover {
  background: #fafafa;
}

/* 字段约束表格 - 紫色渐变表头 */
.constraint-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.constraint-table th {
  color: #ffffff;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 验收标准表格 - 粉红色渐变表头 */
.acceptance-criteria {
  margin-top: 32px;
}

.acceptance-criteria .spec-table thead {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.acceptance-criteria th {
  color: #ffffff;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 样式指南标签页专属样式 */
.style-section {
  margin-bottom: 48px;
}

.style-section h3 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(255, 111, 60, 0.2);
}

.style-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--brand-primary);
  margin: 24px 0 12px;
}

.section-desc {
  margin-bottom: 24px;
  color: var(--text-secondary);
  line-height: 1.7;
}

/* 颜色网格 */
.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.color-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #ffffff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.color-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.color-swatch {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.color-info {
  flex: 1;
  min-width: 0;
}

.color-info strong {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.color-info code {
  display: block;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  color: var(--brand-primary);
  background: rgba(255, 111, 60, 0.08);
  padding: 4px 8px;
  border-radius: 4px;
  margin-bottom: 8px;
  width: fit-content;
}

.color-info p {
  margin: 0;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* 组件规格列表 */
.component-specs {
  margin: 12px 0 24px;
  padding-left: 24px;
  list-style: none;
}

.component-specs li {
  margin-bottom: 10px;
  line-height: 1.7;
  color: var(--text-primary);
  position: relative;
  padding-left: 0;
}

.component-specs li::before {
  content: '▸';
  color: var(--brand-primary);
  font-weight: bold;
  position: absolute;
  left: -20px;
}

.component-specs li strong {
  color: var(--brand-primary);
  font-weight: 600;
  margin-right: 4px;
}

/* 章节树卡片 */
.chapter-tree {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.chapter-card {
  border: 1px solid #f1f2f3;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  background: #fff;
  padding: 12px 16px;
}

.chapter-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chapter-toggle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid #e4eaf2;
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.chapter-toggle-icon {
  position: relative;
  width: 14px;
  height: 14px;
}
.chapter-toggle-icon::before,
.chapter-toggle-icon::after {
  content: '';
  position: absolute;
  background: #7b8794;
  border-radius: 2px;
  transition: all 0.2s ease;
}
.chapter-toggle-icon::before {
  left: 2px;
  right: 2px;
  top: 6px;
  height: 2px;
}
.chapter-toggle-icon::after {
  top: 2px;
  bottom: 2px;
  left: 6px;
  width: 2px;
}
.chapter-toggle-icon.expanded::after {
  opacity: 0;
}

.chapter-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}
.chapter-order {
  color: #222;
  font-weight: 600;
}
.chapter-name {
  color: #2c3e50;
  font-weight: 600;
}

.chapter-sections {
  margin-top: 12px;
  border-top: 1px dashed #e4eaf2;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 6px;
  border-radius: 8px;
}

.section-info {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #2c3e50;
  font-size: 13px;
}

.section-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ff443d;
}

.section-actions {
  display: inline-flex;
  gap: 8px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 12px;
  font-size: 12px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn.btn-link {
  color: #ff4d4f;
  background: transparent;
  border: none;
  padding: 0 8px;
}
.btn.btn-link:hover {
  text-decoration: underline;
}

.btn-outline {
  color: #ff443d;
  border: 1px solid #ff443d;
  background: #fff;
}
.btn-outline:hover {
  background: rgba(255, 68, 61, 0.06);
}
.btn.btn-primary {
  background: linear-gradient(135deg, #ff7a59 0%, #ff4d4f 100%);
  color: #fff;
  border: none;
  height: 32px;
  line-height: 32px;
  padding: 0 16px;
  border-radius: 20px;
  box-shadow: 0 6px 16px rgba(255, 77, 79, 0.25);
}
.btn.btn-primary:hover {
  filter: brightness(1.05);
}

.chapter-footer {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f2f2f2;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.chapter-meta {
  color: #6b6f76;
  font-size: 14px;
}
.chapter-meta strong {
  color: #ff4d4f;
  font-weight: 700;
}

.footer-left {
  font-size: 12px;
  color: #5a6c7d;
}
.footer-count {
  color: #ff443d;
  font-weight: 600;
  margin-left: 4px;
}
.footer-actions {
  display: inline-flex;
  gap: 8px;
}

.chapter-slide-enter-active,
.chapter-slide-leave-active {
  transition: all 0.2s ease;
}
.chapter-slide-enter-from,
.chapter-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}


/* 卡片与主行 */
.chapter-card {
  border: 1px solid #f1f2f3;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}
.chapter-card + .chapter-card {
  margin-top: 12px;
}

.chapter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
}

.chapter-main {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.chapter-title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}
.chapter-order { color: #999; font-weight: 500; }
.chapter-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 520px;
}

/* 中右区域：徽标 + 统计 + 按钮 */
.chapter-extra {
  display: flex;
  align-items: center;
  gap: 18px;
}

.chapter-badges .badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border-radius: 12px;
  background: #fff8f3;
  color: #ff7a00;
  border: 1px dashed #ffb38a;
  font-size: 12px;
}
.badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: #ff7a00;
  display: inline-block;
}

/* 右侧：统计 + 按钮 */
.chapter-meta, .section-meta { color: #6b6f76; font-size: 14px; }
.chapter-meta strong, .section-meta strong { color: #ff4d4f; font-weight: 700; }
.meta-split { margin: 0 8px; color: #d0d3d8; }

/* 按钮风格 */
.btn { cursor: pointer; }
.btn.btn-primary {
  background: linear-gradient(135deg, #ff7a59 0%, #ff4d4f 100%);
  color: #fff; border: none; height: 32px; line-height: 32px;
  padding: 0 16px; border-radius: 20px; box-shadow: 0 6px 16px rgba(255, 77, 79, 0.25);
}
.btn.btn-primary:hover { filter: brightness(1.05); }
.btn.btn-secondary {
  background: #f4f5f7; color: #333; border: 1px solid #e6e8eb;
  height: 32px; line-height: 32px; padding: 0 14px; border-radius: 18px;
}
.btn.btn-secondary:hover { background: #eef0f3; }
.btn.btn-danger {
  background: #ffefe9; color: #ff4d4f; border: 1px solid #ffc2b8;
  height: 32px; line-height: 32px; padding: 0 14px; border-radius: 18px;
}
.btn.btn-danger:hover { background: #ffe6de; }

/* 展开区与原样式保持一致 */
.chapter-sections { padding: 8px 16px 12px 40px; }

.section-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  column-gap: 12px;
  padding: 10px 0;
  border-bottom: 1px dashed #f0f0f0;
}
.section-row:last-child { border-bottom: none; }
.section-info { display: flex; align-items: center; gap: 8px; }
.section-dot { width: 6px; height: 6px; border-radius: 50%; background: #ff7a00; }
.section-actions .btn {
  height: 28px; line-height: 28px; padding: 0 12px; border-radius: 16px;
}

/* 展开/收起按钮：橙色圆形 + / - */
.chapter-toggle { border: none; background: transparent; cursor: pointer; }

.chapter-toggle-icon {
  width: 20px; height: 20px; display: inline-block;
  border: 1px solid #ffb38a; border-radius: 50%;
  background: #fff8f3; position: relative;
}
.chapter-toggle-icon::before,
.chapter-toggle-icon::after {
  content: ''; position: absolute; background: #ff7a00;
}
.chapter-toggle-icon::before { width: 12px; height: 2px; top: 9px; left: 4px; }
.chapter-toggle-icon::after { width: 2px; height: 12px; top: 4px; left: 9px; }
.chapter-toggle-icon.expanded::after { display: none; }

/* 分页样式 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 0;
}

.page-btn {
  height: 32px;
  padding: 0 14px;
  border-radius: 18px;
  background: #f4f5f7;
  border: 1px solid #e6e8eb;
  color: #333;
  cursor: pointer;
}
.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-list {
  display: flex;
  gap: 8px;
}

.page-index {
  min-width: 32px;
  height: 32px;
  padding: 0 10px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid #e6e8eb;
  color: #333;
  cursor: pointer;
}
.page-index.is-active {
  background: #ffefe9;
  border-color: #ffc2b8;
  color: #ff4d4f;
  font-weight: 600;
}
</style>






