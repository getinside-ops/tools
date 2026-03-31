<template>
  <div class="tool-page">
    <!-- Back Link -->
    <router-link to="/" class="tool-back-link">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"/>
        <polyline points="12 19 5 12 12 5"/>
      </svg>
      {{ t('nav.back') }}
    </router-link>

    <!-- Tool Header -->
    <div class="tool-header">
      <div class="tool-header-top">
        <div class="tool-icon" v-if="$slots.icon">
          <slot name="icon"></slot>
        </div>
        <div class="tool-title-section">
          <h1 class="tool-title">
            <slot name="title">{{ title }}</slot>
          </h1>
          <p v-if="subtitle" class="tool-subtitle">{{ subtitle }}</p>
        </div>
      </div>
      <p class="tool-description">
        <slot name="description">{{ description }}</slot>
      </p>
    </div>

    <!-- Divider -->
    <div class="tool-divider"></div>

    <!-- Tool Content -->
    <div class="tool-content">
      <slot></slot>
    </div>

    <!-- Pedagogic Section -->
    <div v-if="$slots.pedagogic" class="tool-pedagogic">
      <slot name="pedagogic"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  title?: string
  subtitle?: string
  description?: string
}>()

const { t } = useI18n()
</script>

<style scoped>
.tool-page {
  max-width: var(--gi-container-tool);
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

.tool-back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 1.5rem;
  padding: 0.375rem 0.625rem;
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-muted);
  text-decoration: none;
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
  background: var(--gi-surface);
}

.tool-back-link:hover {
  border-color: var(--gi-brand);
  color: var(--gi-brand);
  background: var(--gi-brand-fade);
  transform: translateX(-2px);
}

.tool-header {
  margin-bottom: 2rem;
}

.tool-header-top {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.tool-icon {
  width: 48px;
  height: 48px;
  background: var(--gi-brand-fade);
  color: var(--gi-brand);
  border-radius: var(--gi-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--gi-transition-base);
}

.tool-title-section {
  flex: 1;
}

.tool-title {
  font-family: 'Garnett', 'Inter', system-ui, sans-serif;
  font-size: var(--gi-font-size-xl);
  font-weight: 700;
  color: var(--gi-text);
  margin: 0 0 0.25rem 0;
}

.tool-subtitle {
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-muted);
  margin: 0;
}

.tool-description {
  font-size: var(--gi-font-size-base);
  color: var(--gi-text-muted);
  line-height: 1.6;
  margin: 0;
}

.tool-divider {
  height: 1px;
  background: var(--gi-border);
  margin: 2rem 0;
}

.tool-content {
  margin-bottom: 2rem;
}

.tool-pedagogic {
  margin-top: 3rem;
}
</style>
