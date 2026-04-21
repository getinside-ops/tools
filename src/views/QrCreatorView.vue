<template>
  <ToolPageLayout
    :title="t('qrCreator.title')"
    :description="t('qrCreator.desc')"
    category="digital"
  >
    <template #icon>
      <QrCode :size="24" />
    </template>

    <!-- Content Type Tabs -->
    <div class="gi-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="gi-tab"
        :class="{ 'gi-tab-active': contentType === tab.value }"
        @click="contentType = tab.value"
      >
        <component :is="tab.icon" :size="16" />
        {{ t(tab.label) }}
      </button>
    </div>

    <!-- Content Inputs -->
    <div class="gi-content-section">
      <!-- URL Input -->
      <div v-if="contentType === 'url'" class="gi-input-group">
        <label class="gi-label">{{ t('qrCreator.urlLabel') }}</label>
        <input
          v-model="url"
          type="url"
          class="gi-input"
          :placeholder="t('qrCreator.urlPlaceholder')"
          @input="generate"
        />
      </div>

      <!-- Text Input -->
      <div v-if="contentType === 'text'" class="gi-input-group">
        <label class="gi-label">{{ t('qrCreator.textLabel') }}</label>
        <textarea
          v-model="text"
          class="gi-textarea"
          :placeholder="t('qrCreator.textPlaceholder')"
          rows="4"
          @input="generate"
        ></textarea>
      </div>

      <!-- WiFi Input -->
      <div v-if="contentType === 'wifi'" class="gi-wifi-form">
        <div class="gi-input-group">
          <label class="gi-label">{{ t('qrCreator.wifiSsid') }}</label>
          <input
            v-model="wifi.ssid"
            type="text"
            class="gi-input"
            :placeholder="t('qrCreator.wifiSsidPlaceholder')"
            @input="generate"
          />
        </div>
        <div class="gi-input-group">
          <label class="gi-label">{{ t('qrCreator.wifiPassword') }}</label>
          <input
            v-model="wifi.password"
            type="text"
            class="gi-input"
            :placeholder="t('qrCreator.wifiPasswordPlaceholder')"
            @input="generate"
          />
        </div>
        <div class="gi-input-row">
          <div class="gi-input-group">
            <label class="gi-label">{{ t('qrCreator.wifiEncryption') }}</label>
            <select v-model="wifi.encryption" class="gi-select" @change="generate">
              <option value="WPA">WPA/WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">{{ t('qrCreator.wifiNone') }}</option>
            </select>
          </div>
          <div class="gi-input-group">
            <label class="gi-checkbox-label">
              <input v-model="wifi.hidden" type="checkbox" @change="generate" />
              {{ t('qrCreator.wifiHidden') }}
            </label>
          </div>
        </div>
      </div>

      <!-- vCard Input -->
      <div v-if="contentType === 'vcard'" class="gi-vcard-form">
        <div class="gi-input-row">
          <div class="gi-input-group">
            <label class="gi-label">{{ t('qrCreator.vcardFirstName') }}</label>
            <input v-model="vcard.firstName" type="text" class="gi-input" @input="generate" />
          </div>
          <div class="gi-input-group">
            <label class="gi-label">{{ t('qrCreator.vcardLastName') }}</label>
            <input v-model="vcard.lastName" type="text" class="gi-input" @input="generate" />
          </div>
        </div>
        <div class="gi-input-row">
          <div class="gi-input-group">
            <label class="gi-label">{{ t('qrCreator.vcardPhone') }}</label>
            <input v-model="vcard.phone" type="tel" class="gi-input" @input="generate" />
          </div>
          <div class="gi-input-group">
            <label class="gi-label">{{ t('qrCreator.vcardEmail') }}</label>
            <input v-model="vcard.email" type="email" class="gi-input" @input="generate" />
          </div>
        </div>
        <div class="gi-input-group">
          <label class="gi-label">{{ t('qrCreator.vcardOrg') }}</label>
          <input v-model="vcard.organization" type="text" class="gi-input" @input="generate" />
        </div>
        <div class="gi-input-group">
          <label class="gi-label">{{ t('qrCreator.vcardAddress') }}</label>
          <input v-model="vcard.address" type="text" class="gi-input" @input="generate" />
        </div>
        <div class="gi-input-group">
          <label class="gi-label">{{ t('qrCreator.vcardUrl') }}</label>
          <input v-model="vcard.url" type="url" class="gi-input" @input="generate" />
        </div>
      </div>
    </div>

    <!-- Customization Accordion -->
    <div class="gi-accordion">
      <button class="gi-accordion-header" @click="showOptions = !showOptions">
        <span>{{ t('qrCreator.customization') }}</span>
        <ChevronDown :size="18" :class="{ 'gi-rotate': showOptions }" />
      </button>
      <div v-if="showOptions" class="gi-accordion-content">
        <div class="gi-options-grid">
          <div class="gi-input-group">
            <label class="gi-label">{{ t('qrCreator.size') }}</label>
            <select v-model="options.width" class="gi-select" @change="generate">
              <option :value="128">128 px</option>
              <option :value="256">256 px</option>
              <option :value="384">384 px</option>
              <option :value="512">512 px</option>
            </select>
          </div>
          <div class="gi-input-group">
            <label class="gi-label">{{ t('qrCreator.errorCorrection') }}</label>
            <select v-model="options.errorCorrectionLevel" class="gi-select" @change="generate">
              <option value="L">L (7%)</option>
              <option value="M">M (15%)</option>
              <option value="Q">Q (25%)</option>
              <option value="H">H (30%)</option>
            </select>
          </div>
          <div class="gi-input-group gi-checkbox-group">
            <label class="gi-checkbox-label">
              <input v-model="options.transparentBg" type="checkbox" @change="generate" />
              {{ t('qrCreator.transparentBg') }}
            </label>
          </div>
          <div class="gi-input-group">
            <label class="gi-label">{{ t('qrCreator.fgColor') }}</label>
            <div class="gi-color-input">
              <input v-model="options.colorDark" type="color" @input="generate" />
              <input v-model="options.colorDark" type="text" class="gi-input gi-color-text" @input="generate" />
            </div>
          </div>
          <div class="gi-input-group" :class="{ 'gi-disabled': options.transparentBg }">
            <label class="gi-label">{{ t('qrCreator.bgColor') }}</label>
            <div class="gi-color-input">
              <input v-model="options.colorLight" type="color" :disabled="options.transparentBg" @input="generate" />
              <input v-model="options.colorLight" type="text" class="gi-input gi-color-text" :disabled="options.transparentBg" @input="generate" />
            </div>
          </div>
        </div>

        <div class="gi-shape-section">
          <div class="gi-section-title">{{ t('qrCreator.shape') }}</div>
          <div class="gi-options-grid">
            <div class="gi-input-group">
              <label class="gi-label">{{ t('qrCreator.dotStyle') }}</label>
              <select v-model="options.dotStyle" class="gi-select" @change="generate">
                <option value="square">{{ t('qrCreator.dotSquare') }}</option>
                <option value="dots">{{ t('qrCreator.dotDots') }}</option>
                <option value="rounded">{{ t('qrCreator.dotRounded') }}</option>
                <option value="classy">{{ t('qrCreator.dotClassy') }}</option>
                <option value="classy-rounded">{{ t('qrCreator.dotClassyRounded') }}</option>
                <option value="extra-rounded">{{ t('qrCreator.dotExtraRounded') }}</option>
              </select>
            </div>
            <div class="gi-input-group">
              <label class="gi-label">{{ t('qrCreator.cornerSquareStyle') }}</label>
              <select v-model="options.cornerSquareStyle" class="gi-select" @change="generate">
                <option value="square">{{ t('qrCreator.cornerSquare') }}</option>
                <option value="dot">{{ t('qrCreator.cornerDot') }}</option>
                <option value="extra-rounded">{{ t('qrCreator.cornerExtraRounded') }}</option>
                <option value="none">{{ t('qrCreator.cornerNone') }}</option>
              </select>
            </div>
            <div class="gi-input-group">
              <label class="gi-label">{{ t('qrCreator.cornerDotStyle') }}</label>
              <select v-model="options.cornerDotStyle" class="gi-select" @change="generate">
                <option value="square">{{ t('qrCreator.cornerSquare') }}</option>
                <option value="dot">{{ t('qrCreator.cornerDot') }}</option>
                <option value="none">{{ t('qrCreator.cornerNone') }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="gi-logo-section">
          <div class="gi-input-group">
            <label class="gi-label">{{ t('qrCreator.logo') }}</label>
            <div class="gi-logo-upload" @click="logoInput?.click()">
              <Image :size="20" />
              <span>{{ t('qrCreator.logoUpload') }}</span>
            </div>
            <input ref="logoInput" type="file" accept="image/*" style="display: none" @change="handleLogoUpload" />
          </div>
          <div v-if="options.logoUrl" class="gi-logo-preview">
            <img :src="options.logoUrl" alt="Logo" class="gi-logo-img" />
            <button class="gi-remove-logo" @click="removeLogo">
              <X :size="14" />
            </button>
          </div>
          <div v-if="options.logoUrl" class="gi-logo-options">
            <div class="gi-input-group">
              <label class="gi-label">{{ t('qrCreator.logoWidth') }}</label>
              <input v-model.number="options.logoWidth" type="number" min="10" max="100" class="gi-input gi-sm-input" @input="generate" />
            </div>
            <div class="gi-input-group">
              <label class="gi-label">{{ t('qrCreator.logoHeight') }}</label>
              <input v-model.number="options.logoHeight" type="number" min="10" max="100" class="gi-input gi-sm-input" @input="generate" />
            </div>
            <div class="gi-input-group">
              <label class="gi-label">{{ t('qrCreator.logoMargin') }}</label>
              <input v-model.number="options.logoMargin" type="number" min="0" max="20" class="gi-input gi-sm-input" @input="generate" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview & Actions -->
    <div v-if="qrResult" class="gi-preview-section">
      <div class="gi-qr-preview">
        <img :src="qrResult.dataUrl" alt="QR Code" class="gi-qr-img" />
      </div>
      <div class="gi-actions">
        <button class="gi-btn" @click="downloadPng">
          <Download :size="16" />
          PNG
        </button>
        <button class="gi-btn" @click="downloadSvg">
          <Download :size="16" />
          SVG
        </button>
        <button class="gi-btn" :class="{ 'gi-btn-success': copied }" @click="copyToClipboard">
          <component :is="copied ? Check : Clipboard" :size="16" />
          {{ copied ? t('qrCreator.copied') : t('qrCreator.copy') }}
        </button>
      </div>
    </div>

    <template #about>{{ t('qrCreator.about') }}</template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { QrCode, Link, FileText, Wifi, Contact, Image, Download, Clipboard, ChevronDown, X, Check } from 'lucide-vue-next'
import ToolPageLayout from '../components/ToolPageLayout.vue'
import {
  type QrContentType,
  type WifiData,
  type VCardData,
  type QrOptions,
  getQrData,
  generateQrCode,
  copyToClipboard as copyQrToClipboard,
  copyToClipboardWithBg,
  downloadFile,
  downloadSvg as downloadSvgFile,
} from '../composables/useQrCreator'

const { t } = useI18n()

const tabs = [
  { value: 'url', label: 'qrCreator.tabUrl', icon: Link },
  { value: 'text', label: 'qrCreator.tabText', icon: FileText },
  { value: 'wifi', label: 'qrCreator.tabWifi', icon: Wifi },
  { value: 'vcard', label: 'qrCreator.tabVcard', icon: Contact },
] as const

const contentType = ref<QrContentType>('url')
const url = ref('')
const text = ref('')
const wifi = reactive<WifiData>({
  ssid: '',
  password: '',
  encryption: 'WPA',
  hidden: false,
})
const vcard = reactive<VCardData>({
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  organization: '',
  address: '',
  url: '',
})

const options = reactive<QrOptions>({
  width: 256,
  colorDark: '#000000',
  colorLight: '#ffffff',
  transparentBg: true,
  errorCorrectionLevel: 'M',
  dotStyle: 'square',
  cornerSquareStyle: 'square',
  cornerDotStyle: 'square',
  logoUrl: null,
  logoWidth: 40,
  logoHeight: 40,
  logoMargin: 5,
})

const showOptions = ref(false)
const qrResult = ref<{ dataUrl: string; svg: string; exportDataUrl: string; exportSvg: string } | null>(null)
const copied = ref(false)
const logoInput = ref<HTMLInputElement | null>(null)

function getContent(): string {
  return getQrData(contentType.value, url.value, text.value, wifi, vcard)
}

async function generate() {
  const data = getContent()
  if (!data) {
    qrResult.value = null
    return
  }
  try {
    qrResult.value = await generateQrCode(data, options)
  } catch (err) {
    console.error('QR generation error:', err)
  }
}

watch(contentType, () => {
  generate()
})

function handleLogoUpload(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      options.logoUrl = ev.target?.result as string
      generate()
    }
    reader.readAsDataURL(file)
  }
}

