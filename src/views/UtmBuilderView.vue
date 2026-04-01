<template>
  <ToolPageLayout
    :title="t('utmBuilder.title')"
    :description="t('utmBuilder.desc')"
  >
    <template #icon>
      <Link />
    </template>

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
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Link } from 'lucide-vue-next'
import ToolPageLayout from '../components/ToolPageLayout.vue'
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
