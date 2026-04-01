<template>
  <div class="gi-result-card" :class="[`gi-result-card--${variant}`]">
    <div class="gi-result-card-header">
      <slot name="header">
        <h3 class="gi-result-card-title">{{ title }}</h3>
      </slot>
      <button
        v-if="collapsible"
        class="gi-result-card-toggle"
        :aria-expanded="!collapsed"
        @click="$emit('update:collapsed', !collapsed)"
      >
        <ChevronDown :class="{ 'is-collapsed': collapsed }" />
      </button>
    </div>
    <div v-show="!collapsed" class="gi-result-card-content">
      <slot />
      <div v-if="$slots.actions" class="gi-result-card-actions">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'

export interface GiResultCardProps {
  title?: string
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
  collapsible?: boolean
  collapsed?: boolean
}

withDefaults(defineProps<GiResultCardProps>(), {
  variant: 'default',
  collapsible: false,
  collapsed: false
})

defineEmits<{
  'update:collapsed': [value: boolean]
}>()

defineOptions({
  name: 'GiResultCard'
})
</script>

<style scoped>
.gi-result-card {
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
  padding: var(--gi-space-md);
  margin-bottom: var(--gi-space-md);
  box-shadow: var(--gi-shadow-sm);
}

.gi-result-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--gi-space-sm);
}

.gi-result-card-title {
  font-size: var(--gi-font-size-md);
  font-weight: 600;
  color: var(--gi-text);
  margin: 0;
}

.gi-result-card-toggle {
  background: none;
  border: none;
  padding: var(--gi-space-xs);
  cursor: pointer;
  color: var(--gi-text-muted);
  transition: transform var(--gi-transition-fast) var(--gi-ease-out);
  border-radius: var(--gi-radius-sm);
}

.gi-result-card-toggle:hover {
  color: var(--gi-text);
  background: var(--gi-bg-soft);
}

.gi-result-card-toggle:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}

.gi-result-card-toggle .is-collapsed {
  transform: rotate(-90deg);
}

.gi-result-card-content {
  color: var(--gi-text);
}

.gi-result-card-actions {
  display: flex;
  gap: var(--gi-space-sm);
  margin-top: var(--gi-space-md);
  padding-top: var(--gi-space-sm);
  border-top: 1px solid var(--gi-border);
}

/* Variants */
.gi-result-card--success {
  border-left: 4px solid var(--gi-tint-green-text);
}

.gi-result-card--error {
  border-left: 4px solid var(--gi-tint-red-text);
}

.gi-result-card--warning {
  border-left: 4px solid var(--gi-tint-yellow-text);
}

.gi-result-card--info {
  border-left: 4px solid var(--gi-brand);
}
</style>
