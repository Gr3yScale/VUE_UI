import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import JsonNode from './JsonNode.vue'

describe('JsonNode', () => {
  it('renders a string value with quotes', () => {
    const wrapper = mount(JsonNode, { propsData: { value: 'hello', depth: 0 } })
    expect(wrapper.text()).toContain('"hello"')
  })

  it('renders a number value without quotes', () => {
    const wrapper = mount(JsonNode, { propsData: { value: 42, depth: 0 } })
    expect(wrapper.text()).toContain('42')
    expect(wrapper.text()).not.toContain('"42"')
  })

  it('renders boolean true', () => {
    const wrapper = mount(JsonNode, { propsData: { value: true, depth: 0 } })
    expect(wrapper.text()).toContain('true')
  })

  it('renders null', () => {
    const wrapper = mount(JsonNode, { propsData: { value: null, depth: 0 } })
    expect(wrapper.text()).toContain('null')
  })

  it('renders a type badge for leaf nodes', () => {
    const wrapper = mount(JsonNode, { propsData: { value: 'test', depth: 0 } })
    expect(wrapper.text()).toContain('[string]')
  })

  it('renders object key when nodeKey is provided', () => {
    const wrapper = mount(JsonNode, { propsData: { nodeKey: 'name', value: 'Alice', depth: 1 } })
    expect(wrapper.text()).toContain('"name"')
    expect(wrapper.text()).toContain('"Alice"')
  })

  it('renders array index as key', () => {
    const wrapper = mount(JsonNode, { propsData: { nodeKey: 0, value: 'first', depth: 1 } })
    expect(wrapper.text()).toContain('0')
  })

  it('shows toggle button for objects', () => {
    const wrapper = mount(JsonNode, { propsData: { value: { x: 1 }, depth: 0 } })
    expect(wrapper.find('[data-testid="json-node-toggle-btn"]').exists()).toBe(true)
  })

  it('shows toggle button for arrays', () => {
    const wrapper = mount(JsonNode, { propsData: { value: [1, 2, 3], depth: 0 } })
    expect(wrapper.find('[data-testid="json-node-toggle-btn"]').exists()).toBe(true)
  })

  it('collapses on toggle click', async () => {
    const wrapper = mount(JsonNode, { propsData: { value: { name: 'Alice' }, depth: 0 } })
    // Starts expanded at depth 0
    expect(wrapper.text()).toContain('"name"')
    await wrapper.find('[data-testid="json-node-toggle-btn"]').trigger('click')
    expect(wrapper.text()).not.toContain('"name"')
  })

  it('shows collapsed preview with child count', async () => {
    const wrapper = mount(JsonNode, { propsData: { value: { a: 1, b: 2, c: 3 }, depth: 0 } })
    await wrapper.find('[data-testid="json-node-toggle-btn"]').trigger('click')
    expect(wrapper.text()).toContain('…3 fields')
  })

  it('starts collapsed at depth >= 2', () => {
    const wrapper = mount(JsonNode, {
      props: { value: { nested: 'value' }, depth: 2 },
    })
    // Should not show nested content
    expect(wrapper.text()).not.toContain('"nested"')
  })

  it('recursively renders nested objects', () => {
    const wrapper = mount(JsonNode, {
      props: { value: { person: { name: 'Bob' } }, depth: 0 },
    })
    expect(wrapper.text()).toContain('"person"')
    expect(wrapper.text()).toContain('"name"')
    expect(wrapper.text()).toContain('"Bob"')
  })

  it('renders array items', () => {
    const wrapper = mount(JsonNode, { propsData: { value: ['a', 'b'], depth: 0 } })
    expect(wrapper.text()).toContain('"a"')
    expect(wrapper.text()).toContain('"b"')
  })

  it('applies data-testid with nodeKey and depth', () => {
    const wrapper = mount(JsonNode, { propsData: { nodeKey: 'id', value: '123', depth: 1 } })
    expect(wrapper.find('[data-testid="json-node-id-1"]').exists()).toBe(true)
  })
})
