import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomeView },
    // Existing main branch tools
    { path: '/paper-weight', component: () => import('../views/PaperWeightView.vue') },
    { path: '/utm-builder', component: () => import('../views/UtmBuilderView.vue') },
    { path: '/dpi-checker', component: () => import('../views/DpiCheckerView.vue') },
    { path: '/redirect-checker', component: () => import('../views/RedirectCheckerView.vue') },
    { path: '/promo-code', component: () => import('../views/PromoCodeView.vue') },
    { path: '/word-counter', component: () => import('../views/WordCounterView.vue') },
    { path: '/color-palette', component: () => import('../views/ColorPaletteView.vue') },
    { path: '/color-palette-fullscreen', component: () => import('../views/ColorPaletteFullscreenView.vue') },
    { path: '/mockup', component: () => import('../views/MockupGeneratorView.vue') },
    
    // Batch 1 & 2 tools
    { path: '/url-parser', component: () => import('../views/UrlParserView.vue') },
    { path: '/px-to-rem', component: () => import('../views/PxToRemView.vue') },
    { path: '/type-scale', component: () => import('../views/TypeScaleView.vue') },
    { path: '/contrast-checker', component: () => import('../views/ContrastCheckerView.vue') },
    { path: '/color-converter', component: () => import('../views/ColorConverterView.vue') },
    { path: '/image-compressor', component: () => import('../views/ImageCompressorView.vue') },
    { path: '/image-cropper', component: () => import('../views/ImageCropperView.vue') },
    { path: '/image-resizer', component: () => import('../views/ImageResizerView.vue') },
    { path: '/image-filters', component: () => import('../views/ImageFiltersView.vue') },
    { path: '/placeholder', component: () => import('../views/PlaceholderView.vue') },
    { path: '/matte-generator', component: () => import('../views/MatteGeneratorView.vue') },
    { path: '/favicon', component: () => import('../views/FaviconView.vue') },
    { path: '/lorem', component: () => import('../views/LoremIpsumView.vue') },
    { path: '/barcode', component: () => import('../views/BarcodeView.vue') },
    { path: '/safety-margin', component: () => import('../views/SafetyMarginView.vue') },
    { path: '/image-converter', component: () => import('../views/ImageConverterView.vue') },
    { path: '/metadata', component: () => import('../views/MetadataView.vue') },
    { path: '/colorblind', component: () => import('../views/ColorblindView.vue') },
    { path: '/qr-decoder', component: () => import('../views/QrDecoderView.vue') },
    { path: '/palette', component: () => import('../views/PaletteView.vue') },
    { path: '/gemini-watermark', component: () => import('../views/GeminiWatermarkView.vue') },
  ],
})

export default router
