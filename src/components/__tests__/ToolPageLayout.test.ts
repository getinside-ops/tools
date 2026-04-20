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
  it('renders the hero section with icon, title, and description', () => {
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
      },
      slots: {
        icon: '<span class="test-icon">📷</span>'
      }
    })

    expect(wrapper.find('.tool-header').exists()).toBe(true)
    expect(wrapper.find('.tool-icon').exists()).toBe(true)
    expect(wrapper.find('.tool-title').text()).toBe('DPI Checker')
    expect(wrapper.find('.tool-description').text()).toBe('Check whether artwork is ready for print.')
    expect(wrapper.find('.tool-category-badge').text()).toBe('Print')
  })

  it('renders shared header labels from i18n', () => {
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
    expect(wrapper.find('.tool-title').text()).toBe('Barcode')
    expect(wrapper.find('.tool-category-badge').text()).toBe('Print')
  })
})
