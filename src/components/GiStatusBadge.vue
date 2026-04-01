<template>
  <span class="gi-status-badge" :class="[`gi-status-badge--${variant}`]" role="status">
    <CheckCircle v-if="showIcon && variant === 'ok'" class="gi-status-badge-icon" :size="14" />
    <AlertCircle v-if="showIcon && variant === 'error'" class="gi-status-badge-icon" :size="14" />
    <AlertTriangle v-if="showIcon && variant === 'warning'" class="gi-status-badge-icon" :size="14" />
    <Info v-if="showIcon && variant === 'info'" class="gi-status-badge-icon" :size="14" />
    <slot />
  </span>
</template>

<script setup lang="ts">
import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-vue-next'

export interface GiStatusBadgeProps {
  variant?: 'ok' | 'error' | 'warning' | 'info'
  showIcon?: boolean
}

withDefaults(defineProps<GiStatusBadgeProps>(), {
  variant: 'info',
  showIcon: false
})

defineOptions({
  name: 'GiStatusBadge'
})
</script>

<style scoped>
.gi-status-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--gi-space-xs);
  padding: var(--gi-space-xs) var(--gi-space-sm);
  font-size: var(--gi-font-size-xs);
  font-weight: 500;
  border-radius: var(--gi-radius-pill);
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
}

.gi-status-badge-icon {
  flex-shrink: 0;
  color: currentColor; /* Inherit parent text color for dark mode */
}

.gi-status-badge--ok {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.2);
  color: var(--gi-tint-green-text);
}

.gi-status-badge--error {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
  color: var(--gi-tint-red-text);
}

.gi-status-badge--warning {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.2);
  color: var(--gi-tint-yellow-text);
}

.gi-status-badge--info {
  background: rgba(10, 170, 142, 0.1);
  border-color: rgba(10, 170, 142, 0.2);
  color: var(--gi-brand);
}
</style>
