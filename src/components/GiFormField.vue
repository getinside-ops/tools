<template>
  <div class="gi-field" :class="{ 'gi-field--error': error }">
    <label v-if="label" class="gi-label" :for="inputId">
      {{ label }}
      <span v-if="required" class="gi-label-required">*</span>
    </label>
    <slot name="input">
      <input
        v-if="type !== 'textarea'"
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        class="gi-input"
        :class="{ 'gi-input--error': error }"
        :aria-describedby="error && errorId ? errorId : undefined"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <textarea
        v-else
        :id="inputId"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        class="gi-input gi-input--textarea"
        :class="{ 'gi-input--error': error }"
        :aria-describedby="error && errorId ? errorId : undefined"
        @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      />
    </slot>
    <span v-if="error" :id="errorId" class="gi-field-error" role="alert">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

export interface GiFormFieldProps {
  label?: string
  modelValue?: string | number
  type?: 'text' | 'number' | 'email' | 'url' | 'password' | 'textarea' | 'search'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
}

withDefaults(defineProps<GiFormFieldProps>(), {
  type: 'text'
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputId = ref('')
const errorId = computed(() => inputId.value ? `${inputId.value}-error` : '')

onMounted(() => {
  inputId.value = `gi-field-${Math.random().toString(36).slice(2, 9)}`
})

defineOptions({
  name: 'GiFormField'
})
</script>

<style scoped>
.gi-field {
  margin-bottom: var(--gi-space-md);
}

.gi-label {
  display: block;
  font-size: var(--gi-font-size-sm);
  font-weight: 500;
  color: var(--gi-text);
  margin-bottom: var(--gi-space-xs);
}

.gi-label-required {
  color: var(--gi-brand);
  margin-left: 2px;
}

.gi-input {
  width: 100%;
  padding: var(--gi-space-sm) var(--gi-space-md);
  font-size: var(--gi-font-size-base);
  color: var(--gi-text);
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
}

.gi-input:focus {
  outline: none;
  border-color: var(--gi-brand);
  box-shadow: 0 0 0 3px rgba(10, 170, 142, 0.1);
}

.gi-input:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}

[data-theme="dark"] .gi-input:focus {
  box-shadow: 0 0 0 3px rgba(10, 170, 142, 0.25);
}

.gi-input--error {
  border-color: var(--gi-error);
}

.gi-input--textarea {
  min-height: 100px;
  resize: vertical;
}

.gi-field-error {
  display: block;
  font-size: var(--gi-font-size-xs);
  color: var(--gi-error);
  margin-top: var(--gi-space-xs);
}

.gi-field--error .gi-input {
  border-color: var(--gi-error);
}
</style>
