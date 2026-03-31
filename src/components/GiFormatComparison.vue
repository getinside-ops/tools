<template>
  <div class="gi-format-comparison">
    <div class="gi-comparison-bar">
      <button
        v-for="fmt in formats"
        :key="fmt.key"
        type="button"
        class="gi-comparison-rect"
        :class="{ active: selectedFormat === fmt.key }"
        :style="getRectStyle(fmt)"
        @click="$emit('select', fmt.key)"
        :title="fmt.label"
        :aria-pressed="selectedFormat === fmt.key"
      />
    </div>
    <div class="gi-comparison-labels">
      <button
        v-for="fmt in formats"
        :key="fmt.key"
        type="button"
        class="gi-comparison-label"
        :class="{ active: selectedFormat === fmt.key }"
        @click="$emit('select', fmt.key)"
        :aria-pressed="selectedFormat === fmt.key"
      >
        {{ fmt.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FORMATS } from '../composables/usePaperWeight'
import type { FormatKey } from '../composables/usePaperWeight'

interface FormatInfo {
  key: FormatKey
  label: string
  width: number
  height: number
}

const formats: FormatInfo[] = (Object.keys(FORMATS) as Array<Exclude<FormatKey, 'Custom'>>).map((key) => ({
  key,
  label: key,
  width: FORMATS[key].width,
  height: FORMATS[key].height,
}))

defineProps<{
  selectedFormat: FormatKey | 'Custom'
}>()

defineEmits<{
  select: [format: FormatKey]
}>()

const SCALE = 0.8
const MAX_HEIGHT = 60

const getRectStyle = (fmt: FormatInfo) => {
  const scale = MAX_HEIGHT / Math.max(fmt.width, fmt.height) * SCALE
  return {
    width: `${fmt.width * scale}px`,
    height: `${fmt.height * scale}px`,
  }
}
</script>

<style scoped>
.gi-format-comparison {
  padding: var(--gi-space-md);
  background: var(--gi-bg-soft);
  border-radius: var(--gi-radius-lg);
  margin-bottom: var(--gi-space-md);
}

.gi-comparison-bar {
  display: flex;
  align-items: flex-end;
  gap: var(--gi-space-md);
  padding: var(--gi-space-sm);
  min-height: 80px;
  justify-content: center;
}

.gi-comparison-rect {
  background: var(--gi-brand-fade);
  border: 2px solid var(--gi-brand);
  border-radius: var(--gi-radius-sm);
  cursor: pointer;
  transition: all var(--gi-transition-fast);
  flex-shrink: 0;
}

.gi-comparison-rect:hover {
  background: var(--gi-brand);
  transform: translateY(-2px);
}

.gi-comparison-rect.active {
  background: var(--gi-brand);
  box-shadow: 0 0 0 3px rgba(10, 170, 142, 0.3);
}

[data-theme="dark"] .gi-comparison-rect.active {
  box-shadow: 0 0 0 3px rgba(10, 170, 142, 0.5);
}

.gi-comparison-labels {
  display: flex;
  justify-content: center;
  gap: var(--gi-space-md);
  margin-top: var(--gi-space-sm);
}

.gi-comparison-label {
  font-size: var(--gi-font-size-xs);
  font-weight: 600;
  color: var(--gi-text-muted);
  cursor: pointer;
  padding: var(--gi-space-xs) var(--gi-space-sm);
  border-radius: var(--gi-radius-pill);
  transition: all var(--gi-transition-fast);
}

.gi-comparison-label:hover {
  color: var(--gi-brand);
  background: rgba(10, 170, 142, 0.08);
}

.gi-comparison-label.active {
  color: var(--gi-brand);
  background: rgba(10, 170, 142, 0.12);
}
</style>