function removeLogo() {
  options.logoUrl = null
  generate()
}

function downloadPng() {
  if (qrResult.value) {
    downloadFile(qrResult.value.exportDataUrl, 'qrcode.png')
  }
}

function downloadSvg() {
  if (qrResult.value) {
    downloadSvgFile(qrResult.value.exportSvg, 'qrcode.svg')
  }
}

async function copyToClipboard() {
  if (qrResult.value) {
    const dataToCopy = options.transparentBg ? qrResult.value.exportDataUrl : qrResult.value.dataUrl
    const success = options.transparentBg
      ? await copyQrToClipboard(dataToCopy)
      : await copyToClipboardWithBg(dataToCopy)
    if (success) {
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    }
  }
}
</script>

<style scoped>
.gi-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.gi-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius);
  background: transparent;
  color: var(--gi-text-muted);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}
.gi-tab:hover {
  border-color: var(--gi-brand);
  color: var(--gi-brand);
}
.gi-tab-active {
  background: var(--gi-brand);
  border-color: var(--gi-brand);
  color: white;
}

.gi-content-section {
  margin-bottom: 1.5rem;
}
.gi-input-group {
  margin-bottom: 1rem;
}
.gi-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gi-text);
  margin-bottom: 0.5rem;
}
.gi-input, .gi-textarea, .gi-select {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius);
  background: var(--gi-surface);
  color: var(--gi-text);
  font-size: 0.9rem;
  font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.gi-input:focus, .gi-textarea:focus, .gi-select:focus {
  outline: none;
  border-color: var(--gi-brand);
  box-shadow: 0 0 0 3px rgba(10, 170, 142, 0.12);
}
.gi-textarea {
  resize: vertical;
}
.gi-input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.gi-checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--gi-text);
  cursor: pointer;
  margin-top: 1.5rem;
}

