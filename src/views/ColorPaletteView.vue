<template>
  <ToolPageLayout
    :title="t('colorPalette.title')"
    :subtitle="t('colorPalette.desc')"
    category="design"
  >
    <template #icon>
      <Palette />
    </template>

    <div class="gi-palette-actions">
      <button class="gi-btn" @click="regenerate">{{ t('colorPalette.generate') }}</button>
      <span class="gi-palette-hint">{{ t('colorPalette.pressSpace') }}</span>
    </div>

    <div class="gi-palette" role="group" :aria-label="t('colorPalette.title')">
      <div
        v-for="(color, i) in palette"
        :key="i"
        class="gi-swatch"
        :class="{ 'gi-swatch--locked': color.locked }"
        :style="{ background: color.hex }"
        :tabindex="0"
        role="button"
        :aria-label="color.locked ? t('colorPalette.unlock') : t('colorPalette.lock')"
        @click="lock(i)"
        @keydown.enter="lock(i)"
        @keydown.space.prevent="lock(i)"
      >
        <div class="gi-swatch-overlay">
          <span class="gi-swatch-lock-icon">
            <LockIcon v-if="color.locked" :size="20" />
            <UnlockIcon v-else :size="20" />
          </span>
          <span class="gi-swatch-lock-label">{{ color.locked ? t('colorPalette.unlock') : t('colorPalette.lock') }}</span>
        </div>
        <div class="gi-swatch-hex" @click.stop="copy(color.hex, i)">
          <span>{{ copiedIndex === i ? t('colorPalette.copied') : color.hex }}</span>
        </div>
      </div>
    </div>

    <!-- Accessibility live region for copy feedback -->
    <div aria-live="polite" aria-atomic="true" class="sr-only">
      <span v-if="copiedIndex !== null">{{ t('colorPalette.copied') }}: {{ palette[copiedIndex]?.hex }}</span>
    </div>

    <template #about>{{ t('colorPalette.about') }}</template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Palette, Lock as LockIcon, Unlock as UnlockIcon } from 'lucide-vue-next'
import ToolPageLayout from '../components/ToolPageLayout.vue'
import { initPalette, generatePalette, toggleLock } from '../composables/useColorPalette'
import type { PaletteColor } from '../composables/useColorPalette'

const { t } = useI18n()
const palette = ref<PaletteColor[]>(initPalette())
const copiedIndex = ref<number | null>(null)

function regenerate() {
  palette.value = generatePalette(palette.value)
}

function lock(index: number) {
  palette.value = toggleLock(palette.value, index)
}

async function copy(hex: string, index: number) {
  try {
    await navigator.clipboard.writeText(hex)
    copiedIndex.value = index
    setTimeout(() => { copiedIndex.value = null }, 2000)
  } catch {
    // clipboard unavailable — silently ignore
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
    e.preventDefault()
    regenerate()
  }
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))
</script>

<style scoped>
.gi-palette-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.gi-palette-hint { font-size: 0.85rem; color: var(--gi-text-muted); }

.gi-palette {
  display: flex;
  gap: 0.5rem;
  border-radius: var(--gi-radius-lg);
  overflow: hidden;
  height: 280px;
}

.gi-swatch {
  flex: 1;
  position: relative;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: flex 0.2s ease;
  border-radius: 8px;
  overflow: hidden;
}
.gi-swatch:hover { flex: 1.4; }
.gi-swatch:active { transform: scale(0.98); }
.gi-swatch:focus-visible {
  outline: 3px solid var(--gi-brand);
  outline-offset: -3px;
  z-index: 1;
}
.gi-swatch--locked { outline: 3px solid rgba(255, 255, 255, 0.4); outline-offset: -3px; }

.gi-swatch-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  opacity: 0;
  transition: opacity 0.15s;
  background: rgba(0,0,0,0.15);
}
.gi-swatch:hover .gi-swatch-overlay { opacity: 1; }
.gi-swatch--locked .gi-swatch-overlay { opacity: 1; }
.gi-swatch-lock-icon { font-size: 1.2rem; }
.gi-swatch-lock-label { font-size: 0.7rem; color: white; margin-top: 0.25rem; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.4); }

.gi-swatch-hex {
  padding: 0.5rem;
  text-align: center;
  background: rgba(0,0,0,0.2);
  backdrop-filter: blur(4px);
  cursor: copy;
}
.gi-swatch-hex span {
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
  letter-spacing: 0.05em;
  font-family: monospace;
}

@media (max-width: 640px) {
  .gi-palette {
    flex-wrap: wrap;
    height: auto;
  }
  .gi-swatch {
    min-height: 100px;
    flex: 1 1 calc(50% - 0.25rem);
  }
}
</style>
