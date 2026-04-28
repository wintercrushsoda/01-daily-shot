<script setup>
import { ref } from 'vue'
import EditorSetCard from './EditorSetCard.vue'

defineProps({
  frameTitle: {
    type: String,
    required: true,
  },
  frameNote: {
    type: String,
    required: true,
  },
  frameTime: {
    type: String,
    required: true,
  },
  sets: {
    type: Array,
    required: true,
  },
  activeSetId: {
    type: String,
    required: true,
  },
  isGridLayout: {
    type: Boolean,
    required: true,
  },
  isTripleLayout: {
    type: Boolean,
    required: true,
  },
})

defineEmits(['select-set', 'edit-request', 'update-frame-time'])

const captureTargetRef = ref(null)

defineExpose({
  captureTarget: captureTargetRef,
})
</script>

<template>
  <section class="canvas">
    <div
      ref="captureTargetRef"
      class="frame-grid"
      :class="{ grid: isGridLayout, stack: !isGridLayout, three: isTripleLayout }"
    >
      <EditorSetCard
        v-for="(set, index) in sets"
        :key="set.id"
        :set="set"
        :frame-time="frameTime"
        :is-active="set.id === activeSetId"
        :is-last-odd="isGridLayout && sets.length % 2 === 1 && index === sets.length - 1"
        @select-set="$emit('select-set', $event)"
        @edit-request="$emit('edit-request', $event)"
        @update-frame-time="$emit('update-frame-time', $event)"
      />
    </div>
  </section>
</template>

<style scoped>
.canvas {
  display: grid;
  gap: 18px;
  min-width: 0;
}

.frame-grid.stack {
  display: grid;
  gap: 16px;
}

.frame-grid.stack.three {
  justify-items: center;
}

.frame-grid.stack.three :deep(.frame-surface) {
  width: min(30vw, 100%);
  height: auto;
  aspect-ratio: 16 / 9;
}

.frame-grid.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.frame-grid.grid :deep(.set-card.is-last-odd) {
  grid-column: 1 / -1;
  justify-self: center;
  width: min(calc((100% - 16px) / 2), 100%);
}

@media (max-width: 720px) {
  .frame-grid.stack.three {
    justify-items: stretch;
  }

  .frame-grid.stack.three :deep(.frame-surface) {
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 9;
  }

  .frame-grid.grid {
    grid-template-columns: 1fr;
  }

  .frame-grid.grid :deep(.set-card.is-last-odd) {
    grid-column: auto;
    width: 100%;
  }
}
</style>
