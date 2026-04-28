<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  modelValue: {
    type: String,
    required: true,
  },
  options: {
    type: Array,
    required: true,
  },
  helpText: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const rootRef = ref(null)

const selectedOption = computed(() => props.options.find((option) => option.value === props.modelValue) ?? props.options[0] ?? null)

function selectOption(value) {
  emit('update:modelValue', value)
  isOpen.value = false
}

function onDocumentClick(event) {
  if (!rootRef.value?.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>

<template>
  <div ref="rootRef" class="dropdown">
    <button type="button" class="dropdown-trigger" @click="isOpen = !isOpen">
      <span class="dropdown-label">{{ label }}</span>
      <strong class="dropdown-value">{{ selectedOption?.label }}</strong>
      <small v-if="selectedOption?.description || helpText" class="dropdown-help">
        {{ selectedOption?.description || helpText }}
      </small>
      <span class="dropdown-caret">▾</span>
    </button>

    <div v-if="isOpen" class="dropdown-menu">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="dropdown-item"
        :class="{ active: option.value === modelValue }"
        @click="selectOption(option.value)"
      >
        <strong>{{ option.label }}</strong>
        <span>{{ option.description }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.dropdown {
  position: relative;
}

.dropdown-trigger {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2px 12px;
  align-items: center;
  width: 100%;
  border: 1px solid #d7e0ec;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff, #f8fbff);
  padding: 14px 16px;
  cursor: pointer;
  text-align: left;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.04);
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.dropdown-trigger:hover {
  transform: translateY(-1px);
  border-color: #bfdbfe;
  box-shadow: 0 14px 34px rgba(37, 99, 235, 0.08);
}

.dropdown-label {
  color: #64748b;
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.dropdown-value {
  grid-column: 1;
  color: #0f172a;
  font-size: 0.98rem;
  font-weight: 800;
}

.dropdown-help {
  grid-column: 1;
  color: #94a3b8;
  font-size: 0.84rem;
  line-height: 1.4;
}

.dropdown-caret {
  grid-column: 2;
  grid-row: 1 / span 3;
  align-self: center;
  color: #64748b;
  font-size: 1rem;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 20;
  display: grid;
  gap: 8px;
  padding: 10px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid #dbe4f0;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
}

.dropdown-item {
  display: grid;
  gap: 4px;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #f8fbff;
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease,
    transform 0.18s ease;
}

.dropdown-item:hover {
  transform: translateY(-1px);
  border-color: #bfdbfe;
  background: #eff6ff;
}

.dropdown-item strong {
  color: #0f172a;
  font-size: 0.92rem;
}

.dropdown-item span {
  color: #64748b;
  font-size: 0.84rem;
}

.dropdown-item.active {
  border-color: #93c5fd;
  background: #dbeafe;
}
</style>
