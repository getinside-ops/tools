<template>
  <div class="home-wrap">
    <!-- Hero -->
    <section class="home-hero">
      <div class="home-hero-inner">
        <h1 class="home-hero-title">{{ t('home.title') }}</h1>
        <p class="home-hero-tagline">{{ t('home.subtitle') }}</p>
        <p class="home-hero-body">{{ t('home.heroText') }}</p>
        <div class="home-hero-actions">
          <a href="#" class="gi-btn home-hero-cta" @click.prevent="scrollToBrowse">{{ t('home.exploreTools') }}</a>
          <a href="https://www.getinside.fr/" class="home-hero-link" target="_blank" rel="noopener noreferrer">{{ t('home.discoverGetinside') }} →</a>
        </div>
      </div>
    </section>

    <!-- Top Tools -->
    <section class="home-top">
      <div class="home-section-inner">
        <div class="home-top-header">
          <h2 class="home-top-title">{{ t('home.topSection.title') }}</h2>
          <p class="home-top-subtitle">{{ t('home.topSection.subtitle') }}</p>
        </div>
        <div class="home-top-grid">
          <router-link
            v-for="tool in topTools"
            :key="tool.route"
            :to="tool.route"
            class="home-card home-card--top"
          >
            <div class="home-icon-box">
              <component :is="tool.icon" :size="20" />
            </div>
            <strong class="home-card-title">{{ t(tool.titleKey) }}</strong>
            <p class="home-card-desc">{{ t(tool.descKey) }}</p>
            <span class="home-card-cta">{{ t('home.tryNow') }}</span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Browse -->
    <section class="home-browse" id="browse">
      <div class="home-section-inner">
        <div class="home-browse-intro">
          <h2>{{ t('home.browse.title') }}</h2>
          <p>{{ t('home.browse.subtitle') }}</p>
        </div>

        <div class="home-tab-bar" :class="{ 'home-tab-bar--scrolled': showBackToTop }" role="tablist" :aria-label="t('home.browse.title')">
          <button
            v-for="cat in categories"
            :key="cat"
            class="home-tab"
            role="tab"
            :aria-selected="activeCategory === cat"
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
                <div class="home-icon-box">
                  <component :is="tool.icon" :size="20" />
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
              <div class="home-icon-box">
                <component :is="tool.icon" :size="20" />
              </div>
              <strong class="home-card-title">{{ t(tool.titleKey) }}</strong>
              <p class="home-card-desc">{{ t(tool.descKey) }}</p>
              <span class="home-card-cta">{{ t('home.tryNow') }}</span>
            </router-link>
          </div>
          <p v-if="filteredTools.length === 0" class="home-no-results">
            {{ t('nav.search') }} — {{ searchQuery }}
          </p>
        </template>
      </div>
    </section>

    <!-- Back to top -->
    <button
      v-show="showBackToTop"
      class="home-back-to-top"
      :class="{ visible: showBackToTop }"
      @click="scrollToTop"
      aria-label="Retour en haut"
    >
      <ArrowUp :size="20" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Component } from 'vue'
import {
  Scale, Link2, Printer, CornerDownRight, Tag, FileText, Palette, Smartphone,
  Globe, Ruler, Type, Eye, Pipette, FileDown, Crop, Maximize, Sparkles, ImagePlus,
  Square, Compass, AlignLeft, Barcode, Frame, Repeat, Info, QrCode, ArrowUp, Hash,
} from 'lucide-vue-next'
import { useSearch } from '../composables/useSearch'
import { useRecentTools } from '../composables/useRecentTools'

const { t } = useI18n()
const { searchQuery } = useSearch()
const { recentRoutes } = useRecentTools()

const activeCategory = ref('all')
const categories = ['all', 'print', 'marketing', 'images', 'couleurs', 'contenu'] as const
const contentCategories = ['print', 'marketing', 'images', 'couleurs', 'contenu'] as const
type ContentCategory = 'print' | 'marketing' | 'images' | 'couleurs' | 'contenu'

// Back to top
const showBackToTop = ref(false)
function handleScroll() {
  showBackToTop.value = window.scrollY > 600
}
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
onMounted(() => window.addEventListener('scroll', handleScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))

interface Tool {
  route: string
  icon: Component
  titleKey: string
  descKey: string
  category: ContentCategory
}

