<template>
  <div class="gi-comparison">
    <div class="gi-comparison-grid">
      <div v-for="(item, index) in items" :key="index" class="gi-comparison-item">
        <div class="gi-comparison-label">{{ item.label }}</div>
        <div class="gi-comparison-content">
          <slot :name="`item-${index}`" :item="item">
            <div v-if="item.value" class="gi-comparison-value">{{ item.value }}</div>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ComparisonItem {
  label: string
  value?: string | number
}

defineProps<{
  items: ComparisonItem[]
}>()
</script>

<style scoped>
.gi-comparison {
  margin: var(--gi-space-lg) 0;
}

.gi-comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--gi-space-md);
}

.gi-comparison-item {
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
  padding: var(--gi-space-md);
}

.gi-comparison-label {
  font-size: var(--gi-font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gi-text-muted);
  margin-bottom: var(--gi-space-xs);
}

.gi-comparison-content {
  font-size: var(--gi-font-size-md);
  color: var(--gi-text);
}

.gi-comparison-value {
  font-family: 'Menlo', 'Monaco', monospace;
  font-weight: 500;
}
</style>
