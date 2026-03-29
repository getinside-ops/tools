<template>
  <div>
    <!-- Hero -->
    <div class="gi-home-hero">
      <h1>{{ t('home.title') }}</h1>
      <p>{{ t('home.subtitle') }}</p>
    </div>

    <!-- Featured strip -->
    <section class="gi-featured-section">
      <div class="gi-section-label">{{ t('home.featured') }}</div>
      <div class="gi-featured-grid">
        <router-link
          v-for="tool in featuredTools"
          :key="tool.route"
          :to="tool.route"
          class="gi-tool-card gi-tool-card--featured"
        >
          <span class="gi-tool-icon">{{ tool.icon }}</span>
          <div>
            <strong>{{ t(tool.titleKey) }}</strong>
            <p>{{ t(tool.descKey) }}</p>
          </div>
        </router-link>
      </div>
    </section>

    <!-- Search + Category tabs -->
    <div class="gi-browse-header">
      <input
        v-model="searchQuery"
        type="search"
        class="gi-input gi-search-input"
        :placeholder="t('nav.search')"
      />
      <div v-if="!searchQuery.trim()" class="gi-category-tabs">
        <button
          v-for="cat in categories"
          :key="cat"
          class="gi-tab"
          :class="{ 'gi-tab--active': activeCategory === cat }"
          @click="activeCategory = cat"
        >
          {{ t(`home.categories.${cat}`) }}
        </button>
      </div>
    </div>

    <!-- Tool grid -->
    <div class="gi-tools-grid">
      <router-link
        v-for="tool in filteredTools"
        :key="tool.route"
        :to="tool.route"
        class="gi-tool-card"
      >
        <span class="gi-tool-icon">{{ tool.icon }}</span>
        <div class="gi-tool-card-body">
          <div class="gi-tool-card-title-row">
            <strong>{{ t(tool.titleKey) }}</strong>
            <span v-if="tool.isNew" class="gi-badge-new">{{ t('home.new') }}</span>
          </div>
          <p>{{ t(tool.descKey) }}</p>
          <span class="gi-tool-category-tag">{{ t(`home.categories.${tool.category}`) }}</span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const searchQuery = ref('')
const activeCategory = ref('all')
const categories = ['all', 'print', 'digital', 'design'] as const

const allTools = [
  { route: '/paper-weight',     icon: '📦', titleKey: 'home.tools.paperWeight.title',     descKey: 'home.tools.paperWeight.desc',     category: 'print',   isNew: false },
  { route: '/utm-builder',      icon: '🔗', titleKey: 'home.tools.utmBuilder.title',      descKey: 'home.tools.utmBuilder.desc',      category: 'digital', isNew: false },
  { route: '/dpi-checker',      icon: '🖨️', titleKey: 'home.tools.dpiChecker.title',      descKey: 'home.tools.dpiChecker.desc',      category: 'print',   isNew: false },
  { route: '/redirect-checker', icon: '↪️', titleKey: 'home.tools.redirectChecker.title', descKey: 'home.tools.redirectChecker.desc', category: 'digital', isNew: false },
  { route: '/promo-code',       icon: '🏷️', titleKey: 'home.tools.promoCode.title',       descKey: 'home.tools.promoCode.desc',       category: 'digital', isNew: false },
  { route: '/word-counter',     icon: '📝', titleKey: 'home.tools.wordCounter.title',     descKey: 'home.tools.wordCounter.desc',     category: 'digital', isNew: true  },
  { route: '/color-palette',    icon: '🎨', titleKey: 'home.tools.colorPalette.title',    descKey: 'home.tools.colorPalette.desc',    category: 'design',  isNew: true  },
  { route: '/mockup',           icon: '📱', titleKey: 'home.tools.mockupGenerator.title',   descKey: 'home.tools.mockupGenerator.desc',   category: 'design',  isNew: true  },
]

const featuredRoutes = ['/utm-builder', '/dpi-checker', '/color-palette']
const featuredTools = allTools.filter(tool => featuredRoutes.includes(tool.route))

const filteredTools = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (query) {
    return allTools.filter(tool =>
      t(tool.titleKey).toLowerCase().includes(query) ||
      t(tool.descKey).toLowerCase().includes(query)
    )
  }
  if (activeCategory.value === 'all') return allTools
  return allTools.filter(tool => tool.category === activeCategory.value)
})
</script>

<style scoped>
.gi-home-hero { margin-bottom: 2.5rem; }
.gi-home-hero h1 { font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; }
.gi-home-hero p { color: var(--gi-text-muted); font-size: 1.05rem; }

/* Featured */
.gi-featured-section { margin-bottom: 2.5rem; }
.gi-section-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--gi-brand);
  margin-bottom: 0.75rem;
}
.gi-featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}
.gi-tool-card--featured {
  border-color: rgba(10,170,142,0.3);
  background: linear-gradient(135deg, var(--gi-surface) 0%, rgba(106,231,200,0.06) 100%);
  min-height: 100px;
}

/* Search + Tabs */
.gi-browse-header { margin-bottom: 1.25rem; }
.gi-search-input { margin-bottom: 1rem; }
.gi-category-tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.gi-tab {
  padding: 0.35rem 0.85rem;
  border: 1.5px solid var(--gi-border);
  border-radius: 2rem;
  background: transparent;
  font-size: 0.85rem;
  color: var(--gi-text-muted);
  cursor: pointer;
  transition: border-color 0.12s, color 0.12s, background 0.12s;
}
.gi-tab:hover { border-color: var(--gi-brand); color: var(--gi-brand); }
.gi-tab--active { background: rgba(10,170,142,0.1); border-color: var(--gi-brand); color: var(--gi-brand); font-weight: 500; }

/* Grid */
.gi-tools-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
.gi-tool-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--gi-surface);
  border: 1.5px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
  text-decoration: none;
  color: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;
  position: relative;
}
.gi-tool-card:hover { border-color: var(--gi-brand); box-shadow: var(--gi-shadow); }
.gi-tool-icon { font-size: 1.8rem; line-height: 1; flex-shrink: 0; }
.gi-tool-card-body { flex: 1; min-width: 0; }
.gi-tool-card-title-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem; flex-wrap: wrap; }
.gi-tool-card strong { font-weight: 600; }
.gi-tool-card p { font-size: 0.875rem; color: var(--gi-text-muted); line-height: 1.5; margin-bottom: 0.5rem; }

.gi-badge-new {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: var(--gi-mint);
  color: #1a1a1a;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
}
.gi-tool-category-tag {
  font-size: 0.72rem;
  color: var(--gi-text-muted);
  background: var(--gi-bg-soft);
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
}
</style>
