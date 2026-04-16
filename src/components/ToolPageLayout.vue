<template>
  <div class="tool-page">
    <!-- Back Link -->
    <router-link to="/" class="tool-back-link">
      <ChevronLeft :size="16" />
      {{ t('nav.back') }}
    </router-link>

    <!-- Tool Header (flat) -->
    <div class="tool-header">
      <div class="tool-icon" v-if="$slots.icon">
        <slot name="icon"></slot>
      </div>
      <div class="tool-title-section">
        <h1 class="tool-title">
          <slot name="title">{{ title }}</slot>
        </h1>
        <p v-if="subtitle" class="tool-subtitle">{{ subtitle }}</p>
        <p class="tool-description">
          <slot name="description">{{ description }}</slot>
        </p>
      </div>
    </div>

    <hr class="tool-divider" />

    <!-- Tool Content -->
    <div class="tool-content">
      <slot></slot>
    </div>

    <!-- About Panel -->
    <div v-if="$slots.about" class="tool-about" :class="category ? `tool-about--${category}` : ''">
      <div class="tool-about-label">
        <span>{{ t('nav.about') }}</span>
      </div>
      <slot name="about"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ChevronLeft } from 'lucide-vue-next'

defineProps<{
  title?: string
  subtitle?: string
  description?: string
  category?: string
}>()

const { t } = useI18n()
</script>

<style scoped>
.tool-page {
  max-width: var(--gi-container-tool);
  margin: 0 auto;
  padding: 1.75rem 1.5rem 4rem;
}

/* Back Link */
.tool-back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 2rem;
  font-size: var(--gi-font-size-sm);
  font-weight: 500;
  color: var(--gi-text-muted);
  text-decoration: none;
  transition: color var(--gi-transition-fast);
}

.tool-back-link:hover {
  color: var(--gi-brand);
}

.tool-back-link:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
  border-radius: 2px;
}

/* Header (flat, no card) */
.tool-header {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1.25rem;
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
}

.tool-title-section {
  min-width: 0;
  flex: 1;
  padding-top: 0.2rem;
}

.tool-title {
  font-family: 'Garnett', 'Inter', system-ui, sans-serif;
  font-size: var(--gi-font-size-2xl);
  font-weight: 700;
  line-height: 1.15;
  color: var(--gi-text);
  margin: 0 0 0.4rem;
  letter-spacing: -0.02em;
}

.tool-subtitle {
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-muted);
  margin: 0 0 0.25rem;
}

.tool-description {
  max-width: 60ch;
  font-size: 1rem;
  color: var(--gi-text-muted);
  line-height: 1.7;
  margin: 0;
}

/* Divider */
.tool-divider {
  border: none;
  border-top: 1px solid var(--gi-border);
  margin: 0 0 1.75rem;
}

/* Content */
.tool-content {
  margin-bottom: 1.5rem;
}

/* About Panel */
.tool-about {
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
  padding: 1.25rem;
  margin-top: 2rem;
  background: var(--gi-surface);
}

.tool-about--print {
  background: var(--gi-tint-green-bg);
  border-color: var(--gi-tint-green-border);
}

.tool-about--digital {
  background: var(--gi-tint-blue-bg);
  border-color: var(--gi-tint-blue-border);
}

.tool-about--design {
  background: var(--gi-tint-purple-bg);
  border-color: var(--gi-tint-purple-border);
}

.tool-about-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.tool-about-label::before {
  content: '';
  display: block;
  width: 3px;
  height: 1rem;
  background: var(--gi-brand);
  border-radius: 2px;
  flex-shrink: 0;
}

.tool-about-label span {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--gi-text);
}

.tool-about :deep(p) {
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-muted);
  line-height: 1.7;
  margin: 0;
}

@media (max-width: 640px) {
  .tool-page {
    padding-inline: 1rem;
  }

  .tool-header {
    flex-direction: column;
  }
}
</style>
