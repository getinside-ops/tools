<template>
  <div :class="['gi-info-box', `gi-info-box--${variant}`]">
    <div class="gi-info-box-icon">
      <slot name="icon">
        <Info v-if="variant === 'info'" :size="20" />
        <Lightbulb v-else-if="variant === 'tip'" :size="20" />
        <AlertTriangle v-else-if="variant === 'warning'" :size="20" />
      </slot>
    </div>
    <div class="gi-info-box-content">
      <div v-if="title" class="gi-info-box-title">{{ title }}</div>
      <div class="gi-info-box-text">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Info, Lightbulb, AlertTriangle } from 'lucide-vue-next'

/**
 * GiInfoBox - Contextual help component
 * Displays info, tips, or warnings in a styled box
 */

withDefaults(defineProps<{
  variant?: 'info' | 'tip' | 'warning'
  title?: string
}>(), {
  variant: 'info'
})

defineOptions({
  name: 'GiInfoBox'
})
</script>

<style scoped>
.gi-info-box {
  display: flex;
  gap: var(--gi-space-sm);
  padding: var(--gi-space-md);
  border-radius: var(--gi-radius-md);
  border: 1px solid;
}

.gi-info-box--info {
  background: var(--gi-tint-blue-bg);
  border-color: var(--gi-tint-blue-border);
  color: var(--gi-tint-blue-text);
}

.gi-info-box--tip {
  background: var(--gi-tint-green-bg);
  border-color: var(--gi-tint-green-border);
  color: var(--gi-tint-green-text);
}

.gi-info-box--warning {
  background: var(--gi-tint-yellow-bg);
  border-color: var(--gi-tint-yellow-border);
  color: var(--gi-tint-yellow-text);
}

.gi-info-box-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  flex-shrink: 0;
}

.gi-info-box-content {
  flex: 1;
}

.gi-info-box-title {
  font-weight: 600;
  margin-bottom: var(--gi-space-xs);
}

.gi-info-box-text {
  font-size: var(--gi-font-size-sm);
  line-height: 1.5;
}
</style>
