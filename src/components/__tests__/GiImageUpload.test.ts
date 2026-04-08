import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import fr from '../../i18n/fr'
import en from '../../i18n/en'
import GiImageUpload from '../GiImageUpload.vue'

function createTestI18n(locale: 'fr' | 'en' = 'fr') {
  return createI18n({
    locale,
    fallbackLocale: 'en',
    messages: { fr, en },
    legacy: false,
  })
}

describe('GiImageUpload', () => {
  it('should render upload button initially', () => {
    const wrapper = mount(GiImageUpload, {
      global: { plugins: [createTestI18n()] },
    })

    expect(wrapper.find('.gi-image-upload-trigger').exists()).toBe(true)
    expect(wrapper.find('.gi-image-upload-zone').exists()).toBe(false)
    expect(wrapper.text()).toContain('Importer une image')
  })

  it('should reveal zone when button is clicked', async () => {
    const wrapper = mount(GiImageUpload, {
      global: { plugins: [createTestI18n()] },
    })

    await wrapper.find('.gi-image-upload-trigger').trigger('click')

    expect(wrapper.find('.gi-image-upload-trigger').exists()).toBe(false)
    expect(wrapper.find('.gi-image-upload-zone').exists()).toBe(true)
  })

  it('should close zone when close button is clicked', async () => {
    const wrapper = mount(GiImageUpload, {
      global: { plugins: [createTestI18n()] },
    })

    // Open zone
    await wrapper.find('.gi-image-upload-trigger').trigger('click')
    expect(wrapper.find('.gi-image-upload-zone').exists()).toBe(true)

    // Close zone
    await wrapper.find('.gi-image-upload-zone__close').trigger('click')
    expect(wrapper.find('.gi-image-upload-trigger').exists()).toBe(true)
    expect(wrapper.find('.gi-image-upload-zone').exists()).toBe(false)
  })

  it('should render action badges in French', async () => {
    const wrapper = mount(GiImageUpload, {
      global: { plugins: [createTestI18n('fr')] },
    })

    await wrapper.find('.gi-image-upload-trigger').trigger('click')

    const labels = wrapper.findAll('.gi-upload-action__label')
    expect(labels[0].text()).toBe('Coller')
    expect(labels[1].text()).toBe('Glisser')
  })

  it('should render action badges in English', async () => {
    const wrapper = mount(GiImageUpload, {
      global: { plugins: [createTestI18n('en')] },
    })

    await wrapper.find('.gi-image-upload-trigger').trigger('click')

    const labels = wrapper.findAll('.gi-upload-action__label')
    expect(labels[0].text()).toBe('Paste')
    expect(labels[1].text()).toBe('Drop')
  })

  it('should show paste hint when zone is open', async () => {
    const wrapper = mount(GiImageUpload, {
      global: { plugins: [createTestI18n('fr')] },
    })

    await wrapper.find('.gi-image-upload-trigger').trigger('click')

    expect(wrapper.find('.gi-image-upload-zone__hint').text()).toContain('Ctrl+V / Cmd+V pour coller')
  })

  it('should have correct ARIA attributes', async () => {
    const wrapper = mount(GiImageUpload, {
      global: { plugins: [createTestI18n()] },
    })

    await wrapper.find('.gi-image-upload-trigger').trigger('click')

    const zone = wrapper.find('.gi-image-upload-zone')
    expect(zone.attributes('role')).toBe('button')
    expect(zone.attributes('tabindex')).toBe('0')
    expect(zone.attributes('aria-label')).toBe('Importer une image')
  })

  it('should emit upload event when file is selected', async () => {
    const wrapper = mount(GiImageUpload, {
      global: { plugins: [createTestI18n()] },
    })

    await wrapper.find('.gi-image-upload-trigger').trigger('click')

    const testFile = new File(['test content'], 'test.png', { type: 'image/png' })
    const input = wrapper.find('input[type="file"]')
    Object.defineProperty(input.element, 'files', {
      value: [testFile],
      writable: false,
    })
    await input.trigger('change')

    expect(wrapper.emitted('upload')).toBeDefined()
    expect(wrapper.emitted('upload')?.[0]).toHaveLength(1)
  })

  it('should handle drag and drop', async () => {
    const wrapper = mount(GiImageUpload, {
      global: { plugins: [createTestI18n()] },
    })

    await wrapper.find('.gi-image-upload-trigger').trigger('click')

    const testFile = new File(['test content'], 'test.png', { type: 'image/png' })
    const dropZone = wrapper.find('.gi-image-upload-zone')
    await dropZone.trigger('drop', {
      dataTransfer: {
        files: [testFile],
      },
    })

    expect(wrapper.emitted('upload')).toBeDefined()
    expect(wrapper.emitted('upload')?.[0]).toEqual([testFile])
  })

  it('should show drag-over state when dragging', async () => {
    const wrapper = mount(GiImageUpload, {
      global: { plugins: [createTestI18n()] },
    })

    await wrapper.find('.gi-image-upload-trigger').trigger('click')

    const dropZone = wrapper.find('.gi-image-upload-zone')
    await dropZone.trigger('dragover')
    expect(dropZone.classes()).toContain('gi-image-upload-zone--dragover')

    await dropZone.trigger('dragleave')
    expect(dropZone.classes()).not.toContain('gi-image-upload-zone--dragover')
  })

  it('should handle paste event on zone', async () => {
    const wrapper = mount(GiImageUpload, {
      global: { plugins: [createTestI18n()] },
    })

    await wrapper.find('.gi-image-upload-trigger').trigger('click')

    const testFile = new File(['test content'], 'test.png', { type: 'image/png' })
    const zone = wrapper.find('.gi-image-upload-zone')
    await zone.trigger('paste', {
      clipboardData: {
        items: [{
          type: 'image/png',
          getAsFile: () => testFile,
        }],
      },
    })

    expect(wrapper.emitted('upload')).toBeDefined()
    expect(wrapper.emitted('upload')?.[0]).toHaveLength(1)
  })

  it('should show error when paste has no image data', async () => {
    const wrapper = mount(GiImageUpload, {
      global: { plugins: [createTestI18n()] },
    })

    await wrapper.find('.gi-image-upload-trigger').trigger('click')

    const zone = wrapper.find('.gi-image-upload-zone')
    await zone.trigger('paste', {
      clipboardData: {
        items: [],
      },
    })

    expect(wrapper.text()).toContain('Aucune image dans le presse-papiers')
  })

  it('should show error for invalid file type', async () => {
    const wrapper = mount(GiImageUpload, {
      global: { plugins: [createTestI18n()] },
      props: {
        accept: ['image/*'],
      },
    })

    await wrapper.find('.gi-image-upload-trigger').trigger('click')

    const pdfFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    const input = wrapper.find('input[type="file"]')
    Object.defineProperty(input.element, 'files', {
      value: [pdfFile],
      writable: false,
    })
    await input.trigger('change')

    expect(wrapper.emitted('error')).toBeDefined()
    expect(wrapper.emitted('error')?.[0]).toEqual(['Type ou taille de fichier invalide'])
  })

  it('should accept custom accept types', async () => {
    const wrapper = mount(GiImageUpload, {
      global: { plugins: [createTestI18n()] },
      props: {
        accept: ['.pdf', 'application/pdf'],
      },
    })

    await wrapper.find('.gi-image-upload-trigger').trigger('click')

    const input = wrapper.find('input[type="file"]')
    expect(input.attributes('accept')).toBe('.pdf,application/pdf')
  })

  it('should expose reset and closeZone methods', async () => {
    const wrapper = mount(GiImageUpload, {
      global: { plugins: [createTestI18n()] },
    })

    expect(wrapper.vm.reset).toBeDefined()
    expect(wrapper.vm.closeZone).toBeDefined()
  })

  it('should trigger file input on Enter key', async () => {
    const wrapper = mount(GiImageUpload, {
      global: { plugins: [createTestI18n()] },
    })

    await wrapper.find('.gi-image-upload-trigger').trigger('click')

    const fileInput = wrapper.find('input[type="file"]')
    const clickSpy = vi.fn(() => fileInput.element.dispatchEvent(new Event('click')))
    Object.defineProperty(fileInput.element, 'click', {
      value: clickSpy,
      writable: true,
    })

    const zone = wrapper.find('.gi-image-upload-zone')
    await zone.trigger('keydown', { key: 'Enter' })

    expect(clickSpy).toHaveBeenCalled()
  })

  it('should trigger file input on Space key', async () => {
    const wrapper = mount(GiImageUpload, {
      global: { plugins: [createTestI18n()] },
    })

    await wrapper.find('.gi-image-upload-trigger').trigger('click')

    const fileInput = wrapper.find('input[type="file"]')
    const clickSpy = vi.fn(() => fileInput.element.dispatchEvent(new Event('click')))
    Object.defineProperty(fileInput.element, 'click', {
      value: clickSpy,
      writable: true,
    })

    const zone = wrapper.find('.gi-image-upload-zone')
    await zone.trigger('keydown', { key: ' ' })

    expect(clickSpy).toHaveBeenCalled()
  })

  it('should use custom label for aria-label', async () => {
    const wrapper = mount(GiImageUpload, {
      global: { plugins: [createTestI18n()] },
      props: {
        label: 'Custom upload label',
      },
    })

    await wrapper.find('.gi-image-upload-trigger').trigger('click')

    const zone = wrapper.find('.gi-image-upload-zone')
    expect(zone.attributes('aria-label')).toBe('Custom upload label')
  })
})