.gi-accordion {
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius);
  margin-bottom: 1.5rem;
  overflow: hidden;
}
.gi-accordion-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1rem;
  background: var(--gi-surface);
  border: none;
  color: var(--gi-text);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.gi-accordion-header:hover {
  background: var(--gi-tint-green-bg);
}
.gi-accordion-content {
  padding: 1rem;
  border-top: 1px solid var(--gi-border);
  background: var(--gi-bg);
}
.gi-accordion-header svg {
  transition: transform 0.2s;
}
.gi-rotate {
  transform: rotate(180deg);
}

.gi-options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.gi-color-input {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.gi-color-input input[type="color"] {
  width: 40px;
  height: 38px;
  padding: 2px;
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius);
  cursor: pointer;
}
.gi-color-text {
  width: 100px;
}

.gi-logo-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--gi-border);
}
.gi-logo-upload {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 2px dashed var(--gi-border);
  border-radius: var(--gi-radius);
  color: var(--gi-text-muted);
  font-size: 0.875rem;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.gi-logo-upload:hover {
  border-color: var(--gi-brand);
  color: var(--gi-brand);
}
.gi-logo-preview {
  position: relative;
  display: inline-block;
  margin-top: 0.75rem;
}
.gi-logo-img {
  width: 60px;
  height: 60px;
  object-fit: contain;
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius);
}
.gi-remove-logo {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--gi-error);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.gi-logo-options {
  display: flex;
  gap: 1rem;
  margin-top: 0.75rem;
}
.gi-sm-input {
  width: 80px;
}

.gi-preview-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
}
.gi-qr-preview {
  padding: 1.5rem;
  background: white;
  border-radius: var(--gi-radius);
}
.gi-qr-img {
  display: block;
  max-width: 300px;
  width: 100%;
  height: auto;
}
.gi-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}
.gi-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius);
  background: var(--gi-surface);
  color: var(--gi-text);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}
.gi-btn:hover {
  border-color: var(--gi-brand);
  color: var(--gi-brand);
  background: var(--gi-tint-green-bg);
}
.gi-btn-success {
  background: var(--gi-success);
  border-color: var(--gi-success);
  color: white;
}
.gi-btn-success:hover {
  background: var(--gi-success);
  border-color: var(--gi-success);
  color: white;
}
.gi-checkbox-group {
  margin-bottom: 0;
}
.gi-disabled {
  opacity: 0.5;
  pointer-events: none;
}
.gi-shape-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--gi-border);
}
.gi-section-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gi-text);
  margin-bottom: 1rem;
}
</style>