const allTools: Tool[] = [
  // Print
  { route: '/paper-weight',    icon: Scale,           titleKey: 'home.tools.paperWeight.title',     descKey: 'home.tools.paperWeight.desc',     category: 'print'     },
  { route: '/pdfx',            icon: FileText,        titleKey: 'home.tools.pdfX.title',             descKey: 'home.tools.pdfX.desc',             category: 'print'     },
  { route: '/dpi-checker',     icon: Printer,         titleKey: 'home.tools.dpiChecker.title',      descKey: 'home.tools.dpiChecker.desc',      category: 'print'     },
  { route: '/barcode',         icon: Barcode,         titleKey: 'home.tools.barcode.title',          descKey: 'home.tools.barcode.desc',          category: 'print'     },
  { route: '/safety-margin',   icon: Frame,           titleKey: 'home.tools.safetyMargin.title',     descKey: 'home.tools.safetyMargin.desc',     category: 'print'     },
  // Marketing
  { route: '/utm-builder',     icon: Link2,           titleKey: 'home.tools.utmBuilder.title',      descKey: 'home.tools.utmBuilder.desc',      category: 'marketing' },
  { route: '/promo-code',      icon: Tag,             titleKey: 'home.tools.promoCode.title',       descKey: 'home.tools.promoCode.desc',       category: 'marketing' },
  { route: '/redirect-checker',icon: CornerDownRight, titleKey: 'home.tools.redirectChecker.title', descKey: 'home.tools.redirectChecker.desc', category: 'marketing' },
  { route: '/qr-decoder',      icon: QrCode,          titleKey: 'home.tools.qrDecoder.title',        descKey: 'home.tools.qrDecoder.desc',        category: 'marketing' },
  { route: '/qr-creator',     icon: QrCode,          titleKey: 'home.tools.qrCreator.title',       descKey: 'home.tools.qrCreator.desc',       category: 'marketing' },
  { route: '/url-parser',      icon: Globe,           titleKey: 'home.tools.urlParser.title',       descKey: 'home.tools.urlParser.desc',       category: 'marketing' },
  { route: '/favicon',         icon: Compass,         titleKey: 'home.tools.favicon.title',          descKey: 'home.tools.favicon.desc',          category: 'marketing' },
  // Images
  { route: '/mockup',          icon: Smartphone,      titleKey: 'home.tools.mockupGenerator.title', descKey: 'home.tools.mockupGenerator.desc', category: 'images'    },
  { route: '/image-compressor',icon: FileDown,        titleKey: 'home.tools.imageCompressor.title',  descKey: 'home.tools.imageCompressor.desc',  category: 'images'    },
  { route: '/image-cropper',   icon: Crop,            titleKey: 'home.tools.imageCropper.title',     descKey: 'home.tools.imageCropper.desc',     category: 'images'    },
  { route: '/image-resizer',   icon: Maximize,        titleKey: 'home.tools.imageResizer.title',     descKey: 'home.tools.imageResizer.desc',     category: 'images'    },
  { route: '/image-filters',   icon: Sparkles,        titleKey: 'home.tools.imageFilters.title',     descKey: 'home.tools.imageFilters.desc',     category: 'images'    },
  { route: '/image-converter', icon: Repeat,          titleKey: 'home.tools.imageConverter.title',   descKey: 'home.tools.imageConverter.desc',   category: 'images'    },
  { route: '/placeholder',     icon: ImagePlus,       titleKey: 'home.tools.placeholder.title',      descKey: 'home.tools.placeholder.desc',      category: 'images'    },
  { route: '/matte-generator', icon: Square,          titleKey: 'home.tools.matteGenerator.title',   descKey: 'home.tools.matteGenerator.desc',   category: 'images'    },
  { route: '/metadata',        icon: Info,            titleKey: 'home.tools.metadata.title',         descKey: 'home.tools.metadata.desc',         category: 'images'    },
  { route: '/gemini-watermark',icon: Sparkles,        titleKey: 'home.tools.geminiWatermark.title',  descKey: 'home.tools.geminiWatermark.desc',  category: 'images'    },
  // Couleurs
  { route: '/color-palette',   icon: Palette,         titleKey: 'home.tools.colorPalette.title',    descKey: 'home.tools.colorPalette.desc',    category: 'couleurs'  },
  { route: '/color-converter', icon: Pipette,         titleKey: 'home.tools.colorConverter.title',   descKey: 'home.tools.colorConverter.desc',   category: 'couleurs'  },
  { route: '/contrast-checker',icon: Eye,             titleKey: 'home.tools.contrastChecker.title',  descKey: 'home.tools.contrastChecker.desc',  category: 'couleurs'  },
  { route: '/colorblind',      icon: Eye,             titleKey: 'home.tools.colorblind.title',       descKey: 'home.tools.colorblind.desc',       category: 'couleurs'  },
  { route: '/palette',         icon: Palette,         titleKey: 'home.tools.palette.title',          descKey: 'home.tools.palette.desc',          category: 'couleurs'  },
  // Contenu
  { route: '/word-counter',    icon: FileText,        titleKey: 'home.tools.wordCounter.title',     descKey: 'home.tools.wordCounter.desc',     category: 'contenu'   },
  { route: '/type-scale',      icon: Type,            titleKey: 'home.tools.typeScale.title',       descKey: 'home.tools.typeScale.desc',       category: 'contenu'   },
  { route: '/px-to-rem',       icon: Ruler,           titleKey: 'home.tools.pxToRem.title',        descKey: 'home.tools.pxToRem.desc',        category: 'contenu'   },
  { route: '/lorem',           icon: AlignLeft,       titleKey: 'home.tools.lorem.title',            descKey: 'home.tools.lorem.desc',            category: 'contenu'   },
  { route: '/random-hex',     icon: Hash,           titleKey: 'home.tools.randomHex.title',     descKey: 'home.tools.randomHex.desc',     category: 'contenu'   },
]

