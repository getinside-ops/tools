<template>
  <div class="home-wrap">
    <!-- Hero -->
    <section class="home-hero">
      <div class="home-hero-inner">
        <div class="home-hero-visual">
          <img :src="`${base}gi-keyvisual.svg`" alt="" class="home-hero-img" aria-hidden="true" />
        </div>
        <div class="home-hero-content">
          <h1>{{ t('home.title') }}</h1>
          <p class="home-hero-tagline">{{ t('home.subtitle') }}</p>
          <p class="home-hero-body">{{ t('home.heroText') }}</p>
          <a href="#browse" class="gi-btn home-hero-cta">{{ t('home.exploreTools') }}</a>
        </div>
      </div>
    </section>

    <!-- Browse -->
    <section class="home-browse" id="browse">
      <div class="home-browse-intro">
        <h2>{{ t('home.browse.title') }}</h2>
        <p>{{ t('home.browse.subtitle') }}</p>
      </div>

      <input
        v-model="searchQuery"
        type="search"
        class="gi-input home-search"
        :placeholder="t('nav.search')"
      />

      <div class="home-tab-bar">
        <button
          v-for="cat in categories"
          :key="cat"
          class="home-tab"
          :class="{ active: activeCategory === cat }"
          @click="setCategory(cat)"
        >
          {{ t(`home.categories.${cat}`) }}
        </button>
      </div>

      <!-- Grouped view: All + no active search -->
      <template v-if="!searchQuery.trim() && activeCategory === 'all'">
        <div v-for="grp in contentCategories" :key="grp">
          <div class="home-cat-header">{{ t(`home.categories.${grp}`) }}</div>
          <div class="home-grid">
            <router-link
              v-for="tool in toolsByCategory[grp]"
              :key="tool.route"
              :to="tool.route"
              class="home-card"
            >
              <div class="home-card-top">
                <div class="home-icon-box">
                  <component :is="tool.icon" :size="20" />
                </div>
                <span v-if="tool.isNew" class="gi-badge-new">{{ t('home.new') }}</span>
              </div>
              <strong class="home-card-title">{{ t(tool.titleKey) }}</strong>
              <p class="home-card-desc">{{ t(tool.descKey) }}</p>
              <span class="home-card-cta">{{ t('home.tryNow') }}</span>
            </router-link>
          </div>
        </div>
      </template>

      <!-- Filtered / search view: flat grid -->
      <template v-else>
        <div class="home-grid home-grid--mt">
          <router-link
            v-for="tool in filteredTools"
            :key="tool.route"
            :to="tool.route"
            class="home-card"
          >
            <div class="home-card-top">
              <div class="home-icon-box">
                <component :is="tool.icon" :size="20" />
              </div>
              <span v-if="tool.isNew" class="gi-badge-new">{{ t('home.new') }}</span>
            </div>
            <strong class="home-card-title">{{ t(tool.titleKey) }}</strong>
            <p class="home-card-desc">{{ t(tool.descKey) }}</p>
            <span class="home-card-cta">{{ t('home.tryNow') }}</span>
          </router-link>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
const base = import.meta.env.BASE_URL
import type { Component } from 'vue'
import {
  Scale, Link2, Printer, CornerDownRight, Tag, FileText, Palette, Smartphone,
} from 'lucide-vue-next'

const { t } = useI18n()

const searchQuery = ref('')
const activeCategory = ref('all')
const categories = ['all', 'print', 'digital', 'design'] as const
const contentCategories = ['print', 'digital', 'design'] as const
type ContentCategory = 'print' | 'digital' | 'design'

interface Tool {
  route: string
  icon: Component
  titleKey: string
  descKey: string
  category: ContentCategory
  isNew: boolean
}

const allTools: Tool[] = [
  { route: '/paper-weight',     icon: Scale,           titleKey: 'home.tools.paperWeight.title',     descKey: 'home.tools.paperWeight.desc',     category: 'print',   isNew: false },
  { route: '/utm-builder',      icon: Link2,           titleKey: 'home.tools.utmBuilder.title',      descKey: 'home.tools.utmBuilder.desc',      category: 'digital', isNew: false },
  { route: '/dpi-checker',      icon: Printer,         titleKey: 'home.tools.dpiChecker.title',      descKey: 'home.tools.dpiChecker.desc',      category: 'print',   isNew: false },
  { route: '/redirect-checker', icon: CornerDownRight, titleKey: 'home.tools.redirectChecker.title', descKey: 'home.tools.redirectChecker.desc', category: 'digital', isNew: false },
  { route: '/promo-code',       icon: Tag,             titleKey: 'home.tools.promoCode.title',       descKey: 'home.tools.promoCode.desc',       category: 'digital', isNew: false },
  { route: '/word-counter',     icon: FileText,        titleKey: 'home.tools.wordCounter.title',     descKey: 'home.tools.wordCounter.desc',     category: 'digital', isNew: true  },
  { route: '/color-palette',    icon: Palette,         titleKey: 'home.tools.colorPalette.title',    descKey: 'home.tools.colorPalette.desc',    category: 'design',  isNew: true  },
  { route: '/mockup',           icon: Smartphone,      titleKey: 'home.tools.mockupGenerator.title', descKey: 'home.tools.mockupGenerator.desc', category: 'design',  isNew: true  },
]

