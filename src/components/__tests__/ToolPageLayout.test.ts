import { mount, RouterLinkStub } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { describe, expect, it } from 'vitest'
import en from '../../i18n/en'
import fr from '../../i18n/fr'
import ToolPageLayout from '../ToolPageLayout.vue'

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en, fr },
  legacy: false
})

describe('ToolPageLayout', () => {
  it('renders the editorial hero shell', () => {
    const wrapper = mount(ToolPageLayout, {
      global: {
        plugins: [i18n],
        stubs: {
          RouterLink: RouterLinkStub
        }
      },
      props: {
        title: 'DPI Checker',
        subtitle: 'Image resolution',
        description: 'Check whether artwork is ready for print.',
        category: 'print'
      }
    })

    expect(wrapper.find('.tool-header-card').exists()).toBe(true)
    expect(wrapper.find('.tool-header-eyebrow').exists()).toBe(true)
    expect(wrapper.find('.tool-header-sheen').exists()).toBe(true)
  })
})
