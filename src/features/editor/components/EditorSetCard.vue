<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  set: {
    type: Object,
    required: true,
  },
  frameTime: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  isLastOdd: {
    type: Boolean,
    default: false,
  },
  activeCommentText: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['select-set', 'edit-request', 'update-set-field', 'update-frame-time'])

const nicknameInputRef = ref(null)
const captionInputRef = ref(null)
const timeInputRef = ref(null)

const displayNickname = computed(() => props.set.nickname || '이름 없음')
function focusInlineField(field) {
  if (field === 'nickname') {
    nicknameInputRef.value?.focus?.()
    nicknameInputRef.value?.select?.()
  } else if (field === 'oneLineText') {
    captionInputRef.value?.focus?.()
    captionInputRef.value?.select?.()
  } else if (field === 'frameTime') {
    timeInputRef.value?.focus?.()
    timeInputRef.value?.select?.()
  }
}

defineExpose({
  focusInlineField,
})
</script>

<template>
  <article class="set-card" :class="{ active: isActive, 'is-last-odd': isLastOdd }">
    <div
      class="frame-surface"
      role="button"
      tabindex="0"
      @click="$emit('select-set', set.id)"
      @dblclick.stop.prevent="$emit('edit-request', { id: set.id, target: 'backgroundImage' })"
    >
      <div
        v-if="set.backgroundImage"
        class="background-image-wrap"
        @dblclick.stop.prevent="$emit('edit-request', { id: set.id, target: 'backgroundImage' })"
      >
        <img class="background-image" :src="set.backgroundImage" :alt="`${displayNickname} 배경`" />
      </div>
      <div
        v-else
        class="background-placeholder"
        @dblclick.stop.prevent="$emit('edit-request', { id: set.id, target: 'backgroundImage' })"
      >
        배경 이미지 없음
      </div>

      <div
        v-if="set.frameImage"
        class="frame-image-wrap"
        @dblclick.stop.prevent="$emit('edit-request', { id: set.id, target: 'frameImage' })"
      >
        <img class="frame-image" :src="set.frameImage" :alt="`${displayNickname} 컷 이미지`" />
      </div>
      <div
        v-else
        class="frame-placeholder"
        @dblclick.stop.prevent="$emit('edit-request', { id: set.id, target: 'frameImage' })"
      >
        컷 이미지 없음
      </div>

      <div class="overlay" />

      <div class="topbar">
        <div class="identity">
          <div
            v-if="set.profileImage"
            class="avatar-wrap"
            @dblclick.stop.prevent="$emit('edit-request', { id: set.id, target: 'profileImage' })"
          >
            <img class="avatar" :src="set.profileImage" :alt="displayNickname" />
          </div>
          <div
            v-else
            class="avatar-placeholder"
            @dblclick.stop.prevent="$emit('edit-request', { id: set.id, target: 'profileImage' })"
          >
            없음
          </div>

          <input
            ref="nicknameInputRef"
            class="inline-input inline-nickname"
            :value="set.nickname"
            placeholder="이름 없음"
            @dblclick.stop.prevent="focusInlineField('nickname')"
            @click.stop
            @input="$emit('update-set-field', { id: set.id, key: 'nickname', value: $event.target.value })"
          />
        </div>

        <div class="actions">
          <span class="badge">공유</span>
          <span class="icon" aria-hidden="true">↗</span>
          <span class="icon" aria-hidden="true">♡</span>
        </div>
      </div>

      <div class="center-copy">
        <div
          class="time-field"
          @click.stop="focusInlineField('frameTime')"
          @dblclick.stop.prevent="focusInlineField('frameTime')"
        >
          <input
            ref="timeInputRef"
            class="inline-input inline-time"
            type="text"
            inputmode="numeric"
            maxlength="2"
            autocomplete="off"
            spellcheck="false"
            :value="frameTime"
            placeholder="12"
            @input="$emit('update-frame-time', $event.target.value)"
            @blur="$emit('update-frame-time', $event.target.value, true)"
          />
          <span class="time-suffix">:00</span>
        </div>
        <textarea
          ref="captionInputRef"
          class="inline-input inline-caption"
          :value="set.oneLineText"
          placeholder="한 줄 텍스트를 입력하세요"
          rows="2"
          @dblclick.stop.prevent="focusInlineField('oneLineText')"
          @click.stop
          @input="$emit('update-set-field', { id: set.id, key: 'oneLineText', value: $event.target.value })"
        />
      </div>

      <div class="comment-stack" v-if="set.comments?.length">
        <div v-for="comment in set.comments.slice(0, 3)" :key="comment.id" class="comment-chip">
          <span class="comment-author">{{ comment.authorName || '작성자' }}</span>
          <span class="comment-body">{{ comment.body }}</span>
        </div>
      </div>

      <div class="edit-hint">더블클릭으로 편집</div>
    </div>
  </article>
