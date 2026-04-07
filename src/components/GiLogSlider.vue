<template>
  <div class="gi-log-slider" role="group" :aria-label="ariaLabel">
    <!-- Slider -->
    <input
      type="range"
      :min="0"
      :max="LOG_MAX"
      step="1"
      :value="sliderPosition"
      @input="onSliderInput"
      class="gi-log-slider-track"
      :style="sliderStyle"
      :aria-label="label"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="modelValue"
    />

    <!-- Marks -->
    <div class="gi-log-slider-marks" aria-hidden="true">
      <span
        v-for="mark in visibleMarks"
        :key="mark.value"
        class="gi-log-slider-mark"
        :style="{ left: `${getMarkPercent(mark.value)}%` }"
      >
        <span class="gi-log-slider-mark-tick" />
        <span class="gi-log-slider-mark-label">{{ mark.label }}</span>
      </span>
    </div>

    <!-- Current value display -->
    <div class="gi-log-slider-value" aria-live="polite">
      {{ formatValue(modelValue) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: number
  min: number
  max: number
  step: (value: number) => number
  marks: { value: number; label: string }[]
  label?: string
  ariaLabel?: string
  formatValue?: (value: number) => string
}>(), {
  label: '',
  ariaLabel: '',
  formatValue: (v: number) => Math.round(v).toLocaleString(),
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

// Logarithmic scale: map 0..LOG_MAX to min..max using log scale
const LOG_MAX = 1000

const sliderPosition = computed(() => {
  const clamped = Math.max(props.min, Math.min(props.max, props.modelValue))
  const minLog = Math.log(Math.max(props.min, 1))
  const maxLog = Math.log(Math.max(props.max, 1))
  const valLog = Math.log(Math.max(clamped, 1))
  if (maxLog === minLog) return 0
  return Math.round(LOG_MAX * (valLog - minLog) / (maxLog - minLog))
})

function onSliderInput(event: Event) {
  const pos = Number((event.target as HTMLInputElement).value)
  // Convert log position back to value using inverse formula
  const minLog = Math.log(Math.max(props.min, 1))
  const maxLog = Math.log(Math.max(props.max, 1))
  const rawValue = Math.exp(minLog + (pos / LOG_MAX) * (maxLog - minLog))
  // Round to nearest valid step
  const rounded = roundToStep(rawValue, props.min, props.max, props.step)
  emit('update:modelValue', rounded)
}

function roundToStep(value: number, min: number, max: number, stepFn: (v: number) => number): number {
  const clamped = Math.max(min, Math.min(max, value))
  const step = stepFn(clamped)
  return Math.round(clamped / step) * step
}

// Slider fill style
const sliderStyle = computed(() => {
  const pct = (sliderPosition.value / LOG_MAX) * 100
  return {
    '--slider-fill': `${pct}%`,
  } as Record<string, string>
})

// Filter marks to only show those within range and not too close together
const visibleMarks = computed(() => {
  return props.marks.filter(m => m.value >= props.min && m.value <= props.max)
})

function getMarkPercent(value: number): number {
  const minLog = Math.log(Math.max(props.min, 1))
  const maxLog = Math.log(Math.max(props.max, 1))
  const valLog = Math.log(Math.max(value, 1))
  if (maxLog === minLog) return 0
  return Math.round(100 * (valLog - minLog) / (maxLog - minLog))
}
</script>

<style scoped>
.gi-log-slider {
  position: relative;
  width: 100%;
  padding-top: var(--gi-space-xs);
}

.gi-log-slider-track {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: var(--gi-border);
  outline: none;
  cursor: pointer;
  margin: 0;
}

.gi-log-slider-track::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--gi-brand);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: transform var(--gi-transition-fast) var(--gi-ease-out), box-shadow var(--gi-transition-fast) var(--gi-ease-out);
}

.gi-log-slider-track::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}

.gi-log-slider-track::-webkit-slider-thumb:active {
  transform: scale(1.05);
}

.gi-log-slider-track::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--gi-brand);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.gi-log-slider-track:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}

/* Marks */
.gi-log-slider-marks {
  position: relative;
  height: 28px;
  margin-top: 4px;
}

.gi-log-slider-mark {
  position: absolute;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gi-log-slider-mark-tick {
  width: 2px;
  height: 8px;
  background: var(--gi-border);
  border-radius: 1px;
}

.gi-log-slider-mark-label {
  font-size: var(--gi-font-size-xs);
  color: var(--gi-text-muted);
  white-space: nowrap;
  margin-top: 2px;
}

/* Value display */
.gi-log-slider-value {
  text-align: center;
  font-size: var(--gi-font-size-sm);
  font-weight: 600;
  color: var(--gi-brand);
  margin-top: var(--gi-space-xs);
}
</style>
