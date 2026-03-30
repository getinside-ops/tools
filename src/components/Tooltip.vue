<template>
  <div class="gi-tooltip-wrapper">
    <div
      ref="triggerRef"
      class="gi-tooltip-trigger"
      @mouseenter="show = true"
      @mouseleave="show = false"
      @focus="show = true"
      @blur="show = false"
      tabindex="0"
      role="button"
      aria-haspopup="tooltip"
      :aria-expanded="show"
    >
      <slot name="trigger">
        <Info class="gi-tooltip-icon" />
      </slot>
    </div>
    <Teleport to="body">
      <Transition name="gi-tooltip-fade">
        <div
          v-if="show"
          class="gi-tooltip"
          :style="tooltipStyle"
          role="tooltip"
          @mouseenter="show = true"
          @mouseleave="show = false"
        >
          <slot>{{ content }}</slot>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Info } from 'lucide-vue-next'

const props = defineProps<{
  content?: string
}>()

const show = ref(false)
const triggerRef = ref<HTMLElement | null>(null)

const tooltipStyle = computed(() => {
  if (!triggerRef.value) return {}
  const rect = triggerRef.value.getBoundingClientRect()
  return {
    top: `${rect.bottom + 8}px`,
    left: `${rect.left + rect.width / 2}px`,
    transform: 'translateX(-50%)',
  }
})
</script>

<style scoped>
.gi-tooltip-wrapper {
  display: inline-block;
  position: relative;
}

.gi-tooltip-trigger {
  cursor: help;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.gi-tooltip-trigger:hover,
.gi-tooltip-trigger:focus {
  background-color: var(--gi-tint-green-light);
}

.gi-tooltip-icon {
  width: 14px;
  height: 14px;
  color: var(--gi-text-muted);
}

.gi-tooltip {
  position: fixed;
  z-index: 9999;
  max-width: 280px;
  padding: 0.75rem 1rem;
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--gi-text);
  text-align: left;
  white-space: normal;
}

.gi-tooltip-fade-enter-active,
.gi-tooltip-fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.gi-tooltip-fade-enter-from,
.gi-tooltip-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-4px);
}
</style>
