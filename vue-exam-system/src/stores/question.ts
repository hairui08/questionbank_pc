import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Question, QuestionForm, QuestionFilter, QuestionType } from '@/views/question-management/types'

export const useQuestionStore = defineStore('question', () => {
  // Mock数据
  const mockQuestions = ref<Question[]>([
    {
      id: 'q-001',
      projectId: 'proj-001',
      subjectId: 's1',
      chapterId: 'ch-001',
      type: 'single',
      source: 'official',
      year: '2025',
      difficulty: 'medium',
      knowledgePointIds: ['kp-001'],
      stem: '某企业2023年营业收入为5000万元,营业成本为3000万元,期间费用为800万元,则该企业的营业利润为多少?',
      options: [
        { label: 'A', content: '1200万元' },
        { label: 'B', content: '1500万元' },
        { label: 'C', content: '2000万元' },
        { label: 'D', content: '2200万元' }
      ],
      answer: 'A',
      explanation: '营业利润 = 营业收入 - 营业成本 - 期间费用 = 5000 - 3000 - 800 = 1200万元。该题考查营业利润的计算公式。',
      createTime: '2025-10-01T10:00:00.000Z',
      updateTime: '2025-10-01T10:00:00.000Z',
      creatorId: 'admin',
      status: 'active'
    },
    {
      id: 'q-002',
      projectId: 'proj-001',
      subjectId: 's1',
      chapterId: 'ch-001',
      type: 'multiple',
      source: 'official',
      year: '2025',
      difficulty: 'hard',
      knowledgePointIds: ['kp-002'],
      stem: '下列关于财务报表分析的表述中,正确的有哪些?',
      options: [
        { label: 'A', content: '资产负债率越低,企业偿债能力越强' },
        { label: 'B', content: '流动比率越高,企业短期偿债能力越强' },
        { label: 'C', content: '存货周转率越高,存货管理效率越高' },
        { label: 'D', content: '净资产收益率越高,企业盈利能力越强' }
      ],
      answer: ['A', 'C', 'D'],
      explanation: '选项A正确,资产负债率越低表明企业负债占总资产比例越小,偿债能力越强。选项B错误,流动比率过高可能说明资产利用效率低下。选项C正确,存货周转率高说明存货周转速度快,管理效率高。选项D正确,净资产收益率是衡量企业盈利能力的核心指标。',
      createTime: '2025-10-02T09:30:00.000Z',
      updateTime: '2025-10-02T09:30:00.000Z',
      creatorId: 'admin',
      status: 'active'
    },
    {
      id: 'q-003',
      projectId: 'proj-001',
      subjectId: 's1',
      chapterId: 'ch-002',
      type: 'judgment',
      source: 'simulation',
      year: '2025',
      difficulty: 'easy',
      knowledgePointIds: ['kp-002'],
      stem: '企业的利润表反映的是企业在某一时点的经营成果。',
      answer: 'false',
      explanation: '该说法错误。利润表反映的是企业在某一会计期间(而非时点)的经营成果,属于动态报表。资产负债表才是反映企业某一时点财务状况的静态报表。',
      createTime: '2025-10-03T14:20:00.000Z',
      updateTime: '2025-10-03T14:20:00.000Z',
      creatorId: 'editor',
      status: 'active'
    },
    {
      id: 'q-004',
      projectId: 'proj-001',
      subjectId: 's1',
      chapterId: 'ch-002',
      type: 'multiple',
      source: 'official',
      year: '2023',
      difficulty: 'hard',
      knowledgePointIds: ['kp-003'],
      stem: '下列关于企业现金流量表的表述中,正确的是?',
      options: [
        { label: 'A', content: '经营活动现金流量净额为正值,说明企业经营状况良好' },
        { label: 'B', content: '投资活动现金流量净额为负值,说明企业正在扩张' },
        { label: 'C', content: '筹资活动现金流量净额为正值,说明企业融资能力强' },
        { label: 'D', content: '现金及现金等价物净增加额等于三大活动现金流量净额之和' }
      ],
      answer: ['B', 'D'],
      explanation: '选项A不完全正确,需结合其他指标综合判断。选项B正确,投资活动现金流出通常表明企业在进行资本性支出。选项C不完全正确,筹资活动现金流入可能是借款增加,不一定代表融资能力强。选项D正确,这是现金流量表的平衡关系。',
      createTime: '2025-09-25T11:00:00.000Z',
      updateTime: '2025-09-25T11:00:00.000Z',
      creatorId: 'admin',
      status: 'active'
    },
    {
      id: 'q-005',
      projectId: 'proj-001',
      subjectId: 's1',
      chapterId: 'ch-003',
      type: 'essay',
      source: 'custom',
      year: '2025',
      difficulty: 'medium',
      stem: '简述企业财务分析的主要方法及其适用场景。',
      answer: '企业财务分析的主要方法包括:\n1. 比率分析法:通过计算各种财务比率来评价企业财务状况,如偿债能力比率、盈利能力比率等。适用于同一企业不同时期或不同企业之间的比较。\n2. 比较分析法:将企业实际数据与预算数、历史数或行业平均数进行对比。适用于发现差异和趋势。\n3. 趋势分析法:分析企业连续多期财务数据的变化趋势。适用于预测未来发展方向。\n4. 因素分析法:分析影响财务指标的各个因素及其影响程度。适用于深入剖析指标变化原因。',
      explanation: '本题考查财务分析方法的掌握程度。答案应包含主要分析方法的名称、基本原理和适用场景。完整答案需涵盖比率分析、比较分析、趋势分析和因素分析四种方法,并说明各自的应用场景。',
      createTime: '2025-10-05T16:45:00.000Z',
      updateTime: '2025-10-05T16:45:00.000Z',
      creatorId: 'editor',
      status: 'active'
    },
    {
      id: 'q-006',
      projectId: 'proj-001',
      subjectId: 's1',
      chapterId: 'ch-001',
      type: 'single',
      source: 'official',
      year: '2023',
      difficulty: 'easy',
      knowledgePointIds: ['kp-001'],
      stem: '企业会计核算的基本前提不包括以下哪项?',
      options: [
        { label: 'A', content: '会计主体' },
        { label: 'B', content: '持续经营' },
        { label: 'C', content: '会计分期' },
        { label: 'D', content: '谨慎性原则' }
      ],
      answer: 'D',
      explanation: '会计核算的基本前提包括会计主体、持续经营、会计分期和货币计量四项。谨慎性原则属于会计信息质量要求,不是会计基本前提。',
      createTime: '2025-09-20T08:00:00.000Z',
      updateTime: '2025-09-20T08:00:00.000Z',
      creatorId: 'admin',
      status: 'active'
    },
    {
      id: 'q-007',
      projectId: 'proj-001',
      subjectId: 's2',
      chapterId: 'ch-004',
      type: 'single',
      source: 'simulation',
      year: '2025',
      difficulty: 'medium',
      stem: '某企业采用成本模式对投资性房地产进行后续计量,下列表述正确的是?',
      options: [
        { label: 'A', content: '应当按照固定资产准则计提折旧' },
        { label: 'B', content: '公允价值变动计入当期损益' },
        { label: 'C', content: '不需要计提折旧或摊销' },
        { label: 'D', content: '必须每年进行减值测试' }
      ],
      answer: 'A',
      explanation: '采用成本模式计量的投资性房地产,应当按照固定资产或无形资产准则的规定,对房地产计提折旧或进行摊销。公允价值变动是公允价值模式下的处理方式。',
      createTime: '2025-10-08T10:30:00.000Z',
      updateTime: '2025-10-08T10:30:00.000Z',
      creatorId: 'editor',
      status: 'active'
    },
    {
      id: 'q-008',
      projectId: 'proj-001',
      subjectId: 's2',
      chapterId: 'ch-004',
      type: 'multiple',
      source: 'official',
      year: '2025',
      difficulty: 'hard',
      stem: '下列关于会计政策变更的表述中,正确的有?',
      options: [
        { label: 'A', content: '会计政策变更应当采用追溯调整法' },
        { label: 'B', content: '会计估计变更采用未来适用法' },
        { label: 'C', content: '会计政策变更累积影响数不能确定的,采用未来适用法' },
        { label: 'D', content: '所有会计政策变更都需要追溯调整' }
      ],
      answer: ['A', 'B', 'C'],
      explanation: '选项A正确,会计政策变更一般采用追溯调整法。选项B正确,会计估计变更采用未来适用法,不调整以前期间。选项C正确,当累积影响数不能合理确定时,采用未来适用法。选项D错误,并非所有变更都需要追溯调整。',
      createTime: '2025-10-10T15:00:00.000Z',
      updateTime: '2025-10-10T15:00:00.000Z',
      creatorId: 'admin',
      status: 'active'
    },
    {
      id: 'q-009',
      projectId: 'proj-001',
      subjectId: 's1',
      chapterId: 'ch-002',
      type: 'judgment',
      source: 'official',
      year: '2023',
      difficulty: 'medium',
      stem: '企业收到投资者投入的资本,应当按照投资合同或协议约定的价值作为实收资本入账。',
      answer: 'false',
      explanation: '该说法错误。企业收到投资者投入的资本,应当按照投资者实际投入的资本金额(而非合同约定价值)作为实收资本入账。如果实际投入价值与合同约定不一致,差额计入资本公积。',
      createTime: '2025-09-28T13:15:00.000Z',
      updateTime: '2025-09-28T13:15:00.000Z',
      creatorId: 'editor',
      status: 'active'
    },
    {
      id: 'q-010',
      projectId: 'proj-001',
      subjectId: 's1',
      chapterId: 'ch-003',
      type: 'essay',
      source: 'custom',
      year: '2025',
      difficulty: 'hard',
      knowledgePointIds: ['kp-003'],
      stem: '论述企业应收账款管理的主要内容及风险控制措施。',
      answer: '应收账款管理的主要内容:\n1. 信用政策制定:包括信用标准、信用条件和收账政策的确定\n2. 信用调查与评估:对客户进行资信调查,建立信用档案\n3. 账龄分析:定期编制账龄分析表,监控应收账款质量\n4. 催收管理:建立催收制度,及时催收逾期账款\n\n风险控制措施:\n1. 事前控制:严格审查客户资信,设定合理信用额度\n2. 事中控制:加强合同管理,做好销售和收款记录\n3. 事后控制:及时催收,必要时采取法律手段\n4. 建立坏账准备制度:按期计提坏账准备,降低损失',
      explanation: '本题考查应收账款管理的系统性知识。完整答案应包含管理内容和风险控制两个方面,并体现事前、事中、事后的全过程控制思路。评分要点:内容完整性、逻辑性、实务可操作性。',
      createTime: '2025-10-12T09:00:00.000Z',
      updateTime: '2025-10-12T09:00:00.000Z',
      creatorId: 'admin',
      status: 'active'
    },
    {
      id: 'q-011',
      projectId: 'proj-001',
      subjectId: 's1',
      chapterId: 'ch-001',
      type: 'combination',
      source: 'official',
      year: '2025',
      difficulty: 'hard',
      stem: '', // 组合题stem为空,使用mainStem
      mainStem: '某上市公司2025年度财务报告显示:\n\n资产负债表摘要:\n- 流动资产: 5000万元(其中:货币资金1500万元,应收账款2000万元,存货1500万元)\n- 非流动资产: 8000万元(其中:固定资产6000万元,无形资产2000万元)\n- 流动负债: 3000万元(其中:短期借款1500万元,应付账款1500万元)\n- 非流动负债: 4000万元(全部为长期借款)\n- 所有者权益: 6000万元\n\n利润表摘要:\n- 营业收入: 20000万元\n- 营业成本: 12000万元\n- 期间费用: 4000万元\n- 营业利润: 4000万元\n- 净利润: 3000万元\n\n现金流量表摘要:\n- 经营活动现金流量净额: 3500万元\n- 投资活动现金流量净额: -2000万元\n- 筹资活动现金流量净额: -500万元',
      answer: '',
      explanation: '',
      subQuestions: [
        {
          id: 'sq-011-1',
          type: 'single',
          stem: '根据上述资料,该公司的资产负债率为多少?',
          options: [
            { label: 'A', content: '46.15%' },
            { label: 'B', content: '53.85%' },
            { label: 'C', content: '60.00%' },
            { label: 'D', content: '66.67%' }
          ],
          answer: 'B',
          explanation: '资产负债率 = 负债总额 / 资产总额 × 100% = (3000 + 4000) / 13000 × 100% = 53.85%。该比率反映企业财务杠杆水平。'
        },
        {
          id: 'sq-011-2',
          type: 'single',
          stem: '该公司的流动比率为多少?',
          options: [
            { label: 'A', content: '1.00' },
            { label: 'B', content: '1.33' },
            { label: 'C', content: '1.67' },
            { label: 'D', content: '2.00' }
          ],
          answer: 'C',
          explanation: '流动比率 = 流动资产 / 流动负债 = 5000 / 3000 = 1.67。流动比率大于1,表明企业短期偿债能力较好。'
        },
        {
          id: 'sq-011-3',
          type: 'multiple',
          stem: '下列关于该公司财务状况的表述,正确的有哪些?',
          options: [
            { label: 'A', content: '营业利润率为20%' },
            { label: 'B', content: '净利润率为15%' },
            { label: 'C', content: '经营活动现金流量净额为正,说明经营状况良好' },
            { label: 'D', content: '投资活动现金流量净额为负,说明企业正在扩张' }
          ],
          answer: ['A', 'B', 'C', 'D'],
          explanation: 'A正确:营业利润率 = 4000/20000 = 20%。B正确:净利润率 = 3000/20000 = 15%。C正确:经营活动现金流净额为正,反映经营质量较好。D正确:投资活动现金流出,通常表明企业在进行资本性投资。'
        },
        {
          id: 'sq-011-4',
          type: 'judgment',
          stem: '该公司的速动比率低于流动比率,说明存货占流动资产比重较大。',
          answer: 'true',
          explanation: '该说法正确。速动比率 = (流动资产 - 存货) / 流动负债 = (5000 - 1500) / 3000 = 1.17,低于流动比率1.67,说明存货占流动资产比重为30%(1500/5000)。'
        },
        {
          id: 'sq-011-5',
          type: 'essay',
          stem: '根据上述财务数据,分析该公司在盈利能力、偿债能力和现金流管理方面的优势和不足。',
          answer: '优势:\n1. 盈利能力:营业利润率20%,净利润率15%,盈利能力较强\n2. 偿债能力:流动比率1.67,速动比率1.17,短期偿债能力良好;资产负债率53.85%,财务风险可控\n3. 现金流管理:经营活动现金流量净额3500万元,接近净利润3000万元,经营质量高\n\n不足:\n1. 应收账款占比较高(占流动资产40%),可能存在回款风险\n2. 存货占比30%,需关注存货周转效率\n3. 投资活动现金流出2000万元,需评估投资回报\n4. 筹资活动现金流出500万元,可能处于偿还债务阶段',
          explanation: '本题考查综合财务分析能力。评分要点:1)能否从多维度分析财务状况 2)优势和不足分析是否客观全面 3)是否基于数据进行合理推断 4)建议是否具有针对性和可操作性。'
        }
      ],
      createTime: '2025-10-15T10:00:00.000Z',
      updateTime: '2025-10-15T10:00:00.000Z',
      creatorId: 'admin',
      status: 'active'
    },
    // 新增试题 (q-012 到 q-036) - 用于分页演示
    {
      id: 'q-012',
      projectId: 'proj-001',
      subjectId: 's1',
      chapterId: 'ch-001',
      type: 'single',
      source: 'official',
      year: '2025',
      difficulty: 'easy',
      knowledgePointIds: ['kp-006'],
      stem: '投资决策中,下列哪项不属于固定资产投资决策的方法?',
      options: [
        { label: 'A', content: '净现值法' },
        { label: 'B', content: '内含报酬率法' },
        { label: 'C', content: '回收期法' },
        { label: 'D', content: '比率分析法' }
      ],
      answer: 'D',
      explanation: '固定资产投资决策方法包括净现值法、内含报酬率法、回收期法等。比率分析法主要用于财务分析,不属于投资决策方法。',
      createTime: '2025-10-16T10:00:00.000Z',
      updateTime: '2025-10-16T10:00:00.000Z',
      creatorId: 'editor',
      status: 'active'
    },
    {
      id: 'q-013',
      projectId: 'proj-001',
      subjectId: 's1',
      chapterId: 'ch-002',
      type: 'multiple',
      source: 'simulation',
      year: '2025',
      difficulty: 'medium',
      knowledgePointIds: ['kp-007'],
      stem: '企业优化资本结构可以采取的措施包括?',
      options: [
        { label: 'A', content: '调整债务资本和权益资本的比例' },
        { label: 'B', content: '优化债务期限结构' },
        { label: 'C', content: '降低资本成本' },
        { label: 'D', content: '提高财务杠杆' }
      ],
      answer: ['A', 'B', 'C'],
      explanation: '资本结构优化包括调整债务权益比例、优化债务期限、降低资本成本等措施。提高财务杠杆并非总是优化,需要综合考虑风险和收益。',
      createTime: '2025-10-16T11:00:00.000Z',
      updateTime: '2025-10-16T11:00:00.000Z',
      creatorId: 'admin',
      status: 'active'
    },
    {
      id: 'q-014',
      projectId: 'proj-001',
      subjectId: 's1',
      chapterId: 'ch-003',
      type: 'judgment',
      source: 'official',
      year: '2023',
      difficulty: 'medium',
      knowledgePointIds: ['kp-008'],
      stem: '企业风险管理的目标是消除所有风险。',
      answer: 'false',
      explanation: '该说法错误。风险管理的目标不是消除所有风险,而是将风险控制在可接受范围内,实现风险与收益的平衡。',
      createTime: '2025-10-16T12:00:00.000Z',
      updateTime: '2025-10-16T12:00:00.000Z',
      creatorId: 'editor',
      status: 'active'
    },
    {
      id: 'q-015',
      projectId: 'proj-001',
      subjectId: 's1',
      chapterId: 'ch-001',
      type: 'single',
      source: 'custom',
      year: '2025',
      difficulty: 'hard',
      knowledgePointIds: ['kp-009'],
      stem: '平衡计分卡的四个维度不包括?',
      options: [
        { label: 'A', content: '财务维度' },
        { label: 'B', content: '客户维度' },
        { label: 'C', content: '内部流程维度' },
        { label: 'D', content: '市场竞争维度' }
      ],
      answer: 'D',
      explanation: '平衡计分卡包括财务、客户、内部流程和学习成长四个维度。市场竞争不是独立维度,而是体现在其他维度中。',
      createTime: '2025-10-16T13:00:00.000Z',
      updateTime: '2025-10-16T13:00:00.000Z',
      creatorId: 'admin',
      status: 'active'
    },
    {
      id: 'q-016',
      projectId: 'proj-001',
      subjectId: 's1',
      chapterId: 'ch-002',
      type: 'multiple',
      source: 'official',
      year: '2025',
      difficulty: 'hard',
      knowledgePointIds: ['kp-010'],
      stem: '企业并购中,下列说法正确的是?',
      options: [
        { label: 'A', content: '横向并购可以实现规模经济' },
        { label: 'B', content: '纵向并购可以控制产业链' },
        { label: 'C', content: '混合并购风险最小' },
        { label: 'D', content: '并购协同效应一定为正' }
      ],
      answer: ['A', 'B'],
      explanation: 'A正确:横向并购可以扩大规模,实现规模经济。B正确:纵向并购有助于控制上下游。C错误:混合并购因跨行业,风险较大。D错误:并购协同效应可能为负。',
      createTime: '2025-10-16T14:00:00.000Z',
      updateTime: '2025-10-16T14:00:00.000Z',
      creatorId: 'admin',
      status: 'active'
    },
    {
      id: 'q-017',
      projectId: 'proj-001',
      subjectId: 's2',
      chapterId: 'ch-004',
      type: 'single',
      source: 'official',
      year: '2025',
      difficulty: 'easy',
      knowledgePointIds: ['kp-011'],
      stem: '增值税的计税方法不包括?',
      options: [
        { label: 'A', content: '一般计税方法' },
        { label: 'B', content: '简易计税方法' },
        { label: 'C', content: '核定计税方法' },
        { label: 'D', content: '查账计税方法' }
      ],
      answer: 'D',
      explanation: '增值税的计税方法包括一般计税方法、简易计税方法和核定计税方法。查账计税是所得税的计税方式。',
      createTime: '2025-10-16T15:00:00.000Z',
      updateTime: '2025-10-16T15:00:00.000Z',
      creatorId: 'editor',
      status: 'active'
    },
    {
      id: 'q-018',
      projectId: 'proj-001',
      subjectId: 's2',
      chapterId: 'ch-005',
      type: 'multiple',
      source: 'simulation',
      year: '2023',
      difficulty: 'medium',
      knowledgePointIds: ['kp-012'],
      stem: '企业所得税前可以扣除的费用包括?',
      options: [
        { label: 'A', content: '合理的工资薪金支出' },
        { label: 'B', content: '职工福利费不超过工资薪金总额14%的部分' },
        { label: 'C', content: '业务招待费全额扣除' },
        { label: 'D', content: '广告费和业务宣传费不超过营业收入15%的部分' }
      ],
      answer: ['A', 'B', 'D'],
      explanation: 'A正确:合理工资薪金可以扣除。B正确:职工福利费限额14%。C错误:业务招待费按发生额60%且不超过营业收入5‰扣除。D正确:广告费限额15%。',
      createTime: '2025-10-16T16:00:00.000Z',
      updateTime: '2025-10-16T16:00:00.000Z',
      creatorId: 'admin',
      status: 'active'
    },
    {
      id: 'q-019',
      projectId: 'proj-001',
      subjectId: 's2',
      chapterId: 'ch-006',
      type: 'judgment',
      source: 'official',
      year: '2025',
      difficulty: 'medium',
      knowledgePointIds: ['kp-014'],
      stem: '我国居民企业来源于境外的所得,已在境外缴纳的所得税可以全额抵免国内应纳税额。',
      answer: 'false',
      explanation: '该说法错误。境外所得税抵免有限额规定,超过抵免限额的部分不能在本年度抵免,但可以在以后5个年度内结转抵免。',
      createTime: '2025-10-16T17:00:00.000Z',
      updateTime: '2025-10-16T17:00:00.000Z',
      creatorId: 'editor',
      status: 'active'
    },
    {
      id: 'q-020',
      projectId: 'proj-001',
      subjectId: 's2',
      chapterId: 'ch-004',
      type: 'essay',
      source: 'custom',
      year: '2025',
      difficulty: 'hard',
      knowledgePointIds: ['kp-013'],
      stem: '论述企业应对税务稽查的准备工作和应对策略。',
      answer: '税务稽查准备工作:\n1. 建立完善的税务档案管理制度\n2. 定期进行税务自查,发现和纠正问题\n3. 加强财务人员税法培训\n4. 建立税务风险预警机制\n\n应对策略:\n1. 配合检查:积极配合税务机关检查,提供相关资料\n2. 据实说明:对检查发现的问题如实说明情况\n3. 合法抗辩:对不当处理意见依法提出申辩\n4. 及时整改:对确实存在的问题及时纠正\n5. 专业咨询:必要时聘请税务师等专业人员协助',
      explanation: '本题考查税务稽查应对的实务知识。评分要点:1)准备工作是否全面系统 2)应对策略是否合法合规 3)是否体现事前防范和事中应对相结合的思路。',
      createTime: '2025-10-16T18:00:00.000Z',
      updateTime: '2025-10-16T18:00:00.000Z',
      creatorId: 'admin',
      status: 'active'
    },
    {
      id: 'q-021',
      projectId: 'proj-001',
      subjectId: 's1',
      chapterId: 'ch-001',
      type: 'single',
      source: 'official',
      year: '2023',
      difficulty: 'easy',
      knowledgePointIds: ['kp-001'],
      stem: '会计要素中,反映企业财务状况的要素不包括?',
      options: [
        { label: 'A', content: '资产' },
        { label: 'B', content: '负债' },
        { label: 'C', content: '所有者权益' },
        { label: 'D', content: '收入' }
      ],
      answer: 'D',
      explanation: '反映财务状况的要素包括资产、负债和所有者权益。收入属于反映经营成果的要素。',
      createTime: '2025-10-17T08:00:00.000Z',
      updateTime: '2025-10-17T08:00:00.000Z',
      creatorId: 'editor',
      status: 'active'
    },
    {
      id: 'q-022',
      projectId: 'proj-001',
      subjectId: 's1',
      chapterId: 'ch-002',
      type: 'multiple',
      source: 'simulation',
      year: '2025',
      difficulty: 'medium',
      knowledgePointIds: ['kp-002'],
      stem: '财务报表分析的局限性包括?',
      options: [
        { label: 'A', content: '财务报表数据具有历史性' },
        { label: 'B', content: '会计政策选择影响可比性' },
        { label: 'C', content: '无法反映非财务信息' },
        { label: 'D', content: '完全准确反映企业价值' }
      ],
      answer: ['A', 'B', 'C'],
      explanation: 'A正确:财务报表反映历史数据。B正确:不同会计政策影响可比性。C正确:无法反映管理水平等非财务因素。D错误:财务报表有局限性,不能完全准确反映企业价值。',
      createTime: '2025-10-17T09:00:00.000Z',
      updateTime: '2025-10-17T09:00:00.000Z',
      creatorId: 'admin',
      status: 'active'
    },
    {
      id: 'q-023',
      projectId: 'proj-001',
      subjectId: 's1',
      chapterId: 'ch-003',
      type: 'judgment',
      source: 'official',
      year: '2025',
      difficulty: 'easy',
      knowledgePointIds: ['kp-003'],
      stem: '企业现金流量表中的"现金"仅指库存现金。',
      answer: 'false',
      explanation: '该说法错误。现金流量表中的"现金"是指现金及现金等价物,包括库存现金、银行存款和其他货币资金,以及期限不超过3个月的短期投资。',
      createTime: '2025-10-17T10:00:00.000Z',
      updateTime: '2025-10-17T10:00:00.000Z',
      creatorId: 'editor',
      status: 'active'
    },
    {
      id: 'q-024',
      projectId: 'proj-001',
      subjectId: 's2',
      chapterId: 'ch-005',
      type: 'single',
      source: 'official',
      year: '2025',
      difficulty: 'medium',
      knowledgePointIds: ['kp-012'],
      stem: '企业所得税法规定的企业所得税税率为?',
      options: [
        { label: 'A', content: '20%' },
        { label: 'B', content: '25%' },
        { label: 'C', content: '30%' },
        { label: 'D', content: '35%' }
      ],
      answer: 'B',
      explanation: '企业所得税法规定的基本税率为25%。符合条件的小型微利企业可享受20%或更低税率的优惠政策。',
      createTime: '2025-10-17T11:00:00.000Z',
      updateTime: '2025-10-17T11:00:00.000Z',
      creatorId: 'admin',
      status: 'active'
    },
    {
      id: 'q-025',
      projectId: 'proj-001',
      subjectId: 's2',
      chapterId: 'ch-006',
      type: 'multiple',
      source: 'simulation',
      year: '2023',
      difficulty: 'hard',
      knowledgePointIds: ['kp-015'],
      stem: '税务内控体系建设应包括哪些方面?',
      options: [
        { label: 'A', content: '税务风险识别与评估' },
        { label: 'B', content: '税务内部控制制度设计' },
        { label: 'C', content: '税务合规性检查' },
        { label: 'D', content: '税务信息系统建设' }
      ],
      answer: ['A', 'B', 'C', 'D'],
      explanation: '税务内控体系建设是全方位的,包括风险识别评估、制度设计、合规检查和信息系统建设等各个方面,形成完整的税务内部控制体系。',
      createTime: '2025-10-17T12:00:00.000Z',
      updateTime: '2025-10-17T12:00:00.000Z',
      creatorId: 'editor',
      status: 'active'
    },
    {
      id: 'q-026',
      projectId: 'proj-001',
      subjectId: 's1',
      chapterId: 'ch-001',
      type: 'single',
      source: 'custom',
      year: '2025',
      difficulty: 'easy',
      knowledgePointIds: ['kp-006'],
      stem: '净现值法的决策规则是?',
      options: [
        { label: 'A', content: 'NPV>0则接受项目' },
        { label: 'B', content: 'NPV<0则接受项目' },
        { label: 'C', content: 'NPV=0则拒绝项目' },
        { label: 'D', content: 'NPV越小越好' }
      ],
      answer: 'A',
      explanation: '净现值法的决策规则:NPV>0,项目可行;NPV<0,项目不可行;NPV=0,项目处于可行与不可行的临界点。',
      createTime: '2025-10-17T13:00:00.000Z',
      updateTime: '2025-10-17T13:00:00.000Z',
      creatorId: 'admin',
      status: 'active'
    },
    {
      id: 'q-027',
      projectId: 'proj-001',
      subjectId: 's1',
      chapterId: 'ch-002',
      type: 'judgment',
      source: 'official',
      year: '2023',
      difficulty: 'medium',
      knowledgePointIds: ['kp-007'],
      stem: '企业的最优资本结构是使加权平均资本成本最低的资本结构。',
      answer: 'true',
      explanation: '该说法正确。最优资本结构是指在一定条件下使企业加权平均资本成本最低,同时企业价值最大的资本结构。',
      createTime: '2025-10-17T14:00:00.000Z',
      updateTime: '2025-10-17T14:00:00.000Z',
      creatorId: 'editor',
      status: 'active'
    },
    {
      id: 'q-028',
      projectId: 'proj-001',
      subjectId: 's2',
      chapterId: 'ch-004',
      type: 'single',
      source: 'official',
      year: '2025',
      difficulty: 'medium',
      knowledgePointIds: ['kp-011'],
      stem: '增值税一般纳税人的基本税率为?',
      options: [
        { label: 'A', content: '6%' },
        { label: 'B', content: '9%' },
        { label: 'C', content: '13%' },
        { label: 'D', content: '17%' }
      ],
      answer: 'C',
      explanation: '增值税一般纳税人的基本税率为13%,适用于销售货物、提供加工修理修配劳务等。另有9%和6%的低税率适用于不同行业。',
      createTime: '2025-10-17T15:00:00.000Z',
      updateTime: '2025-10-17T15:00:00.000Z',
      creatorId: 'admin',
      status: 'active'
    },
    {
      id: 'q-029',
      projectId: 'proj-001',
      subjectId: 's1',
      chapterId: 'ch-003',
      type: 'multiple',
      source: 'simulation',
      year: '2025',
      difficulty: 'hard',
      knowledgePointIds: ['kp-008'],
      stem: '企业风险管理框架的组成要素包括?',
      options: [
        { label: 'A', content: '风险管理策略' },
        { label: 'B', content: '风险管理组织' },
        { label: 'C', content: '风险管理流程' },
        { label: 'D', content: '风险管理文化' }
      ],
      answer: ['A', 'B', 'C', 'D'],
      explanation: '完整的风险管理框架包括风险管理策略、组织体系、管理流程和风险文化四个核心要素,构成全面的风险管理体系。',
      createTime: '2025-10-17T16:00:00.000Z',
      updateTime: '2025-10-17T16:00:00.000Z',
      creatorId: 'editor',
      status: 'active'
    },
    {
      id: 'q-030',
      projectId: 'proj-001',
      subjectId: 's2',
      chapterId: 'ch-005',
      type: 'judgment',
      source: 'official',
      year: '2025',
      difficulty: 'easy',
      knowledgePointIds: ['kp-012'],
      stem: '企业购置用于研发活动的仪器设备,可以一次性在税前扣除。',
      answer: 'true',
      explanation: '该说法正确。企业购置用于研发活动的仪器、设备,单位价值不超过500万元的,允许一次性计入当期成本费用在计算应纳税所得额时扣除。',
      createTime: '2025-10-17T17:00:00.000Z',
      updateTime: '2025-10-17T17:00:00.000Z',
      creatorId: 'admin',
      status: 'active'
    },
    {
      id: 'q-031',
      projectId: 'proj-001',
      subjectId: 's1',
      chapterId: 'ch-001',
      type: 'essay',
      source: 'custom',
      year: '2025',
      difficulty: 'hard',
      knowledgePointIds: ['kp-009'],
      stem: '论述如何建立有效的企业绩效评价体系。',
      answer: '建立有效绩效评价体系的关键要素:\n\n1. 战略导向:绩效指标应与企业战略目标紧密挂钩\n2. 多维度评价:财务指标与非财务指标相结合\n3. 层次性:建立公司、部门、员工三级评价体系\n4. 动态调整:根据内外部环境变化及时调整指标\n5. 激励相容:评价结果与薪酬激励有效挂钩\n\n具体实施步骤:\n1. 分析战略目标,确定关键成功因素\n2. 设计KPI指标体系\n3. 建立数据采集和分析机制\n4. 制定评价标准和方法\n5. 实施评价并反馈改进',
      explanation: '本题考查绩效管理的系统性知识。评分要点:1)是否体现战略导向 2)指标设计是否科学合理 3)实施步骤是否完整 4)是否考虑激励机制。',
      createTime: '2025-10-17T18:00:00.000Z',
      updateTime: '2025-10-17T18:00:00.000Z',
      creatorId: 'editor',
      status: 'active'
    },
    {
      id: 'q-032',
      projectId: 'proj-001',
      subjectId: 's2',
      chapterId: 'ch-006',
      type: 'single',
      source: 'official',
      year: '2023',
      difficulty: 'medium',
      knowledgePointIds: ['kp-014'],
      stem: '我国对"走出去"企业实行的税收抵免方法是?',
      options: [
        { label: 'A', content: '直接抵免法' },
        { label: 'B', content: '间接抵免法' },
        { label: 'C', content: '综合抵免法' },
        { label: 'D', content: '分国抵免法和综合抵免法可选' }
      ],
      answer: 'D',
      explanation: '我国对境外所得税收抵免实行分国抵免法和综合抵免法可选。纳税人可以选择按国(地区)别分别计算抵免限额,也可以选择综合计算抵免限额。',
      createTime: '2025-10-17T19:00:00.000Z',
      updateTime: '2025-10-17T19:00:00.000Z',
      creatorId: 'admin',
      status: 'active'
    },
    {
      id: 'q-033',
      projectId: 'proj-001',
      subjectId: 's1',
      chapterId: 'ch-002',
      type: 'single',
      source: 'simulation',
      year: '2025',
      difficulty: 'easy',
      knowledgePointIds: ['kp-007'],
      stem: '财务杠杆系数(DFL)的计算公式是?',
      options: [
        { label: 'A', content: 'EBIT / (EBIT - I)' },
        { label: 'B', content: '(EBIT - I) / EBIT' },
        { label: 'C', content: 'EPS / EBIT' },
        { label: 'D', content: 'EBIT / EPS' }
      ],
      answer: 'A',
      explanation: '财务杠杆系数DFL = EBIT / (EBIT - I),其中EBIT是息税前利润,I是利息费用。该系数反映财务杠杆对每股收益的影响程度。',
      createTime: '2025-10-17T20:00:00.000Z',
      updateTime: '2025-10-17T20:00:00.000Z',
      creatorId: 'editor',
      status: 'active'
    },
    {
      id: 'q-034',
      projectId: 'proj-001',
      subjectId: 's2',
      chapterId: 'ch-004',
      type: 'multiple',
      source: 'official',
      year: '2025',
      difficulty: 'medium',
      knowledgePointIds: ['kp-011'],
      stem: '增值税专用发票的作用包括?',
      options: [
        { label: 'A', content: '作为购买方的扣税凭证' },
        { label: 'B', content: '作为销售方的记账凭证' },
        { label: 'C', content: '作为购买方的付款凭证' },
        { label: 'D', content: '反映增值税的征税和抵扣情况' }
      ],
      answer: ['A', 'B', 'D'],
      explanation: 'A正确:专用发票是购买方抵扣进项税的凭证。B正确:也是销售方的记账依据。C错误:发票不是付款凭证。D正确:发票反映增值税的征收和抵扣。',
      createTime: '2025-10-17T21:00:00.000Z',
      updateTime: '2025-10-17T21:00:00.000Z',
      creatorId: 'admin',
      status: 'active'
    },
    {
      id: 'q-035',
      projectId: 'proj-001',
      subjectId: 's1',
      chapterId: 'ch-003',
      type: 'single',
      source: 'official',
      year: '2025',
      difficulty: 'medium',
      knowledgePointIds: ['kp-010'],
      stem: '企业并购后整合的重点领域不包括?',
      options: [
        { label: 'A', content: '组织结构整合' },
        { label: 'B', content: '企业文化整合' },
        { label: 'C', content: '业务流程整合' },
        { label: 'D', content: '政府关系整合' }
      ],
      answer: 'D',
      explanation: '并购后整合的重点包括组织结构、企业文化、业务流程、人力资源、财务系统等方面。政府关系不是并购整合的核心内容。',
      createTime: '2025-10-17T22:00:00.000Z',
      updateTime: '2025-10-17T22:00:00.000Z',
      creatorId: 'editor',
      status: 'active'
    },
    {
      id: 'q-036',
      projectId: 'proj-001',
      subjectId: 's2',
      chapterId: 'ch-006',
      type: 'judgment',
      source: 'simulation',
      year: '2025',
      difficulty: 'hard',
      knowledgePointIds: ['kp-015'],
      stem: '企业税务内控体系的建设应以事后监督为主。',
      answer: 'false',
      explanation: '该说法错误。税务内控体系应以事前防范为主,事中控制为辅,事后监督为补充,形成全过程的税务风险控制机制。',
      createTime: '2025-10-17T23:00:00.000Z',
      updateTime: '2025-10-17T23:00:00.000Z',
      creatorId: 'admin',
      status: 'active'
    }
  ])

  // 当前筛选条件
  const currentFilter = ref<QuestionFilter>({})

  // 获取筛选后的试题列表
  function getFilteredQuestions(filter: QuestionFilter): Question[] {
    return mockQuestions.value.filter(q => {
      if (filter.projectId && q.projectId !== filter.projectId) return false
      if (filter.subjectId && q.subjectId !== filter.subjectId) return false
      if (filter.chapterId && q.chapterId !== filter.chapterId) return false
      if (filter.source && q.source !== filter.source) return false
      if (filter.year && q.year !== filter.year) return false
      if (filter.knowledgePointId && !q.knowledgePointIds?.includes(filter.knowledgePointId)) return false
      if (filter.type && q.type !== filter.type) return false
      if (filter.difficulty && q.difficulty !== filter.difficulty) return false
      if (filter.status && filter.status !== 'all' && q.status !== filter.status) return false
      // paymentLevel field removed
      return true
    })
  }

  // 分页查询试题
  function getPaginatedQuestions(filter: QuestionFilter, page: number, pageSize: number): {
    data: Question[]
    total: number
    currentPage: number
    pageSize: number
    totalPages: number
  } {
    const filteredData = getFilteredQuestions(filter)

    // 按创建时间倒序排序（最新的在前）
    const sortedData = [...filteredData].sort((a, b) => {
      return new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
    })

    const total = sortedData.length
    const totalPages = Math.ceil(total / pageSize)
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const data = sortedData.slice(startIndex, endIndex)

    return {
      data,
      total,
      currentPage: page,
      pageSize,
      totalPages
    }
  }

  // 根据ID获取试题详情
  function getQuestionById(id: string): Question | undefined {
    return mockQuestions.value.find(q => q.id === id)
  }

  // 添加试题
  function addQuestion(form: QuestionForm): void {
    const newQuestion: Question = {
      ...form,
      id: Date.now().toString(),
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      creatorId: 'user-001',
      status: 'active'
    }
    mockQuestions.value.push(newQuestion)
  }

  // 更新试题
  function updateQuestion(id: string, form: Partial<QuestionForm>): void {
    const index = mockQuestions.value.findIndex(q => q.id === id)
    if (index > -1) {
      mockQuestions.value[index] = {
        ...mockQuestions.value[index],
        ...form,
        updateTime: new Date().toISOString()
      }
    }
  }

  // 删除试题
  function deleteQuestion(id: string): void {
    const index = mockQuestions.value.findIndex(q => q.id === id)
    if (index > -1) {
      mockQuestions.value.splice(index, 1)
    }
  }

  // 批量删除试题
  function deleteQuestionsBatch(ids: string[]): void {
    mockQuestions.value = mockQuestions.value.filter(q => !ids.includes(q.id))
  }

  // 检查试题唯一性
  function checkQuestionUniqueness(
    stem: string,
    subjectId: string,
    chapterId: string,
    excludeId?: string
  ): boolean {
    // 查找是否存在相同题干的试题（排除当前编辑的试题）
    const duplicate = mockQuestions.value.find(q =>
      q.stem === stem &&
      q.subjectId === subjectId &&
      q.chapterId === chapterId &&
      q.id !== excludeId
    )

    return !duplicate // 返回 true 表示唯一，false 表示重复
  }

  // 切换试题状态
  function toggleQuestionStatus(id: string): void {
    const question = mockQuestions.value.find(q => q.id === id)
    if (question) {
      question.status = question.status === 'active' ? 'disabled' : 'active'
    }
  }

  // 软删除试题（不从数据中移除，仅标记为已删除）
  function deleteQuestionSoft(id: string, reason?: string): boolean {
    const question = mockQuestions.value.find(q => q.id === id)
    if (question) {
      question.status = 'deleted'
      question.deprecatedReason = reason
      question.deprecatedDate = new Date().toISOString()
      question.updateTime = new Date().toISOString()
      return true
    }
    return false
  }

  // 标记试题为过时
  function deprecateQuestion(id: string, reason: string, replacedBy?: string): boolean {
    const question = mockQuestions.value.find(q => q.id === id)
    if (question) {
      question.status = 'deprecated'
      question.deprecatedReason = reason
      question.deprecatedDate = new Date().toISOString()
      question.updateTime = new Date().toISOString()
      // 注意：replacedBy 字段目前在 Question 类型中没有，需要在试题中使用备注方式记录
      return true
    }
    return false
  }

  // 批量导入试题（从试卷同步到题库）
  function importQuestionsFromExam(
    examId: string,
    embeddedQuestions: any[], // EmbeddedQuestionData[] 类型
    defaultChapterId: string
  ): number {
    let importedCount = 0

    embeddedQuestions.forEach(embeddedQ => {
      // 检查是否已存在（通过题干+章节匹配，避免重复导入）
      const chapterId = embeddedQ.chapterId || defaultChapterId
      const exists = mockQuestions.value.some(q =>
        q.stem === embeddedQ.stem &&
        q.chapterId === chapterId
      )

      if (!exists) {
        // 创建新试题
        const newQuestion: Question = {
          id: `q-exam-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          projectId: '', // 需要从章节反查项目ID
          subjectId: '', // 需要从章节反查科目ID
          chapterId: chapterId,
          type: embeddedQ.type || 'single',
          year: embeddedQ.year,
          difficulty: embeddedQ.difficulty,
          frequency: embeddedQ.frequency,
          knowledgePointIds: embeddedQ.knowledgePointIds || [],
          stem: embeddedQ.stem,
          options: embeddedQ.options,
          answer: embeddedQ.answer,
          explanation: embeddedQ.explanation,
          mainStem: embeddedQ.mainStem,
          subQuestions: embeddedQ.subQuestions,
          paymentRuleId: embeddedQ.paymentRuleId,
          paymentRuleParams: embeddedQ.paymentRuleParams,
          fromExamId: examId, // 记录来源试卷
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString(),
          creatorId: 'system', // 系统自动导入
          status: 'active'
        }

        mockQuestions.value.push(newQuestion)
        importedCount++
      }
    })

    return importedCount
  }

  return {
    mockQuestions,
    currentFilter,
    getFilteredQuestions,
    getPaginatedQuestions,
    getQuestionById,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    deleteQuestionsBatch,
    checkQuestionUniqueness,
    toggleQuestionStatus,
    deleteQuestionSoft,
    deprecateQuestion,
    importQuestionsFromExam
  }
})
