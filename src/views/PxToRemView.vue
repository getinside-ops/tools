<template>
  <div>
    <div class="gi-tool-header">
      <h1>{{ t('pxToRem.title') }}</h1>
      <p>{{ t('pxToRem.desc') }}</p>
    </div>

    <div class="gi-field">
      <label class="gi-label">{{ t('pxToRem.baseSize') }}</label>
      <input v-model.number="base" type="number" class="gi-input" min="1" />
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
      <div class="gi-field">
        <label class="gi-label">{{ t('pxToRem.pxLabel') }}</label>
        <input v-model.number="px" type="number" class="gi-input" @input="updateRem" />
      </div>
      <div class="gi-field">
        <label class="gi-label">{{ t('pxToRem.remLabel') }}</label>
        <input v-model.number="rem" type="number" step="0.01" class="gi-input" @input="updatePx" />
      </div>
    </div>

    <div class="gi-result">
      <div class="gi-result-label">{{ t('pxToRem.result') }}</div>
      <p class="gi-result-value">{{ px }}px = {{ formattedRem }}rem</p>
      <p class="gi-result-secondary">({{ t('pxToRem.baseSize') }}: {{ base }}px)</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { pxToRem, remToPx } from '../composables/usePxToRem'

const { t } = useI18n()

const base = ref(16)
const px = ref(16)
const rem = ref(1)

const formattedRem = computed(() => {
  const value = pxToRem(px.value, base.value)
  return Number.isInteger(value) ? value : value.toFixed(3)
})

function updateRem() {
  rem.value = pxToRem(px.value, base.value)
}

function updatePx() {
  px.value = remToPx(rem.value, base.value)
}
</script>
