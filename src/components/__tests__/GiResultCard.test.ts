import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import GiResultCard from '../GiResultCard.vue'

describe('GiResultCard', () => {
  it('renders title and content slots', () => {
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
    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.find('button').text()).toBe('Download')
  })

  it('applies variant classes', () => {
    const wrapper = mount(GiResultCard, {
      props: { variant: 'success' },
      slots: { default: 'Content' }
    })
    expect(wrapper.classes()).toContain('gi-result-card--success')
  })

  it('is collapsible when collapsible prop is true', async () => {
    const wrapper = mount(GiResultCard, {
      props: { collapsible: true, collapsed: false },
      slots: { header: 'Title', default: 'Content' }
    })
    expect(wrapper.find('button[aria-expanded]').exists()).toBe(true)
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('update:collapsed')).toEqual([[true]])
  })
})
