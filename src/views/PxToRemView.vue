<template>
  <ToolPageLayout
    :title="t('pxToRem.title')"
    :description="t('pxToRem.desc')"
    category="design"
  >
    <template #icon>
      <Ruler :size="22" />
    </template>

    <!-- Base Size Setting -->
    <div class="px-base-row">
      <span class="px-base-label">{{ t('pxToRem.baseSize') }}</span>
      <div class="px-base-input">
        <input v-model.number="base" type="number" class="gi-input" min="1" />
        <span class="px-base-unit">px</span>
      </div>
    </div>

    <!-- Conversion Grid Header -->
    <div class="px-grid-header">
      <div>Pixel (px)</div>
      <div>Rem</div>
      <div></div>
    </div>

    <!-- Dynamic Rows -->
    <div class="px-rows">
      <div
        v-for="(row, index) in rows"
        :key="row.id"
        class="gi-card px-row"
      >
        <input
          v-model.number="row.px"
          type="number"
          class="gi-input px-value-input"
          step="1"
          @input="onPxInput(index)"
        />
        <input
          v-model.number="row.rem"
          type="number"
          class="gi-input px-value-input px-value-input--rem"
          step="0.125"
          @input="onRemInput(index)"
        />
        <button
          v-if="rows.length > 1"
          @click="removeRow(index)"
          class="gi-btn-ghost px-remove-btn"
          title="Remove row"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </button>
        <div v-else></div>
      </div>
    </div>

    <button @click="addRow" class="gi-btn-ghost px-add-btn">
      + {{ t('pxToRem.addRow') }}
    </button>

    <template #about>{{ t('pxToRem.about') }}</template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Ruler } from 'lucide-vue-next'
import ToolPageLayout from '../components/ToolPageLayout.vue'
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

watch(base, () => {
  rows.value.forEach((_, i) => onPxInput(i))
})

function onPxInput(index: number) {
  const row = rows.value[index]
  if (row.px === '') { row.rem = ''; return }
  row.rem = Number(pxToRem(Number(row.px), base.value).toFixed(4))
}

function onRemInput(index: number) {
  const row = rows.value[index]
  if (row.rem === '') { row.px = ''; return }
  row.px = Number(remToPx(Number(row.rem), base.value).toFixed(2))
}

function addRow() {
  rows.value.push({ id: crypto.randomUUID(), px: '', rem: '' })
}

function removeRow(index: number) {
  rows.value.splice(index, 1)
}
</script>

<style scoped>
.px-base-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
}

.px-base-label {
  font-weight: 500;
  color: var(--gi-text);
}

.px-base-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 80px;
  margin: 0 auto;
}

.px-base-unit {
  color: var(--gi-text-muted);
}

.px-grid-header {
  display: grid;
  grid-template-columns: 1fr 1fr 50px;
  gap: 1rem;
  margin-bottom: 0.5rem;
  padding: 0 1rem;
  color: var(--gi-text-muted);
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
}

.px-rows {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.px-row {
  padding: 0.75rem 1rem;
  display: grid;
  grid-template-columns: 1fr 1fr 50px;
  gap: 1rem;
  align-items: center;
}

.px-value-input {
  font-size: var(--gi-font-size-lg);
  text-align: center;
}

.px-value-input--rem {
  color: var(--gi-brand);
  font-weight: 600;
}

.px-remove-btn {
  padding: 0.4rem;
  border: none;
  color: var(--gi-tint-red-text);
}

.px-add-btn {
  width: 100%;
  justify-content: center;
  border-style: dashed;
}
</style>
