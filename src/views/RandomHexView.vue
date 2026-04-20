<template>
  <ToolPageLayout :title="t('randomHex.title')" :description="t('randomHex.desc')" category="design">
    <template #icon>
      <Hash />
    </template>

    <div class="gi-grid">
      <div class="gi-field">
        <GiFormField
          :label="t('randomHex.digits')"
          type="number"
          :model-value="digits"
          @update:model-value="digits = Number($event)"
        />

        <GiFormField
          :label="t('randomHex.count')"
          type="number"
          :model-value="count"
          @update:model-value="count = Number($event)"
        />

        <button class="gi-btn" style="width: 100%" @click="generate">
          {{ t('randomHex.generate') }}
        </button>
      </div>

      <GiResultCard :title="t('randomHex.output')">
        <div class="hex-output">
          {{ result }}
        </div>
        <template #actions>
          <button class="gi-btn-ghost" @click="copy">
            {{ copied ? t('randomHex.copied') : t('randomHex.copy') }}
          </button>
        </template>
      </GiResultCard>
    </div>

    <template #about>{{ t('randomHex.about') }}</template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { generateRandomHex } from '../composables/useRandomHex'
import ToolPageLayout from '../components/ToolPageLayout.vue'
import GiFormField from '../components/GiFormField.vue'
import GiResultCard from '../components/GiResultCard.vue'
import { Hash } from 'lucide-vue-next'

const { t } = useI18n()

const digits = ref(32)
const count = ref(1)
const result = ref('')
const copied = ref(false)

function generate() {
  result.value = generateRandomHex({
    digits: digits.value,
    count: count.value
  }).join('\n')
}

async function copy() {
  await navigator.clipboard.writeText(result.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

onMounted(() => {
  generate()
})
</script>

<style scoped>
.hex-output {
  white-space: pre-wrap;
  font-family: var(--gi-font-mono);
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--gi-text);
  max-height: 400px;
  overflow-y: auto;
  padding-right: 0.5rem;
  word-break: break-all;
}
</style>