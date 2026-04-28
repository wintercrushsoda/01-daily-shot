<script setup>
import { computed, nextTick, ref } from 'vue'
import SurfaceCard from '../../../shared/ui/SurfaceCard.vue'
import CustomDropdown from './CustomDropdown.vue'

const props = defineProps({
  sets: {
    type: Array,
    required: true,
  },
  activeSet: {
    type: Object,
    default: null,
  },
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
  sidebarDock: {
    type: String,
    required: true,
  },
  setCount: {
    type: Number,
    required: true,
  },
  commentSourceId: {
    type: String,
    required: true,
  },
  commentTargetId: {
    type: String,
    required: true,
  },
  commentDraft: {
    type: String,
    required: true,
  },
})

const emit = defineEmits([
  'update:frame-title',
  'update:frame-note',
  'update:frame-time',
  'update-set-count',
  'add-set',
  'remove-set',
  'select-set',
  'update-set-field',
  'update-set-media',
  'move-set',
  'update-comment-source',
  'update-comment-target',
  'update-comment-draft',
  'add-comment',
  'download',
  'preview',
  'dock-left',
  'dock-right',
])

const activeProfileLabel = computed(() => props.activeSet?.profileImageName || '선택된 파일이 없습니다')
const activeBackgroundLabel = computed(() => props.activeSet?.backgroundImageName || '선택된 파일이 없습니다')
const activeFrameLabel = computed(() => props.activeSet?.frameImageName || '선택된 파일이 없습니다')

function getSetLabel(set, index) {
  return set.nickname?.trim() ? set.nickname : `세트 ${index + 1}`
}

function getSetSummaryLabel(set, index) {
  const name = getSetLabel(set, index)
  const message = set.oneLineText?.trim() || '한줄 메세지가 없습니다'
  return `${name} / ${message}`
}

const dockOptions = [
  { label: '왼쪽 고정', value: 'left', description: '사이드바를 왼쪽에 둡니다.' },
  { label: '오른쪽 고정', value: 'right', description: '사이드바를 오른쪽에 둡니다.' },
]

const setOptions = computed(() =>
  props.sets.map((set, index) => ({
    label: getSetSummaryLabel(set, index),
    value: set.id,
    description: '편집할 세트를 선택합니다.',
  })),
)

const commentAuthorOptions = computed(() =>
  props.sets.map((set, index) => ({
    label: getSetSummaryLabel(set, index),
    value: set.id,
    description: '댓글을 작성할 세트를 선택합니다.',
  })),
)

const commentTargetOptions = computed(() =>
  props.sets.map((set, index) => ({
    label: getSetSummaryLabel(set, index),
    value: set.id,
    description: '댓글을 받을 세트를 선택합니다.',
  })),
)

function clampCount(value) {
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed)) return props.setCount
  return Math.max(1, Math.min(12, parsed))
}

function handleCountInput(event) {
  emit('update-set-count', clampCount(event.target.value))
}

const nicknameInputRef = ref(null)
const textInputRef = ref(null)
const profileInputRef = ref(null)
const backgroundInputRef = ref(null)
const frameInputRef = ref(null)
let pendingMediaTargetId = ''

async function focusField(field) {
  await nextTick()

  if (field === 'nickname') {
    nicknameInputRef.value?.focus?.()
    nicknameInputRef.value?.select?.()
  } else if (field === 'oneLineText') {
    textInputRef.value?.focus?.()
    textInputRef.value?.select?.()
  }
}

async function openMediaPicker(kind, setId) {
  pendingMediaTargetId = setId || props.activeSet?.id || ''
  await nextTick()

  if (kind === 'profile') {
    profileInputRef.value?.click?.()
  } else if (kind === 'background') {
    backgroundInputRef.value?.click?.()
  } else if (kind === 'frame') {
    frameInputRef.value?.click?.()
  }
}

defineExpose({
  focusField,
  openMediaPicker,
})

function emitMedia(kind, file) {
  const targetId = pendingMediaTargetId || props.activeSet?.id
  if (file && targetId) {
    emit('update-set-media', { id: targetId, kind, file })
  }
  pendingMediaTargetId = ''
}

function handleMediaSelect(kind, event) {
  const file = event.target.files?.[0]
  emitMedia(kind, file)
  event.target.value = ''
}

function handleDrop(kind, event) {
  const file = event.dataTransfer.files?.[0]
  emitMedia(kind, file)
}

function handleReorder(event, toId) {
  event.preventDefault()
  const fromId = event.dataTransfer.getData('text/plain')
  if (fromId) emit('move-set', { fromId, toId })
}

function handleDragStart(event, id) {
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', id)
}

function setDock(value) {
  emit(value === 'left' ? 'dock-left' : 'dock-right')
}
</script>

