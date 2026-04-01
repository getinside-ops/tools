import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import GiFormField from '../GiFormField.vue'

describe('GiFormField', () => {
  it('renders label and input correctly', () => {
    const wrapper = mount(GiFormField, {
      props: {
        label: 'Test Label',
        modelValue: 'test'
      }
    })
    expect(wrapper.text()).toContain('Test Label')
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(GiFormField, {
      props: {
        label: 'Test',
        modelValue: 'initial'
      }
    })
    await wrapper.find('input').setValue('new value')
    expect(wrapper.emitted('update:modelValue')).toEqual([['new value']])
  })

  it('supports different input types', () => {
    const wrapper = mount(GiFormField, {
      props: {
        label: 'Number',
        modelValue: '42',
        type: 'number'
      }
    })
    expect(wrapper.find('input').attributes('type')).toBe('number')
  })

  it('displays error message when provided', () => {
    const wrapper = mount(GiFormField, {
      props: {
        label: 'Email',
        modelValue: 'invalid',
        error: 'Invalid email format'
      }
    })
    expect(wrapper.text()).toContain('Invalid email format')
    expect(wrapper.classes()).toContain('gi-field--error')
  })
})