const DEFAULT_TOP_ROUTES = ['/qr-decoder', '/utm-builder', '/promo-code', '/type-scale']
const TOP_COUNT = 4

const topTools = computed<Tool[]>(() => {
  const byRoute = new Map(allTools.map(tool => [tool.route, tool]))
  const ordered: Tool[] = []
  const seen = new Set<string>()
  for (const route of recentRoutes.value) {
    const tool = byRoute.get(route)
    if (tool && !seen.has(route)) {
      ordered.push(tool)
      seen.add(route)
      if (ordered.length === TOP_COUNT) return ordered
    }
  }
  // Backfill with defaults so the section is never empty / under-filled
  for (const route of DEFAULT_TOP_ROUTES) {
    if (ordered.length === TOP_COUNT) break
    const tool = byRoute.get(route)
    if (tool && !seen.has(route)) {
      ordered.push(tool)
      seen.add(route)
    }
  }
  return ordered
})

const toolsByCategory = computed((): Record<ContentCategory, Tool[]> => ({
  print:     allTools.filter(tool => tool.category === 'print'),
  marketing: allTools.filter(tool => tool.category === 'marketing'),
  images:    allTools.filter(tool => tool.category === 'images'),
  couleurs:  allTools.filter(tool => tool.category === 'couleurs'),
  contenu:   allTools.filter(tool => tool.category === 'contenu'),
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

function scrollToBrowse() {
  const el = document.getElementById('browse')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<style scoped>
/* =============================================
   LAYOUT
   ============================================= */
.home-wrap {
  width: 100%;
}

.home-section-inner {
  max-width: var(--gi-container-hero);
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* =============================================
   HERO
   ============================================= */
.home-hero {
  width: 100%;
  padding: 5rem 1.5rem 4.5rem;
  text-align: center;
  border-bottom: 1px solid var(--gi-border);
  background: #F7F6F3;
}

.home-hero-inner {
  max-width: 640px;
  margin: 0 auto;
}

.home-hero-title {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: clamp(2.25rem, 4vw, 3.25rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--gi-text);
  margin: 0 0 1rem;
  line-height: 1.1;
}

.home-hero-tagline {
  font-size: 1.05rem;
  font-weight: 600;
  color: #0D0D0C;
  margin-bottom: 1rem;
  line-height: 1.55;
}

.home-hero-body {
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-muted);
  line-height: 1.7;
  margin: 0 auto 2rem;
  max-width: 52ch;
}

.home-hero-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.home-hero-cta {
  font-size: var(--gi-font-size-md);
  padding: 0.7rem 1.5rem;
}

.home-hero-link {
  font-size: var(--gi-font-size-sm);
  font-weight: 500;
  color: var(--gi-text-muted);
  text-decoration: none;
  transition: color var(--gi-transition-fast);
}

.home-hero-link:hover {
  color: #0D0D0C;
}

/* =============================================
   TOP TOOLS
   ============================================= */
.home-top {
  width: 100%;
  background: #F7F6F3;
  border-bottom: 1px solid var(--gi-border);
  padding: 2.5rem 0;
}

.home-top-header {
  margin-bottom: 1.25rem;
}

.home-top-title {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: var(--gi-text);
  letter-spacing: -0.01em;
  margin: 0 0 0.2rem;
}

.home-top-subtitle {
  font-size: var(--gi-font-size-xs);
  color: var(--gi-text-muted);
  margin: 0;
}

.home-top-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--gi-grid-gap);
}

.home-card--top {
  background: #F7F6F3;
  border-color: transparent;
}

.home-card--top:hover {
  background: #FFFFFF;
  border-color: #5E5D55;
}

/* =============================================
   BROWSE
   ============================================= */
.home-browse {
  width: 100%;
  padding: 3rem 0 5rem;
}

.home-browse-intro {
  text-align: center;
  margin-bottom: 2rem;
}

.home-browse-intro h2 {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.4rem;
  letter-spacing: -0.01em;
}

.home-browse-intro p {
  color: var(--gi-text-muted);
  font-size: 0.95rem;
}

/* Underline tabs */
.home-tab-bar {
  display: flex;
  border-bottom: 1px solid #DBDAD7;
  background: #F7F6F3;
  position: sticky;
  top: 56px;
  z-index: 40;
  overflow-x: auto;
  scrollbar-width: none;
  gap: 0;
  padding: 0;
  margin-bottom: var(--gi-space-xl);
  transition: box-shadow var(--gi-transition-fast) var(--gi-ease-out);
}

.home-tab-bar::-webkit-scrollbar {
  display: none;
}

.home-tab-bar--scrolled {
  box-shadow: var(--gi-shadow-sm);
}

.home-tab {
  padding: 10px 18px;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  background: none;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  color: #5E5D55;
  cursor: pointer;
  white-space: nowrap;
  border-radius: 0;
  transition: color 0.15s, border-color 0.15s;
}

.home-tab:hover {
  color: #0D0D0C;
}

.home-tab.active,
.home-tab[aria-selected="true"] {
  color: #0D0D0C;
  font-weight: 700;
  border-bottom-color: #0D0D0C;
  background: none;
  box-shadow: none;
}

/* Category section header */
.home-cat-header {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #5E5D55;
  margin: 2.5rem 0 1rem;
  padding-bottom: 10px;
  border-bottom: 1px solid #DBDAD7;
}

/* Card grid */
.home-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--gi-grid-gap);
}