<template>
  <aside class="sidebar">
    <SurfaceCard title="프레임 컨트롤" description="공통으로 적용될 값과 전체 배치 옵션을 관리합니다.">
      <div class="control-stack">
        <CustomDropdown
          label="사이드바 위치"
          :model-value="sidebarDock"
          :options="dockOptions"
          help-text="에디터 도구를 왼쪽 또는 오른쪽에 고정합니다."
          @update:modelValue="setDock"
        />

        <label class="field">
          <span>프레임 제목</span>
          <input type="text" :value="frameTitle" @input="$emit('update:frame-title', $event.target.value)" />
        </label>

        <label class="field">
          <span>프레임 설명</span>
          <textarea rows="3" :value="frameNote" @input="$emit('update:frame-note', $event.target.value)" />
        </label>

        <label class="field">
          <span>공유 시각</span>
          <input
            type="text"
            inputmode="numeric"
            maxlength="2"
            autocomplete="off"
            spellcheck="false"
            :value="frameTime"
            placeholder="12"
            @input="$emit('update:frame-time', $event.target.value)"
            @blur="$emit('update:frame-time', $event.target.value, true)"
          />
        </label>

        <div class="counter-row">
          <button type="button" class="counter-button" @click="$emit('remove-set')">-</button>
          <input
            class="count-input"
            type="number"
            min="1"
            max="12"
            :value="setCount"
            @input="handleCountInput"
          />
          <button type="button" class="counter-button" @click="$emit('add-set')">+</button>
        </div>

        <div class="hint-box">
          <strong>배치 안내</strong>
          <span>세트가 4개 이하면 세로로 쌓이고, 5개 이상이면 2열로 정렬됩니다.</span>
        </div>
      </div>
    </SurfaceCard>

    <SurfaceCard title="세트 목록" description="드래그해서 순서를 바꿀 수 있습니다.">
      <div class="control-stack">
        <CustomDropdown
          label="활성 세트"
          :model-value="activeSet?.id ?? ''"
          :options="setOptions"
          help-text="지금 편집할 세트를 고릅니다."
          @update:modelValue="$emit('select-set', $event)"
        />

        <div class="chip-list">
          <button
            v-for="set in sets"
            :key="set.id"
            type="button"
            class="chip"
            :class="{ active: set.id === activeSet?.id }"
            draggable="true"
            @dragstart="handleDragStart($event, set.id)"
            @dragover.prevent
            @drop="handleReorder($event, set.id)"
            @click="$emit('select-set', set.id)"
          >
            <span v-if="set.profileImage" class="chip-image-wrap">
              <img :src="set.profileImage" :alt="set.nickname || `세트 ${set.id}`" />
            </span>
            <span v-else class="chip-image-fallback">없음</span>
            <span>{{ getSetSummaryLabel(set, props.sets.findIndex((item) => item.id === set.id)) }}</span>
            <small>순서 {{ props.sets.findIndex((item) => item.id === set.id) + 1 }}</small>
          </button>
        </div>
      </div>
    </SurfaceCard>

    <SurfaceCard
      v-if="activeSet"
      title="세트 편집"
      description="닉네임과 텍스트는 카드 안에서 바로 수정됩니다. 이미지는 더블클릭으로 교체할 수 있습니다."
    >
      <div class="control-stack">
        <label class="field">
          <span>닉네임</span>
          <input
            ref="nicknameInputRef"
            type="text"
            :value="activeSet.nickname"
            @input="$emit('update-set-field', { id: activeSet.id, key: 'nickname', value: $event.target.value })"
          />
        </label>

        <label class="field">
          <span>한 줄 텍스트</span>
          <textarea
            ref="textInputRef"
            rows="3"
            :value="activeSet.oneLineText"
            @input="$emit('update-set-field', { id: activeSet.id, key: 'oneLineText', value: $event.target.value })"
          />
        </label>

        <label class="dropzone" @dragover.prevent @drop.prevent="handleDrop('background', $event)">
          <input
            ref="backgroundInputRef"
            type="file"
            accept="image/*"
            @change="handleMediaSelect('background', $event)"
          />
          <strong>배경 이미지</strong>
          <span>{{ activeBackgroundLabel }}</span>
          <small>배경으로 사용할 이미지를 넣습니다.</small>
        </label>

        <label class="dropzone" @dragover.prevent @drop.prevent="handleDrop('profile', $event)">
          <input
            ref="profileInputRef"
            type="file"
            accept="image/*"
            @change="handleMediaSelect('profile', $event)"
          />
          <strong>프로필 이미지</strong>
          <span>{{ activeProfileLabel }}</span>
          <small>프로필 이미지를 업로드하거나 드래그해 넣을 수 있습니다.</small>
        </label>

        <label class="dropzone" @dragover.prevent @drop.prevent="handleDrop('frame', $event)">
          <input ref="frameInputRef" type="file" accept="image/*" @change="handleMediaSelect('frame', $event)" />
          <strong>컷 이미지</strong>
          <span>{{ activeFrameLabel }}</span>
          <small>프레임에 들어갈 메인 이미지를 넣습니다.</small>
        </label>
      </div>
    </SurfaceCard>

    <SurfaceCard title="댓글 연결" description="어느 세트가 어느 세트에 댓글을 남길지 정합니다.">
      <div class="control-stack">
        <CustomDropdown
          label="댓글 작성 세트"
          :model-value="commentSourceId"
          :options="commentAuthorOptions"
          help-text="댓글을 작성할 세트를 선택합니다."
          @update:modelValue="$emit('update-comment-source', $event)"
        />

        <CustomDropdown
          label="댓글 대상 세트"
          :model-value="commentTargetId"
          :options="commentTargetOptions"
          help-text="댓글을 받을 세트를 선택합니다."
          @update:modelValue="$emit('update-comment-target', $event)"
        />

        <label class="field">
          <span>댓글 내용</span>
          <textarea
            rows="4"
            :value="commentDraft"
            placeholder="댓글 내용을 입력하세요"
            @input="$emit('update-comment-draft', $event.target.value)"
          />
        </label>

        <button type="button" class="primary-button" @click="$emit('add-comment')">
          댓글 추가
        </button>
      </div>
    </SurfaceCard>

    <SurfaceCard title="미리보기와 저장" description="현재 화면을 그대로 확인하고 이미지로 저장합니다.">
      <div class="preview-actions">
        <button type="button" class="ghost-button" @click="$emit('preview')">미리보기</button>
        <button type="button" class="download-button" @click="$emit('download')">PNG 저장</button>
      </div>
    </SurfaceCard>
  </aside>
