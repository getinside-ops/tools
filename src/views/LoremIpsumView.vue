<template>
  <div>
    <div class="gi-tool-header">
      <h1>{{ t('lorem.title') }}</h1>
      <p>{{ t('lorem.desc') }}</p>
    </div>

    <div class="gi-grid">
      <!-- Controls -->
      <div class="gi-field">
        <div class="gi-label">{{ t('lorem.type') }}</div>
        <div class="mode-toggle">
          <button 
            class="gi-btn-ghost" 
            :class="{ active: mode === 'paragraphs' }"
            @click="mode = 'paragraphs'"
          >
            {{ t('lorem.modeParagraphs') }}
          </button>
          <button 
            class="gi-btn-ghost" 
            :class="{ active: mode === 'words' }"
            @click="mode = 'words'"
          >
            {{ t('lorem.modeWords') }}
          </button>
        </div>

        <div v-if="mode === 'paragraphs'" class="gi-field">
          <label class="gi-label">{{ t('lorem.paragraphs') }}</label>
          <input v-model.number="paragraphs" type="number" class="gi-input" min="1" max="50" />
        </div>

        <div v-else class="gi-field">
          <label class="gi-label">{{ t('lorem.words') }}</label>
          <input v-model.number="words" type="number" class="gi-input" min="1" max="1000" />
        </div>

        <div class="gi-field">
          <label class="checkbox-label">
            <input v-model="startWithLorem" type="checkbox" />
            <span>{{ t('lorem.startWithLorem') }}</span>
          </label>
        </div>

        <button class="gi-btn" style="width: 100%" @click="generate">
          {{ t('lorem.generate') }}
        </button>
      </div>

      <!-- Result Area -->
      <div class="gi-result" style="margin-top: 0">
        <div class="gi-result-header">
          <div class="gi-result-label">Output</div>
          <button class="gi-btn-ghost" @click="copy">
            {{ copied ? t('utmBuilder.copied') : t('lorem.copy') }}
          </button>
        </div>
        <div class="lorem-output">
          {{ result }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { generateLorem } from '../composables/useLoremIpsum'

const { t } = useI18n()

const mode = ref<'paragraphs' | 'words'>('paragraphs')
const paragraphs = ref(3)
const words = ref(50)
const startWithLorem = ref(true)
const result = ref('')
const copied = ref(false)

function generate() {
  result.value = generateLorem({
    paragraphs: mode.value === 'paragraphs' ? paragraphs.value : undefined,
    words: mode.value === 'words' ? words.value : undefined,
    startWithLorem: startWithLorem.value
  })
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
.mode-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  background: var(--gi-surface-2);
  padding: 0.25rem;
  border-radius: var(--gi-radius);
}
.mode-toggle button {
  flex: 1;
  padding: 0.4rem;
  font-size: 0.85rem;
}
.mode-toggle button.active {
  background: var(--gi-surface);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  color: var(--gi-brand);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.lorem-output {
  white-space: pre-wrap;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--gi-text);
  max-height: 400px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.gi-result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
</style>
