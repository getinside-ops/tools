import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import fr from '../../i18n/fr'
import en from '../../i18n/en'
import GiPedagogic from '../GiPedagogic.vue'

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: { fr, en },
  legacy: false,
})

describe('GiPedagogic', () => {
  it('should render title', () => {
    const wrapper = mount(GiPedagogic, {
      global: { plugins: [i18n] },
      props: { title: 'About Testing' },
    })
    expect(wrapper.text()).toContain('About Testing')
  })

  it('should render description when provided', () => {
    const wrapper = mount(GiPedagogic, {
      global: { plugins: [i18n] },
      props: { 
        title: 'About Testing',
        description: 'Testing is important',
      },
    })
    expect(wrapper.text()).toContain('Testing is important')
  })

  it('should render tips when provided', () => {
    const wrapper = mount(GiPedagogic, {
      global: { plugins: [i18n] },
      props: { 
        title: 'About Testing',
        tips: ['Write tests first', 'Keep tests small'],
      },
    })
    expect(wrapper.text()).toContain('Write tests first')
    expect(wrapper.text()).toContain('Keep tests small')
  })

  it('should render resources when provided', () => {
    const wrapper = mount(GiPedagogic, {
      global: { plugins: [i18n] },
      props: { 
        title: 'About Testing',
        resources: [{ label: 'Vitest Docs', url: 'https://vitest.dev' }],
      },
    })
    expect(wrapper.text()).toContain('Vitest Docs')
  })
})
