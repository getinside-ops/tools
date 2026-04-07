<template>
  <div class="tool-page">
    <!-- Back Link -->
    <router-link to="/" class="tool-back-link">
      <ChevronLeft :size="16" />
      {{ t('nav.back') }}
    </router-link>

    <!-- Tool Header Card -->
    <div class="tool-header-card">
      <div class="tool-icon" v-if="$slots.icon">
        <slot name="icon"></slot>
      </div>
      <div class="tool-title-section">
        <div class="tool-title-row">
          <h1 class="tool-title">
            <slot name="title">{{ title }}</slot>
          </h1>
          <span v-if="category" class="tool-category-badge" :class="`tool-category-badge--${category}`">
            {{ t(`home.categories.${category}`) }}
          </span>
        </div>
        <p v-if="subtitle" class="tool-subtitle">{{ subtitle }}</p>
        <p class="tool-description">
          <slot name="description">{{ description }}</slot>
        </p>
      </div>
    </div>

    <!-- Tool Content -->
    <div class="tool-content">
      <slot></slot>
    </div>

    <!-- About Panel -->
    <div v-if="$slots.about" class="tool-about" :class="`tool-about--${category}`">
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
  category?: 'print' | 'digital' | 'design'
}>()

const { t } = useI18n()
</script>

<style scoped>
.tool-page {
  max-width: var(--gi-container-tool);
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

/* Back Link */
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

.tool-back-link:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}

[data-theme="dark"] .tool-back-link:hover {
  background: rgba(10, 170, 142, 0.15);
}

/* Header Card */
.tool-header-card {
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  box-shadow: var(--gi-shadow-sm);
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
}

.tool-title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.25rem;
}

.tool-title {
  font-size: var(--gi-font-size-xl);
  font-weight: 700;
  line-height: 1.2;
  color: var(--gi-text);
  margin: 0;
}

.tool-category-badge {
  font-size: 0.6875rem;
  font-weight: 700;
  border-radius: var(--gi-radius-pill);
  padding: 2px 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
  white-space: nowrap;
}

.tool-category-badge--print {
  background: var(--gi-brand-fade);
  color: var(--gi-brand);
}

.tool-category-badge--digital {
  background: var(--gi-tint-blue-bg);
  color: var(--gi-tint-blue-text);
}

.tool-category-badge--design {
  background: var(--gi-tint-purple-bg);
  color: var(--gi-tint-purple-text);
}

.tool-subtitle {
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-muted);
  margin: 0 0 0.25rem;
}

.tool-description {
  max-width: 56ch;
  font-size: 1rem;
  color: color-mix(in srgb, var(--gi-text-muted) 92%, var(--gi-text));
  line-height: 1.7;
  margin: 0;
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

  .tool-header-card {
    padding: 1.25rem;
    flex-direction: column;
  }
}
</style>
