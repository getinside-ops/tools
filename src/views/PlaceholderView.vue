<template>
  <ToolPageLayout :title="t('placeholder.title')" :subtitle="t('placeholder.desc')" category="design">
    <template #icon>
      <Image />
    </template>

    <div class="gi-grid">
      <!-- Controls -->
      <div class="gi-field">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <GiFormField
            :label="t('placeholder.width')"
            v-model.number="width"
            type="number"
          />
          <GiFormField
            :label="t('placeholder.height')"
            v-model.number="height"
            type="number"
          />
        </div>

        <GiFormField
          :label="t('placeholder.text')"
          v-model="text"
          type="text"
          :placeholder="`${width} x ${height}`"
        />

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <GiFormField :label="t('placeholder.bgColor')">
            <template #input>
              <div style="display: flex; gap: 0.5rem">
                <input v-model="bgColor" type="color" class="gi-input" style="width: 50px; padding: 2px" />
                <input v-model="bgColor" type="text" class="gi-input" style="flex: 1" />
              </div>
            </template>
          </GiFormField>
          <GiFormField :label="t('placeholder.textColor')">
            <template #input>
              <div style="display: flex; gap: 0.5rem">
                <input v-model="textColor" type="color" class="gi-input" style="width: 50px; padding: 2px" />
                <input v-model="textColor" type="text" class="gi-input" style="flex: 1" />
              </div>
            </template>
          </GiFormField>
        </div>

        <div style="display: flex; gap: 1rem; margin-top: 1rem">
          <button class="gi-btn-primary" style="flex: 1" @click="download('png')">⬇️ PNG</button>
          <button class="gi-btn-ghost" @click="download('svg')">⬇️ SVG</button>
        </div>
      </div>

      <!-- Preview -->
      <GiResultCard :title="t('placeholder.preview')" style="margin-top: 0">
        <div
          style="background: var(--gi-bg-soft); border-radius: var(--gi-radius); overflow: auto; display: flex; justify-content: center; align-items: center; min-height: 300px; padding: 2rem;"
        >
          <div v-html="svgCode" style="box-shadow: 0 10px 30px rgba(0,0,0,0.1); line-height: 0;"></div>
        </div>
      </GiResultCard>
    </div>

    <template #about>{{ t('placeholder.about') }}</template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Image } from 'lucide-vue-next'
import ToolPageLayout from '../components/ToolPageLayout.vue'
import GiFormField from '../components/GiFormField.vue'
import GiResultCard from '../components/GiResultCard.vue'
import { generatePlaceholderSvg, getPlaceholderDataUrl } from '../composables/usePlaceholder'

const { t } = useI18n()

const width = ref(800)
const height = ref(450)
const text = ref('')
const bgColor = ref('#cccccc')
const textColor = ref('#333333')

const svgCode = computed(() => generatePlaceholderSvg({
  width: width.value,
  height: height.value,
  text: text.value,
  bgColor: bgColor.value,
  textColor: textColor.value
}))

function download(format: 'png' | 'svg') {
  if (format === 'svg') {
    const blob = new Blob([svgCode.value], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `placeholder-${width.value}x${height.value}.svg`
    link.click()
    URL.revokeObjectURL(url)
  } else {
    // PNG via Canvas
    const img = new window.Image()
    const svgUrl = getPlaceholderDataUrl({
      width: width.value,
      height: height.value,
      text: text.value,
      bgColor: bgColor.value,
      textColor: textColor.value
    })

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = width.value
      canvas.height = height.value
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0)
      const pngUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = pngUrl
      link.download = `placeholder-${width.value}x${height.value}.png`
      link.click()
    }
    img.src = svgUrl
  }
}
</script>
