<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  currentTime: {
    type: String,
    required: true,
  },
  setCount: {
    type: Number,
    required: true,
  },
})

defineEmits(['update:title', 'add-set', 'remove-set', 'download'])
</script>

<template>
  <header class="topbar">
    <div class="heading">
      <p class="eyebrow">White Dashboard Editor</p>
      <input
        class="title-input"
        type="text"
        :value="title"
        @input="$emit('update:title', $event.target.value)"
      />
      <p class="subline">프레임 제목과 현재 시각은 공통 헤더로 노출됩니다.</p>
    </div>

    <div class="controls">
      <div class="time-chip">{{ currentTime }}</div>
      <div class="count-box">
        <span class="count-label">세트 수</span>
        <strong>{{ setCount }}</strong>
      </div>
      <button type="button" class="ghost-button" @click="$emit('download')">이미지 다운로드</button>
      <button type="button" class="ghost-button" @click="$emit('remove-set')">인원 삭제</button>
      <button type="button" class="primary-button" @click="$emit('add-set')">인원 추가</button>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 22px 24px;
  border: 1px solid #dbe4f0;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
}

.heading {
  flex: 1;
  display: grid;
  gap: 10px;
}

.eyebrow {
  color: #2563eb;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.title-input {
  width: min(100%, 520px);
  border: 1px solid #d7e0ec;
  border-radius: 16px;
  padding: 12px 14px;
  color: #0f172a;
  background: #f8fbff;
  outline: none;
  font-size: 1.15rem;
  font-weight: 700;
}

.title-input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.16);
}

.subline {
  color: #64748b;
  font-size: 0.92rem;
}

.controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.time-chip,
.count-box,
.ghost-button,
.primary-button {
  border-radius: 999px;
}

.time-chip {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 14px;
  color: #0f172a;
  background: #e0f2fe;
  border: 1px solid #bae6fd;
  font-size: 0.92rem;
  font-weight: 600;
}

.count-box {
  min-width: 78px;
  padding: 10px 14px;
  color: #0f172a;
  background: #f8fbff;
  border: 1px solid #dbe4f0;
}

.count-label {
  display: block;
  margin-bottom: 6px;
  color: #64748b;
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.count-box strong {
  font-size: 1.2rem;
  font-weight: 800;
}

.ghost-button,
.primary-button {
  border: 1px solid transparent;
  padding: 12px 16px;
  cursor: pointer;
  font-weight: 700;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.ghost-button {
  color: #0f172a;
  background: #f8fbff;
  border-color: #dbe4f0;
}

.primary-button {
  color: #ffffff;
  background: linear-gradient(135deg, #2563eb, #0ea5e9);
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.2);
}

.ghost-button:hover,
.primary-button:hover {
  transform: translateY(-1px);
}

@media (max-width: 720px) {
  .topbar {
    flex-direction: column;
    align-items: stretch;
  }

  .controls {
    justify-content: flex-start;
  }
}
</style>
