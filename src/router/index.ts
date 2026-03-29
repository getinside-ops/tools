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
    { path: '/word-counter', component: () => import('../views/WordCounterView.vue') },
    { path: '/color-palette', component: () => import('../views/ColorPaletteView.vue') },
    { path: '/mockup', component: () => import('../views/MockupGeneratorView.vue') },
    // { path: '/pdf-x', component: () => import('../views/PdfXView.vue') }, // coming soon
  ],
})

export default router
