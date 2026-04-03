import { mount, RouterLinkStub } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { describe, expect, it } from 'vitest'
import en from '../../i18n/en'
import fr from '../../i18n/fr'
import DpiCheckerView from '../DpiCheckerView.vue'

function createTestI18n(locale: 'fr' | 'en' = 'en') {
  return createI18n({
    locale,
    fallbackLocale: 'en',
    messages: { en, fr },
    legacy: false,
  })
}

describe('DpiCheckerView', () => {
  it('renders the refreshed analysis stage and keeps educational content secondary', async () => {
    const wrapper = mount(DpiCheckerView, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    })

    expect(wrapper.find('.dpi-analysis-stage').exists()).toBe(true)
    expect(wrapper.find('.dpi-stage-summary').exists()).toBe(false)

    ;(wrapper.vm as unknown as { widthPx: number; heightPx: number }).widthPx = 2400
    ;(wrapper.vm as unknown as { widthPx: number; heightPx: number }).heightPx = 3000
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.dpi-stage-summary').exists()).toBe(true)
    expect(wrapper.find('.dpi-primary-results').exists()).toBe(true)
    expect(wrapper.find('.dpi-curated-panels').exists()).toBe(true)
    expect(wrapper.find('.dpi-education-card').exists()).toBe(true)

    const content = wrapper.find('.tool-content').element.children

    expect((content[0] as HTMLElement).className).toContain('dpi-analysis-stage')
    expect((content[1] as HTMLElement).className).toContain('dpi-primary-results')
    expect((content[2] as HTMLElement).className).toContain('dpi-curated-panels')
    expect((content[3] as HTMLElement).className).toContain('dpi-education-card')
  })
})
