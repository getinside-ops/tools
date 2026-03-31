<template>
  <div class="gi-data-display" role="list" aria-label="Data display">
    <div v-for="row in data" :key="row.label" class="gi-data-row" role="listitem">
      <div class="gi-data-label">{{ row.label }}</div>
      <div class="gi-data-value" :style="{ color: row.color }">
        <code v-if="row.code">{{ row.value }}</code>
        <span v-else>{{ row.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * GiDataDisplay - Displays structured data in label/value row pairs
 * Inspired by Delphi.tools data presentation pattern
 */

/**
 * Single row of data to display
 * Note: label must be unique for proper key binding
 */
export interface DataRow {
  /** Label text */
  label: string
  /** Value to display */
  value: string | number
  /** Optional text color */
  color?: string
  /** Display value in code styling */
  code?: boolean
}

defineProps<{
  data: DataRow[]
}>()

defineOptions({
  name: 'GiDataDisplay'
})
</script>

<style scoped>
.gi-data-display {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-sm);
}

.gi-data-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--gi-space-sm) var(--gi-space-md);
  background: var(--gi-bg-soft);
  border-radius: var(--gi-radius-md);
  gap: var(--gi-space-md);
}

@media (max-width: 480px) {
  .gi-data-row {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--gi-space-xs);
  }
}

.gi-data-label {
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-muted);
  font-weight: 500;
}

.gi-data-value {
  font-size: var(--gi-font-size-sm);
  font-weight: 600;
  font-family: 'Menlo', 'Monaco', monospace;
}

.gi-data-value code {
  background: var(--gi-surface);
  padding: 0.25rem 0.5rem;
  border-radius: var(--gi-radius-sm);
  border: 1px solid var(--gi-border);
}
</style>
