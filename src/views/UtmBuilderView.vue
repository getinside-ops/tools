<template>
  <div>
    <router-link to="/" class="gi-back-link">{{ t('nav.back') }}</router-link>
    <div class="gi-tool-header">
      <h1>{{ t('utmBuilder.title') }}</h1>
      <p>{{ t('utmBuilder.desc') }}</p>
    </div>

    <div class="gi-field">
      <label class="gi-label">{{ t('utmBuilder.destinationUrl') }}</label>
      <input v-model="url" type="url" placeholder="https://example.com/page" class="gi-input" />
    </div>
    <div class="gi-field">
      <label class="gi-label">{{ t('utmBuilder.source') }}</label>
      <input v-model="source" list="source-list" class="gi-input" />
      <datalist id="source-list">
        <option value="sponsored-mail" />
        <option value="dedicated-email" />
        <option value="display-email" />
        <option value="social-ads" />
      </datalist>
    </div>
    <div class="gi-field">
      <label class="gi-label">{{ t('utmBuilder.medium') }}</label>
      <input v-model="medium" list="medium-list" class="gi-input" />
      <datalist id="medium-list">
        <option value="insert" />
        <option value="email" />
        <option value="display" />
        <option value="social" />
      </datalist>
    </div>
    <div class="gi-field">
      <label class="gi-label">
        {{ t('utmBuilder.campaign') }}
        <span class="gi-optional">({{ t('utmBuilder.optional') }})</span>
      </label>
      <input v-model="campaign" class="gi-input" />
    </div>
    <div class="gi-field">
      <label class="gi-label">
        {{ t('utmBuilder.content') }}
        <span class="gi-optional">({{ t('utmBuilder.optional') }})</span>
      </label>
      <input v-model="content" class="gi-input" />
    </div>
    <div class="gi-field">
      <label class="gi-label">
        {{ t('utmBuilder.term') }}
        <span class="gi-optional">({{ t('utmBuilder.optional') }})</span>
      </label>
      <input v-model="term" class="gi-input" />
    </div>

    <div class="gi-result">
      <div class="gi-result-label">{{ t('utmBuilder.result') }}</div>
      <div v-if="urlError" style="color: var(--gi-tint-red-text)">
        {{ t('utmBuilder.invalidUrl') }}
      </div>
      <div v-else-if="!generatedUrl" style="color: var(--gi-text-muted); font-size: 0.9rem">
        {{ t('utmBuilder.fillRequired') }}
      </div>
      <div v-else>
        <p class="gi-code">{{ generatedUrl }}</p>
        <button class="gi-btn" style="margin-top:0.75rem" @click="copy">
          {{ copied ? t('utmBuilder.copied') : t('utmBuilder.copy') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { buildUtmUrl } from '../composables/useUtmBuilder'

const { t } = useI18n()

const url = ref('')
const source = ref('')
const medium = ref('')
const campaign = ref('')
const content = ref('')
const term = ref('')
const copied = ref(false)
const urlError = ref(false)

const generatedUrl = computed(() => {
  if (!url.value || !source.value || !medium.value) return ''
  try {
    urlError.value = false
    return buildUtmUrl({
      url: url.value,
      source: source.value,
      medium: medium.value,
      campaign: campaign.value || undefined,
      content: content.value || undefined,
      term: term.value || undefined,
    })
  } catch {
    urlError.value = true
    return ''
  }
})

async function copy() {
  if (!generatedUrl.value) return
  await navigator.clipboard.writeText(generatedUrl.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<style scoped>
.gi-back-link {
  display: inline-flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0.3rem 0.75rem;
  border: 1.5px solid var(--gi-border);
  border-radius: var(--gi-radius);
  font-size: 0.85rem;
  color: var(--gi-text-muted);
  text-decoration: none;
  transition: border-color 0.12s, color 0.12s;
}
.gi-back-link:hover { border-color: var(--gi-brand); color: var(--gi-brand); }
</style>
