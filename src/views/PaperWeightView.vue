<template>
  <div>
    <router-link to="/" class="gi-back-link">{{ t('nav.back') }}</router-link>
    <div class="gi-tool-header">
      <h1>{{ t('paperWeight.title') }}</h1>
      <p>{{ t('paperWeight.desc') }}</p>
    </div>

    <div class="gi-field">
      <label class="gi-label">{{ t('paperWeight.quantity') }}</label>
      <div class="gi-chips">
        <button
          v-for="q in POPULAR_QUANTITIES" :key="q"
          type="button" class="gi-chip" :class="{ active: quantity === q }"
          @click="quantity = q"
        >
          {{ q.toLocaleString() }}
        </button>
        <div class="gi-chip-input-wrap">
          <input v-model.number="quantity" type="number" min="1" class="gi-input gi-chip-input" :placeholder="t('paperWeight.otherQuantity')" />
        </div>
      </div>
    </div>

    <div class="gi-field">
      <label class="gi-label">{{ t('paperWeight.format') }}</label>
      <div class="gi-format-grid">
        <button
          v-for="fmt in ['A6', 'A5', 'Carte'] as const" 
          :key="fmt"
          type="button"
          class="gi-format-card"
          :class="{ active: selectedFormat === fmt }"
          @click="selectedFormat = fmt"
        >
          <div class="gi-card-title">{{ t(`paperWeight.formats.${fmt}`) }}</div>
          <div class="gi-card-desc">{{ FORMATS[fmt].width }} × {{ FORMATS[fmt].height }} mm</div>
        </button>
        <button
          type="button"
          class="gi-format-card"
          :class="{ active: selectedFormat === 'Custom' }"
          @click="selectedFormat = 'Custom'"
        >
          <div class="gi-card-title">{{ t('paperWeight.formats.Custom') }}</div>
          <div class="gi-card-desc">{{ t('paperWeight.customDimensions') }}</div>
        </button>
      </div>
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
      <div class="gi-chips">
        <button
          v-for="g in POPULAR_GRAMMAGES" :key="g"
          type="button" class="gi-chip" :class="{ active: grammage === g }"
          @click="grammage = g"
        >
          {{ g }}g
        </button>
        <div class="gi-chip-input-wrap">
          <input v-model.number="grammage" type="number" min="1" class="gi-input gi-chip-input" :placeholder="t('paperWeight.otherWeight')" />
        </div>
      </div>
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

const POPULAR_GRAMMAGES = [80, 90, 115, 135, 170, 250, 300, 350, 400]
const POPULAR_QUANTITIES = [100, 250, 500, 1000, 2500, 5000]

const quantity = ref(1000)
const selectedFormat = ref<FormatKey>('A6')
const customWidth = ref(100)
const customHeight = ref(100)
const grammage = ref(250)

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
.gi-format-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem; margin-top: 0.5rem; }
.gi-format-card {
  display: flex; flex-direction: column; align-items: flex-start; justify-content: center;
  padding: 1rem; border: 1.5px solid var(--gi-border); border-radius: var(--gi-radius);
  background: var(--gi-bg-alt); cursor: pointer; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  text-align: left;
}
.gi-format-card:hover { border-color: var(--gi-border-strong); background: var(--gi-bg); }
.gi-format-card.active { border-color: var(--gi-brand); background: var(--gi-bg); box-shadow: 0 0 0 1px var(--gi-brand); }
.gi-card-title { font-weight: 600; color: var(--gi-text); margin-bottom: 0.25rem; }
.gi-card-desc { font-size: 0.75rem; color: var(--gi-text-muted); font-variant-numeric: tabular-nums; }
.gi-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem; }
.gi-chip {
  padding: 0.5rem 0.75rem; border: 1.5px solid var(--gi-border); border-radius: 2rem;
  background: var(--gi-bg-alt); color: var(--gi-text); cursor: pointer;
  font-size: 0.85rem; font-weight: 500; transition: all 0.2s; white-space: nowrap;
}
.gi-chip:hover { border-color: var(--gi-border-strong); }
.gi-chip.active { background: var(--gi-brand); border-color: var(--gi-brand); color: white; }
.gi-chip-input-wrap { flex: 1; min-width: 100px; display: flex; }
.gi-chip-input { border-radius: 2rem; padding: 0.4rem 0.75rem; height: auto; }

/* Enhanced Result Panel */
.gi-result {
  margin-top: 2rem;
  padding: 2.5rem 1.5rem;
  background: linear-gradient(145deg, var(--gi-bg-alt), var(--gi-bg));
  border: 1px solid var(--gi-border);
  border-radius: calc(var(--gi-radius) * 1.5);
  text-align: center;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  transition: transform 0.2s;
}
.gi-result::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: var(--gi-brand);
}
.gi-result-value {
  font-size: 3.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--gi-text);
  margin: 0.5rem 0 0.25rem;
}
.gi-result-secondary {
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--gi-text-muted);
}
.gi-formula {
  margin-top: 1.5rem;
  display: inline-block;
  padding: 0.5rem 1rem;
  background: var(--gi-bg);
  border-radius: var(--gi-radius);
  border: 1px dashed var(--gi-border);
}
</style>
