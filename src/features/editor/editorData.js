function createSet(index) {
  const id = `set-${index + 1}`

  return {
    id,
    nickname: '',
    oneLineText: '',
    backgroundImage: '',
    backgroundImageName: '',
    profileImage: '',
    profileImageName: '',
    frameImage: '',
    frameImageName: '',
    comments: [],
  }
}

export function createInitialSets(count = 4) {
  return Array.from({ length: count }, (_, index) => createSet(index))
}

export function createNextSet(index) {
  return createSet(index)
}

export function formatClock(date) {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
}
