import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import QueryEditor from './QueryEditor.vue'
import type { JsonEditorState } from '../types'

function validState(raw = '{}'): JsonEditorState {
  return { raw, isValid: true, error: null }
}

function invalidState(raw = 'invalid'): JsonEditorState {
  return { raw, isValid: false, error: 'Unexpected token i in JSON at position 0' }
}

describe('QueryEditor', () => {
  const defaultProps = {
    filter: validState(),
    sort: validState(),
    projection: validState(),
    canRun: true,
    isLoading: false,
  }

  it('renders all three textareas', () => {
    const wrapper = mount(QueryEditor, { propsData: defaultProps })
    expect(wrapper.find('[data-testid="query-editor-filter-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="query-editor-sort-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="query-editor-projection-input"]').exists()).toBe(true)
  })

  it('run button is enabled when canRun is true', () => {
    const wrapper = mount(QueryEditor, { propsData: defaultProps })
    const btn = wrapper.find('[data-testid="query-editor-run-btn"]')
    expect((btn.element as HTMLButtonElement).disabled).toBe(false)
  })

  it('run button is disabled when canRun is false', () => {
    const wrapper = mount(QueryEditor, { propsData: { ...defaultProps, canRun: false } })
    const btn = wrapper.find('[data-testid="query-editor-run-btn"]')
    expect((btn.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('run button is disabled when isLoading', () => {
    const wrapper = mount(QueryEditor, { propsData: { ...defaultProps, isLoading: true } })
    const btn = wrapper.find('[data-testid="query-editor-run-btn"]')
    expect((btn.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('shows "Running…" label when isLoading', () => {
    const wrapper = mount(QueryEditor, { propsData: { ...defaultProps, isLoading: true } })
    expect(wrapper.find('[data-testid="query-editor-run-btn"]').text()).toBe('Running…')
  })

  it('emits run event when Run Query button is clicked', async () => {
    const wrapper = mount(QueryEditor, { propsData: defaultProps })
    await wrapper.find('[data-testid="query-editor-run-btn"]').trigger('click')
    expect(wrapper.emitted('run')).toBeTruthy()
  })

  it('emits reset event when Reset button is clicked', async () => {
    const wrapper = mount(QueryEditor, { propsData: defaultProps })
    await wrapper.find('[data-testid="query-editor-reset-btn"]').trigger('click')
    expect(wrapper.emitted('reset')).toBeTruthy()
  })

  it('emits update:filter on textarea input', async () => {
    const wrapper = mount(QueryEditor, { propsData: defaultProps })
    const ta = wrapper.find('[data-testid="query-editor-filter-input"]')
    await ta.setValue('{"x":1}')
    expect(wrapper.emitted('update:filter')?.[0]).toEqual(['{"x":1}'])
  })

  it('shows filter error when filter is invalid', () => {
    const wrapper = mount(QueryEditor, { propsData: { ...defaultProps, filter: invalidState() } })
    expect(wrapper.find('[data-testid="query-editor-filter-error"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="query-editor-filter-error"]').text()).toBeTruthy()
  })

  it('hides filter error when filter is valid', () => {
    const wrapper = mount(QueryEditor, { propsData: defaultProps })
    expect(wrapper.find('[data-testid="query-editor-filter-error"]').exists()).toBe(false)
  })

  it('shows sort error when sort is invalid', () => {
    const wrapper = mount(QueryEditor, { propsData: { ...defaultProps, sort: invalidState() } })
    expect(wrapper.find('[data-testid="query-editor-sort-error"]').exists()).toBe(true)
  })
})
