<script setup>
import SurfaceCard from '../../../shared/ui/SurfaceCard.vue'

defineProps({
  currentTime: {
    type: String,
    required: true,
  },
  layoutSummary: {
    type: String,
    required: true,
  },
  setCount: {
    type: Number,
    required: true,
  },
  activeSet: {
    type: Object,
    default: null,
  },
})
</script>

<template>
  <aside class="inspector">
    <SurfaceCard title="규칙 요약" description="배치와 댓글 재사용 원칙을 한눈에 봅니다.">
      <ul class="rule-list">
        <li>{{ layoutSummary }}</li>
        <li>프로필 이미지와 닉네임은 댓글 작성자 정보로 재사용합니다.</li>
        <li>제목과 현재 시각은 프레임 공통 정보로 표기합니다.</li>
      </ul>
    </SurfaceCard>

    <SurfaceCard title="실시간 상태" description="현재 편집 중인 프레임 상태를 보여줍니다.">
      <dl class="status-grid">
        <div>
          <dt>Set count</dt>
          <dd>{{ setCount }}</dd>
        </div>
        <div>
          <dt>Clock</dt>
          <dd>{{ currentTime }}</dd>
        </div>
        <div>
          <dt>Selected user</dt>
          <dd>{{ activeSet?.nickname ?? 'None' }}</dd>
        </div>
      </dl>
    </SurfaceCard>
  </aside>
</template>

<style scoped>
.inspector {
  display: grid;
  gap: 16px;
}

.rule-list {
  display: grid;
  gap: 12px;
  color: #334155;
  padding-left: 18px;
}

.rule-list li {
  line-height: 1.55;
}

.status-grid {
  display: grid;
  gap: 12px;
}

.status-grid div {
  padding: 14px 16px;
  border-radius: 18px;
  background: #f8fbff;
  border: 1px solid #e2e8f0;
}

.status-grid dt {
  color: #64748b;
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.status-grid dd {
  margin-top: 8px;
  color: #0f172a;
  font-weight: 700;
}
</style>
