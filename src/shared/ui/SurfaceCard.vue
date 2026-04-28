<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <section class="surface-card">
    <header class="surface-header">
      <div>
        <h3>{{ title }}</h3>
        <p v-if="description">{{ description }}</p>
      </div>
    </header>

    <div class="surface-body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.surface-card {
  padding: 20px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #dbe4f0;
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.06);
}

.surface-header h3 {
  color: #0f172a;
  font-size: 1rem;
  font-weight: 800;
}

.surface-header p {
  margin-top: 6px;
  color: #64748b;
  font-size: 0.9rem;
}

.surface-body {
  margin-top: 16px;
}
</style>
