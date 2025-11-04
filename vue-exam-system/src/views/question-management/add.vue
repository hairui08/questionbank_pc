<template>
  <AppLayout title="题库系统题库管理">
    <TabNavigation :tabs="tabs" :default-tab="'prototype'">
      <!-- 原型展示标签页 -->
      <template #prototype>
        <div class="tab-panel">
          <div class="question-form-wrapper">
            <!-- 基本信息筛选 -->
            <div class="form-section">
              <h4>基本信息筛选</h4>
              <div class="filter-grid">
                <div class="form-group">
                  <label>项目 <span class="required">*</span></label>
                  <select v-model="filter.projectId" @change="onProjectChange" required :disabled="isEditMode">
                    <option value="">请选择项目</option>
                    <option v-for="project in projects" :key="project.id" :value="project.id">
                      {{ project.name }}
                    </option>
                  </select>
                  <span v-if="isEditMode" class="form-hint">编辑模式下不可修改项目</span>
                </div>
                <div class="form-group">
                  <label>科目 <span class="required">*</span></label>
                  <select v-model="filter.subjectId" @change="onSubjectChange" :disabled="!filter.projectId || isEditMode" required>
                    <option value="">{{ filter.projectId ? '请选择科目' : '请先选择项目' }}</option>
                    <option v-for="subject in filteredSubjects" :key="subject.id" :value="subject.id">
                      {{ subject.name }}
                    </option>
                  </select>
                  <span v-if="isEditMode" class="form-hint">编辑模式下不可修改科目</span>
                </div>
                <div class="form-group">
                  <label>章节 <span class="required">*</span></label>
                  <select v-model="filter.chapterId" :disabled="!filter.subjectId" required>
                    <option value="">{{ filter.subjectId ? '请选择章节' : '请先选择科目' }}</option>
                    <option v-for="chapter in filteredChapters" :key="chapter.id" :value="chapter.id">
                      {{ chapter.name }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>试题来源</label>
                  <select v-model="filter.source">
                    <option value="">全部来源</option>
                    <option value="official">历年真题</option>
                    <option value="simulation">模拟试题</option>
                    <option value="custom">自定义</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>所属年份</label>
                  <select v-model="filter.year">
                    <option value="">全部年份</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>试题难度</label>
                  <select v-model="filter.difficulty">
                    <option value="">全部难度</option>
                    <option value="easy">简单</option>
                    <option value="medium">中等</option>
                    <option value="hard">困难</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>收费规则</label>
                  <PaymentRuleSelector
                    v-model="paymentRuleId"
                    :applicable-to="['question']"
                  />
                </div>
                <div class="form-group knowledge-points-select">
                  <label>关联知识点</label>
                  <div class="knowledge-point-input-wrapper">
                    <div class="knowledge-point-display" :class="{ 'is-disabled': !filter.subjectId }">
                      <div v-if="selectedKnowledgePointNames.length > 0" class="selected-knowledge-points">
                        <span
                          v-for="(name, idx) in selectedKnowledgePointNames"
                          :key="idx"
                          class="knowledge-point-tag"
                        >
                          {{ name }}
                          <button class="remove-tag-btn" @click="removeKnowledgePoint(idx)" :disabled="!filter.subjectId">×</button>
                        </span>
                      </div>
                      <span v-else class="placeholder-text">
                        {{ filter.subjectId ? '暂未选择知识点' : '请先选择科目' }}
                      </span>
                    </div>
                    <button
                      type="button"
                      class="btn-add-knowledge-point"
                      @click="openKnowledgePointModal"
                      :disabled="!filter.subjectId"
                    >
                      添加知识点
                    </button>
                  </div>
                  <span class="form-hint">提示：一个试题可以关联多个知识点</span>
                </div>
              </div>
            </div>

            <!-- 题型选择 -->
            <div class="form-section">
              <h4>题型选择</h4>
              <div class="type-selector">
                <label v-for="type in questionTypes" :key="type.value" class="type-label" :class="{ active: currentType === type.value, disabled: isEditMode }">
                  <input
                    type="radio"
                    name="question-type"
                    :value="type.value"
                    v-model="currentType"
                    class="type-radio"
                    :disabled="isEditMode"
                  >
                  {{ type.label }}
                </label>
              </div>
              <span v-if="isEditMode" class="form-hint">编辑模式下不可修改题型</span>
            </div>

            <!-- 组合题特殊区域 -->
            <div v-if="currentType === 'combination'" class="form-section">
              <h4>案例背景（大题干）</h4>
              <div class="form-group">
                <label>案例背景 <span class="required">*</span></label>
                <textarea
                  v-model="mainStem"
                  placeholder="请输入组合题的案例背景材料（所有小问都基于此背景）..."
                  required
                  rows="8"
                  maxlength="5000"
                ></textarea>
                <span class="form-hint">提示：案例背景为所有小问提供统一的上下文，最多5000字符</span>
              </div>

              <div class="sub-questions-header">
                <h4>小问列表</h4>
                <button type="button" class="add-sub-question-btn" @click="addSubQuestion">
                  ➕ 添加小问
                </button>
              </div>

              <div v-if="subQuestions.length === 0" class="empty-sub-questions">
                <p>暂无小问，请点击【添加小问】按钮开始创建</p>
              </div>

              <div v-for="(subQ, index) in subQuestions" :key="subQ.id" class="sub-question-card">
                <div class="sub-question-header">
                  <span class="sub-question-number">小问 {{ index + 1 }}</span>
                  <button type="button" class="remove-sub-question-btn" @click="removeSubQuestion(index)">
                    删除小问
                  </button>
                </div>

                <div class="sub-question-body">
                  <!-- 小问题型选择 -->
                  <div class="form-group">
                    <label>题型 <span class="required">*</span></label>
                    <select v-model="subQ.type" @change="onSubQuestionTypeChange(index)">
                      <option value="single">单选题</option>
                      <option value="multiple">多选题</option>
                      <option value="judgment">判断题</option>
                      <option value="essay">简答题</option>
                    </select>
                    <span class="form-hint">注意：组合题小问不支持不定项题型</span>
                  </div>

                  <!-- 小问题干 -->
                  <div class="form-group">
                    <label>题干 <span class="required">*</span></label>
                    <textarea
                      v-model="subQ.stem"
                      :placeholder="`请输入第${index + 1}个小问的题干内容...`"
                      required
                      rows="3"
                    ></textarea>
                  </div>

                  <!-- 客观题选项 -->
                  <div v-if="isSubQuestionObjective(subQ.type)" class="form-group">
                    <label>选项设置 <span class="required">*</span></label>
                    <div class="options-container">
                      <div v-for="(opt, optIndex) in subQ.options" :key="opt.label" class="option-item">
                        <div class="option-label">{{ opt.label }}</div>
                        <input
                          type="text"
                          class="option-input"
                          v-model="opt.content"
                          :placeholder="`请输入选项${opt.label}内容`"
                          required
                        >
                        <button
                          type="button"
                          class="option-remove"
                          @click="removeSubQuestionOption(index, optIndex)"
                          :disabled="subQ.options!.length <= 2"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      class="add-option-btn"
                      @click="addSubQuestionOption(index)"
                      :disabled="subQ.options!.length >= 10"
                    >
                      ➕ 添加选项
                    </button>
                  </div>

                  <!-- 答案 -->
                  <div class="form-group">
                    <label>正确答案 <span class="required">*</span></label>

                    <!-- 单选题答案 -->
                    <div v-if="subQ.type === 'single'" class="answer-selector">
                      <label v-for="opt in subQ.options" :key="opt.label" class="answer-option">
                        <input type="radio" :value="opt.label" v-model="subQ.answer" :name="`sub-answer-${index}`">
                        {{ opt.label }}
                      </label>
                    </div>

                    <!-- 多选题答案 -->
                    <div v-else-if="subQ.type === 'multiple'" class="answer-selector">
                      <label v-for="opt in subQ.options" :key="opt.label" class="answer-option">
                        <input type="checkbox" :value="opt.label" v-model="subQ.answer" :name="`sub-answer-${index}`">
                        {{ opt.label }}
                      </label>
                    </div>

                    <!-- 判断题答案 -->
                    <div v-else-if="subQ.type === 'judgment'" class="answer-selector">
                      <label class="answer-option">
                        <input type="radio" value="true" v-model="subQ.answer" :name="`sub-answer-${index}`">
                        正确
                      </label>
                      <label class="answer-option">
                        <input type="radio" value="false" v-model="subQ.answer" :name="`sub-answer-${index}`">
                        错误
                      </label>
                    </div>

                    <!-- 简答题答案 -->
                    <div v-else>
                      <textarea
                        v-model="subQ.answer"
                        placeholder="请输入参考答案"
                        rows="3"
                      ></textarea>
                    </div>
                  </div>

                  <!-- 小问解析 -->
                  <div class="form-group">
                    <label>解析 <span class="required">*</span></label>
                    <textarea
                      v-model="subQ.explanation"
                      placeholder="请输入本小问的详细解析..."
                      rows="3"
                      required
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- 常规题型内容 -->
            <div v-else>
              <!-- 试题内容 -->
              <div class="form-section">
                <h4>试题内容</h4>
                <div class="form-group">
                  <label>题干 <span class="required">*</span></label>
                  <textarea
                    v-model="questionForm.stem"
                    placeholder="请输入题目内容，支持富文本编辑..."
                    required
                    rows="6"
                    maxlength="5000"
                  ></textarea>
                  <span class="form-hint">提示：可输入题目描述、背景材料等内容，最多5000字符</span>
                </div>

                <!-- 客观题选项 -->
                <div v-if="isObjectiveQuestion" class="form-group">
                  <label>选项设置 <span class="required">*</span></label>
                  <div class="options-container">
                    <div v-for="(option, index) in options" :key="option.label" class="option-item">
                      <div class="option-label">{{ option.label }}</div>
                      <input
                        type="text"
                        class="option-input"
                        v-model="option.content"
                        :placeholder="`请输入选项${option.label}内容`"
                        required
                        maxlength="500"
                      >
                      <button
                        type="button"
                        class="option-remove"
                        @click="removeOption(index)"
                        :disabled="options.length <= 2"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    class="add-option-btn"
                    @click="addOption"
                    :disabled="options.length >= 10"
                  >
                    ➕ 添加选项
                  </button>
                  <span class="form-hint">提示：最少2个选项，最多10个选项，每个选项最多500字符</span>
                </div>
              </div>

              <!-- 答案与解析 -->
              <div class="form-section">
                <h4>答案与解析</h4>
                <div class="form-group">
                  <label>正确答案 <span class="required">*</span></label>

                  <!-- 单选题答案 -->
                  <div v-if="currentType === 'single'" class="answer-selector">
                    <label v-for="option in options" :key="option.label" class="answer-option">
                      <input type="radio" :value="option.label" v-model="singleAnswer">
                      {{ option.label }}
                    </label>
                  </div>

                  <!-- 多选题答案 -->
                  <div v-else-if="currentType === 'multiple'" class="answer-selector">
                    <label v-for="option in options" :key="option.label" class="answer-option">
                      <input type="checkbox" :value="option.label" v-model="multipleAnswer">
                      {{ option.label }}
                    </label>
                  </div>

                  <!-- 判断题答案 -->
                  <div v-else-if="currentType === 'judgment'" class="answer-selector">
                    <label class="answer-option">
                      <input type="radio" value="true" v-model="singleAnswer">
                      正确
                    </label>
                    <label class="answer-option">
                      <input type="radio" value="false" v-model="singleAnswer">
                      错误
                    </label>
                  </div>

                  <!-- 简答题答案 -->
                  <div v-else>
                    <textarea
                      v-model="textAnswer"
                      placeholder="请输入参考答案，最多2000字符"
                      rows="4"
                      maxlength="2000"
                    ></textarea>
                  </div>
                </div>

                <div class="form-group">
                  <label>试题解析 <span class="required">*</span></label>
                  <textarea
                    v-model="questionForm.explanation"
                    placeholder="请输入详细的答案解析，帮助学生理解...（最多3000字符）"
                    rows="5"
                    required
                    maxlength="3000"
                  ></textarea>
                  <span class="form-hint">提示：详细的解析有助于学生理解知识点，建议包含答案解析、知识点说明、解题思路</span>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="form-actions">
              <button type="button" class="btn tertiary" @click="handleCancel">取消</button>
              <button type="button" class="btn secondary" @click="handleSave">保存</button>
              <button type="button" class="btn primary" @click="handleSaveAndContinue">保存并继续添加</button>
            </div>
          </div>
        </div>
      </template>

      <!-- 需求文档标签页 -->
      <template #requirements>
        <div class="tab-panel">
          <div class="requirements-header">
            <h2>题库管理需求文档</h2>
            <p>详细的功能需求、业务规则和验收标准，确保试题管理模块满足多题型录入和管理需求。</p>
          </div>

          <div class="requirements-content">
            <section class="business-requirements">
              <h3>业务需求</h3>
              <div class="requirement-section">
                <h4>核心目标</h4>
                <ul>
                  <li>支持5种题型的录入和管理（单选、多选、判断、简答、组合题）</li>
                  <li>提供多维度筛选功能，支持按项目、科目、章节、来源、年份、级别、难度分类</li>
                  <li>支持知识点多选关联，一个试题可关联多个知识点，支持跨章节但同科目约束</li>
                  <li>支持动态选项管理，客观题可自由设置2-10个选项</li>
                  <li>支持组合题复杂结构，包含案例背景和多个独立小问</li>
                  <li>提供高效的连续录入模式，提升题库建设效率</li>
                </ul>
              </div>

              <div class="requirement-section">
                <h4>用户场景</h4>
                <ul>
                  <li>教研人员需要批量录入历年真题，要求保留来源和年份信息</li>
                  <li>题库管理员需要按难度和级别分类管理试题</li>
                  <li>内容创作者需要快速录入模拟试题，要求支持连续添加</li>
                  <li>组卷人员需要按章节查询试题，要求三级联动筛选</li>
                </ul>
              </div>

              <div class="requirement-section">
                <h4>业务规则</h4>
                <ul>
                  <li><strong>知识点关联规则：</strong>一个试题可以关联0-N个知识点，支持跨章节关联，但知识点必须属于同一科目</li>
                  <li><strong>知识点筛选：</strong>知识点下拉列表根据当前选择的科目动态加载，支持多选（按住 Ctrl/Cmd 键）</li>
                  <li><strong>知识点跨项目选择：</strong>知识点选择模态框支持自由切换项目和科目，用户可以在不同科目间浏览和选择知识点，支持跨科目关联（但推荐选择同一科目内的知识点）</li>
                  <li><strong>知识点分组展示：</strong>知识点列表按科目分组展示，每个分组显示科目名称和知识点数量，便于快速定位</li>
                  <li><strong>知识点搜索：</strong>支持按关键词实时搜索知识点，搜索结果仍然按科目分组展示</li>
                  <li><strong>连续录入保持：</strong>使用"保存并继续添加"功能时，知识点选择会保持，便于批量录入同类试题</li>
                  <li><strong>知识点展示：</strong>表格视图中多个知识点用"、"分隔显示；预览视图中以标签形式展示，支持鼠标悬停交互</li>
                </ul>
              </div>
            </section>

            <section class="functional-requirements">
              <h3>功能规格</h3>

              <table class="spec-table">
                <thead>
                  <tr>
                    <th width="15%">功能项</th>
                    <th width="25%">功能描述</th>
                    <th width="50%">详细说明</th>
                    <th width="10%">优先级</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>三级联动筛选</td>
                    <td>项目-科目-章节的三级级联选择</td>
                    <td>选择项目后加载对应科目；选择科目后加载对应章节；未选择上级时，下级选择框禁用</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>辅助筛选</td>
                    <td>提供试题来源、年份、级别、难度的辅助筛选</td>
                    <td>试题来源：历年真题/模拟试题/自定义；年份：≥2000的整数；级别：基础/中级/高级；难度：简单/中等/困难</td>
                    <td>P1</td>
                  </tr>
                  <tr>
                    <td>题型切换</td>
                    <td>支持5种题型的自由切换，界面动态适配</td>
                    <td>单选题/多选题/判断题：显示选项设置和单/多选答案；简答题：仅显示文本答案输入；组合题：显示案例背景和小问管理区域</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>动态选项管理</td>
                    <td>客观题支持自由添加和删除选项</td>
                    <td>默认提供A/B/C/D四个选项；可添加至10个选项（A-J）；最少保留2个选项；删除选项后自动重新分配标签（A/B/C...）；答案选择器同步更新</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>题干输入</td>
                    <td>支持录入题目内容，包括题目描述和背景材料</td>
                    <td>必填项；最多5000字符；支持富文本（预留功能）；建议包含题目编号</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>选项内容</td>
                    <td>为客观题设置选项内容</td>
                    <td>客观题必填；每个选项1-500字符；支持富文本（预留功能）</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>答案设置</td>
                    <td>录入试题的正确答案</td>
                    <td>单选/判断：单选按钮选择一个答案；多选：多选框选择多个答案；简答/组合题：文本输入框输入参考答案（最多2000字符）</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>试题解析</td>
                    <td>录入答案解析和知识点说明</td>
                    <td>必填项；最多3000字符；建议包含答案解析、知识点说明、解题思路</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>表单验证</td>
                    <td>提交前进行完整性和合法性校验，确保数据质量</td>
                    <td>验证项目、科目、章节、题型、题干、答案、解析必填；客观题至少2个选项且答案在范围内；字符长度符合限制</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>保存逻辑</td>
                    <td>提供【保存】和【保存并继续添加】两种保存模式</td>
                    <td>【保存】：校验通过后保存并清空表单，显示"试题保存成功"；【保存并继续添加】：保留筛选条件和题型，清空题干/选项/答案/解析并聚焦题干输入框，显示"试题保存成功，可继续添加"</td>
                    <td>P0</td>
                  </tr>
                  <tr>
                    <td>取消操作</td>
                    <td>支持取消当前录入的试题内容</td>
                    <td>若表单有内容，弹出确认对话框"确认取消？未保存的内容将丢失。"；确认后清空表单，重置为初始状态</td>
                    <td>P1</td>
                  </tr>
                  <tr>
                    <td>知识点选择器增强</td>
                    <td>知识点选择模态框支持项目和科目筛选，提供灵活的知识点浏览和选择体验</td>
                    <td>顶部提供项目和科目下拉筛选器；支持"全部项目"和"全部科目"选项；项目切换时科目列表自动更新；知识点列表按科目分组展示；支持关键词搜索，实时过滤结果；已选知识点以标签形式展示在底部</td>
                    <td>P1</td>
                  </tr>
                  <tr>
                    <td>数据唯一性</td>
                    <td>确保同一科目、同一章节下题干内容不重复</td>
                    <td>检测到重复时提示"该题目已存在，请检查"，拒绝保存；支持相似题目提示（预留功能）</td>
                    <td>P1</td>
                  </tr>
                  <tr>
                    <td>组合题结构</td>
                    <td>组合题由一个案例背景（大题干）和多个小问组成，支持复杂题型录入</td>
                    <td>案例背景必填，最多5000字符；每个小问包含题型、题干、选项（客观题）、答案、解析；小问题型支持：单选、多选、判断、简答</td>
                    <td>P1</td>
                  </tr>
                  <tr>
                    <td>小问管理</td>
                    <td>支持动态添加和删除组合题的小问，自动维护编号</td>
                    <td>点击【添加小问】动态创建小问；小问自动编号（1、2、3...）；删除后自动重新编号；小问数量不限，建议3-8个</td>
                    <td>P1</td>
                  </tr>
                  <tr>
                    <td>组合题验证</td>
                    <td>对组合题进行完整性校验，确保所有必填项完整</td>
                    <td>验证案例背景、至少一个小问为必填；验证每个小问的题干、答案、解析；客观题小问必须设置选项和答案；简答题小问必须输入参考答案</td>
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
                    <td>题干内容</td>
                    <td>String</td>
                    <td>1-5000字符</td>
                    <td>是</td>
                    <td>同科目同章节唯一</td>
                    <td>-</td>
                    <td>支持富文本（预留），建议包含题目编号</td>
                  </tr>
                  <tr>
                    <td>题型</td>
                    <td>Enum</td>
                    <td>5种类型</td>
                    <td>是</td>
                    <td>-</td>
                    <td>单选题</td>
                    <td>single/multiple/judgment/essay/combination</td>
                  </tr>
                  <tr>
                    <td>选项内容</td>
                    <td>String</td>
                    <td>1-500字符/选项</td>
                    <td>客观题必填</td>
                    <td>-</td>
                    <td>-</td>
                    <td>客观题2-10个选项</td>
                  </tr>
                  <tr>
                    <td>正确答案</td>
                    <td>Mixed</td>
                    <td>单选/判断：1个<br>多选：1-N个<br>文本：1-2000字符</td>
                    <td>是</td>
                    <td>-</td>
                    <td>-</td>
                    <td>答案必须在选项范围内（客观题）</td>
                  </tr>
                  <tr>
                    <td>试题解析</td>
                    <td>String</td>
                    <td>1-3000字符</td>
                    <td>是</td>
                    <td>-</td>
                    <td>-</td>
                    <td>建议包含答案解析、知识点说明、解题思路</td>
                  </tr>
                  <tr>
                    <td>试题来源</td>
                    <td>Enum</td>
                    <td>3种类型</td>
                    <td>否</td>
                    <td>-</td>
                    <td>-</td>
                    <td>official（历年真题）/simulation（模拟试题）/custom（自定义）</td>
                  </tr>
                  <tr>
                    <td>所属年份</td>
                    <td>Integer</td>
                    <td>≥ 2000</td>
                    <td>否</td>
                    <td>-</td>
                    <td>当前年份</td>
                    <td>历年真题必填</td>
                  </tr>
                  <tr>
                    <td>试题级别</td>
                    <td>Enum</td>
                    <td>3种类型</td>
                    <td>否</td>
                    <td>-</td>
                    <td>-</td>
                    <td>basic（基础）/intermediate（中级）/advanced（高级）</td>
                  </tr>
                  <tr>
                    <td>试题难度</td>
                    <td>Enum</td>
                    <td>3种类型</td>
                    <td>否</td>
                    <td>-</td>
                    <td>medium</td>
                    <td>easy（简单）/medium（中等）/hard（困难）</td>
                  </tr>
                  <tr style="background: #fff8dc;">
                    <td><strong>收费规则ID</strong></td>
                    <td>String</td>
                    <td>收费规则ID</td>
                    <td>否</td>
                    <td>-</td>
                    <td>t001</td>
                    <td>从收费规则管理选择，默认"免费"(t001)；仅显示 applicableTo 包含 'question' 且状态为 'active' 的规则</td>
                  </tr>
                  <tr>
                    <td>案例背景</td>
                    <td>String</td>
                    <td>1-5000字符</td>
                    <td>组合题必填</td>
                    <td>-</td>
                    <td>-</td>
                    <td>组合题的大题干，所有小问基于此背景</td>
                  </tr>
                  <tr>
                    <td>小问数量</td>
                    <td>Integer</td>
                    <td>≥ 1</td>
                    <td>组合题必填</td>
                    <td>-</td>
                    <td>-</td>
                    <td>建议3-8个小问</td>
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
                      <td>用户在试题管理页面</td>
                      <td>选择项目"高级会计师"</td>
                      <td>科目下拉框应自动加载该项目下的所有科目，章节下拉框禁用</td>
                    </tr>
                    <tr>
                      <td>AC-02</td>
                      <td>用户选择题型"单选题"</td>
                      <td>切换到"简答题"</td>
                      <td>选项区域隐藏，答案区域显示文本输入框</td>
                    </tr>
                    <tr>
                      <td>AC-03</td>
                      <td>用户在单选题模式下点击【添加选项】</td>
                      <td>当前已有4个选项</td>
                      <td>应添加选项E，答案区域同步增加选项E</td>
                    </tr>
                    <tr>
                      <td>AC-04</td>
                      <td>用户填写完整试题信息，点击【保存并继续添加】</td>
                      <td>保存成功</td>
                      <td>显示Toast提示，筛选条件和题型保留，题干、选项、答案、解析清空，聚焦题干输入框</td>
                    </tr>
                    <tr>
                      <td>AC-05</td>
                      <td>用户未填写必填项，点击【保存】</td>
                      <td>题干或答案为空</td>
                      <td>显示错误提示"请完整填写必填项"，拒绝提交</td>
                    </tr>
                    <tr>
                      <td>AC-06</td>
                      <td>用户选择题型"组合题"</td>
                      <td>题型切换完成</td>
                      <td>隐藏常规题干区域，显示案例背景输入框和小问管理区域，显示【添加小问】按钮</td>
                    </tr>
                    <tr>
                      <td>AC-07</td>
                      <td>用户在组合题模式下点击【添加小问】</td>
                      <td>当前小问列表为空</td>
                      <td>应创建编号为1的小问，默认题型为单选题，显示题型选择器、题干输入框、选项设置和答案选择</td>
                    </tr>
                    <tr>
                      <td>AC-08</td>
                      <td>用户在小问中切换题型为"简答"</td>
                      <td>题型切换完成</td>
                      <td>隐藏选项设置区域，答案区域显示文本输入框，题型标签更新为"简答题"</td>
                    </tr>
                    <tr>
                      <td>AC-09</td>
                      <td>用户填写完整组合题信息，点击【保存】</td>
                      <td>案例背景已填写，至少有一个小问且所有小问的必填项已完整</td>
                      <td>显示Toast提示"试题保存成功"，清空表单</td>
                    </tr>
                    <tr>
                      <td>AC-10</td>
                      <td>用户在组合题模式下点击【保存】</td>
                      <td>小问列表为空</td>
                      <td>显示错误提示"组合题至少需要添加一个小问"，拒绝提交</td>
                    </tr>
                    <tr>
                      <td>AC-11</td>
                      <td>用户在添加试题时点击【添加知识点】按钮</td>
                      <td>知识点选择模态框打开</td>
                      <td>应显示当前科目的知识点列表，按科目分组展示；顶部显示项目和科目筛选器，默认选中当前科目</td>
                    </tr>
                    <tr>
                      <td>AC-12</td>
                      <td>用户在知识点选择模态框中切换项目</td>
                      <td>选择不同的项目</td>
                      <td>科目下拉列表应自动更新为该项目下的所有科目；知识点列表同步更新为该项目下所有科目的知识点</td>
                    </tr>
                    <tr>
                      <td>AC-13</td>
                      <td>用户在知识点选择模态框中选择科目</td>
                      <td>选择某个具体科目</td>
                      <td>知识点列表应仅显示该科目的知识点；分组标题显示该科目名称和知识点数量</td>
                    </tr>
                    <tr>
                      <td>AC-14</td>
                      <td>用户在知识点搜索框中输入关键词"微分"</td>
                      <td>搜索结果实时过滤</td>
                      <td>应仅显示名称包含"微分"的知识点，仍按科目分组展示；若无匹配结果显示"未找到匹配的知识点"</td>
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
            <p>完整的设计系统、组件库和交互规范已统一整合到设计规范页面，请访问以获取详细信息。</p>
          </div>
          <div class="style-guide-content">
            <section style="text-align: center; padding: 60px 40px; background: linear-gradient(180deg, #fafcfe 0%, #ffffff 100%); border: 2px dashed #e4eaf2; border-radius: 12px;">
              <div style="font-size: 48px; margin-bottom: 24px;">📐</div>
              <h3 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: var(--primary-text);">统一的设计规范</h3>
              <p style="margin: 0 0 32px; color: var(--secondary-text); line-height: 1.6; max-width: 500px; margin-left: auto; margin-right: auto;">
                为确保所有模块使用一致的视觉风格和交互体验，我们将设计系统、色彩规范、字体系统、间距系统、组件库和交互规范统一整合到了设计规范页面。
              </p>
              <router-link to="/design-guidelines" class="btn primary" style="display: inline-block; text-decoration: none;">
                访问设计规范页面 →
              </router-link>
            </section>
          </div>
        </div>
      </template>
    </TabNavigation>

    <!-- 知识点选择弹窗 -->
    <KnowledgePointSelectModal
      :visible="knowledgePointModalVisible"
      :subject-id="filter.subjectId"
      :selected-ids="selectedKnowledgePointIds"
      @update:visible="knowledgePointModalVisible = $event"
      @submit="handleKnowledgePointSelect"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppLayout from '@/components/Layout/AppLayout.vue'
import TabNavigation from '@/components/Tab/TabNavigation.vue'
import KnowledgePointSelectModal from '@/components/KnowledgePoint/KnowledgePointSelectModal.vue'
import PaymentRuleSelector from '@/components/PaymentRuleSelector.vue'
import { useProjectStore } from '@/stores/project'
import { useQuestionStore } from '@/stores/question'
import { useChapterStore } from '@/stores/chapter'
import { useKnowledgePointStore } from '@/stores/knowledgePoint'
import { useToast } from '@/composables/useToast'
import type { QuestionFilter, QuestionForm, QuestionType, QuestionOption, SubQuestion } from './types'

const router = useRouter()
const route = useRoute()
const projectStore = useProjectStore()
const questionStore = useQuestionStore()
const chapterStore = useChapterStore()
const knowledgePointStore = useKnowledgePointStore()
const { showToast } = useToast()

// 编辑模式
const isEditMode = computed(() => !!route.params.id)
const editingQuestionId = ref<string | null>(null)

const tabs = [
  { key: 'prototype', label: '原型展示', icon: '🎨' },
  { key: 'requirements', label: '需求文档', icon: '📋' },
  { key: 'style-guide', label: '样式指南', icon: '🎯' }
]

// 编辑模式下加载试题数据
onMounted(() => {
  if (isEditMode.value) {
    const questionId = route.params.id as string
    editingQuestionId.value = questionId
    const existingQuestion = questionStore.getQuestionById(questionId)

    if (existingQuestion) {
      // 回填基本信息
      filter.value.projectId = existingQuestion.projectId
      filter.value.subjectId = existingQuestion.subjectId
      filter.value.chapterId = existingQuestion.chapterId
      filter.value.source = existingQuestion.source
      filter.value.year = existingQuestion.year
      filter.value.difficulty = existingQuestion.difficulty

      // 回填知识点
      selectedKnowledgePointIds.value = existingQuestion.knowledgePointIds ? [...existingQuestion.knowledgePointIds] : []

      // 回填收费规则
      paymentRuleId.value = existingQuestion.paymentRuleId || ''

      // 设置题型
      currentType.value = existingQuestion.type

      // 根据题型回填内容
      if (existingQuestion.type === 'combination') {
        // 组合题
        mainStem.value = existingQuestion.mainStem || ''
        subQuestions.value = existingQuestion.subQuestions ?
          existingQuestion.subQuestions.map(sq => ({...sq})) : []
      } else {
        // 常规题型
        questionForm.value.stem = existingQuestion.stem
        questionForm.value.explanation = existingQuestion.explanation

        // 回填选项
        if (isObjectiveQuestion.value && existingQuestion.options) {
          options.value = existingQuestion.options.map(opt => ({...opt}))
        }

        // 回填答案
        if (existingQuestion.type === 'single' || existingQuestion.type === 'judgment') {
          singleAnswer.value = existingQuestion.answer as string
        } else if (existingQuestion.type === 'multiple') {
          multipleAnswer.value = [...(existingQuestion.answer as string[])]
        } else if (existingQuestion.type === 'essay') {
          textAnswer.value = existingQuestion.answer as string
        }
      }
    } else {
      showToast('未找到试题', { type: 'error' })
      router.push('/question-management')
    }
  }
})

// 筛选条件
const filter = ref<QuestionFilter>({})

// 知识点多选
const selectedKnowledgePointIds = ref<string[]>([])

// 收费规则
const paymentRuleId = ref<string>('')

// 知识点选择弹窗状态
const knowledgePointModalVisible = ref(false)

// 题型列表
const questionTypes = [
  { value: 'single', label: '单选题' },
  { value: 'multiple', label: '多选题' },
  { value: 'judgment', label: '判断题' },
  { value: 'essay', label: '简答题' },
  { value: 'combination', label: '组合题' }
]

// 当前题型
const currentType = ref<QuestionType>('single')

// 试题表单
const questionForm = ref<QuestionForm>({
  projectId: '',
  subjectId: '',
  chapterId: '',
  type: 'single',
  source: 'custom',
  stem: '',
  answer: '',
  explanation: ''
})

// 选项列表（常规题型）
const options = ref<QuestionOption[]>([
  { label: 'A', content: '' },
  { label: 'B', content: '' },
  { label: 'C', content: '' },
  { label: 'D', content: '' }
])

// 答案（常规题型）
const singleAnswer = ref('')
const multipleAnswer = ref<string[]>([])
const textAnswer = ref('')

// 组合题相关
const mainStem = ref('')
const subQuestions = ref<SubQuestion[]>([])

// 计算属性
const projects = computed(() => projectStore.mockProjects)

const filteredSubjects = computed(() => {
  if (!filter.value.projectId) return []
  return projectStore.mockSubjects.filter(s => s.projectId === filter.value.projectId)
})

const filteredChapters = computed(() => {
  if (!filter.value.subjectId) return []
  return chapterStore.chapters.filter(c => c.subjectId === filter.value.subjectId)
})

const filteredKnowledgePoints = computed(() => {
  if (!filter.value.subjectId) return []
  return knowledgePointStore.getKnowledgePointsBySubject(filter.value.subjectId).value
})

/**
 * 已选知识点名称列表(用于显示)
 */
const selectedKnowledgePointNames = computed(() => {
  return selectedKnowledgePointIds.value.map(id => {
    const kp = knowledgePointStore.knowledgePoints.find(k => k.id === id)
    return kp?.name || ''
  }).filter(name => name !== '')
})

const isObjectiveQuestion = computed(() => {
  return ['single', 'multiple', 'uncertain'].includes(currentType.value)
})

// 方法
function onProjectChange() {
  filter.value.subjectId = ''
  filter.value.chapterId = ''
}

function onSubjectChange() {
  filter.value.chapterId = ''
}

/**
 * 打开知识点选择弹窗
 */
function openKnowledgePointModal() {
  if (!filter.value.subjectId) {
    showToast('请先选择科目', { type: 'error' })
    return
  }
  knowledgePointModalVisible.value = true
}

/**
 * 处理知识点选择
 */
function handleKnowledgePointSelect(knowledgePointIds: string[]) {
  selectedKnowledgePointIds.value = [...knowledgePointIds]
}

/**
 * 移除单个知识点
 */
function removeKnowledgePoint(index: number) {
  selectedKnowledgePointIds.value.splice(index, 1)
}

function addOption() {
  if (options.value.length >= 10) return
  const nextLabel = String.fromCharCode(65 + options.value.length) // A, B, C, ...
  options.value.push({ label: nextLabel, content: '' })
}

function removeOption(index: number) {
  if (options.value.length <= 2) return
  options.value.splice(index, 1)
  // 重新分配标签
  options.value.forEach((opt, idx) => {
    opt.label = String.fromCharCode(65 + idx)
  })
}

// 组合题：添加小问
function addSubQuestion() {
  const newSubQuestion: SubQuestion = {
    id: Date.now().toString() + Math.random(),
    type: 'single',
    stem: '',
    options: [
      { label: 'A', content: '' },
      { label: 'B', content: '' },
      { label: 'C', content: '' },
      { label: 'D', content: '' }
    ],
    answer: '',
    explanation: ''
  }
  subQuestions.value.push(newSubQuestion)
}

// 组合题：删除小问
function removeSubQuestion(index: number) {
  subQuestions.value.splice(index, 1)
}

// 组合题：判断小问是否为客观题
function isSubQuestionObjective(type: QuestionType): boolean {
  return ['single', 'multiple'].includes(type)
}

// 组合题：小问题型变化
function onSubQuestionTypeChange(index: number) {
  const subQ = subQuestions.value[index]

  // 重置答案
  if (subQ.type === 'single' || subQ.type === 'judgment') {
    subQ.answer = ''
  } else if (subQ.type === 'multiple') {
    subQ.answer = []
  } else {
    subQ.answer = ''
  }

  // 判断题不需要选项
  if (subQ.type === 'judgment') {
    subQ.options = undefined
  } else if (isSubQuestionObjective(subQ.type) && !subQ.options) {
    // 客观题需要选项
    subQ.options = [
      { label: 'A', content: '' },
      { label: 'B', content: '' },
      { label: 'C', content: '' },
      { label: 'D', content: '' }
    ]
  } else if (subQ.type === 'essay') {
    // 简答题不需要选项
    subQ.options = undefined
  }
}

// 组合题：小问添加选项
function addSubQuestionOption(subQIndex: number) {
  const subQ = subQuestions.value[subQIndex]
  if (!subQ.options || subQ.options.length >= 10) return
  const nextLabel = String.fromCharCode(65 + subQ.options.length)
  subQ.options.push({ label: nextLabel, content: '' })
}

// 组合题：小问删除选项
function removeSubQuestionOption(subQIndex: number, optIndex: number) {
  const subQ = subQuestions.value[subQIndex]
  if (!subQ.options || subQ.options.length <= 2) return
  subQ.options.splice(optIndex, 1)
  // 重新分配标签
  subQ.options.forEach((opt, idx) => {
    opt.label = String.fromCharCode(65 + idx)
  })
}

function handleCancel() {
  router.push('/')
}

function validateForm(): boolean {
  if (!filter.value.projectId || !filter.value.subjectId || !filter.value.chapterId) {
    showToast('请选择完整的项目、科目和章节', { type: 'error' })
    return false
  }

  // 组合题验证
  if (currentType.value === 'combination') {
    if (!mainStem.value.trim()) {
      showToast('请输入案例背景', { type: 'error' })
      return false
    }
    if (subQuestions.value.length === 0) {
      showToast('组合题至少需要添加一个小问', { type: 'error' })
      return false
    }
    // 验证每个小问
    for (let i = 0; i < subQuestions.value.length; i++) {
      const subQ = subQuestions.value[i]
      if (!subQ.stem.trim()) {
        showToast(`小问${i + 1}的题干不能为空`, { type: 'error' })
        return false
      }
      if (isSubQuestionObjective(subQ.type) && subQ.options) {
        if (subQ.options.some(opt => !opt.content.trim())) {
          showToast(`小问${i + 1}的选项内容不能为空`, { type: 'error' })
          return false
        }
      }
      if (subQ.type === 'single' || subQ.type === 'judgment') {
        if (!subQ.answer) {
          showToast(`小问${i + 1}未选择答案`, { type: 'error' })
          return false
        }
      } else if (subQ.type === 'multiple') {
        if (!Array.isArray(subQ.answer) || subQ.answer.length === 0) {
          showToast(`小问${i + 1}至少选择一个答案`, { type: 'error' })
          return false
        }
      } else {
        if (typeof subQ.answer === 'string' && !subQ.answer.trim()) {
          showToast(`小问${i + 1}的答案不能为空`, { type: 'error' })
          return false
        }
      }
      if (!subQ.explanation.trim()) {
        showToast(`小问${i + 1}的解析不能为空`, { type: 'error' })
        return false
      }
    }
    return true
  }

  // 常规题型验证
  if (!questionForm.value.stem.trim()) {
    showToast('请输入题干内容', { type: 'error' })
    return false
  }
  if (isObjectiveQuestion.value) {
    if (options.value.some(opt => !opt.content.trim())) {
      showToast('请填写所有选项内容', { type: 'error' })
      return false
    }
    if (currentType.value === 'single' && !singleAnswer.value) {
      showToast('请选择正确答案', { type: 'error' })
      return false
    }
    if (currentType.value === 'multiple' && multipleAnswer.value.length === 0) {
      showToast('请至少选择一个正确答案', { type: 'error' })
      return false
    }
  } else if (currentType.value === 'judgment' && !singleAnswer.value) {
    showToast('请选择正确答案', { type: 'error' })
    return false
  } else if (currentType.value === 'essay' && !textAnswer.value.trim()) {
    showToast('请输入参考答案', { type: 'error' })
    return false
  }
  if (!questionForm.value.explanation.trim()) {
    showToast('请输入试题解析', { type: 'error' })
    return false
  }
  return true
}

function buildFormData(): QuestionForm {
  const formData: QuestionForm = {
    projectId: filter.value.projectId!,
    subjectId: filter.value.subjectId!,
    chapterId: filter.value.chapterId!,
    type: currentType.value,
    source: filter.value.source || 'custom',
    year: filter.value.year,
    difficulty: filter.value.difficulty,
    knowledgePointIds: selectedKnowledgePointIds.value.length > 0 ? [...selectedKnowledgePointIds.value] : undefined,
    paymentRuleId: paymentRuleId.value || undefined,
    stem: '',
    answer: '',
    explanation: ''
  }

  // 组合题
  if (currentType.value === 'combination') {
    formData.mainStem = mainStem.value
    formData.subQuestions = subQuestions.value.map(subQ => ({ ...subQ }))
    formData.stem = mainStem.value // 兼容性
    formData.answer = '参见小问答案'
    formData.explanation = '参见各小问解析'
  } else {
    // 常规题型
    formData.stem = questionForm.value.stem
    formData.explanation = questionForm.value.explanation

    if (isObjectiveQuestion.value) {
      formData.options = options.value.map(opt => ({ ...opt }))
      if (currentType.value === 'single') {
        formData.answer = singleAnswer.value
      } else {
        formData.answer = [...multipleAnswer.value]
      }
    } else if (currentType.value === 'judgment') {
      formData.answer = singleAnswer.value
    } else {
      formData.answer = textAnswer.value
    }
  }

  return formData
}

function resetForm() {
  questionForm.value = {
    projectId: filter.value.projectId || '',
    subjectId: filter.value.subjectId || '',
    chapterId: filter.value.chapterId || '',
    type: currentType.value,
    source: filter.value.source || 'custom',
    stem: '',
    answer: '',
    explanation: ''
  }
  // 保持知识点选择（支持连续录入）
  // selectedKnowledgePointIds.value = []
  // 重置收费规则（连续录入时可能需要调整）
  paymentRuleId.value = ''
  singleAnswer.value = ''
  multipleAnswer.value = []
  textAnswer.value = ''
  mainStem.value = ''
  subQuestions.value = []

  if (currentType.value !== 'combination' && isObjectiveQuestion.value) {
    options.value = [
      { label: 'A', content: '' },
      { label: 'B', content: '' },
      { label: 'C', content: '' },
      { label: 'D', content: '' }
    ]
  } else {
    options.value = []
  }
}

function handleSave() {
  if (!validateForm()) return

  const formData = buildFormData()
  if (isEditMode.value && editingQuestionId.value) {
    questionStore.updateQuestion(editingQuestionId.value, formData)
    showToast('试题更新成功')
  } else {
    questionStore.addQuestion(formData)
    showToast('试题保存成功')
  }
  router.push('/question-management')
}

function handleSaveAndContinue() {
  if (!validateForm()) return

  const formData = buildFormData()
  if (isEditMode.value && editingQuestionId.value) {
    questionStore.updateQuestion(editingQuestionId.value, formData)
    showToast('试题更新成功')
    router.push('/question-management')
  } else {
    questionStore.addQuestion(formData)
    showToast('试题保存成功，可继续添加')
    resetForm()
  }
}

// 监听题型变化,重置答案
watch(currentType, () => {
  singleAnswer.value = ''
  multipleAnswer.value = []
  textAnswer.value = ''
  mainStem.value = ''
  subQuestions.value = []

  if (currentType.value === 'combination') {
    options.value = []
  } else if (!isObjectiveQuestion.value) {
    options.value = []
  } else if (options.value.length === 0) {
    options.value = [
      { label: 'A', content: '' },
      { label: 'B', content: '' },
      { label: 'C', content: '' },
      { label: 'D', content: '' }
    ]
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

/* 表单区域 */
.question-form-wrapper {
  display: grid;
  gap: 24px;
}

.form-section {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  padding: 24px;
}

.form-section h4 {
  margin: 0 0 20px;
  font-size: 16px;
  font-weight: 600;
  color: var(--accent);
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-section h4::before {
  content: "";
  width: 4px;
  height: 16px;
  background: linear-gradient(180deg, #4f77ff 0%, #2f57e3 100%);
  border-radius: 2px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.form-group {
  display: grid;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  font-size: 13px;
  color: var(--primary-text);
}

.form-group label .required {
  color: #d54a3c;
  margin-left: 2px;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #cdd5e0;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-group select.multi-select {
  min-height: 120px;
  padding: 8px;
}

.form-group select.multi-select option {
  padding: 6px 8px;
  margin: 2px 0;
  border-radius: 4px;
}

.form-group select.multi-select option:checked {
  background: linear-gradient(180deg, #4f77ff 0%, #2f57e3 100%);
  color: #ffffff;
  font-weight: 600;
}

.knowledge-points-select {
  grid-column: 1 / -1;
}

.form-hint {
  font-size: 12px;
  color: var(--secondary-text);
}

/* 题型选择 */
.type-selector {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.type-radio {
  position: absolute;
  opacity: 0;
}

.type-label {
  padding: 10px 20px;
  border-radius: 8px;
  border: 2px solid #e4eaf2;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 14px;
  color: var(--primary-text);
}

.type-label:hover {
  border-color: var(--accent);
  background: var(--row-hover);
}

.type-label.active {
  border-color: var(--accent);
  background: linear-gradient(180deg, #e6f2ff 0%, #d9ebff 100%);
  color: var(--accent);
  font-weight: 600;
}

.type-label.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f5f5f5;
  border-color: #e4eaf2;
}

.type-label.disabled:hover {
  border-color: #e4eaf2;
  background: #f5f5f5;
}

.form-group select:disabled,
.form-group input:disabled {
  background: #f5f5f5;
  color: var(--secondary-text);
  cursor: not-allowed;
  opacity: 0.7;
}

/* 选项管理 */
.options-container {
  display: grid;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.option-label {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: linear-gradient(180deg, #4f77ff 0%, #2f57e3 100%);
  color: #ffffff;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.option-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #cdd5e0;
  border-radius: 6px;
  font-size: 14px;
}

.option-remove {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #cf4a30;
  background: #ffffff;
  color: #cf4a30;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-remove:hover:not(:disabled) {
  background: #fff3f0;
}

.option-remove:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-option-btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: 2px dashed var(--accent);
  background: #ffffff;
  color: var(--accent);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: fit-content;
}

.add-option-btn:hover:not(:disabled) {
  background: var(--row-hover);
}

.add-option-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 答案选择 */
.answer-selector {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.answer-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #e4eaf2;
  border-radius: 6px;
  background: #fafcfe;
  cursor: pointer;
  transition: all 0.2s ease;
}

.answer-option:hover {
  background: var(--row-hover);
  border-color: var(--accent);
}

.answer-option input {
  cursor: pointer;
}

/* 组合题相关样式 */
.sub-questions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.sub-questions-header h4 {
  margin: 0;
}

.add-sub-question-btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: 2px dashed var(--accent);
  background: #ffffff;
  color: var(--accent);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-sub-question-btn:hover {
  background: var(--row-hover);
}

.empty-sub-questions {
  text-align: center;
  padding: 40px 20px;
  color: var(--secondary-text);
  background: #fafcfe;
  border: 1px dashed #e4eaf2;
  border-radius: 8px;
}

.sub-question-card {
  background: #fafcfe;
  border: 1px solid #e4eaf2;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}

.sub-question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(180deg, #e6f2ff 0%, #d9ebff 100%);
  border-bottom: 1px solid #e4eaf2;
}

.sub-question-number {
  font-weight: 600;
  font-size: 14px;
  color: var(--accent);
}

.remove-sub-question-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #cf4a30;
  background: #ffffff;
  color: #cf4a30;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-sub-question-btn:hover {
  background: #fff3f0;
}

.sub-question-body {
  padding: 16px;
  display: grid;
  gap: 16px;
}

/* 操作按钮 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid var(--panel-border);
  margin-top: 24px;
}

.btn {
  padding: 10px 24px;
  border-radius: 8px;
  border: 1px solid transparent;
  font-size: 14px;
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

.btn.tertiary {
  background-color: #ffffff;
  color: var(--secondary-text);
  border-color: #d8d8d8;
}

.btn.tertiary:hover {
  background-color: #f5f5f5;
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

/* 样式指南 */
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

/* 知识点选择样式 */
.knowledge-point-input-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.knowledge-point-display {
  flex: 1;
  min-height: 42px;
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid #dfe3eb;
  border-radius: 6px;
  transition: border-color 0.2s;
}

.knowledge-point-display.is-disabled {
  background-color: #f5f7fa;
  cursor: not-allowed;
}

.selected-knowledge-points {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.knowledge-point-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f2ff 100%);
  border: 1px solid #b3d9ff;
  border-radius: 4px;
  font-size: 13px;
  color: var(--primary-text);
}

.remove-tag-btn {
  margin-left: 6px;
  padding: 0;
  width: 16px;
  height: 16px;
  background: rgba(0, 102, 204, 0.1);
  border: none;
  border-radius: 50%;
  color: var(--accent);
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-tag-btn:hover:not(:disabled) {
  background: var(--accent);
  color: #ffffff;
}

.remove-tag-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.placeholder-text {
  color: #999;
  font-size: 14px;
}

.btn-add-knowledge-point {
  padding: 10px 20px;
  background: linear-gradient(180deg, #4f77ff 0%, #2f57e3 100%);
  border: 1px solid #375edf;
  border-radius: 6px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-add-knowledge-point:hover:not(:disabled) {
  background: linear-gradient(180deg, #4b6ee6 0%, #264acc 100%);
}

.btn-add-knowledge-point:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #cbd5e0;
  border-color: #cbd5e0;
}

@media (max-width: 768px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }

  .type-selector {
    flex-direction: column;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
