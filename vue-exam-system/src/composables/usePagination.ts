import { ref, computed, watch } from 'vue'

/**
 * 分页 Composable
 * 用于处理数据分页逻辑
 */
export function usePagination<T>(data: T[], pageSize = 10) {
  // 当前页码（从1开始）
  const currentPage = ref(1)

  // 总页数
  const totalPages = computed(() => Math.ceil(data.length / pageSize))

  // 总记录数
  const totalCount = computed(() => data.length)

  // 当前页的数据
  const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    const end = start + pageSize
    return data.slice(start, end)
  })

  // 是否有上一页
  const hasPrev = computed(() => currentPage.value > 1)

  // 是否有下一页
  const hasNext = computed(() => currentPage.value < totalPages.value)

  /**
   * 生成页码按钮数组
   * 最多显示5个页码，超出部分用省略号表示
   * 例如：
   * - 总页数 <= 5: [1, 2, 3, 4, 5]
   * - 当前页在前3页: [1, 2, 3, 4, '...', 10]
   * - 当前页在后3页: [1, '...', 7, 8, 9, 10]
   * - 当前页在中间: [1, '...', 5, 6, 7, '...', 10]
   */
  const pageNumbers = computed(() => {
    const total = totalPages.value
    const current = currentPage.value
    const pages: (number | string)[] = []

    if (total <= 5) {
      // 总页数不超过5，全部显示
      for (let i = 1; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // 总页数超过5，使用省略号
      if (current <= 3) {
        // 当前页在前3页
        pages.push(1, 2, 3, 4, '...', total)
      } else if (current >= total - 2) {
        // 当前页在后3页
        pages.push(1, '...', total - 3, total - 2, total - 1, total)
      } else {
        // 当前页在中间
        pages.push(1, '...', current - 1, current, current + 1, '...', total)
      }
    }

    return pages
  })

  /**
   * 跳转到指定页
   */
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages.value) {
      return
    }
    currentPage.value = page
  }

  /**
   * 上一页
   */
  const prevPage = () => {
    if (hasPrev.value) {
      currentPage.value--
    }
  }

  /**
   * 下一页
   */
  const nextPage = () => {
    if (hasNext.value) {
      currentPage.value++
    }
  }

  /**
   * 重置到第一页
   * 在数据变化时使用
   */
  const resetPage = () => {
    currentPage.value = 1
  }

  // 监听数据变化，如果当前页超出范围则重置
  watch(
    () => data.length,
    () => {
      if (currentPage.value > totalPages.value && totalPages.value > 0) {
        currentPage.value = totalPages.value
      } else if (totalPages.value === 0) {
        currentPage.value = 1
      }
    }
  )

  return {
    currentPage,
    totalPages,
    totalCount,
    paginatedData,
    hasPrev,
    hasNext,
    pageNumbers,
    goToPage,
    prevPage,
    nextPage,
    resetPage
  }
}
