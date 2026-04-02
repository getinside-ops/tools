<template>
  <ToolPageLayout
    :title="t('contrastChecker.title')"
    :description="t('contrastChecker.desc')"
    category="design"
  >
    <template #icon>
      <Contrast :size="24" />
    </template>

    <!-- Inputs & Preview Card -->
    <div class="contrast-card gi-card">

      <!-- Interactive Preview Area -->
      <div
        class="contrast-preview"
        :style="{ backgroundColor: bgHex, color: textHex }"
      >
        <div class="contrast-preview-large">
          {{ t('contrastChecker.preview') }} (Large)
        </div>
        <div class="contrast-preview-body">
          {{ t('contrastChecker.sampleText') }}
        </div>
      </div>

      <!-- Controls -->
      <div class="contrast-controls">
        <GiFormField :label="t('contrastChecker.textColor')" class="contrast-field">
          <template #input>
            <div class="contrast-color-input">
              <input v-model="textHex" type="color" class="gi-input contrast-color-swatch" />
              <input v-model="textHex" type="text" class="gi-input" placeholder="#000000" />
            </div>
          </template>
        </GiFormField>

        <button @click="swapColors" class="gi-btn-ghost contrast-swap-btn" title="Swap Colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/></svg>
        </button>

        <GiFormField :label="t('contrastChecker.bgColor')" class="contrast-field">
          <template #input>
            <div class="contrast-color-input">
              <input v-model="bgHex" type="color" class="gi-input contrast-color-swatch" />
              <input v-model="bgHex" type="text" class="gi-input" placeholder="#FFFFFF" />
            </div>
          </template>
        </GiFormField>
      </div>
    </div>

    <!-- Results Data Grid -->
    <div class="gi-grid">
      <!-- WCAG 2.1 Block -->
      <GiResultCard
        title="WCAG 2.1"
        :variant="allWcagPass ? 'success' : 'error'"
      >
        <template #header>
          <h3 class="gi-result-card-title">
            WCAG 2.1
            <span class="gi-data-value contrast-ratio-display">{{ wcagRatio.toFixed(2) }}:1</span>
          </h3>
        </template>

        <div class="contrast-checks">
          <div v-for="(level, key) in wcagChecks" :key="key" class="contrast-check-row">
            <span class="contrast-check-label">{{ level.label }}</span>
            <GiStatusBadge :variant="level.pass ? 'ok' : 'error'" showIcon>
              {{ level.pass ? t('contrastChecker.pass') : t('contrastChecker.fail') }}
            </GiStatusBadge>
          </div>
        </div>
      </GiResultCard>

      <!-- APCA Block -->
      <GiResultCard
        title="APCA (WCAG 3.0)"
        variant="info"
      >
        <template #header>
          <h3 class="gi-result-card-title">
            APCA (WCAG 3.0)
            <span class="gi-data-value contrast-ratio-display" :class="{ 'contrast-ratio-pass': Math.abs(apcaScore) > 60 }">
              Lc {{ Math.round(apcaScore) }}
            </span>
          </h3>
        </template>

        <p class="contrast-apca-note">Advanced Perceptual Contrast Algorithm</p>

        <div class="contrast-apca-table">
          <div class="contrast-apca-row">
            <span>Lc 90+</span> <span>Preferred for body text</span>
          </div>
          <div class="contrast-apca-row">
            <span>Lc 75+</span> <span>Minimum for body text</span>
          </div>
          <div class="contrast-apca-row">
            <span>Lc 60+</span> <span>Minimum for large text</span>
          </div>
          <div class="contrast-apca-row">
            <span>Lc 45+</span> <span>Minimum for UI components</span>
          </div>
        </div>
      </GiResultCard>
    </div>

    <template #about>{{ t('contrastChecker.about') }}</template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ToolPageLayout from '../components/ToolPageLayout.vue'
import GiFormField from '../components/GiFormField.vue'
import GiResultCard from '../components/GiResultCard.vue'
import GiStatusBadge from '../components/GiStatusBadge.vue'
import { Contrast } from 'lucide-vue-next'
import { getWcagContrast, getApcaContrast, meetsWcagLevel } from '../composables/useContrast'

const { t } = useI18n()

const textHex = ref('#0aaa8e')
const bgHex = ref('#ffffff')

const wcagRatio = computed(() => {
  try {
    return getWcagContrast(textHex.value, bgHex.value)
  } catch {
    return 1
  }
})

const apcaScore = computed(() => {
  try {
    return getApcaContrast(textHex.value, bgHex.value)
  } catch {
    return 0
  }
})

const wcagChecks = computed(() => [
  { label: t('contrastChecker.levels.aaNormal'), pass: meetsWcagLevel(wcagRatio.value, 'AA_Normal') },
  { label: t('contrastChecker.levels.aaaNormal'), pass: meetsWcagLevel(wcagRatio.value, 'AAA_Normal') },
  { label: t('contrastChecker.levels.aaLarge'), pass: meetsWcagLevel(wcagRatio.value, 'AA_Large') },
  { label: t('contrastChecker.levels.aaaLarge'), pass: meetsWcagLevel(wcagRatio.value, 'AAA_Large') },
  { label: t('contrastChecker.levels.uiComponent'), pass: meetsWcagLevel(wcagRatio.value, 'UI_Component') },
])

const allWcagPass = computed(() => wcagChecks.value.every(check => check.pass))

function swapColors() {
  const temp = textHex.value
  textHex.value = bgHex.value
  bgHex.value = temp
}
</script>

<style scoped>
.contrast-card {
  margin-bottom: 2rem;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.contrast-preview {
  padding: 3rem 2rem;
  min-height: 250px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: background 0.2s, color 0.2s;
}

.contrast-preview-large {
  font-weight: 700;
  font-size: 2.5rem;
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
  text-align: center;
}

.contrast-preview-body {
  font-size: 1.125rem;
  max-width: 500px;
  text-align: center;
  font-weight: 400;
  opacity: 0.9;
}

.contrast-controls {
  padding: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: center;
  background: var(--gi-surface);
}

.contrast-field {
  flex: 1;
  min-width: 150px;
  margin-bottom: 0;
}

.contrast-color-input {
  display: flex;
  gap: 0.5rem;
}

.contrast-color-swatch {
  width: 50px;
  padding: 2px;
  flex-shrink: 0;
}

.contrast-swap-btn {
  padding: 0.5rem;
  border-radius: 50%;
  margin-top: var(--gi-space-md);
}

.contrast-checks {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contrast-check-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--gi-border);
}

.contrast-check-label {
  font-size: 0.95rem;
}

.contrast-apca-note {
  font-size: 0.8rem;
  color: var(--gi-text-muted);
  margin-bottom: 1rem;
}

.contrast-apca-table {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: var(--gi-text-muted);
}

.contrast-apca-row {
  display: flex;
  justify-content: space-between;
}

.contrast-apca-row span:last-child {
  font-weight: 500;
}

.contrast-ratio-display {
  font-size: 1.5rem;
  font-weight: 700;
  margin-left: 0.5rem;
}

.contrast-ratio-pass {
  color: var(--gi-tint-green-text);
}
</style>
