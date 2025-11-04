<template>
  <AppLayout title="设计规范与技术约束">
    <div class="design-guidelines">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1>题库系统设计规范与技术约束</h1>
        <p>统一的设计系统、交互规范和技术标准，确保整个产品的一致性和高质量交付。</p>
        <div class="page-meta">
          <span class="meta-item">📅 最后更新：2025-10-10</span>
          <span class="meta-item">✅ 强制执行</span>
          <span class="meta-item">🔄 持续优化</span>
        </div>
      </div>

      <!-- 快速导航 -->
      <nav class="toc">
        <a href="#design-system" class="toc-item" @click.prevent="scrollToSection('design-system')">
          <span class="toc-icon">🎨</span>
          <span>UI规范</span>
        </a>
        <a href="#components" class="toc-item" @click.prevent="scrollToSection('components')">
          <span class="toc-icon">🧩</span>
          <span>组件库</span>
        </a>
        <a href="#interaction" class="toc-item" @click.prevent="scrollToSection('interaction')">
          <span class="toc-icon">🖱️</span>
          <span>交互规范</span>
        </a>
        <a href="#technical" class="toc-item" @click.prevent="scrollToSection('technical')">
          <span class="toc-icon">⚙️</span>
          <span>技术规范</span>
        </a>
        <a href="#testing" class="toc-item" @click.prevent="scrollToSection('testing')">
          <span class="toc-icon">✅</span>
          <span>测试要求</span>
        </a>
      </nav>

      <!-- UI规范 -->
      <section class="section" id="design-system">
        <h2>
          <span class="section-icon">🎨</span>
          UI规范
        </h2>
        <p>统一的视觉设计系统，包含色彩、字体、间距等基础设计元素，确保产品视觉一致性。</p>

        <h3>色彩系统</h3>
        <p>使用CSS变量定义颜色，确保全局一致性。所有颜色值均经过无障碍对比度测试。</p>
        <div class="color-palette">
          <div class="color-item">
            <div class="color-swatch" style="background: #0066cc;"></div>
            <div class="color-info">
              <strong>Primary Blue</strong>
              <code>--accent: #0066cc</code>
              <small>主要操作按钮、链接</small>
            </div>
          </div>
          <div class="color-item">
            <div class="color-swatch" style="background: #004f99;"></div>
            <div class="color-info">
              <strong>Primary Blue Hover</strong>
              <code>--accent-hover: #004f99</code>
              <small>按钮悬停状态</small>
            </div>
          </div>
          <div class="color-item">
            <div class="color-swatch" style="background: #1a1a1a;"></div>
            <div class="color-info">
              <strong>Primary Text</strong>
              <code>--primary-text: #1a1a1a</code>
              <small>主要文本颜色</small>
            </div>
          </div>
          <div class="color-item">
            <div class="color-swatch" style="background: #666666;"></div>
            <div class="color-info">
              <strong>Secondary Text</strong>
              <code>--secondary-text: #666666</code>
              <small>辅助文本、说明文字</small>
            </div>
          </div>
          <div class="color-item">
            <div class="color-swatch" style="background: #2e8b57;"></div>
            <div class="color-info">
              <strong>Success Green</strong>
              <code>#2e8b57</code>
              <small>成功状态、启用标识</small>
            </div>
          </div>
          <div class="color-item">
            <div class="color-swatch" style="background: #cf4a30;"></div>
            <div class="color-info">
              <strong>Error Red</strong>
              <code>#cf4a30</code>
              <small>错误状态、禁用标识</small>
            </div>
          </div>
          <div class="color-item">
            <div class="color-swatch" style="background: #f5f5f5;"></div>
            <div class="color-info">
              <strong>Background Gray</strong>
              <code>--app-bg: #f5f5f5</code>
              <small>页面背景色</small>
            </div>
          </div>
          <div class="color-item">
            <div class="color-swatch" style="background: #ffffff;"></div>
            <div class="color-info">
              <strong>Panel White</strong>
              <code>--panel-bg: #ffffff</code>
              <small>面板、卡片背景色</small>
            </div>
          </div>
        </div>

        <h3>字体系统</h3>
        <p>使用微软雅黑作为主字体，确保中文显示效果。所有字号遵循8的倍数原则。</p>
        <div class="typography-demo">
          <div class="typo-item">
            <h1 style="margin: 0; font-size: 32px; font-weight: 600;">标题 H1 - 32px / 600</h1>
            <code>font-size: 32px; font-weight: 600;</code>
          </div>
          <div class="typo-item">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600;">标题 H1 (常用) - 24px / 600</h1>
            <code>font-size: 24px; font-weight: 600;</code>
          </div>
          <div class="typo-item">
            <h2 style="margin: 0; font-size: 20px; font-weight: 600;">标题 H2 - 20px / 600</h2>
            <code>font-size: 20px; font-weight: 600;</code>
          </div>
          <div class="typo-item">
            <h3 style="margin: 0; font-size: 18px; font-weight: 600;">标题 H3 - 18px / 600</h3>
            <code>font-size: 18px; font-weight: 600;</code>
          </div>
          <div class="typo-item">
            <p style="margin: 0; font-size: 14px;">正文文本 - 14px / 400</p>
            <code>font-size: 14px; font-weight: 400;</code>
          </div>
          <div class="typo-item">
            <small style="font-size: 12px;">小字文本 - 12px / 400</small>
            <code>font-size: 12px; font-weight: 400;</code>
          </div>
        </div>

        <h3>间距系统</h3>
        <p>使用8的倍数作为基础间距单位，确保视觉节奏一致。</p>
        <div class="spacing-demo">
          <div class="spacing-item">
            <div class="spacing-visual" style="width: 8px; height: 8px;"></div>
            <span><strong>8px</strong> - 最小间距，用于紧密排列的元素</span>
          </div>
          <div class="spacing-item">
            <div class="spacing-visual" style="width: 16px; height: 16px;"></div>
            <span><strong>16px</strong> - 标准间距，用于常规元素</span>
          </div>
          <div class="spacing-item">
            <div class="spacing-visual" style="width: 24px; height: 24px;"></div>
            <span><strong>24px</strong> - 大间距，用于区块之间</span>
          </div>
          <div class="spacing-item">
            <div class="spacing-visual" style="width: 32px; height: 32px;"></div>
            <span><strong>32px</strong> - 超大间距，用于主要区块</span>
          </div>
          <div class="spacing-item">
            <div class="spacing-visual" style="width: 48px; height: 48px;"></div>
            <span><strong>48px</strong> - 特大间距，用于页面级别分隔</span>
          </div>
        </div>
      </section>

      <!-- 组件库 -->
      <section class="section" id="components">
        <h2>
          <span class="section-icon">🧩</span>
          组件库
        </h2>

        <div class="component-grid">
          <div class="component-demo">
            <h4>按钮组件</h4>
            <div class="demo-buttons">
              <button class="btn primary">主要按钮</button>
              <button class="btn secondary">次要按钮</button>
              <button class="btn primary" disabled>禁用按钮</button>
            </div>
          </div>

          <div class="component-demo">
            <h4>状态标签</h4>
            <div class="demo-status">
              <span class="status is-active">启用</span>
              <span class="status is-disabled">禁用</span>
            </div>
          </div>

          <div class="component-demo">
            <h4>标签组件</h4>
            <div class="demo-tags">
              <span class="tag">v1.0</span>
              <span class="tag">最后更新：2025-10-10</span>
              <span class="tag">实时交互</span>
            </div>
          </div>

          <div class="component-demo">
            <h4>表单组件</h4>
            <div class="demo-forms">
              <input type="text" placeholder="文本输入框" style="padding: 8px 12px; border: 1px solid #cdd5e0; border-radius: 6px;">
              <select style="padding: 8px 12px; border: 1px solid #cdd5e0; border-radius: 6px;">
                <option>下拉选择</option>
                <option>选项1</option>
                <option>选项2</option>
              </select>
              <label style="display: flex; align-items: center; gap: 6px;">
                <input type="checkbox">
                <span>复选框</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      <!-- 交互规范 -->
      <section class="section" id="interaction">
        <h2>
          <span class="section-icon">🖱️</span>
          交互规范
        </h2>

        <h3>通用交互原则</h3>
        <div class="interaction-guide">
          <div class="interaction-item">
            <strong>悬停反馈</strong>
            <p>所有可点击元素在悬停时必须有视觉反馈，过渡时间为0.2s，使用ease缓动函数。</p>
          </div>
          <div class="interaction-item">
            <strong>点击反馈</strong>
            <p>按钮点击时应有明显的状态变化，长时间操作需显示加载指示器。</p>
          </div>
          <div class="interaction-item">
            <strong>焦点状态</strong>
            <p>表单元素获得焦点时显示蓝色边框（#0066cc），支持Tab键盘导航。</p>
          </div>
          <div class="interaction-item">
            <strong>禁用状态</strong>
            <p>禁用元素透明度设为0.5，鼠标指针显示为not-allowed，不响应任何交互。</p>
          </div>
          <div class="interaction-item">
            <strong>加载状态</strong>
            <p>异步操作时显示加载指示器，防止重复提交，操作完成后显示结果反馈。</p>
          </div>
          <div class="interaction-item">
            <strong>错误提示</strong>
            <p>表单验证错误在失去焦点时实时显示，使用红色文字（#cf4a30）和红色边框。</p>
          </div>
        </div>

        <h3>特定交互规范</h3>
        <div class="interaction-guide">
          <div class="interaction-item">
            <strong>树形导航</strong>
            <p>点击项目头部展开/收起科目，点击科目加载对应内容，当前选中项高亮显示。</p>
          </div>
          <div class="interaction-item">
            <strong>表格折叠</strong>
            <p>点击表格行展开/收起详情，支持多行同时展开，展开图标旋转90度动画。</p>
          </div>
          <div class="interaction-item">
            <strong>弹窗操作</strong>
            <p>点击背景或按ESC键关闭弹窗，关键操作需二次确认，弹窗出现时焦点自动定位到首个输入框。</p>
          </div>
          <div class="interaction-item">
            <strong>分页导航</strong>
            <p>支持页码点击、上下页按钮、页码跳转三种方式，当前页高亮，首末页禁用对应按钮。</p>
          </div>
          <div class="interaction-item">
            <strong>状态切换</strong>
            <p>启用/禁用等关键操作需二次确认，确认对话框清晰说明操作影响。</p>
          </div>
          <div class="interaction-item">
            <strong>删除保护</strong>
            <p>删除操作必须二次确认，存在关联数据时提示并拒绝删除，提供详细的影响说明。</p>
          </div>
        </div>

        <h3>Toast提示规范</h3>
        <div class="interaction-guide">
          <div class="interaction-item">
            <strong>成功提示</strong>
            <p>绿色渐变背景（#0f8a5f → #0c6f4c），白色文字，右下角显示，2.4秒后自动消失。</p>
          </div>
          <div class="interaction-item">
            <strong>错误提示</strong>
            <p>红色渐变背景（#d54a3c → #b13a30），白色文字，右下角显示，2.4秒后自动消失。</p>
          </div>
          <div class="interaction-item">
            <strong>提示内容</strong>
            <p>简洁明确，不超过20字，使用主动语态，避免技术术语，提供清晰的操作结果反馈。</p>
          </div>
        </div>
      </section>

      <!-- 技术规范 -->
      <section class="section" id="technical">
        <h2>
          <span class="section-icon">⚙️</span>
          技术规范
        </h2>
        <p>统一的技术标准和约束，确保系统性能、安全性和可维护性。适用于所有模块的开发。</p>

        <h3>性能要求</h3>
        <ul class="constraint-list">
          <li>页面首次加载时间 ≤ 2秒</li>
          <li>交互响应时间 ≤ 500ms</li>
          <li>支持100+项目/科目/章节同时展示</li>
          <li>内存占用 ≤ 50MB</li>
          <li>表格支持虚拟滚动，处理1000+行数据</li>
          <li>图片懒加载，减少初始加载时间</li>
        </ul>

        <h3>兼容性要求</h3>
        <ul class="constraint-list">
          <li>支持 Chrome 90+</li>
          <li>支持 Firefox 90+</li>
          <li>支持 Safari 14+</li>
          <li>支持 Edge 90+</li>
          <li>支持 1366x768 以上分辨率</li>
          <li>支持移动端访问（响应式设计）</li>
          <li>支持键盘导航和无障碍访问（WCAG 2.1 AA级）</li>
          <li>不支持 IE 浏览器</li>
        </ul>

        <h3>安全要求</h3>
        <ul class="constraint-list">
          <li>所有操作需要身份验证和权限校验</li>
          <li>敏感操作（删除、禁用）需要二次确认</li>
          <li>完整的操作日志记录（操作人、时间、内容）</li>
          <li>数据传输使用 HTTPS</li>
          <li>输入数据必须进行 XSS 防护</li>
          <li>防止 CSRF 攻击</li>
          <li>敏感信息不在前端存储</li>
        </ul>

        <h3>数据约束</h3>
        <ul class="constraint-list">
          <li>项目名称：最多50字符，同一级别不能重复</li>
          <li>科目名称：最多50字符，同一项目下不能重复</li>
          <li>章节名称：最多50字符，同一科目下不能重复</li>
          <li>小节名称：最多50字符，同一章节下不能重复</li>
          <li>题型内部名称：系统预定义，不超过20字符</li>
          <li>题型外部名称：最多50字符，同一科目下不能重复</li>
          <li>题型描述：最多200字符</li>
          <li>排序号范围：1-999，正整数，同级别不能重复</li>
        </ul>

        <h3>编码规范</h3>
        <ul class="constraint-list">
          <li>HTML: 2空格缩进，标签和属性使用小写</li>
          <li>CSS: 使用CSS变量定义设计tokens，BEM命名规范</li>
          <li>JavaScript: ES6+语法，使用严格模式，驼峰命名</li>
          <li>语义化HTML标签，提升无障碍访问性</li>
          <li>所有用户输入必须校验和转义</li>
          <li>代码注释使用中文，技术术语保持英文原文</li>
        </ul>

        <h3>文件组织</h3>
        <ul class="constraint-list">
          <li>每个模块一个HTML文件（project-management.html）</li>
          <li>PM文档放置于 docs/pm/ 目录</li>
          <li>资源文件放置于 assets/pm/ 目录</li>
          <li>使用相对路径引用资源</li>
          <li>文件命名使用小写字母和连字符</li>
          <li>保持项目根目录整洁</li>
        </ul>
      </section>

      <!-- 测试要求 -->
      <section class="section" id="testing">
        <h2>
          <span class="section-icon">✅</span>
          测试要求
        </h2>
        <p>标准化的测试流程和验收标准，确保交付质量。所有模块必须严格执行以下测试要求。</p>

        <h3>功能测试</h3>
        <ul class="constraint-list">
          <li>每次修改后必须手动测试核心功能流程</li>
          <li>验证所有表单字段的校验逻辑（必填项、格式、长度）</li>
          <li>测试所有交互元素的响应（按钮、链接、下拉菜单）</li>
          <li>验证弹窗和Toast提示的正确显示</li>
          <li>测试状态切换功能（启用/禁用、展开/收起）</li>
          <li>验证数据的增删改查完整流程</li>
        </ul>

        <h3>边界测试</h3>
        <ul class="constraint-list">
          <li>测试空数据状态下的页面展示和提示信息</li>
          <li>测试最大数据量情况（100+记录、1000+字符）</li>
          <li>验证字段长度限制的正确执行</li>
          <li>测试重复数据的唯一性校验</li>
          <li>验证排序值的边界情况（最小值1、最大值999）</li>
          <li>测试网络延迟和错误情况的处理</li>
        </ul>

        <h3>兼容性测试</h3>
        <ul class="constraint-list">
          <li>在Chrome、Firefox、Safari浏览器上测试核心功能</li>
          <li>测试不同屏幕尺寸下的响应式布局（1366x768、1920x1080）</li>
          <li>验证移动端访问的可用性</li>
          <li>测试键盘导航（Tab键、Enter键、ESC键）</li>
          <li>使用屏幕阅读器验证无障碍访问</li>
        </ul>

        <h3>代码质量检查</h3>
        <ul class="constraint-list">
          <li>浏览器控制台无JavaScript错误和警告</li>
          <li>使用HTMLHint进行HTML代码质量检查</li>
          <li>验证所有链接和资源路径有效</li>
          <li>检查CSS样式无冲突和覆盖问题</li>
          <li>代码格式化符合项目规范（2空格缩进）</li>
        </ul>

        <h3>验收标准模板</h3>
        <div class="interaction-guide">
          <div class="interaction-item">
            <strong>Given-When-Then 格式</strong>
            <p><strong>Given</strong> 描述初始状态和前置条件<br>
            <strong>When</strong> 描述用户执行的操作<br>
            <strong>Then</strong> 描述预期的系统响应和结果</p>
          </div>
          <div class="interaction-item">
            <strong>示例：新增功能验收</strong>
            <p><strong>Given</strong> 用户在管理页面点击【新增】按钮<br>
            <strong>When</strong> 填写完整信息并提交<br>
            <strong>Then</strong> 系统验证通过，列表新增记录，显示成功提示</p>
          </div>
          <div class="interaction-item">
            <strong>示例：校验规则验收</strong>
            <p><strong>Given</strong> 用户在新增弹窗中<br>
            <strong>When</strong> 输入已存在的名称并提交<br>
            <strong>Then</strong> 系统提示"该名称已存在"，拒绝提交</p>
          </div>
        </div>
      </section>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/Layout/AppLayout.vue'