</template>

<style scoped>
.set-card {
  display: flex;
  justify-content: center;
  width: 100%;
}

.frame-surface {
  position: relative;
  display: block;
  width: min(30vw, 100%);
  padding: 0;
  border: 0;
  cursor: pointer;
  overflow: hidden;
  border-radius: 30px;
  background: #0f172a;
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.14);
  aspect-ratio: 16 / 9;
}

.frame-surface:focus {
  outline: none;
}

.set-card.active .frame-surface {
  box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.16), 0 18px 42px rgba(15, 23, 42, 0.14);
}

.background-image-wrap,
.frame-image-wrap {
  width: 100%;
  height: 100%;
}

.background-image,
.frame-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.background-image {
  filter: saturate(0.95) brightness(0.88);
}

.background-placeholder,
.frame-placeholder {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  color: #94a3b8;
  background: linear-gradient(180deg, #ffffff, #f8fbff);
  font-weight: 700;
}

.background-placeholder {
  color: #64748b;
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.08), transparent 35%),
    linear-gradient(180deg, #eef4ff, #f8fbff);
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.18), rgba(15, 23, 42, 0.36));
}

.topbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 16px 18px;
}

.identity {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  color: #ffffff;
  font-weight: 700;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.85);
}

.avatar-wrap {
  width: 40px;
  height: 40px;
}

.inline-input {
  border: 0;
  outline: none;
  color: #ffffff;
  background: transparent;
  text-shadow: 0 6px 20px rgba(15, 23, 42, 0.36);
  white-space: nowrap;
}

.inline-input::placeholder {
  color: rgba(255, 255, 255, 0.64);
}

.inline-nickname {
  min-width: 0;
  width: clamp(92px, 9vw, 160px);
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.2;
}

.avatar-placeholder {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.74);
  border: 2px dashed rgba(255, 255, 255, 0.5);
  font-size: 0.72rem;
}

.actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #ffffff;
}

.badge,
.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.1);
}

.badge {
  padding: 0 12px;
  min-width: auto;
  background: #22c55e;
  border-color: transparent;
  font-size: 0.78rem;
  font-weight: 800;
}

.center-copy {
  position: absolute;
  inset: 50% 18px auto;
  transform: translateY(-20%);
  text-align: center;
  color: #ffffff;
  text-shadow: 0 6px 20px rgba(15, 23, 42, 0.36);
}

.time-field {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: fit-content;
  margin: 0 auto;
  white-space: nowrap;
}

.inline-time {
  width: 52px;
  padding: 0;
  border: 0;
  color: #ffffff;
  background: transparent;
  text-align: center;
  font-size: clamp(1.85rem, 3.4vw, 3.1rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.05em;
  caret-color: #ffffff;
  font-variant-numeric: tabular-nums;
}

.time-suffix {
  font-size: clamp(1.1rem, 2vw, 1.5rem);
  font-weight: 800;
  line-height: 1;
  color: #ffffff;
}

.inline-caption {
  display: block;
  margin: 8px auto 0;
  width: min(100%, 86%);
  resize: none;
  text-align: center;
  font-size: clamp(0.92rem, 1.6vw, 1.25rem);
  font-weight: 600;
  line-height: 1.35;
}

.comment-stack {
  position: absolute;
  left: 16px;
  bottom: 16px;
  display: grid;
  gap: 6px;
  max-width: calc(100% - 32px);
  text-align: left;
}

.comment-chip {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  width: fit-content;
  max-width: 100%;
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.62);
  color: #ffffff;
  backdrop-filter: blur(6px);
}

.comment-author {
  font-weight: 800;
  font-size: 0.76rem;
}

.comment-body {
  font-size: 0.76rem;
  line-height: 1.25;
  opacity: 0.92;
}

.edit-hint {
  position: absolute;
  right: 14px;
  bottom: 14px;
  z-index: 2;
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.5);
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  opacity: 0;
  transform: translateY(4px);
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
  pointer-events: none;
}

.frame-surface:hover .edit-hint,
.frame-surface:focus-within .edit-hint,
.frame-surface:focus .edit-hint {
  opacity: 1;
  transform: translateY(0);
}
</style>
