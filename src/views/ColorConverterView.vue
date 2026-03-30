<template>
  <div>
    <div class="gi-tool-header">
      <h1>{{ t('colorConverter.title') }}</h1>
      <p>{{ t('colorConverter.desc') }}</p>
    </div>

    <div style="display: flex; flex-direction: column; gap: 1.5rem">
      <!-- Preview & Color Picker -->
      <div style="display: flex; gap: 1.5rem; align-items: start">
        <div 
          class="gi-result" 
          :style="{ backgroundColor: hex, width: '100px', height: '100px', padding: 0, marginTop: 0, border: '1px solid var(--gi-border)' }"
        ></div>
        <div class="gi-field" style="flex: 1">
          <label class="gi-label">{{ t('colorConverter.hex') }}</label>
          <div style="display: flex; gap: 0.5rem">
            <input v-model="hex" type="color" class="gi-input" style="width: 50px; padding: 2px" />
            <input v-model="hex" type="text" class="gi-input" placeholder="#FFFFFF" @input="updateFromHex" />
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem">
        <!-- RGB -->
        <div class="gi-field">
          <label class="gi-label">{{ t('colorConverter.rgb') }}</label>
          <div style="display: flex; gap: 0.5rem">
            <input v-model.number="rgb.r" type="number" class="gi-input" min="0" max="255" @input="updateFromRgb" />
            <input v-model.number="rgb.g" type="number" class="gi-input" min="0" max="255" @input="updateFromRgb" />
            <input v-model.number="rgb.b" type="number" class="gi-input" min="0" max="255" @input="updateFromRgb" />
          </div>
        </div>

        <!-- HSL -->
        <div class="gi-field">
          <label class="gi-label">{{ t('colorConverter.hsl') }}</label>
          <div style="display: flex; gap: 0.5rem">
            <input v-model.number="hsl.h" type="number" class="gi-input" min="0" max="360" @input="updateFromHsl" />
            <input v-model.number="hsl.s" type="number" class="gi-input" min="0" max="100" @input="updateFromHsl" />
            <input v-model.number="hsl.l" type="number" class="gi-input" min="0" max="100" @input="updateFromHsl" />
          </div>
        </div>
      </div>

      <!-- CMYK -->
      <div class="gi-field">
        <label class="gi-label">{{ t('colorConverter.cmyk') }}</label>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 0.5rem">
          <input v-model.number="cmyk.c" type="number" class="gi-input" min="0" max="100" @input="updateFromCmyk" />
          <input v-model.number="cmyk.m" type="number" class="gi-input" min="0" max="100" @input="updateFromCmyk" />
          <input v-model.number="cmyk.y" type="number" class="gi-input" min="0" max="100" @input="updateFromCmyk" />
          <input v-model.number="cmyk.k" type="number" class="gi-input" min="0" max="100" @input="updateFromCmyk" />
        </div>
      </div>
    </div>

    <div class="gi-result">
      <div class="gi-result-label">Values</div>
      <div style="display: flex; flex-direction: column; gap: 0.5rem">
        <div v-for="fmt in formats" :key="fmt.label" style="display: flex; justify-content: space-between; align-items: center">
          <span style="font-weight: 500; font-size: 0.9rem">{{ fmt.label }}:</span>
          <div style="display: flex; gap: 0.5rem; align-items: center">
            <code class="gi-code" style="padding: 0.2rem 0.5rem">{{ fmt.value }}</code>
            <button class="gi-btn-ghost" style="padding: 0.2rem 0.6rem; font-size: 0.75rem" @click="copy(fmt.value, fmt.label)">
              {{ copiedLabel === fmt.label ? t('colorConverter.copied') : t('colorConverter.copy') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { 
  hexToRgb, rgbToHex, rgbToHsl, hslToRgb, rgbToCmyk, cmykToRgb 
} from '../composables/useColorConverter'

const { t } = useI18n()

const hex = ref('#0aaa8e')
const rgb = ref({ r: 10, g: 170, b: 142 })
const hsl = ref({ h: 169, s: 89, l: 35 })
const cmyk = ref({ c: 94, m: 0, y: 16, k: 33 })

const copiedLabel = ref('')

const formats = computed(() => [
  { label: 'HEX', value: hex.value.toUpperCase() },
  { label: 'RGB', value: `rgb(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b})` },
  { label: 'HSL', value: `hsl(${hsl.value.h}, ${hsl.value.s}%, ${hsl.value.l}%)` },
  { label: 'CMYK', value: `cmyk(${cmyk.value.c}%, ${cmyk.value.m}%, ${cmyk.value.y}%, ${cmyk.value.k}%)` },
])

function updateFromHex() {
  const converted = hexToRgb(hex.value)
  if (converted) {
    rgb.value = converted
    syncFromRgb()
  }
}

function updateFromRgb() {
  hex.value = rgbToHex(rgb.value)
  syncFromRgb()
}

function updateFromHsl() {
  rgb.value = hslToRgb(hsl.value)
  hex.value = rgbToHex(rgb.value)
  cmyk.value = rgbToCmyk(rgb.value)
}

function updateFromCmyk() {
  rgb.value = cmykToRgb(cmyk.value)
  hex.value = rgbToHex(rgb.value)
  hsl.value = rgbToHsl(rgb.value)
}

function syncFromRgb() {
  hsl.value = rgbToHsl(rgb.value)
  cmyk.value = rgbToCmyk(rgb.value)
}

async function copy(val: string, label: string) {
  await navigator.clipboard.writeText(val)
  copiedLabel.value = label
  setTimeout(() => { copiedLabel.value = '' }, 2000)
}
</script>
