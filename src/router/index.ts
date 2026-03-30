import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory('/tools/'),
  routes: [
    { path: '/', component: HomeView },
    { path: '/paper-weight', component: () => import('../views/PaperWeightView.vue') },
    { path: '/utm-builder', component: () => import('../views/UtmBuilderView.vue') },
    { path: '/dpi-checker', component: () => import('../views/DpiCheckerView.vue') },
    { path: '/redirect-checker', component: () => import('../views/RedirectCheckerView.vue') },
    { path: '/promo-code', component: () => import('../views/PromoCodeView.vue') },
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
    // { path: '/pdf-x', component: () => import('../views/PdfXView.vue') }, // coming soon
  ],
})

export default router
