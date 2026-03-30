<template>
  <div class="gi-url-anatomy">
    <div class="gi-url-example">
      <span class="gi-url-part protocol">https://</span>
      <span class="gi-url-part hostname">example.com</span>
      <span class="gi-url-part port">:8080</span>
      <span class="gi-url-part pathname">/path/to/page</span>
      <span class="gi-url-part search">?search=term</span>
      <span class="gi-url-part hash">#section</span>
    </div>
    <div class="gi-url-labels">
      <div class="gi-url-label">
        <span class="gi-label-line protocol"></span>
        <span>{{ t('urlParser.guide.anatomy.protocol') }}</span>
      </div>
      <div class="gi-url-label">
        <span class="gi-label-line hostname"></span>
        <span>{{ t('urlParser.guide.anatomy.hostname') }}</span>
      </div>
      <div class="gi-url-label">
        <span class="gi-label-line port"></span>
        <span>{{ t('urlParser.guide.anatomy.port') }}</span>
      </div>
      <div class="gi-url-label">
        <span class="gi-label-line pathname"></span>
        <span>{{ t('urlParser.guide.anatomy.pathname') }}</span>
      </div>
      <div class="gi-url-label">
        <span class="gi-label-line search"></span>
        <span>{{ t('urlParser.guide.anatomy.search') }}</span>
      </div>
      <div class="gi-url-label">
        <span class="gi-label-line hash"></span>
        <span>{{ t('urlParser.guide.anatomy.hash') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.gi-url-anatomy {
  background: var(--gi-surface-alt);
  border: 1px solid var(--gi-border);
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1.5rem 0;
}

.gi-url-example {
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.95rem;
  line-height: 2;
  word-break: break-all;
}

.gi-url-part {
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  margin: 0.1rem;
}

.gi-url-part.protocol {
  background: var(--gi-tint-green-light);
  color: var(--gi-tint-green-text);
}

.gi-url-part.hostname {
  background: var(--gi-tint-blue-light);
  color: var(--gi-tint-blue-text);
}

.gi-url-part.port {
  background: var(--gi-tint-yellow-light);
  color: var(--gi-tint-yellow-text);
}

.gi-url-part.pathname {
  background: var(--gi-tint-purple-light);
  color: var(--gi-tint-purple-text);
}

.gi-url-part.search {
  background: var(--gi-tint-orange-light);
  color: var(--gi-tint-orange-text);
}

.gi-url-part.hash {
  background: var(--gi-tint-red-light);
  color: var(--gi-tint-red-text);
}

.gi-url-labels {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--gi-border);
}

.gi-url-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.gi-label-line {
  width: 20px;
  height: 3px;
  border-radius: 2px;
}

.gi-label-line.protocol {
  background: var(--gi-tint-green-text);
}

.gi-label-line.hostname {
  background: var(--gi-tint-blue-text);
}

.gi-label-line.port {
  background: var(--gi-tint-yellow-text);
}

.gi-label-line.pathname {
  background: var(--gi-tint-purple-text);
}

.gi-label-line.search {
  background: var(--gi-tint-orange-text);
}

.gi-label-line.hash {
  background: var(--gi-tint-red-text);
}
</style>
