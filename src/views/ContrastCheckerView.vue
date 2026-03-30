<template>
  <div>
    <div class="gi-tool-header">
      <h1>{{ t('contrastChecker.title') }}</h1>
      <p>{{ t('contrastChecker.desc') }}</p>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
      <div class="gi-field">
        <label class="gi-label">{{ t('contrastChecker.background') }}</label>
        <div style="display: flex; gap: 0.5rem">
          <input v-model="bgHex" type="color" class="gi-input" style="width: 50px; padding: 2px" />
          <input v-model="bgHex" type="text" class="gi-input" placeholder="#FFFFFF" />
        </div>
      </div>
      <div class="gi-field">
        <label class="gi-label">{{ t('contrastChecker.foreground') }}</label>
        <div style="display: flex; gap: 0.5rem">
          <input v-model="fgHex" type="color" class="gi-input" style="width: 50px; padding: 2px" />
          <input v-model="fgHex" type="text" class="gi-input" placeholder="#000000" />
        </div>
      </div>
    </div>

    <div v-if="result" class="gi-result">
      <div class="gi-result-label">{{ t('contrastChecker.ratio') }}</div>
      <div class="gi-result-value">{{ result.ratio.toFixed(2) }}:1</div>

      <div style="margin-top: 1.5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div v-for="(val, key) in scores" :key="key" class="gi-status" :class="val ? 'gi-status-ok' : 'gi-status-error'">
          {{ val ? '✓' : '✗' }} {{ t(`contrastChecker.scores.${key}`) }}
        </div>
      </div>

      <div style="margin-top: 2rem">
        <div class="gi-result-label">{{ t('contrastChecker.preview') }}</div>
        <div :style="{ backgroundColor: bgHex, color: fgHex, padding: '2rem', borderRadius: 'var(--gi-radius)', border: '1px solid var(--gi-border)' }">
          <p style="font-weight: 700; font-size: 1.25rem; margin-bottom: 0.5rem">Large Text / Heading</p>
          <p>{{ t('contrastChecker.sampleText') }}</p>
        </div>
      </div>
    </div>

    <div v-if="error" class="gi-result" style="border-color: var(--gi-tint-red-border)">
      <p style="color: var(--gi-tint-red-text)">{{ t('utmBuilder.invalidUrl') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { checkContrast } from '../composables/useContrastChecker'

const { t } = useI18n()

const bgHex = ref('#ffffff')
const fgHex = ref('#0aaa8e')

const result = computed(() => {
  return checkContrast(bgHex.value, fgHex.value)
})

const error = computed(() => {
  return bgHex.value && fgHex.value && !result.value
})

const scores = computed(() => {
  if (!result.value) return {}
  return {
    aaLarge: result.value.aaLarge,
    aa: result.value.aa,
    aaaLarge: result.value.aaaLarge,
    aaa: result.value.aaa,
  }
})
</script>
