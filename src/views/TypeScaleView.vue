<template>
  <div>
    <div class="gi-tool-header">
      <h1>{{ t('typeScale.title') }}</h1>
      <p>{{ t('typeScale.desc') }}</p>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
      <div class="gi-field">
        <label class="gi-label">{{ t('typeScale.baseSize') }}</label>
        <input v-model.number="baseSize" type="number" class="gi-input" min="1" />
      </div>
      <div class="gi-field">
        <label class="gi-label">{{ t('typeScale.ratio') }}</label>
        <select v-model.number="ratio" class="gi-select">
          <option v-for="(value, key) in TYPE_SCALE_RATIOS" :key="key" :value="value">
            {{ t(`typeScale.ratios.${key}`) }}
          </option>
        </select>
      </div>
    </div>

    <div class="gi-result">
      <div class="gi-result-label">{{ t('typeScale.preview') }}</div>
      <div class="gi-table-wrapper" style="overflow-x: auto;">
        <table class="gi-table">
          <thead>
            <tr>
              <th>{{ t('typeScale.step') }}</th>
              <th>{{ t('typeScale.size') }} (px)</th>
              <th>{{ t('typeScale.size') }} (rem)</th>
              <th style="width: 60%">Preview</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in scale" :key="s.step" :style="{ fontWeight: s.step === 0 ? '700' : '400', background: s.step === 0 ? 'rgba(10,170,142,0.05)' : 'transparent' }">
              <td>{{ s.step }}</td>
              <td>{{ s.px }}px</td>
              <td>{{ s.rem }}rem</td>
              <td>
                <div :style="{ fontSize: s.px + 'px', lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }">
                  The quick brown fox
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { generateTypeScale, TYPE_SCALE_RATIOS } from '../composables/useTypeScale'

const { t } = useI18n()

const baseSize = ref(16)
const ratio = ref(TYPE_SCALE_RATIOS.majorSecond)

const scale = computed(() => {
  return generateTypeScale(baseSize.value, ratio.value, 2, 8)
})
</script>

<style scoped>
.gi-table-wrapper {
  margin-top: 1rem;
  border-radius: var(--gi-radius);
  border: 1px solid var(--gi-border);
}
.gi-table tr:last-child td { border-bottom: none; }
</style>
