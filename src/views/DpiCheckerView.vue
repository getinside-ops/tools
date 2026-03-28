<template>
  <div>
    <div class="gi-tool-header">
      <h1>{{ t('dpiChecker.title') }}</h1>
      <p>{{ t('dpiChecker.desc') }}</p>
    </div>

    <div class="gi-upload-zone" @click="triggerFileInput" @dragover.prevent @drop.prevent="onDrop">
      <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileChange" />
      <span>{{ t('dpiChecker.upload') }}</span>
    </div>
    <p class="gi-or">{{ t('dpiChecker.orManual') }}</p>

    <div class="gi-row">
      <div class="gi-field">
        <label class="gi-label">{{ t('dpiChecker.widthPx') }}</label>
        <input v-model.number="widthPx" type="number" min="1" class="gi-input" />
      </div>
      <div class="gi-field">
        <label class="gi-label">{{ t('dpiChecker.heightPx') }}</label>
        <input v-model.number="heightPx" type="number" min="1" class="gi-input" />
      </div>
    </div>

    <template v-if="widthPx > 0 && heightPx > 0">
      <div class="gi-result">
        <div class="gi-result-label">{{ t('dpiChecker.resultTitle') }}</div>
        <table class="gi-table" style="margin-top:0.75rem">
          <thead>
            <tr>
              <th>{{ t('dpiChecker.dpiCol') }}</th>
              <th>{{ t('dpiChecker.widthCol') }}</th>
              <th>{{ t('dpiChecker.heightCol') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in dimensions" :key="row.dpi" :class="{ 'gi-row-highlight': row.dpi === 300 }">
              <td><strong>{{ row.dpi }} dpi</strong></td>
              <td>{{ row.widthCm }} cm</td>
              <td>{{ row.heightCm }} cm</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="gi-result" style="margin-top:1rem">
        <div class="gi-result-label">{{ t('dpiChecker.formatTitle') }}</div>
        <div class="gi-format-statuses">
          <div v-for="(status, fmt) in formatStatus" :key="fmt" class="gi-format-status-row">
            <span class="gi-format-name">{{ fmt }}</span>
            <span :class="`gi-status gi-status-${status}`">{{ t(`dpiChecker.status.${status}`) }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { calculatePrintDimensions, getFormatStatus } from '../composables/useDpiChecker'

const { t } = useI18n()
const widthPx = ref(0)
const heightPx = ref(0)
const fileInput = ref<HTMLInputElement>()

const dimensions = computed(() => calculatePrintDimensions(widthPx.value, heightPx.value))
const formatStatus = computed(() => getFormatStatus(widthPx.value, heightPx.value))

function triggerFileInput() { fileInput.value?.click() }

function loadImage(file: File) {
  const img = new Image()
  const url = URL.createObjectURL(file)
  img.onload = () => {
    widthPx.value = img.naturalWidth
    heightPx.value = img.naturalHeight
    URL.revokeObjectURL(url)
  }
  img.src = url
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) loadImage(file)
}

function onDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (file?.type.startsWith('image/')) loadImage(file)
}
</script>

<style scoped>
.gi-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.gi-upload-zone {
  border: 2px dashed var(--gi-border);
  border-radius: var(--gi-radius-lg);
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  color: var(--gi-text-muted);
  font-size: 0.9rem;
  transition: border-color 0.15s;
  margin-bottom: 1rem;
}
.gi-upload-zone:hover { border-color: var(--gi-brand); color: var(--gi-brand); }
.gi-or { text-align: center; color: var(--gi-text-muted); font-size: 0.85rem; margin-bottom: 1rem; }
.gi-row-highlight td { font-weight: 600; background: rgba(10,170,142,0.05); }
.gi-format-statuses { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.75rem; }
.gi-format-status-row { display: flex; align-items: center; justify-content: space-between; }
.gi-format-name { font-weight: 600; font-size: 0.9rem; }
</style>
