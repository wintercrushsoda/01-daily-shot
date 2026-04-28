<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { createInitialSets, createNextSet } from '../editorData'
import { buildFrameExportSvg, exportElementAsPng, exportFrameAsPng } from '../editorExport'
import EditorSidebar from './EditorSidebar.vue'
import EditorCanvas from './EditorCanvas.vue'

const frameTitle = ref('')
const frameNote = ref('')
const frameTime = ref('12')
const sets = ref(createInitialSets(4))
const activeSetId = ref(sets.value[0]?.id ?? '')
const commentSourceId = ref(sets.value[0]?.id ?? '')
const commentTargetId = ref(sets.value[1]?.id ?? sets.value[0]?.id ?? '')
const commentDraft = ref('')
const sidebarDock = ref('right')
const previewOpen = ref(false)
const previewUrl = ref('')
const canvasRef = ref(null)
const sidebarRef = ref(null)
let nextSetIndex = sets.value.length

const activeSet = computed(() => sets.value.find((set) => set.id === activeSetId.value) ?? sets.value[0] ?? null)
const isGridLayout = computed(() => sets.value.length >= 5)
const isTripleLayout = computed(() => sets.value.length === 3)

function ensureValidSelection() {
  const ids = new Set(sets.value.map((set) => set.id))
  if (!ids.has(activeSetId.value)) activeSetId.value = sets.value[0]?.id ?? ''
  if (!ids.has(commentSourceId.value)) commentSourceId.value = sets.value[0]?.id ?? ''
  if (!ids.has(commentTargetId.value)) commentTargetId.value = sets.value[1]?.id ?? sets.value[0]?.id ?? ''
}

function setSetCount(nextCount) {
  const parsed = Number.parseInt(nextCount, 10)
  if (Number.isNaN(parsed)) return

  const targetCount = Math.max(1, Math.min(12, parsed))
  while (sets.value.length < targetCount) {
    sets.value.push(createNextSet(nextSetIndex))
    nextSetIndex += 1
  }

  while (sets.value.length > targetCount) {
    sets.value.pop()
  }

  ensureValidSelection()
}

function addSet() {
  setSetCount(sets.value.length + 1)
}

function removeSet() {
  setSetCount(sets.value.length - 1)
}

function selectSet(id) {
  activeSetId.value = id
}

async function handleEditRequest({ id, target }) {
  selectSet(id)
  await sidebarRef.value?.focusField?.(target)

  if (target === 'profileImage') {
    await sidebarRef.value?.openMediaPicker?.('profile', id)
  } else if (target === 'backgroundImage') {
    await sidebarRef.value?.openMediaPicker?.('background', id)
  } else if (target === 'frameImage') {
    await sidebarRef.value?.openMediaPicker?.('frame', id)
  }
}

function updateFrameTitle(value) {
  frameTitle.value = value
}

function updateFrameNote(value) {
  frameNote.value = value
}

function updateFrameTime(value, finalize = false) {
  const raw = String(value ?? '')
  const match = raw.match(/\d{1,2}/)

  if (!match) {
    frameTime.value = finalize ? '12' : ''
    return
  }

  const hour = Math.max(0, Math.min(23, Number.parseInt(match[0], 10)))
  frameTime.value = finalize ? String(hour).padStart(2, '0') : String(hour)
}

function updateSetField({ id, key, value }) {
  const target = sets.value.find((set) => set.id === id)
  if (target) target[key] = value
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

async function updateSetMedia({ id, kind, file }) {
  const target = sets.value.find((set) => set.id === id)
  if (!target || !file) return

  const dataUrl = await readFileAsDataUrl(file)
  if (kind === 'profile') {
    target.profileImage = dataUrl
    target.profileImageName = file.name
  } else if (kind === 'background') {
    target.backgroundImage = dataUrl
    target.backgroundImageName = file.name
  } else if (kind === 'frame') {
    target.frameImage = dataUrl
    target.frameImageName = file.name
  }
}

function moveSet({ fromId, toId }) {
  if (fromId === toId) return

  const fromIndex = sets.value.findIndex((set) => set.id === fromId)
  const toIndex = sets.value.findIndex((set) => set.id === toId)
  if (fromIndex < 0 || toIndex < 0) return

  const [moved] = sets.value.splice(fromIndex, 1)
  const insertIndex = fromIndex < toIndex ? toIndex - 1 : toIndex
  sets.value.splice(insertIndex, 0, moved)
}

function updateCommentSource(value) {
  commentSourceId.value = value
}

function updateCommentTarget(value) {
  commentTargetId.value = value
}

function updateCommentDraft(value) {
  commentDraft.value = value
}

function blurActiveElement() {
  const activeElement = document.activeElement
  if (activeElement instanceof HTMLElement) {
    activeElement.blur()
  }
}

function addComment() {
  const source = sets.value.find((set) => set.id === commentSourceId.value)
  const target = sets.value.find((set) => set.id === commentTargetId.value)
  const body = commentDraft.value.trim()

  if (!source || !target || !body) return

  target.comments.unshift({
    id: `${target.id}-${Date.now()}`,
    body,
    authorId: source.id,
    authorName: source.nickname,
    authorImage: source.profileImage,
  })

  commentDraft.value = ''
}

async function openPreview() {
  try {
    blurActiveElement()
    const canvasElement = canvasRef.value?.captureTarget ?? canvasRef.value?.$el ?? null
    const blob = await exportElementAsPng(canvasElement, { backgroundColor: '#f8fafc' })

    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
    }

    previewUrl.value = URL.createObjectURL(blob)
    previewOpen.value = true
  } catch (error) {
    console.error(error)
    const fallbackBlob = await exportFrameAsPng({
      title: frameTitle.value,
      note: frameNote.value,
      frameTime: frameTime.value,
      sets: sets.value,
    })

    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
    }

    previewUrl.value = URL.createObjectURL(fallbackBlob)
    previewOpen.value = true
  }
}

