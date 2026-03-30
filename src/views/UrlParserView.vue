<template>
  <div>
    <div class="gi-tool-header">
      <h1>{{ t('urlParser.title') }}</h1>
      <p>{{ t('urlParser.desc') }}</p>
    </div>

    <div class="gi-field">
      <label class="gi-label">{{ t('urlParser.label') }}</label>
      <input
        v-model="urlInput"
        type="url"
        :placeholder="t('urlParser.placeholder')"
        class="gi-input"
        @input="handleInput"
      />
    </div>

    <div v-if="parsedUrl" class="gi-result">
      <div class="gi-result-label">{{ t('urlParser.result') }}</div>
      
      <div style="margin-bottom: 1.5rem">
        <h3 class="gi-label" style="margin-bottom: 0.5rem">{{ t('urlParser.components') }}</h3>
        <table class="gi-table">
          <thead>
            <tr>
              <th>{{ t('urlParser.keys.protocol') }}</th>
              <th>{{ t('urlParser.keys.hostname') }}</th>
              <th>{{ t('urlParser.keys.port') }}</th>
              <th>{{ t('urlParser.keys.pathname') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ parsedUrl.protocol }}</td>
              <td>{{ parsedUrl.hostname }}</td>
              <td>{{ parsedUrl.port || '-' }}</td>
              <td>{{ parsedUrl.pathname }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="margin-bottom: 1rem">
        <h3 class="gi-label" style="margin-bottom: 0.5rem">{{ t('urlParser.parameters') }}</h3>
        <div v-if="Object.keys(parsedUrl.params).length > 0">
          <table class="gi-table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(value, key) in parsedUrl.params" :key="key">
                <td class="gi-code" style="padding: 0.2rem 0.5rem; background: none; border-bottom: none">{{ key }}</td>
                <td>{{ value }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else style="color: var(--gi-text-muted); font-size: 0.9rem">{{ t('urlParser.noParams') }}</p>
      </div>

      <div v-if="parsedUrl.hash" style="margin-top: 1rem">
        <h3 class="gi-label" style="margin-bottom: 0.5rem">{{ t('urlParser.keys.hash') }}</h3>
        <p class="gi-code">{{ parsedUrl.hash }}</p>
      </div>
    </div>

    <div v-if="error" class="gi-result" style="border-color: var(--gi-tint-red-border)">
      <p style="color: var(--gi-tint-red-text)">{{ t('utmBuilder.invalidUrl') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { parseUrl, type ParsedUrl } from '../composables/useUrlParser'

const { t } = useI18n()

const urlInput = ref('')
const error = ref(false)

const parsedUrl = computed<ParsedUrl | null>(() => {
  if (!urlInput.value) return null
  try {
    error.value = false
    return parseUrl(urlInput.value)
  } catch {
    error.value = true
    return null
  }
})

function handleInput() {
  if (!urlInput.value) {
    error.value = false
  }
}
</script>
