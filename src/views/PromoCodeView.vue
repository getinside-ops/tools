<template>
  <ToolPageLayout :title="t('promoCode.title')" :description="t('promoCode.desc')" category="digital">
    <template #icon>
      <Tag />
    </template>

    <GiFormField
      :label="t('promoCode.label')"
      v-model="code"
      type="text"
      placeholder="SUMMER25FR"
      class="gi-promo-code-field"
    />

    <template v-if="checks.length">
      <div class="gi-score-bar">
        <span class="gi-score-label">{{ t('promoCode.score') }}</span>
        <span class="gi-score-value" :class="scoreClass">{{ passed }} / {{ checks.length }}</span>
      </div>

      <ul class="gi-checklist">
        <li v-for="check in checks" :key="check.rule" :class="check.pass ? 'gi-check-pass' : 'gi-check-fail'">
          <span class="gi-check-icon">{{ check.pass ? '✓' : '✗' }}</span>
          {{ t(`promoCode.checks.${camelRule(check.rule)}`) }}
        </li>
      </ul>
    </template>
    <template #about>{{ t('promoCode.about') }}</template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Tag } from 'lucide-vue-next'
import { validatePromoCode } from '../composables/usePromoCode'
import ToolPageLayout from '../components/ToolPageLayout.vue'
import GiFormField from '../components/GiFormField.vue'

const { t } = useI18n()
const code = ref('')

const checks = computed(() => validatePromoCode(code.value))
const passed = computed(() => checks.value.filter(c => c.pass).length)
const scoreClass = computed(() => {
  const ratio = passed.value / (checks.value.length || 1)
  if (ratio === 1) return 'gi-score-ok'
  if (ratio >= 0.6) return 'gi-score-warn'
  return 'gi-score-bad'
})

const ruleMap: Record<string, string> = {
  'length': 'length',
  'no-special-chars': 'noSpecialChars',
  'no-spaces': 'noSpaces',
  'no-ambiguous': 'noAmbiguous',
  'uppercase': 'uppercase',
}
function camelRule(rule: string) { return ruleMap[rule] ?? rule }
</script>

<style scoped>
.gi-promo-code-field :deep(.gi-input) {
  font-family: 'Menlo', 'Monaco', monospace;
  font-size: 1.1rem;
  letter-spacing: 0.1em;
}

.gi-score-bar { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
.gi-score-label { font-weight: 600; font-size: 0.9rem; }
.gi-score-value { font-size: 1.4rem; font-weight: 700; }
.gi-score-ok   { color: var(--gi-tint-green-text); }
.gi-score-warn { color: var(--gi-tint-yellow-text); }
.gi-score-bad  { color: var(--gi-tint-red-text); }
.gi-checklist { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
.gi-checklist li { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; padding: 0.5rem 0.75rem; border-radius: var(--gi-radius); }
.gi-check-pass { background: var(--gi-tint-green-bg); color: var(--gi-tint-green-text); }
.gi-check-fail { background: var(--gi-tint-red-bg); color: var(--gi-tint-red-text); }
.gi-check-icon { font-weight: 700; }
</style>