async function downloadFrameImage() {
  try {
    blurActiveElement()
    const canvasElement = canvasRef.value?.captureTarget ?? canvasRef.value?.$el ?? null
    const blob = await exportElementAsPng(canvasElement, { backgroundColor: '#f8fafc' })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${frameTitle.value || 'frame'}.png`
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch (error) {
    console.error(error)
    try {
      const fallbackBlob = await exportFrameAsPng({
        title: frameTitle.value,
        note: frameNote.value,
        frameTime: frameTime.value,
        sets: sets.value,
      })

      const url = URL.createObjectURL(fallbackBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${frameTitle.value || 'frame'}.png`
      link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (fallbackError) {
      console.error(fallbackError)
      window.alert('이미지 저장에 실패했습니다.')
    }
  }
}

onMounted(() => {
  ensureValidSelection()
})

onBeforeUnmount(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})
</script>

<template>
  <div class="workspace-shell" :class="`dock-${sidebarDock}`">
    <main class="workspace-grid">
      <EditorCanvas
        ref="canvasRef"
        class="workspace-canvas"
        :frame-title="frameTitle"
        :frame-note="frameNote"
        :frame-time="frameTime"
        :sets="sets"
        :active-set-id="activeSetId"
        :is-grid-layout="isGridLayout"
        :is-triple-layout="isTripleLayout"
        @select-set="selectSet"
        @edit-request="handleEditRequest"
        @update-frame-time="updateFrameTime"
      />

      <EditorSidebar
        ref="sidebarRef"
        class="workspace-sidebar"
        :sets="sets"
        :active-set="activeSet"
        :frame-title="frameTitle"
        :frame-note="frameNote"
        :frame-time="frameTime"
        :sidebar-dock="sidebarDock"
        :set-count="sets.length"
        :comment-source-id="commentSourceId"
        :comment-target-id="commentTargetId"
        :comment-draft="commentDraft"
        @update:frame-title="updateFrameTitle"
        @update:frame-note="updateFrameNote"
        @update:frame-time="updateFrameTime"
        @update-set-count="setSetCount"
        @add-set="addSet"
        @remove-set="removeSet"
        @select-set="selectSet"
        @update-set-field="updateSetField"
        @update-set-media="updateSetMedia"
        @move-set="moveSet"
        @update-comment-source="updateCommentSource"
        @update-comment-target="updateCommentTarget"
        @update-comment-draft="updateCommentDraft"
        @add-comment="addComment"
        @download="downloadFrameImage"
        @preview="openPreview"
        @dock-left="sidebarDock = 'left'"
        @dock-right="sidebarDock = 'right'"
      />
    </main>

    <div v-if="previewOpen" class="preview-overlay" @click.self="previewOpen = false">
      <div class="preview-modal">
        <header class="preview-modal-head">
          <strong>저장 전 미리보기</strong>
          <button type="button" class="close-button" @click="previewOpen = false">닫기</button>
        </header>
        <img :src="previewUrl" alt="export preview" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.workspace-shell {
  min-height: 100vh;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(56, 189, 248, 0.16), transparent 24%),
    radial-gradient(circle at top right, rgba(249, 115, 22, 0.12), transparent 20%),
    linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.workspace-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 420px);
  gap: 20px;
  align-items: start;
}

.dock-left .workspace-grid {
  grid-template-columns: minmax(360px, 420px) minmax(0, 1fr);
}

.workspace-canvas {
  order: 1;
}

.workspace-sidebar {
  order: 2;
}

.dock-left .workspace-canvas {
  order: 2;
}

.dock-left .workspace-sidebar {
  order: 1;
}

.preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.58);
  display: grid;
  place-items: center;
  padding: 24px;
  z-index: 50;
}

.preview-modal {
  width: min(1100px, 100%);
  max-height: 92vh;
  overflow: auto;
  border-radius: 28px;
  background: #ffffff;
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.3);
}

.preview-modal-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.preview-modal img {
  display: block;
  width: 100%;
  height: auto;
  margin: 0 0 20px;
}

.close-button {
  border: 1px solid #dbe4f0;
  border-radius: 999px;
  background: #f8fbff;
  padding: 10px 14px;
  cursor: pointer;
}

@media (max-width: 1200px) {
  .workspace-grid,
  .dock-left .workspace-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .workspace-shell {
    padding: 16px;
  }
}
</style>
