<template>
  <div class="home-wrap">
    <!-- Hero -->
    <section class="home-hero">
      <div class="home-hero-inner">
        <div class="home-hero-visual">
          <img :src="`${base}gi-keyvisual.svg`" alt="" class="home-hero-img" aria-hidden="true" />
        </div>
        <div class="home-hero-content">
          <h1 class="home-hero-title">{{ t('home.title') }}</h1>
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
                <span v-else-if="tool.isPopular" class="gi-badge-popular">{{ t('home.popular') }}</span>
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
              <span v-else-if="tool.isPopular" class="gi-badge-popular">{{ t('home.popular') }}</span>
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
  Globe, Ruler, Type, Eye, Pipette, FileDown, Crop, Maximize, Sparkles, ImagePlus, Square, Compass, AlignLeft, Barcode, Frame, Repeat, Info, QrCode
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
  isPopular?: boolean
}

const allTools: Tool[] = [
  // Existing tools
  { route: '/paper-weight',     icon: Scale,           titleKey: 'home.tools.paperWeight.title',     descKey: 'home.tools.paperWeight.desc',     category: 'print',   isNew: false, isPopular: true },
  { route: '/utm-builder',      icon: Link2,           titleKey: 'home.tools.utmBuilder.title',      descKey: 'home.tools.utmBuilder.desc',      category: 'digital', isNew: false, isPopular: true },
  { route: '/dpi-checker',      icon: Printer,         titleKey: 'home.tools.dpiChecker.title',      descKey: 'home.tools.dpiChecker.desc',      category: 'print',   isNew: false, isPopular: true },
  { route: '/redirect-checker', icon: CornerDownRight, titleKey: 'home.tools.redirectChecker.title', descKey: 'home.tools.redirectChecker.desc', category: 'digital', isNew: false },
  { route: '/promo-code',       icon: Tag,             titleKey: 'home.tools.promoCode.title',       descKey: 'home.tools.promoCode.desc',       category: 'digital', isNew: false },
  { route: '/word-counter',     icon: FileText,        titleKey: 'home.tools.wordCounter.title',     descKey: 'home.tools.wordCounter.desc',     category: 'digital', isNew: true  },
  { route: '/color-palette',    icon: Palette,         titleKey: 'home.tools.colorPalette.title',    descKey: 'home.tools.colorPalette.desc',    category: 'design',  isNew: true  },
  { route: '/mockup',           icon: Smartphone,      titleKey: 'home.tools.mockupGenerator.title', descKey: 'home.tools.mockupGenerator.desc', category: 'design',  isNew: true  },
  
  // New tools from Batch 1 & 2
  { route: '/url-parser',       icon: Globe,           titleKey: 'home.tools.urlParser.title',       descKey: 'home.tools.urlParser.desc',       category: 'digital', isNew: true  },
  { route: '/px-to-rem',        icon: Ruler,           titleKey: 'home.tools.pxToRem.title',        descKey: 'home.tools.pxToRem.desc',        category: 'design',  isNew: true  },
  { route: '/type-scale',       icon: Type,            titleKey: 'home.tools.typeScale.title',       descKey: 'home.tools.typeScale.desc',       category: 'design',  isNew: true  },
  { route: '/contrast-checker',  icon: Eye,             titleKey: 'home.tools.contrastChecker.title',  descKey: 'home.tools.contrastChecker.desc',  category: 'design',  isNew: true  },
  { route: '/color-converter',   icon: Pipette,         titleKey: 'home.tools.colorConverter.title',   descKey: 'home.tools.colorConverter.desc',   category: 'design',  isNew: true  },
  { route: '/image-compressor',  icon: FileDown,        titleKey: 'home.tools.imageCompressor.title',  descKey: 'home.tools.imageCompressor.desc',  category: 'design',  isNew: true  },
  { route: '/image-cropper',     icon: Crop,            titleKey: 'home.tools.imageCropper.title',     descKey: 'home.tools.imageCropper.desc',     category: 'design',  isNew: true  },
  { route: '/image-resizer',     icon: Maximize,        titleKey: 'home.tools.imageResizer.title',     descKey: 'home.tools.imageResizer.desc',     category: 'design',  isNew: true  },
  { route: '/image-filters',     icon: Sparkles,        titleKey: 'home.tools.imageFilters.title',     descKey: 'home.tools.imageFilters.desc',     category: 'design',  isNew: true  },
  { route: '/placeholder',       icon: ImagePlus,       titleKey: 'home.tools.placeholder.title',      descKey: 'home.tools.placeholder.desc',      category: 'design',  isNew: true  },
  { route: '/matte-generator',   icon: Square,          titleKey: 'home.tools.matteGenerator.title',   descKey: 'home.tools.matteGenerator.desc',   category: 'design',  isNew: true  },
  { route: '/favicon',           icon: Compass,         titleKey: 'home.tools.favicon.title',          descKey: 'home.tools.favicon.desc',          category: 'digital', isNew: true  },
  { route: '/lorem',             icon: AlignLeft,       titleKey: 'home.tools.lorem.title',            descKey: 'home.tools.lorem.desc',            category: 'design',  isNew: true  },
  { route: '/barcode',           icon: Barcode,         titleKey: 'home.tools.barcode.title',          descKey: 'home.tools.barcode.desc',          category: 'print',   isNew: true  },
  { route: '/safety-margin',     icon: Frame,           titleKey: 'home.tools.safetyMargin.title',     descKey: 'home.tools.safetyMargin.desc',     category: 'print',   isNew: true  },
  { route: '/image-converter',   icon: Repeat,          titleKey: 'home.tools.imageConverter.title',   descKey: 'home.tools.imageConverter.desc',   category: 'design',  isNew: true  },
  { route: '/metadata',          icon: Info,            titleKey: 'home.tools.metadata.title',         descKey: 'home.tools.metadata.desc',         category: 'digital', isNew: true  },
  { route: '/colorblind',        icon: Eye,             titleKey: 'home.tools.colorblind.title',       descKey: 'home.tools.colorblind.desc',       category: 'design',  isNew: true  },
  { route: '/qr-decoder',        icon: QrCode,          titleKey: 'home.tools.qrDecoder.title',        descKey: 'home.tools.qrDecoder.desc',        category: 'digital', isNew: true  },
  { route: '/palette',           icon: Palette,         titleKey: 'home.tools.palette.title',          descKey: 'home.tools.palette.desc',          category: 'design',  isNew: true  },
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
  padding: var(--gi-space-3xl) 1.5rem var(--gi-space-2xl);
  max-width: var(--gi-container-hero); /* 1400px */
  margin: 0 auto;
}
.home-hero-inner {
  display: flex;
  align-items: center;
  gap: 4rem;
}
.home-hero-visual {
  flex-shrink: 0;
  width: 180px;
}
.home-hero-img {
  width: 100%;
  height: auto;
  display: block;
}
.home-hero-content {
  flex: 1;
}
.home-hero-title {
  font-family: 'Garnett', 'Inter', system-ui, sans-serif;
  font-size: var(--gi-font-size-3xl); /* 2.5rem */
  font-weight: 700;
  margin-bottom: 0.75rem;
  letter-spacing: -0.02em;
  color: var(--gi-text);
}
.home-hero-tagline {
  font-size: 1rem; /* ~0.95rem */
  font-weight: 600;
  color: var(--gi-text);
  margin-bottom: 0.75rem;
  line-height: 1.5;
}
.home-hero-body {
  font-size: var(--gi-font-size-sm); /* 0.875rem */
  color: var(--gi-text-muted);
  line-height: 1.65;
  margin-bottom: 2rem;
}
.home-hero-cta {
  font-size: var(--gi-font-size-md);
  padding: 0.7rem 1.5rem;
}
@media (max-width: 768px) {
  .home-hero-inner {
    flex-direction: column;
    gap: 2rem;
    text-align: center;
  }
  .home-hero-visual { 
    width: 120px; 
  }
  .home-hero-title { 
    font-size: var(--gi-font-size-2xl); 
  }
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

/* Zerokit-style pill tabs */
.home-tab-bar {
  display: flex;
  gap: var(--gi-space-sm);
  margin-bottom: var(--gi-space-lg);
  flex-wrap: wrap;
}
.home-tab {
  padding: 0.5rem 1rem;
  border: 1.5px solid var(--gi-border);
  background: var(--gi-surface);
  font-size: var(--gi-font-size-sm);
  font-weight: 500;
  color: var(--gi-text-muted);
  border-radius: var(--gi-radius-pill);
  cursor: pointer;
  font-family: inherit;
  transition: all var(--gi-transition-fast);
}
.home-tab:hover {
  border-color: var(--gi-border-hover);
  color: var(--gi-text);
}
.home-tab.active {
  background: var(--gi-brand);
  color: white;
  border-color: var(--gi-brand);
}

/* Category section header */
.home-cat-header {
  font-size: var(--gi-font-size-sm);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--gi-text-muted);
  margin: var(--gi-space-2xl) 0 var(--gi-space-lg);
  padding-bottom: var(--gi-space-sm);
  border-bottom: 1px solid var(--gi-border);
}

