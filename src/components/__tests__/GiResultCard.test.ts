import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import GiResultCard from '../GiResultCard.vue'

describe('GiResultCard', () => {
  it('renders title prop inside the refined heading shell', () => {
    const wrapper = mount(GiResultCard, {
      props: {
        title: 'Result Title'
      },
      slots: {
        default: 'Result content here'
      }
    })

    expect(wrapper.find('.gi-result-card-heading').exists()).toBe(true)
    expect(wrapper.find('.gi-result-card-title').text()).toBe('Result Title')
    expect(wrapper.text()).toContain('Result content here')
  })

  it('still renders custom header slot content', () => {
    const wrapper = mount(GiResultCard, {
      slots: {
        header: 'Result Title',
        default: 'Result content here'
      }
    })
    expect(wrapper.text()).toContain('Result Title')
    expect(wrapper.text()).toContain('Result content here')
  })

  it('renders actions slot', () => {
    const wrapper = mount(GiResultCard, {
      slots: {
        header: 'Title',
        default: 'Content',
        actions: '<button>Download</button>'
      }
    })
    expect(wrapper.find('.gi-result-card-actions').exists()).toBe(true)
    expect(wrapper.find('.gi-result-card-actions button').exists()).toBe(true)
    expect(wrapper.find('.gi-result-card-actions').text()).toContain('Download')
  })

  it('applies variant classes', () => {
    const wrapper = mount(GiResultCard, {
      props: { variant: 'success' },
      slots: { default: 'Content' }
    })
    expect(wrapper.classes()).toContain('gi-result-card--success')
  })

  it('adds a collapsible modifier and emits updates when toggled', async () => {
    const wrapper = mount(GiResultCard, {
      props: { title: 'Title', collapsible: true, collapsed: false },
      slots: { default: 'Content' }
    })

    expect(wrapper.classes()).toContain('gi-result-card--collapsible')
    expect(wrapper.find('.gi-result-card-toggle').attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('.gi-result-card-toggle').attributes('aria-labelledby')).toBeDefined()
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('update:collapsed')).toEqual([[true]])
  })

  it('keeps the collapsible toggle named when using a custom header slot', () => {
    const wrapper = mount(GiResultCard, {
      props: { collapsible: true, collapsed: false },
      slots: {
        header: '<span class="custom-heading">Custom header</span>',
        default: 'Content'
      }
    })

    const heading = wrapper.find('.gi-result-card-heading')
    const toggle = wrapper.find('.gi-result-card-toggle')

    expect(heading.attributes('id')).toBeDefined()
    expect(toggle.attributes('aria-labelledby')).toBe(heading.attributes('id'))
    expect(heading.text()).toContain('Custom header')
  })
})
