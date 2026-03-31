<template>
  <div class="gi-data-display">
    <div v-for="(row, index) in data" :key="row.label || index" class="gi-data-row">
      <div class="gi-data-label">{{ row.label }}</div>
      <div class="gi-data-value" :style="{ color: row.color }">
        <code v-if="row.code">{{ row.value }}</code>
        <span v-else>{{ row.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface DataRow {
  label: string
  value: string | number
  color?: string
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
