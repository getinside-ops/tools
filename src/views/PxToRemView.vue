<template>
  <div>
    <div class="gi-tool-header">
      <h1>{{ t('pxToRem.title') }}</h1>
      <p>{{ t('pxToRem.desc') }}</p>
    </div>

    <!-- Base Size Setting -->
    <div class="gi-card" style="margin-bottom: 2rem; padding: 1rem 1.5rem; display: flex; align-items: center; justify-content: space-between; background: var(--gi-surface);">
      <span style="font-weight: 500;">{{ t('pxToRem.baseSize') }}</span>
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <input v-model.number="base" type="number" class="gi-input" min="1" style="width: 80px; text-align: center;" />
        <span style="color: var(--gi-text-muted);">px</span>
      </div>
    </div>

    <!-- Conversion Grid Header -->
    <div style="display: grid; grid-template-columns: 1fr 1fr 50px; gap: 1rem; margin-bottom: 0.5rem; padding: 0 1rem; color: var(--gi-text-muted); font-size: 0.85rem; font-weight: 600; text-transform: uppercase;">
      <div>Pixel (px)</div>
      <div>Rem</div>
      <div></div>
    </div>

    <!-- Dynamic Rows -->
    <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem;">
      <div 
        v-for="(row, index) in rows" 
        :key="row.id" 
        class="gi-card" 
        style="padding: 0.75rem 1rem; display: grid; grid-template-columns: 1fr 1fr 50px; gap: 1rem; align-items: center;"
      >
        <!-- Pixels Input -->
        <input 
          v-model.number="row.px" 
          type="number" 
          class="gi-input gi-data-value" 
          step="1"
          style="background: transparent; border-color: transparent; font-size: 1.25rem;" 
          @input="onPxInput(index)"
        />

        <!-- REMs Input -->
        <input 
          v-model.number="row.rem" 
          type="number" 
          class="gi-input gi-data-value" 
          step="0.125"
          style="background: transparent; border-color: transparent; font-size: 1.25rem; color: var(--gi-brand);" 
          @input="onRemInput(index)"
        />

        <!-- Remove Row -->
        <button 
          v-if="rows.length > 1"
          @click="removeRow(index)" 
          class="gi-btn-ghost" 
          style="padding: 0.4rem; border: none; color: var(--gi-tint-red-text);"
          title="Remove row"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </button>
        <div v-else></div>
      </div>
    </div>

    <button @click="addRow" class="gi-btn-ghost" style="width: 100%; justify-content: center; border-style: dashed;">
      + {{ t('pxToRem.addRow') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { pxToRem, remToPx } from '../composables/usePxToRem'

const { t } = useI18n()

interface RowData {
  id: string
  px: number | ''
  rem: number | ''
}

const base = ref(16)
const rows = ref<RowData[]>([
  { id: crypto.randomUUID(), px: 16, rem: 1 },
  { id: crypto.randomUUID(), px: 24, rem: 1.5 },
  { id: crypto.randomUUID(), px: 32, rem: 2 },
])

// Re-calculate all when base changes
watch(base, () => {
  rows.value.forEach((_, i) => onPxInput(i))
})

function onPxInput(index: number) {
  const row = rows.value[index]
  if (row.px === '') {
    row.rem = ''
    return
  }
  const calculated = pxToRem(Number(row.px), base.value)
  row.rem = Number(calculated.toFixed(4))
}

function onRemInput(index: number) {
  const row = rows.value[index]
  if (row.rem === '') {
    row.px = ''
    return
  }
  const calculated = remToPx(Number(row.rem), base.value)
  row.px = Number(calculated.toFixed(2))
}

function addRow() {
  rows.value.push({ id: crypto.randomUUID(), px: '', rem: '' })
}

function removeRow(index: number) {
  rows.value.splice(index, 1)
}
</script>

<style scoped>
.gi-input:focus {
  background: var(--gi-bg-soft) !important;
  border-color: var(--gi-brand) !important;
}
</style>