const toolsByCategory = computed((): Record<ContentCategory, Tool[]> => ({
  print:   allTools.filter(tool => tool.category === 'print'),
  digital: allTools.filter(tool => tool.category === 'digital'),
  design:  allTools.filter(tool => tool.category === 'design'),
}))

const filteredTools = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (query) {
    return allTools.filter(tool =>
      t(tool.titleKey).toLowerCase().includes(query) ||
      t(tool.descKey).toLowerCase().includes(query),
    )
  }
  if (activeCategory.value === 'all') return allTools
  return allTools.filter(tool => tool.category === activeCategory.value)
})

function setCategory(cat: string) {
  activeCategory.value = cat
  searchQuery.value = ''
}
</script>

<style scoped>
/* Break out of gi-main's 800px/padding constraint */
.home-wrap {
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  width: 100vw;
  margin-top: -2rem;
  margin-bottom: -4rem;
}

/* Hero */
.home-hero {
  padding: 4rem 1.5rem 3.5rem;
  max-width: 1100px;
  margin: 0 auto;
}
.home-hero-inner {
  display: flex;
  align-items: center;
  gap: 4rem;
}
.home-hero-visual {
  flex-shrink: 0;
  width: 150px;
}
.home-hero-img {
  width: 100%;
  height: auto;
  display: block;
}
.home-hero-content {
  flex: 1;
}
.home-hero h1 {
  font-family: 'Garnett', 'Inter', system-ui, sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  letter-spacing: -0.02em;
}
.home-hero-tagline {
  font-size: 1.05rem;
  font-weight: 500;
  color: var(--gi-text);
  margin-bottom: 0.75rem;
  line-height: 1.5;
}
.home-hero-body {
  font-size: 0.95rem;
  color: var(--gi-text-muted);
  line-height: 1.65;
  margin-bottom: 2rem;
}
.home-hero-cta {
  font-size: 1rem;
  padding: 0.7rem 1.5rem;
}
@media (max-width: 640px) {
  .home-hero-inner {
    flex-direction: column;
    gap: 1.75rem;
    text-align: center;
  }
  .home-hero-visual { width: 100px; }
  .home-hero h1 { font-size: 2rem; }
}

/* Browse section */
.home-browse {
  border-top: 1px solid var(--gi-border);
  padding: 3rem 1.5rem 4rem;
  max-width: 1100px;
  margin: 0 auto;
}
.home-browse-intro {
  text-align: center;
  margin-bottom: 2rem;
}
.home-browse-intro h2 {
  font-family: 'Garnett', 'Inter', system-ui, sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.4rem;
  letter-spacing: -0.01em;
}
.home-browse-intro p {
  color: var(--gi-text-muted);
  font-size: 0.95rem;
}

/* Search */
.home-search { margin-bottom: 1.25rem; }

/* Underline tabs */
.home-tab-bar {
  display: flex;
  border-bottom: 1px solid var(--gi-border);
  margin-bottom: 0;
}
.home-tab {
  padding: 0.6rem 1rem;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gi-text-muted);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  cursor: pointer;
  font-family: inherit;
  transition: color 0.12s, border-color 0.12s;
}
.home-tab:hover { color: var(--gi-text); }
.home-tab.active { color: var(--gi-brand); border-bottom-color: var(--gi-brand); }

/* Category section header */
.home-cat-header {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--gi-text-muted);
  margin: 2rem 0 0.75rem;
}

/* Card grid */
.home-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.875rem;
}
.home-grid--mt { margin-top: 1.5rem; }

/* Tool card */
.home-card {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1.125rem;
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.15s, border-color 0.15s;
  min-height: 160px;
}
.home-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border-color: rgba(10, 170, 142, 0.4);
}
.home-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.home-icon-box {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  background: var(--gi-tint-green-bg);
  color: var(--gi-brand);
  border-radius: var(--gi-radius);
  display: flex;
  align-items: center;
  justify-content: center;
}
.home-card-title {
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.3;
}
.home-card-desc {
  font-size: 0.8rem;
  color: var(--gi-text-muted);
  line-height: 1.5;
  flex: 1;
}
.home-card-cta {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--gi-brand);
  margin-top: auto;
}
</style>
