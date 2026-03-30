<template>
  <div>
    <div class="gi-home-hero">
      <h1>{{ t('home.title') }}</h1>
      <p>{{ t('home.subtitle') }}</p>
    </div>
    <div class="gi-tools-grid">
      <router-link
        v-for="tool in tools"
        :key="tool.route"
        :to="tool.route"
        class="gi-tool-card"
      >
        <span class="gi-tool-icon">{{ tool.icon }}</span>
        <div>
          <strong>{{ t(tool.titleKey) }}</strong>
          <p>{{ t(tool.descKey) }}</p>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const tools = [
  { route: '/paper-weight', icon: '📦', titleKey: 'home.tools.paperWeight.title', descKey: 'home.tools.paperWeight.desc' },
  { route: '/utm-builder',  icon: '🔗', titleKey: 'home.tools.utmBuilder.title',  descKey: 'home.tools.utmBuilder.desc' },
  { route: '/dpi-checker',  icon: '🖨️', titleKey: 'home.tools.dpiChecker.title',  descKey: 'home.tools.dpiChecker.desc' },
  { route: '/redirect-checker', icon: '↪️', titleKey: 'home.tools.redirectChecker.title', descKey: 'home.tools.redirectChecker.desc' },
  { route: '/promo-code',   icon: '🏷️', titleKey: 'home.tools.promoCode.title',   descKey: 'home.tools.promoCode.desc' },
  { route: '/url-parser',   icon: '🔍', titleKey: 'home.tools.urlParser.title',   descKey: 'home.tools.urlParser.desc' },
  { route: '/px-to-rem',   icon: '📏', titleKey: 'home.tools.pxToRem.title',   descKey: 'home.tools.pxToRem.desc' },
  { route: '/type-scale',   icon: '📐', titleKey: 'home.tools.typeScale.title',   descKey: 'home.tools.typeScale.desc' },
  { route: '/contrast-checker', icon: '🎨', titleKey: 'home.tools.contrastChecker.title', descKey: 'home.tools.contrastChecker.desc' },
  { route: '/color-converter', icon: '🌈', titleKey: 'home.tools.colorConverter.title', descKey: 'home.tools.colorConverter.desc' },
  { route: '/image-compressor', icon: '📉', titleKey: 'home.tools.imageCompressor.title', descKey: 'home.tools.imageCompressor.desc' },
  { route: '/image-cropper', icon: '✂️', titleKey: 'home.tools.imageCropper.title', descKey: 'home.tools.imageCropper.desc' },
  { route: '/image-resizer', icon: '🖼️', titleKey: 'home.tools.imageResizer.title', descKey: 'home.tools.imageResizer.desc' },
  { route: '/image-filters', icon: '✨', titleKey: 'home.tools.imageFilters.title', descKey: 'home.tools.imageFilters.desc' },
  { route: '/placeholder', icon: '🖼️', titleKey: 'home.tools.placeholder.title', descKey: 'home.tools.placeholder.desc' },
  { route: '/matte-generator', icon: '🔳', titleKey: 'home.tools.matteGenerator.title', descKey: 'home.tools.matteGenerator.desc' },
  // { route: '/pdf-x', icon: '🖨️', titleKey: 'home.tools.pdfX.title', descKey: 'home.tools.pdfX.desc' }, // coming soon
]
</script>

<style scoped>
.gi-home-hero { margin-bottom: 2.5rem; }
.gi-home-hero h1 { font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; }
.gi-home-hero p { color: var(--gi-text-muted); font-size: 1.05rem; }

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
}
.gi-tool-card:hover { border-color: var(--gi-brand); box-shadow: var(--gi-shadow); }
.gi-tool-icon { font-size: 1.8rem; line-height: 1; flex-shrink: 0; }
.gi-tool-card strong { display: block; font-weight: 600; margin-bottom: 0.3rem; }
.gi-tool-card p { font-size: 0.875rem; color: var(--gi-text-muted); line-height: 1.5; }
</style>
