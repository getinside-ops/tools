import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import GiImageUpload from '../GiImageUpload.vue'

describe('GiImageUpload', () => {
  it('should render paste zone by default', () => {
    const wrapper = mount(GiImageUpload)
    expect(wrapper.find('.gi-paste-zone').exists()).toBe(true)
  })

  it('should render upload zone', () => {
    const wrapper = mount(GiImageUpload)
    expect(wrapper.find('.gi-upload-zone').exists()).toBe(true)
  })

  it('should hide paste zone when pasteZone prop is false', () => {
    const wrapper = mount(GiImageUpload, {
      props: {
        pasteZone: false,
      },
    })
    expect(wrapper.find('.gi-paste-zone').exists()).toBe(false)
    expect(wrapper.find('.gi-upload-zone').exists()).toBe(true)
  })

  it('should emit upload event when file is selected via click', async () => {
    const wrapper = mount(GiImageUpload)
    const testFile = new File(['test content'], 'test.png', { type: 'image/png' })

    // Mock the file input change by directly setting files
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
    const wrapper = mount(GiImageUpload)
    const testFile = new File(['test content'], 'test.png', { type: 'image/png' })

    const dropZone = wrapper.find('.gi-upload-zone')
    await dropZone.trigger('drop', {
      dataTransfer: {
        files: [testFile],
      },
    })

    expect(wrapper.emitted('upload')).toBeDefined()
    expect(wrapper.emitted('upload')?.[0]).toEqual([testFile])
  })

  it('should handle paste event', async () => {
    const wrapper = mount(GiImageUpload)
    const testFile = new File(['test content'], 'test.png', { type: 'image/png' })

    const pasteZone = wrapper.find('.gi-paste-zone')
    await pasteZone.trigger('paste', {
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

  it('should show error for invalid file type', async () => {
    const wrapper = mount(GiImageUpload, {
      props: {
        accept: ['image/*'],
      },
    })

    const pdfFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })

    const input = wrapper.find('input[type="file"]')
    Object.defineProperty(input.element, 'files', {
      value: [pdfFile],
      writable: false,
    })
    await input.trigger('change')

    expect(wrapper.emitted('error')).toBeDefined()
    expect(wrapper.emitted('error')?.[0]).toEqual(['Invalid file type or size'])
  })

  it('should show error when paste has no image data', async () => {
    const wrapper = mount(GiImageUpload)

    const pasteZone = wrapper.find('.gi-paste-zone')
    await pasteZone.trigger('paste', {
      clipboardData: {
        items: [],
      },
    })

    // When there are no items, the error message should be displayed
    expect(wrapper.text()).toContain('No clipboard data available')
  })

  it('should accept custom accept types', () => {
    const wrapper = mount(GiImageUpload, {
      props: {
        accept: ['.pdf', 'application/pdf'],
      },
    })

    const input = wrapper.find('input[type="file"]')
    expect(input.attributes('accept')).toBe('.pdf,application/pdf')
  })

  it('should expose reset method', async () => {
    const wrapper = mount(GiImageUpload)

    // Verify reset is exposed
    expect(wrapper.vm.reset).toBeDefined()
    expect(typeof wrapper.vm.reset).toBe('function')
  })

  it('should apply focus state when paste zone is focused', async () => {
    const wrapper = mount(GiImageUpload)
    const pasteZone = wrapper.find('.gi-paste-zone')

    await pasteZone.trigger('focus')
    expect(pasteZone.classes()).toContain('gi-paste-zone-focus')

    await pasteZone.trigger('blur')
    expect(pasteZone.classes()).not.toContain('gi-paste-zone-focus')
  })

  it('should trigger file input on Enter key', async () => {
    const wrapper = mount(GiImageUpload)
    const fileInput = wrapper.find('input[type="file"]')
    const clickSpy = vi.fn(() => fileInput.element.dispatchEvent(new Event('click')))
    // Mock the click method properly
    Object.defineProperty(fileInput.element, 'click', {
      value: clickSpy,
      writable: true,
    })

    const pasteZone = wrapper.find('.gi-paste-zone')
    await pasteZone.trigger('keydown', { key: 'Enter' })

    expect(clickSpy).toHaveBeenCalled()
  })

  it('should trigger file input on Space key', async () => {
    const wrapper = mount(GiImageUpload)
    const fileInput = wrapper.find('input[type="file"]')
    const clickSpy = vi.fn(() => fileInput.element.dispatchEvent(new Event('click')))
    Object.defineProperty(fileInput.element, 'click', {
      value: clickSpy,
      writable: true,
    })

    const pasteZone = wrapper.find('.gi-paste-zone')
    await pasteZone.trigger('keydown', { key: ' ' })

    expect(clickSpy).toHaveBeenCalled()
  })

  it('should use custom paste title and hint', () => {
    const wrapper = mount(GiImageUpload, {
      props: {
        pasteTitle: 'Custom Title',
        pasteHint: 'Custom Hint',
      },
    })

    expect(wrapper.text()).toContain('Custom Title')
    expect(wrapper.text()).toContain('Custom Hint')
  })

  it('should use custom upload text', () => {
    const wrapper = mount(GiImageUpload, {
      props: {
        uploadText: 'Custom upload text',
      },
    })

    expect(wrapper.text()).toContain('Custom upload text')
  })
})
