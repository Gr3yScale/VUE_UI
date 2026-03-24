import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PaginationBar from './PaginationBar.vue'

const defaultProps = {
  summary: 'Page 1 | Showing 1–100 of 500 matches',
  hasPrev: false,
  hasNext: true,
  isLoading: false,
}

describe('PaginationBar', () => {
  it('renders the summary text', () => {
    const wrapper = mount(PaginationBar, { propsData: defaultProps })
    expect(wrapper.find('[data-testid="pagination-summary"]').text()).toBe(defaultProps.summary)
  })

  it('prev button is disabled when hasPrev is false', () => {
    const wrapper = mount(PaginationBar, { propsData: defaultProps })
    const btn = wrapper.find('[data-testid="pagination-prev-btn"]')
    expect((btn.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('next button is enabled when hasNext is true', () => {
    const wrapper = mount(PaginationBar, { propsData: defaultProps })
    const btn = wrapper.find('[data-testid="pagination-next-btn"]')
    expect((btn.element as HTMLButtonElement).disabled).toBe(false)
  })

  it('both buttons are disabled when isLoading', () => {
    const wrapper = mount(PaginationBar, {
      props: { ...defaultProps, hasPrev: true, isLoading: true },
    })
    expect((wrapper.find('[data-testid="pagination-prev-btn"]').element as HTMLButtonElement).disabled).toBe(true)
    expect((wrapper.find('[data-testid="pagination-next-btn"]').element as HTMLButtonElement).disabled).toBe(true)
  })

  it('emits prev event on prev button click', async () => {
    const wrapper = mount(PaginationBar, { propsData: { ...defaultProps, hasPrev: true } })
    await wrapper.find('[data-testid="pagination-prev-btn"]').trigger('click')
    expect(wrapper.emitted('prev')).toBeTruthy()
  })

  it('emits next event on next button click', async () => {
    const wrapper = mount(PaginationBar, { propsData: defaultProps })
    await wrapper.find('[data-testid="pagination-next-btn"]').trigger('click')
    expect(wrapper.emitted('next')).toBeTruthy()
  })

  it('next button is disabled when hasNext is false', () => {
    const wrapper = mount(PaginationBar, { propsData: { ...defaultProps, hasNext: false } })
    const btn = wrapper.find('[data-testid="pagination-next-btn"]')
    expect((btn.element as HTMLButtonElement).disabled).toBe(true)
  })
})
