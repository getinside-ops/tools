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
        :class="{ 'gi-log-slider-mark-prominent': isProminentMark(mark.value) }"
        :style="{ left: `${getMarkPercent(mark.value)}%` }"
      >
        <span class="gi-log-slider-mark-tick" />
        <span class="gi-log-slider-mark-label">{{ mark.label }}</span>
      </span>
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
  snapTo?: number[]
}>(), {
  label: '',
  ariaLabel: '',
  snapTo: undefined,
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
  
  // If snapTo is provided, snap to the nearest value in the array
  if (props.snapTo && props.snapTo.length > 0) {
    let nearest = props.snapTo[0]
    let minDist = Math.abs(clamped - nearest)
    
    for (let i = 1; i < props.snapTo.length; i++) {
      const dist = Math.abs(clamped - props.snapTo[i])
      if (dist < minDist) {
        minDist = dist
        nearest = props.snapTo[i]
      }
    }
    return nearest
  }
  
  // Otherwise, use the step function
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

// Determine if this is a prominent mark (major milestone)
function isProminentMark(value: number): boolean {
  const label = props.marks.find(m => m.value === value)?.label || ''
  // Prominent marks: 1k, 10k, 100k, 1M, 10M, 100M for quantity; 100, 250, 500 for grammage
  return label.includes('M') || label.includes('k') || ['80', '135', '250', '500'].includes(label)
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
  height: 24px;
  margin-top: 2px;
}

.gi-log-slider-mark {
  position: absolute;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gi-log-slider-mark-tick {
  width: 1px;
  height: 5px;
  background: var(--gi-border);
  border-radius: 1px;
}

.gi-log-slider-mark-prominent .gi-log-slider-mark-tick {
  width: 2px;
  height: 8px;
  background: var(--gi-text-muted);
}

.gi-log-slider-mark-label {
  font-size: 9px;
  color: var(--gi-text-muted);
  opacity: 0.7;
  white-space: nowrap;
  margin-top: 1px;
  transition: opacity var(--gi-transition-fast) var(--gi-ease-out);
}

.gi-log-slider-mark-prominent .gi-log-slider-mark-label {
  font-weight: 600;
  opacity: 1;
  color: var(--gi-text);
}

/* Value display removed - redundant with input field */
</style>
