<template>
  <div
    class="gi-result-card"
    :class="[
      `gi-result-card--${variant}`,
      { 'gi-result-card--collapsible': collapsible }
    ]"
  >
    <div class="gi-result-card-header">
      <div :id="headingId" class="gi-result-card-heading">
        <slot name="header">
          <h3 v-if="title" class="gi-result-card-title">{{ title }}</h3>
        </slot>
      </div>
      <button
        v-if="collapsible"
        class="gi-result-card-toggle"
        :aria-expanded="!collapsed"
        :aria-labelledby="headingId"
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
import { computed, getCurrentInstance } from 'vue'
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

const instance = getCurrentInstance()
const headingId = computed(() => `gi-result-card-heading-${instance?.uid ?? 'static'}`)

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
  border-radius: var(--gi-radius-xl);
  padding: var(--gi-space-lg);
  margin-bottom: var(--gi-space-md);
  box-shadow: var(--gi-shadow);
  position: relative;
  overflow: hidden;
}

.gi-result-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--gi-space-md);
  margin-bottom: var(--gi-space-md);
}

.gi-result-card-heading {
  display: flex;
  flex: 1;
  min-width: 0;
  align-items: center;
}

.gi-result-card-title {
  font-size: var(--gi-font-size-md);
  font-weight: 700;
  color: var(--gi-text);
  margin: 0;
  letter-spacing: -0.01em;
}

.gi-result-card-toggle {
  background: var(--gi-bg-soft);
  border: 1px solid var(--gi-border);
  padding: var(--gi-space-xs);
  cursor: pointer;
  color: var(--gi-text);
  transition:
    transform var(--gi-transition-fast) var(--gi-ease-out),
    border-color var(--gi-transition-fast) var(--gi-ease-out),
    background var(--gi-transition-fast) var(--gi-ease-out);
  border-radius: var(--gi-radius-pill);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.gi-result-card-toggle:hover {
  background: var(--gi-brand-fade);
  border-color: color-mix(in srgb, var(--gi-brand) 24%, var(--gi-border));
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

.gi-result-card--collapsible .gi-result-card-header {
  margin-bottom: var(--gi-space-sm);
}
</style>
