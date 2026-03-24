import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ResultsViewer from './ResultsViewer.vue'
import type { MongoDocument } from '../types'

const sampleDocs: MongoDocument[] = [
  { id: '1', name: 'Alice', age: 30 },
  { id: '2', name: 'Bob', age: 25 },
]

describe('ResultsViewer', () => {
  it('shows loading indicator when isLoading is true', () => {
    const wrapper = mount(ResultsViewer, {
      propsData: { results: [], isLoading: true, fetchError: null },
    })
    expect(wrapper.find('[data-testid="results-loading-indicator"]').exists()).toBe(true)
  })

  it('hides loading indicator when not loading', () => {
    const wrapper = mount(ResultsViewer, {
      propsData: { results: [], isLoading: false, fetchError: null },
    })
    expect(wrapper.find('[data-testid="results-loading-indicator"]').exists()).toBe(false)
  })

  it('shows error message when fetchError is set', () => {
    const wrapper = mount(ResultsViewer, {
      propsData: { results: [], isLoading: false, fetchError: 'HTTP 500: Server error' },
    })
    expect(wrapper.find('[data-testid="results-error-message"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="results-error-message"]').text()).toContain('HTTP 500')
  })

  it('shows empty state when no results and no error', () => {
    const wrapper = mount(ResultsViewer, {
      propsData: { results: [], isLoading: false, fetchError: null },
    })
    expect(wrapper.find('[data-testid="results-empty-state"]').exists()).toBe(true)
  })

  it('renders a card for each document', () => {
    const wrapper = mount(ResultsViewer, {
      propsData: { results: sampleDocs, isLoading: false, fetchError: null },
    })
    expect(wrapper.find('[data-testid="results-document-card-0"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="results-document-card-1"]').exists()).toBe(true)
  })

  it('renders copy button for each document card', () => {
    const wrapper = mount(ResultsViewer, {
      propsData: { results: sampleDocs, isLoading: false, fetchError: null },
    })
    expect(wrapper.find('[data-testid="results-copy-btn-0"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="results-copy-btn-1"]').exists()).toBe(true)
  })

  it('does not show empty state when results are present', () => {
    const wrapper = mount(ResultsViewer, {
      propsData: { results: sampleDocs, isLoading: false, fetchError: null },
    })
    expect(wrapper.find('[data-testid="results-empty-state"]').exists()).toBe(false)
  })

  it('hides error message when fetchError is null', () => {
    const wrapper = mount(ResultsViewer, {
      propsData: { results: sampleDocs, isLoading: false, fetchError: null },
    })
    expect(wrapper.find('[data-testid="results-error-message"]').exists()).toBe(false)
  })
})