</template>

<style scoped>
.sidebar {
  display: grid;
  gap: 16px;
}

.control-stack {
  display: grid;
  gap: 12px;
}

.field,
.hint-box {
  display: grid;
  gap: 8px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #f8fbff;
}

.field span,
.hint-box strong {
  color: #64748b;
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.hint-box span {
  color: #0f172a;
  font-size: 0.94rem;
  line-height: 1.5;
}

.field input,
.field textarea,
.count-input {
  width: 100%;
  border: 1px solid #d7e0ec;
  border-radius: 14px;
  background: #ffffff;
  padding: 12px 13px;
  color: #0f172a;
  outline: none;
}

.field textarea {
  resize: vertical;
}

.field input:focus,
.field textarea:focus,
.count-input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.14);
}

.counter-row {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 44px;
  gap: 10px;
  align-items: center;
}

.counter-button,
.primary-button,
.download-button,
.ghost-button {
  border: 1px solid transparent;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 700;
}

.counter-button {
  width: 44px;
  height: 44px;
  background: #ffffff;
  border-color: #dbe4f0;
  color: #0f172a;
}

.chip-list {
  display: grid;
  gap: 10px;
}

.chip {
  display: grid;
  grid-template-columns: 40px 1fr auto;
  gap: 12px;
  align-items: center;
  width: 100%;
  padding: 10px 12px;
  text-align: left;
  cursor: grab;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #f8fbff;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.chip img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #dbe4f0;
}

.chip-image-wrap {
  display: inline-flex;
}

.chip-image-fallback {
  display: inline-grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px dashed #cbd5e1;
  color: #94a3b8;
  font-size: 0.72rem;
  background: #ffffff;
}

.chip span {
  color: #0f172a;
  font-weight: 700;
}

.chip small {
  color: #64748b;
}

.chip.active {
  border-color: #60a5fa;
  box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.14);
  transform: translateY(-1px);
}

.dropzone {
  display: grid;
  gap: 6px;
  padding: 14px;
  border-radius: 18px;
  border: 1px dashed #cbd5e1;
  background: #fbfdff;
  cursor: pointer;
}

.dropzone input {
  display: none;
}

.dropzone strong {
  color: #0f172a;
  font-size: 0.94rem;
}

.dropzone span {
  color: #2563eb;
  font-weight: 700;
  word-break: break-all;
}

.dropzone small {
  color: #64748b;
}

.primary-button,
.download-button,
.ghost-button {
  padding: 12px 16px;
}

.ghost-button {
  color: #0f172a;
  background: #f8fbff;
  border-color: #dbe4f0;
}

.primary-button,
.download-button {
  color: #ffffff;
  background: linear-gradient(135deg, #2563eb, #0ea5e9);
}

.preview-actions {
  display: grid;
  gap: 10px;
}
</style>
