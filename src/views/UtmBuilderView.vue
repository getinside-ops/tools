<template>
  <ToolPageLayout
    :title="t('utmBuilder.title')"
    :description="t('utmBuilder.desc')"
  >
    <template #icon>
      <Link />
    </template>

    <GiFormField :label="t('utmBuilder.destinationUrl')" type="url" placeholder="https://example.com/page" v-model="url" />
    <GiFormField :label="t('utmBuilder.source')" v-model="source">
      <template #input>
        <input id="source-input" v-model="source" list="source-list" class="gi-input" />
        <datalist id="source-list">
          <option value="sponsored-mail" />
          <option value="dedicated-email" />
          <option value="display-email" />
          <option value="social-ads" />
        </datalist>
      </template>
    </GiFormField>
    <GiFormField :label="t('utmBuilder.medium')" v-model="medium">
      <template #input>
        <input id="medium-input" v-model="medium" list="medium-list" class="gi-input" />
        <datalist id="medium-list">
          <option value="insert" />
          <option value="email" />
          <option value="display" />
          <option value="social" />
        </datalist>
      </template>
    </GiFormField>
    <GiFormField :label="t('utmBuilder.campaign') + ' (' + t('utmBuilder.optional') + ')'" v-model="campaign" />
    <GiFormField :label="t('utmBuilder.content') + ' (' + t('utmBuilder.optional') + ')'" v-model="content" />
    <GiFormField :label="t('utmBuilder.term') + ' (' + t('utmBuilder.optional') + ')'" v-model="term" />

    <GiResultCard :title="t('utmBuilder.result')">
      <div v-if="urlError" style="color: var(--gi-tint-red-text)">
        {{ t('utmBuilder.invalidUrl') }}
      </div>
      <div v-else-if="!generatedUrl" style="color: var(--gi-text-muted); font-size: 0.9rem">
        {{ t('utmBuilder.fillRequired') }}
      </div>
      <p v-else class="gi-code">{{ generatedUrl }}</p>
      <template #actions>
        <button v-if="generatedUrl && !urlError" class="gi-btn" @click="copy">
          {{ copied ? t('utmBuilder.copied') : t('utmBuilder.copy') }}
        </button>
      </template>
    </GiResultCard>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Link } from 'lucide-vue-next'
import ToolPageLayout from '../components/ToolPageLayout.vue'
import GiFormField from '../components/GiFormField.vue'
import GiResultCard from '../components/GiResultCard.vue'
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
