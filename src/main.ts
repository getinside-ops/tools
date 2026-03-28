import { createApp } from 'vue'
import './assets/styles/global.css'
import App from './App.vue'
import router from './router'
import { createI18n } from 'vue-i18n'
import fr from './i18n/fr'
import en from './i18n/en'

const savedLocale = localStorage.getItem('gi-locale')
const browserLocale = navigator.language.startsWith('fr') ? 'fr' : 'en'
const locale = (savedLocale === 'fr' || savedLocale === 'en') ? savedLocale : browserLocale

const i18n = createI18n({
  locale,
  fallbackLocale: 'en',
  messages: { fr, en },
  legacy: false,
})

createApp(App)
  .use(router)
  .use(i18n)
  .mount('#app')
