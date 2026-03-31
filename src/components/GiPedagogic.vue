<template>
  <section class="gi-pedagogic">
    <div class="gi-pedagogic-header">
      <span class="gi-pedagogic-icon">📚</span>
      <h3 class="gi-pedagogic-title">{{ title }}</h3>
    </div>
    
    <div class="gi-pedagogic-content">
      <slot name="content">
        <p v-if="description" class="gi-pedagogic-description">{{ description }}</p>
      </slot>
    </div>
    
    <div v-if="tips && tips.length" class="gi-pedagogic-tips">
      <h4 class="gi-pedagogic-subtitle">💡 {{ t('pedagogic.tips') }}</h4>
      <ul class="gi-pedagogic-list">
        <li v-for="(tip, index) in tips" :key="index" class="gi-pedagogic-list-item">
          {{ tip }}
        </li>
      </ul>
    </div>
    
    <div v-if="resources && resources.length" class="gi-pedagogic-resources">
      <h4 class="gi-pedagogic-subtitle">🔗 {{ t('pedagogic.resources') }}</h4>
      <ul class="gi-pedagogic-list">
        <li v-for="(resource, index) in resources" :key="index" class="gi-pedagogic-list-item">
          <a :href="resource.url" target="_blank" rel="noopener noreferrer" class="gi-pedagogic-link">
            {{ resource.label }}
          </a>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

interface Resource {
  label: string
  url: string
}

defineProps<{
  title: string
  description?: string
  tips?: string[]
  resources?: Resource[]
}>()

const { t } = useI18n()
</script>

<style scoped>
.gi-pedagogic {
  background: var(--gi-tint-blue-bg);
  border: 1px solid var(--gi-tint-blue-border);
  border-radius: var(--gi-radius-lg);
  padding: var(--gi-space-lg);
  margin-top: var(--gi-space-xl);
}

.gi-pedagogic-header {
  display: flex;
  align-items: center;
  gap: var(--gi-space-sm);
  margin-bottom: var(--gi-space-md);
}

.gi-pedagogic-icon {
  font-size: 1.5rem;
}

.gi-pedagogic-title {
  font-size: var(--gi-font-size-lg);
  font-weight: 600;
  color: var(--gi-tint-blue-text);
  margin: 0;
}

.gi-pedagogic-content {
  margin-bottom: var(--gi-space-lg);
}

.gi-pedagogic-description {
  font-size: var(--gi-font-size-md);
  color: var(--gi-text);
  line-height: 1.6;
  margin: 0;
}

.gi-pedagogic-tips,
.gi-pedagogic-resources {
  margin-top: var(--gi-space-md);
  padding-top: var(--gi-space-md);
  border-top: 1px solid var(--gi-tint-blue-border);
}

.gi-pedagogic-subtitle {
  font-size: var(--gi-font-size-sm);
  font-weight: 600;
  color: var(--gi-tint-blue-text);
  margin: 0 0 var(--gi-space-sm) 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.gi-pedagogic-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-xs);
}

.gi-pedagogic-list-item {
  font-size: var(--gi-font-size-md);
  color: var(--gi-text);
  padding-left: var(--gi-space-sm);
  border-left: 2px solid var(--gi-tint-blue-border);
}

.gi-pedagogic-link {
  color: var(--gi-brand);
  text-decoration: none;
  font-weight: 500;
  transition: color var(--gi-transition-fast);
}

.gi-pedagogic-link:hover {
  color: var(--gi-brand-dark);
  text-decoration: underline;
}
</style>