// 平滑滚动到指定锚点
function scrollToSection(id: string) {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
}
</script>

<style scoped>
.design-guidelines {
  padding: 32px 48px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 页面头部 */
.page-header {
  margin-bottom: 48px;
  padding-bottom: 32px;
  border-bottom: 2px solid var(--panel-border);
}

.page-header h1 {
  margin: 0 0 16px;
  font-size: 32px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: var(--primary-text);
}

.page-header p {
  margin: 0;
  font-size: 16px;
  color: var(--secondary-text);
  line-height: 1.6;
}

.page-meta {
  display: flex;
  gap: 24px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.meta-item {
  font-size: 13px;
  color: var(--secondary-text);
  background: var(--badge-bg);
  padding: 6px 14px;
  border-radius: 20px;
}

/* 快速导航 */
.toc {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 48px;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.25);
}

.toc-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  text-decoration: none;
  color: var(--primary-text);
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

.toc-item:hover {
  background: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.toc-icon {
  font-size: 24px;
}

/* 章节 */
.section {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.section h2 {
  margin: 0 0 24px;
  font-size: 28px;
  font-weight: 600;
  color: var(--accent);
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-icon {
  font-size: 32px;
}

.section h3 {
  margin: 32px 0 16px;
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-text);
  padding-left: 16px;
  border-left: 4px solid var(--accent);
}

.section h3:first-of-type {
  margin-top: 0;
}

.section p {
  margin: 0 0 16px;
  color: var(--secondary-text);
  line-height: 1.8;
}

/* 色彩系统 */
.color-palette {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  margin-bottom: 24px;
}

.color-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #ffffff;
  transition: all 0.2s ease;
}

.color-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.color-swatch {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.color-info strong {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-text);
  margin-bottom: 4px;
}

.color-info code {
  display: block;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  color: var(--secondary-text);
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  margin-bottom: 4px;
}

.color-info small {
  font-size: 11px;
  color: var(--secondary-text);
}

/* 字体系统 */
.typography-demo {
  display: grid;
  gap: 16px;
  margin-bottom: 24px;
}

.typo-item {
  padding: 16px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #fafafa;
}

.typo-item code {
  display: block;
  margin-top: 8px;
  font-size: 11px;
  color: var(--secondary-text);
  font-family: 'Courier New', monospace;
  background: #ffffff;
  padding: 4px 8px;
  border-radius: 4px;
}

/* 间距系统 */
.spacing-demo {
  display: grid;
  gap: 16px;
}

.spacing-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #ffffff;
}

.spacing-visual {
  border-radius: 2px;
  background: var(--accent);
  flex-shrink: 0;
}

.spacing-item span {
  font-size: 14px;
  color: var(--primary-text);
}

/* 组件库 */
.component-grid {
  display: grid;
  gap: 24px;
  margin-bottom: 24px;
}

.component-demo {
  padding: 24px;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  background: linear-gradient(180deg, #fafcfe 0%, #ffffff 100%);
}

.component-demo h4 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: var(--accent);
}

.demo-buttons,
.demo-status,
.demo-forms,
.demo-tags {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.btn {
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid transparent;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn.primary {
  background: linear-gradient(180deg, #4f77ff 0%, #2f57e3 100%);
  color: #ffffff;
  border-color: #375edf;
  box-shadow: 0 4px 8px rgba(79, 119, 255, 0.3);
}

.btn.primary:hover {
  background: linear-gradient(180deg, #4b6ee6 0%, #264acc 100%);
}

.btn.secondary {
  background-color: #ffffff;
  color: var(--accent);
  border-color: rgba(0, 102, 204, 0.4);
}

.btn.secondary:hover {
  background-color: rgba(0, 102, 204, 0.08);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.status {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
}

.status.is-active {
  background-color: #ecfff2;
  color: #2e8b57;
  border: 1px solid rgba(46, 139, 87, 0.4);
}

.status.is-disabled {
  background-color: #fff3f0;
  color: #cf4a30;
  border: 1px solid rgba(207, 74, 48, 0.3);
}

.tag {
  padding: 4px 12px;
  border-radius: 20px;
  background-color: var(--badge-bg);
  color: var(--badge-text);
  font-size: 12px;
}

/* 交互规范 */
.interaction-guide {
  display: grid;
  gap: 16px;
}

.interaction-item {
  padding: 16px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #ffffff;
}

.interaction-item strong {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 8px;
}

.interaction-item p {
  margin: 0;
  font-size: 13px;
  color: var(--secondary-text);
  line-height: 1.5;
}

/* 技术规范约束列表 */
.constraint-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
}

.constraint-list li {
  padding: 12px 16px;
  background: linear-gradient(180deg, #f7f9fc 0%, #ffffff 100%);
  border: 1px solid #e4eaf2;
  border-radius: 8px;
  color: var(--primary-text);
  line-height: 1.6;
  position: relative;
  padding-left: 40px;
}

.constraint-list li::before {
  content: "✓";
  position: absolute;
  left: 12px;
  top: 12px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(180deg, #4f77ff 0%, #2f57e3 100%);
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .design-guidelines {
    padding: 24px;
  }

  .section {
    padding: 24px;
  }

  .toc {
    grid-template-columns: 1fr;
  }

  .color-palette {
    grid-template-columns: 1fr;
  }
}
</style>
