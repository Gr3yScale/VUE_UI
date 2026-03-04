import { describe, it, expect, beforeEach } from 'vitest'
import { usePagination, PAGE_SIZE } from './usePagination'

describe('usePagination', () => {
  let pagination: ReturnType<typeof usePagination>

  beforeEach(() => {
    pagination = usePagination()
  })

  it('initialises with page 1 and null offset', () => {
    expect(pagination.state.value.currentPage).toBe(0)
    expect(pagination.state.value.offsets).toEqual([null])
    expect(pagination.state.value.hasNext).toBe(false)
    expect(pagination.currentOffset()).toBeNull()
  })

  it('goToNext appends the offset and increments currentPage', () => {
    pagination.setHasNext(true)
    pagination.goToNext('abc')

    expect(pagination.state.value.currentPage).toBe(1)
    expect(pagination.state.value.offsets).toEqual([null, 'abc'])
    expect(pagination.currentOffset()).toBe('abc')
  })

  it('goToNext does not duplicate offset on forward-then-back-then-forward', () => {
    pagination.goToNext('abc')
    pagination.goToPrev()
    pagination.goToNext('abc')

    expect(pagination.state.value.offsets).toEqual([null, 'abc'])
    expect(pagination.state.value.currentPage).toBe(1)
  })

  it('appends new offset when continuing forward past known pages', () => {
    pagination.goToNext('abc')
    pagination.goToNext('cde')

    expect(pagination.state.value.offsets).toEqual([null, 'abc', 'cde'])
    expect(pagination.state.value.currentPage).toBe(2)
  })

  it('goToPrev decrements currentPage without mutating offsets', () => {
    pagination.goToNext('abc')
    pagination.goToNext('cde')
    pagination.goToPrev()

    expect(pagination.state.value.currentPage).toBe(1)
    expect(pagination.state.value.offsets).toEqual([null, 'abc', 'cde'])
    expect(pagination.currentOffset()).toBe('abc')
  })

  it('goToPrev is a no-op on page 1', () => {
    pagination.goToPrev()

    expect(pagination.state.value.currentPage).toBe(0)
    expect(pagination.state.value.offsets).toEqual([null])
  })

  it('reset returns to initial state', () => {
    pagination.goToNext('abc')
    pagination.goToNext('cde')
    pagination.setHasNext(true)
    pagination.reset()

    expect(pagination.state.value.currentPage).toBe(0)
    expect(pagination.state.value.offsets).toEqual([null])
    expect(pagination.state.value.hasNext).toBe(false)
    expect(pagination.currentOffset()).toBeNull()
  })

  it('setHasNext updates the hasNext flag', () => {
    pagination.setHasNext(true)
    expect(pagination.state.value.hasNext).toBe(true)

    pagination.setHasNext(false)
    expect(pagination.state.value.hasNext).toBe(false)
  })

  it('pageSummary formats large numbers with Intl.NumberFormat', () => {
    const summary = pagination.pageSummary(11231231231)
    expect(summary).toContain('Page 1')
    expect(summary).toContain('1')
    expect(summary).toContain(String(PAGE_SIZE))
    expect(summary).toMatch(/11[,.]?231[,.]?231[,.]?231/)
  })

  it('pageSummary reflects the current page offset', () => {
    pagination.goToNext('abc')
    const summary = pagination.pageSummary(500)
    expect(summary).toContain('Page 2')
    expect(summary).toContain('101')
    expect(summary).toContain('200')
  })
})
