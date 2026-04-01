import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import GiStatusBadge from '../GiStatusBadge.vue'

describe('GiStatusBadge', () => {
  it('renders text content', () => {
    const wrapper = mount(GiStatusBadge, {
      props: { variant: 'ok' },
      slots: { default: 'Success' }
    })
    expect(wrapper.text()).toBe('Success')
  })

  it('applies variant classes', () => {
    const variants = ['ok', 'error', 'warning', 'info'] as const
    variants.forEach(variant => {
      const wrapper = mount(GiStatusBadge, {
        props: { variant },
        slots: { default: 'Status' }
      })
      expect(wrapper.classes()).toContain(`gi-status-badge--${variant}`)
    })
  })

  it('supports icon display', () => {
    const wrapper = mount(GiStatusBadge, {
      props: { variant: 'ok', showIcon: true },
      slots: { default: 'OK' }
    })
    expect(wrapper.find('svg').exists()).toBe(true)
  })
})