/* Card grid */
.home-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--gi-grid-gap);
}
.home-grid--mt { 
  margin-top: var(--gi-space-lg); 
}

/* Tool card */
.home-card {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-sm);
  padding: var(--gi-space-xl);
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
  text-decoration: none;
  color: inherit;
  transition: all var(--gi-transition-base) var(--gi-ease-out);
  min-height: var(--gi-card-min-height);
  position: relative;
  box-shadow: var(--gi-shadow-sm);
}

.home-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--gi-shadow-lg);
  border-color: rgba(10, 170, 142, 0.4);
}

[data-theme="dark"] .home-card:hover {
  box-shadow: var(--gi-shadow-glow);
  border-color: rgba(10, 170, 142, 0.6);
}

.home-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.home-icon-box {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  background: var(--gi-brand-fade);
  color: var(--gi-brand);
  border-radius: var(--gi-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--gi-transition-base) var(--gi-ease-bounce);
}

.home-card:hover .home-icon-box {
  background: var(--gi-brand);
  color: white;
  transform: scale(1.05);
}

.home-card-title {
  font-size: var(--gi-font-size-lg);
  font-weight: 600;
  line-height: 1.3;
  color: var(--gi-text);
}

.home-card-desc {
  font-size: var(--gi-font-size-xs);
  color: var(--gi-text-muted);
  line-height: 1.5;
  flex: 1;
}

.home-card-cta {
  font-size: var(--gi-font-size-xs);
  font-weight: 500;
  color: var(--gi-brand);
  margin-top: auto;
  transition: color var(--gi-transition-fast);
}

.home-card:hover .home-card-cta {
  color: var(--gi-brand-dark);
}

/* Badges */
.gi-badge-new,
.gi-badge-popular {
  font-size: 0.6rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: var(--gi-radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.gi-badge-new {
  background: var(--gi-violet);
  color: white;
}

.gi-badge-popular {
  background: var(--gi-tint-orange-text);
  color: white;
}
</style>
