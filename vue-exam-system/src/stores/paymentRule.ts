/**
 * 收费规则 Store
 */

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { PaymentRule, ApplicableObject } from '@/views/payment-rule-management/types'

export const usePaymentRuleStore = defineStore('paymentRule', () => {
  // 10条预设收费规则
  const rules = ref<PaymentRule[]>([
    {
      id: 't001',
      code: 'T001',
      displayName: '免费',
      applicableTo: ['question', 'exam', 'chapter', 'subject'],
      paramPlaceholder: '-',
      description: '无需任何权限,所有用户可访问',
      status: 'active',
      order: 100,
      createdAt: '2025-01-01T00:00:00Z'
    },
    {
      id: 't002',
      code: 'T002',
      displayName: '章节通票',
      applicableTo: ['question', 'chapter'],
      paramPlaceholder: '{CHAPTER}',
      description: '需购买本章节通票',
      status: 'active',
      order: 90,
      createdAt: '2025-01-01T00:00:00Z'
    },
    {
      id: 't003',
      code: 'T003',
      displayName: 'VIP及以上',
      applicableTo: ['question', 'exam', 'chapter', 'subject'],
      paramPlaceholder: '{TIER=VIP}',
      description: '全站会员等级 ≥ VIP',
      status: 'active',
      order: 80,
      createdAt: '2025-01-01T00:00:00Z'
    },
    {
      id: 't004',
      code: 'T004',
      displayName: 'SVIP及以上',
      applicableTo: ['question', 'exam', 'chapter', 'subject'],
      paramPlaceholder: '{TIER=SVIP}',
      description: '全站会员等级 ≥ SVIP',
      status: 'active',
      order: 70,
      createdAt: '2025-01-01T00:00:00Z'
    },
    {
      id: 't005',
      code: 'T005',
      displayName: '章节通票 或 VIP',
      applicableTo: ['question', 'chapter'],
      paramPlaceholder: '{CHAPTER},{VIP}',
      description: '本章节通票或VIP会员任一满足',
      status: 'active',
      order: 60,
      createdAt: '2025-01-01T00:00:00Z'
    },
    {
      id: 't006',
      code: 'T006',
      displayName: '试卷专属票',
      applicableTo: ['exam'],
      paramPlaceholder: '{PAPER}',
      description: '购买本试卷即可作答',
      status: 'active',
      order: 50,
      createdAt: '2025-01-01T00:00:00Z'
    },
    {
      id: 't007',
      code: 'T007',
      displayName: '课程视频票',
      applicableTo: [],
      paramPlaceholder: '{COURSE}',
      description: '购买本课程即可观看(预留)',
      status: 'disabled',
      order: 40,
      createdAt: '2025-01-01T00:00:00Z'
    },
    {
      id: 't008',
      code: 'T008',
      displayName: '学科VIP(局部)',
      applicableTo: ['question', 'chapter'],
      paramPlaceholder: '{PROJECT},{SUBJECT}',
      description: '仅在某项目/科目下 ≥ VIP(可选上线)',
      status: 'disabled',
      order: 30,
      createdAt: '2025-01-01T00:00:00Z'
    },
    {
      id: 't009',
      code: 'T009',
      displayName: '试看N题',
      applicableTo: ['question', 'exam'],
      paramPlaceholder: '{FREE_TRY=N}',
      description: '可先做N题,后续需权限',
      status: 'active',
      order: 20,
      createdAt: '2025-01-01T00:00:00Z'
    },
    {
      id: 't010',
      code: 'T010',
      displayName: '限时开放',
      applicableTo: ['question', 'exam', 'chapter', 'subject'],
      paramPlaceholder: '{START},{END}',
      description: '在时间窗口内开放',
      status: 'active',
      order: 10,
      createdAt: '2025-01-01T00:00:00Z'
    }
  ])

  /**
   * 获取所有启用的规则列表
   */
  const activeRules = computed(() =>
    rules.value
      .filter(r => r.status === 'active')
      .sort((a, b) => b.order - a.order)
  )

  /**
   * 获取适用于指定对象的启用规则列表
   * @param applicableTo 适用对象类型
   */
  const getActiveRulesByApplicable = (applicableTo: ApplicableObject) => {
    return computed(() =>
      rules.value
        .filter(r => r.status === 'active' && r.applicableTo.includes(applicableTo))
        .sort((a, b) => b.order - a.order)
    )
  }

  /**
   * 根据ID获取规则详情
   * @param ruleId 规则ID
   */
  const getRuleById = (ruleId: string): PaymentRule | undefined => {
    return rules.value.find(r => r.id === ruleId)
  }

  /**
   * 根据code获取规则详情
   * @param code 规则编码
   */
  const getRuleByCode = (code: string): PaymentRule | undefined => {
    return rules.value.find(r => r.code === code)
  }

  /**
   * 切换规则启用/禁用状态
   * @param ruleId 规则ID
   */
  const toggleRuleStatus = (ruleId: string): boolean => {
    const rule = rules.value.find(r => r.id === ruleId)
    if (!rule) {
      throw new Error('规则不存在')
    }

    rule.status = rule.status === 'active' ? 'disabled' : 'active'
    return true
  }

  /**
   * 更新规则排序
   * @param ruleId 规则ID
   * @param newOrder 新排序值
   */
  const updateRuleOrder = (ruleId: string, newOrder: number): boolean => {
    const rule = rules.value.find(r => r.id === ruleId)
    if (!rule) {
      throw new Error('规则不存在')
    }

    rule.order = newOrder
    return true
  }

  /**
   * 批量更新规则排序
   * @param updates 更新列表 { ruleId, order }[]
   */
  const batchUpdateRuleOrder = (updates: { ruleId: string; order: number }[]): boolean => {
    updates.forEach(({ ruleId, order }) => {
      const rule = rules.value.find(r => r.id === ruleId)
      if (rule) {
        rule.order = order
      }
    })
    return true
  }

  return {
    rules,
    activeRules,
    getActiveRulesByApplicable,
    getRuleById,
    getRuleByCode,
    toggleRuleStatus,
    updateRuleOrder,
    batchUpdateRuleOrder
  }
})
