import { mount, RouterLinkStub } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { describe, expect, it } from 'vitest'
import en from '../../i18n/en'
import fr from '../../i18n/fr'
import ToolPageLayout from '../ToolPageLayout.vue'

function createTestI18n(locale: 'fr' | 'en' = 'en') {
  return createI18n({
    locale,
    fallbackLocale: 'en',
    messages: { en, fr },
    legacy: false
  })
}

describe('ToolPageLayout', () => {
  it('renders the editorial hero shell', () => {
    const wrapper = mount(ToolPageLayout, {
      global: {
        plugins: [createTestI18n()],
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

  it('renders shared header labels from i18n without hardcoded microcopy', () => {
    const wrapper = mount(ToolPageLayout, {
      global: {
        plugins: [createTestI18n('fr')],
        stubs: {
          RouterLink: RouterLinkStub
        }
      },
      props: {
        title: 'Barcode',
        description: 'Description',
        category: 'print'
      }
    })

    expect(wrapper.find('.tool-back-link').text()).toContain('Retour aux outils')
    expect(wrapper.find('.tool-header-eyebrow').text()).toBe('Print')
    expect(wrapper.find('.tool-category-badge').text()).toBe('Print')
    expect(wrapper.find('.tool-header-microcopy').exists()).toBe(false)
  })
})
