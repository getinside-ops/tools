<template>
  <div>
    <router-link to="/" class="gi-back-link">{{ t('nav.back') }}</router-link>
    <div class="gi-tool-header">
      <h1>{{ t('paperWeight.title') }}</h1>
      <p>{{ t('paperWeight.desc') }}</p>
    </div>

    <div class="gi-field">
      <label class="gi-label">{{ t('paperWeight.quantity') }}</label>
      <input v-model.number="quantity" type="number" min="1" class="gi-input" />
    </div>

    <div class="gi-field">
      <label class="gi-label">{{ t('paperWeight.format') }}</label>
      <select v-model="selectedFormat" class="gi-select">
        <option value="A5">{{ t('paperWeight.formats.A5') }}</option>
        <option value="A6">{{ t('paperWeight.formats.A6') }}</option>
        <option value="Carte">{{ t('paperWeight.formats.Carte') }}</option>
        <option value="Custom">{{ t('paperWeight.formats.Custom') }}</option>
      </select>
    </div>

    <template v-if="selectedFormat === 'Custom'">
      <div class="gi-row">
        <div class="gi-field">
          <label class="gi-label">{{ t('paperWeight.customWidth') }}</label>
          <input v-model.number="customWidth" type="number" min="1" class="gi-input" />
        </div>
        <div class="gi-field">
          <label class="gi-label">{{ t('paperWeight.customHeight') }}</label>
          <input v-model.number="customHeight" type="number" min="1" class="gi-input" />
        </div>
      </div>
    </template>

    <div class="gi-field">
      <label class="gi-label">{{ t('paperWeight.grammage') }}</label>
      <input v-model.number="grammage" type="number" min="1" class="gi-input" />
    </div>

    <div v-if="result" class="gi-result">
      <div class="gi-result-label">{{ t('paperWeight.result') }}</div>
      <div class="gi-result-value">{{ result.kg }} kg</div>
      <div class="gi-result-secondary">{{ result.grams.toLocaleString() }} g</div>
      <div class="gi-formula">
        {{ t('paperWeight.formula') }} :
        {{ activeDims.width }}mm × {{ activeDims.height }}mm × {{ grammage }} g/m² × {{ quantity }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { calculatePaperWeight, FORMATS, type FormatKey } from '../composables/usePaperWeight'

const { t } = useI18n()

const quantity = ref(1000)
const selectedFormat = ref<FormatKey>('A6')
const customWidth = ref(100)
const customHeight = ref(100)
const grammage = ref(300)

const activeDims = computed(() => {
  if (selectedFormat.value === 'Custom') return { width: customWidth.value, height: customHeight.value }
  return FORMATS[selectedFormat.value as keyof typeof FORMATS]
})

const result = computed(() => {
  if (quantity.value <= 0 || activeDims.value.width <= 0 || activeDims.value.height <= 0 || grammage.value <= 0) return null
  return calculatePaperWeight(quantity.value, activeDims.value.width, activeDims.value.height, grammage.value)
})
</script>

<style scoped>
.gi-back-link {
  display: inline-flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0.3rem 0.75rem;
  border: 1.5px solid var(--gi-border);
  border-radius: var(--gi-radius);
  font-size: 0.85rem;
  color: var(--gi-text-muted);
  text-decoration: none;
  transition: border-color 0.12s, color 0.12s;
}
.gi-back-link:hover { border-color: var(--gi-brand); color: var(--gi-brand); }
.gi-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.gi-formula { margin-top: 0.75rem; font-size: 0.85rem; color: var(--gi-text-muted); font-family: monospace; }
</style>
