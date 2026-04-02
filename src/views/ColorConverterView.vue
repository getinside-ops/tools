<template>
  <ToolPageLayout
    :title="t('colorConverter.title')"
    :description="t('colorConverter.desc')"
    category="design"
  >
    <template #icon>
      <Palette />
    </template>

    <!-- Input Section -->
    <div class="gi-card" style="margin-bottom: 2rem;">
      <div style="display: flex; gap: 2rem; align-items: center; flex-wrap: wrap;">
        <!-- Large Preview -->
        <div
          class="preview-circle"
          :style="{ backgroundColor: hex }"
        ></div>

        <!-- HEX Input -->
        <GiFormField :label="t('colorConverter.hex')" style="flex: 1; min-width: 200px;">
          <template #input>
            <div style="display: flex; gap: 0.5rem;">
              <input v-model="hex" type="color" class="gi-input" style="width: 60px; padding: 2px; height: 42px;" />
              <input v-model="hex" type="text" class="gi-input" placeholder="#FFFFFF" @input="updateFromHex" />
            </div>
          </template>
        </GiFormField>
      </div>

      <!-- Quick Adjust (RGB/HSL Sliders) -->
      <div class="gi-grid" style="margin-top: 2rem; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
        <GiFormField :label="t('colorConverter.rgb')">
          <template #input>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem;">
              <input v-model.number="rgb.r" type="number" class="gi-input" min="0" max="255" @input="updateFromRgb" />
              <input v-model.number="rgb.g" type="number" class="gi-input" min="0" max="255" @input="updateFromRgb" />
              <input v-model.number="rgb.b" type="number" class="gi-input" min="0" max="255" @input="updateFromRgb" />
            </div>
          </template>
        </GiFormField>
        <GiFormField :label="t('colorConverter.hsl')">
          <template #input>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem;">
              <input v-model.number="hsl.h" type="number" class="gi-input" min="0" max="360" @input="updateFromHsl" />
              <input v-model.number="hsl.s" type="number" class="gi-input" min="0" max="100" @input="updateFromHsl" />
              <input v-model.number="hsl.l" type="number" class="gi-input" min="0" max="100" @input="updateFromHsl" />
            </div>
          </template>
        </GiFormField>
      </div>
    </div>

    <!-- Professional Results Grid (Delphic Pattern) -->
    <div class="gi-grid">
      <GiResultCard v-for="fmt in formats" :key="fmt.label" :title="fmt.label">
        <div class="gi-data-value" style="font-size: 1.1rem; word-break: break-all;">
          {{ fmt.value }}
        </div>
        <template #actions>
          <button class="gi-btn-ghost" @click="copy(fmt.value, fmt.label)">
            {{ copiedLabel === fmt.label ? t('colorConverter.copied') : t('colorConverter.copy') }}
          </button>
        </template>
      </GiResultCard>
    </div>

    <template #about>{{ t('colorConverter.about') }}</template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Palette } from 'lucide-vue-next'
import ToolPageLayout from '../components/ToolPageLayout.vue'
import GiFormField from '../components/GiFormField.vue'
import GiResultCard from '../components/GiResultCard.vue'
import {
  hexToRgb, rgbToHex, rgbToHsl, hslToRgb, rgbToCmyk,
  rgbToOklch, rgbToLab, rgbToLch
} from '../composables/useColorConverter'

const { t } = useI18n()

const hex = ref('#0aaa8e')
const rgb = ref({ r: 10, g: 170, b: 142 })
const hsl = ref({ h: 169, s: 89, l: 35 })
const cmyk = ref({ c: 94, m: 0, y: 16, k: 33 })

const copiedLabel = ref('')

const formats = computed(() => {
  const oklch = rgbToOklch(rgb.value)
  const lab = rgbToLab(rgb.value)
  const lch = rgbToLch(rgb.value)
  
  return [
    { label: 'HEX', value: hex.value.toUpperCase() },
    { label: 'RGB', value: `rgb(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b})` },
    { label: 'HSL', value: `hsl(${hsl.value.h}, ${hsl.value.s}%, ${hsl.value.l}%)` },
    { label: 'OKLCH', value: `oklch(${oklch.l.toFixed(2)} ${oklch.c.toFixed(3)} ${oklch.h.toFixed(1)})` },
    { label: 'LAB', value: `lab(${lab.l.toFixed(2)} ${lab.a.toFixed(2)} ${lab.b.toFixed(2)})` },
    { label: 'LCH', value: `lch(${lch.l.toFixed(2)} ${lch.c.toFixed(2)} ${lch.h.toFixed(1)})` },
  ]
})

function updateFromHex() {
  if (hex.value.length < 4) return
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

<style scoped>
.preview-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid var(--gi-surface);
  box-shadow: 0 0 0 1px var(--gi-border), var(--gi-shadow);
}
</style>