.home-grid--mt {
  margin-top: var(--gi-space-lg);
}

@media (max-width: 1024px) {
  .home-grid,
  .home-top-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 720px) {
  .home-grid,
  .home-top-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .home-grid,
  .home-top-grid {
    grid-template-columns: 1fr;
  }
}

/* No results */
.home-no-results {
  color: var(--gi-text-muted);
  font-size: var(--gi-font-size-sm);
  padding: 2rem 0;
}

/* =============================================
   TOOL CARDS
   ============================================= */
.home-icon-box {
  width: 36px;
  height: 36px;
  background: #F7F6F3;
  border: 1px solid #DBDAD7;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5E5D55;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  flex-shrink: 0;
  margin-bottom: var(--gi-space-sm);
}

.home-card {
  display: flex;
  flex-direction: column;
  padding: var(--gi-space-xl);
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
  text-decoration: none;
  color: inherit;
  transition: all var(--gi-transition-base) var(--gi-ease-out);
  min-height: var(--gi-card-min-height);
  box-shadow: var(--gi-shadow-sm);
  cursor: pointer;
}

.home-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--gi-shadow-lg);
  border-color: #5E5D55;
}

.home-card:hover .home-icon-box {
  background: #FCF758;
  border-color: #FCF758;
  color: #0D0D0C;
}

.home-card:hover .home-card-title {
  color: #0D0D0C;
}

.home-card:active {
  transform: scale(0.98);
}

.home-card:focus-visible {
  outline: 2px solid #0D0D0C;
  outline-offset: 2px;
}

[data-theme="dark"] .home-card:hover {
  box-shadow: var(--gi-shadow-md);
  border-color: #5E5D55;
}


.home-card-title {
  font-size: var(--gi-font-size-lg);
  font-weight: 600;
  line-height: 1.3;
  color: var(--gi-text);
  margin-bottom: var(--gi-space-sm);
  transition: color var(--gi-transition-fast);
}

.home-card-desc {
  font-size: var(--gi-font-size-xs);
  color: var(--gi-text-muted);
  line-height: 1.5;
  flex: 1;
  margin-bottom: var(--gi-space-md);
}

.home-card-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: var(--gi-font-size-xs);
  font-weight: 500;
  color: #5E5D55;
  background: var(--gi-brand-fade);
  padding: 0.4rem 0.75rem;
  border-radius: var(--gi-radius-sm);
  margin-top: auto;
  width: fit-content;
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
}

.home-card:hover .home-card-cta {
  color: #0D0D0C;
  background: var(--gi-brand-fade);
}

/* =============================================
   BACK TO TOP
   ============================================= */
.home-back-to-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0D0D0C;
  color: #FFFFFF;
  border: none;
  border-radius: var(--gi-radius-pill);
  box-shadow: var(--gi-shadow-lg);
  cursor: pointer;
  z-index: 50;
  opacity: 0;
  transform: translateY(8px);
  transition: all var(--gi-transition-base) var(--gi-ease-out);
  pointer-events: none;
}

.home-back-to-top.visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.home-back-to-top:hover {
  background: #5E5D55;
  transform: translateY(-2px);
}

.home-back-to-top:active {
  transform: scale(0.95);
}

.home-back-to-top:focus-visible {
  outline: 2px solid #0D0D0C;
  outline-offset: 2px;
}

@media (max-width: 768px) {
  .home-hero {
    padding: 3.5rem 1.5rem 3rem;
  }

  .home-back-to-top {
    bottom: 1.25rem;
    right: 1.25rem;
    width: 44px;
    height: 44px;
  }
}
</style>
