function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function wrapText(text, maxChars) {
  const words = String(text ?? '').split(/\s+/).filter(Boolean)
  const lines = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length <= maxChars) {
      current = candidate
    } else {
      if (current) lines.push(current)
      current = word
    }
  }

  if (current) lines.push(current)
  return lines.length > 0 ? lines : ['']
}

function drawRect(lines, { x, y, width, height, fill = '#ffffff', stroke = '#dbe4f0', radius = 30, strokeWidth = 1 }) {
  lines.push(
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`,
  )
}

function drawText(lines, { x, y, value, size, weight = 400, fill = '#0f172a', anchor = 'start' }) {
  if (!String(value ?? '').trim()) return

  lines.push(
    `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${fill}" font-size="${size}" font-family="Arial, sans-serif" font-weight="${weight}">${escapeXml(value)}</text>`,
  )
}

function inlineComputedStyles(sourceNode, targetNode) {
  if (!(sourceNode instanceof Element) || !(targetNode instanceof Element)) return

  const computedStyle = window.getComputedStyle(sourceNode)
  const styleParts = []

  for (const propertyName of Array.from(computedStyle)) {
    styleParts.push(`${propertyName}:${computedStyle.getPropertyValue(propertyName)};`)
  }

  targetNode.setAttribute('style', styleParts.join(''))

  const sourceChildren = Array.from(sourceNode.childNodes)
  const targetChildren = Array.from(targetNode.childNodes)

  sourceChildren.forEach((child, index) => {
    const targetChild = targetChildren[index]
    if (child instanceof Element && targetChild instanceof Element) {
      inlineComputedStyles(child, targetChild)
    }
  })
}

async function serializeElementToSvgString(element, backgroundColor = '#f1f5f9') {
  const rect = element.getBoundingClientRect()
  const clone = element.cloneNode(true)

  inlineComputedStyles(element, clone)

  if (document.fonts?.ready) {
    try {
      await document.fonts.ready
    } catch {
      // Ignore font loading issues and continue with the current layout.
    }
  }

  const serialized = new XMLSerializer().serializeToString(clone)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(rect.width)}" height="${Math.ceil(rect.height)}" viewBox="0 0 ${rect.width} ${rect.height}">
      <foreignObject x="0" y="0" width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width:${rect.width}px;height:${rect.height}px;background:${backgroundColor};">
          ${serialized}
        </div>
      </foreignObject>
    </svg>
  `

  return svg
}

function drawPlaceholderImage(lines, { x, y, width, height, label }) {
  drawRect(lines, {
    x,
    y,
    width,
    height,
    fill: '#f8fbff',
    stroke: '#e2e8f0',
    radius: 26,
  })
  drawText(lines, {
    x: x + width / 2,
    y: y + height / 2 + 5,
    value: label,
    size: 14,
    weight: 700,
    fill: '#94a3b8',
    anchor: 'middle',
  })
}

function drawFrameCard(lines, { set, frameTime, x, y, width, height, isActive }) {
  const frameClipId = `frame-${escapeXml(set.id)}`
  const avatarClipId = `avatar-${escapeXml(set.id)}`
  const normalizedFrameTime = (String(frameTime ?? '12').replace(/\D/g, '').slice(0, 2) || '12').padStart(2, '0')

  drawRect(lines, {
    x,
    y,
    width,
    height,
    fill: '#ffffff',
    stroke: isActive ? '#93c5fd' : '#dbe4f0',
    radius: 30,
    strokeWidth: 1,
  })

  if (set.backgroundImage) {
    lines.push(
      `<defs><clipPath id="${frameClipId}-background"><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="30" /></clipPath></defs>`,
      `<image href="${escapeXml(set.backgroundImage)}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${frameClipId}-background)" />`,
    )
  } else {
    drawRect(lines, {
      x,
      y,
      width,
      height,
      fill: '#f8fbff',
      stroke: 'none',
      radius: 30,
    })
  }

  if (set.frameImage) {
    lines.push(
      `<defs><clipPath id="${frameClipId}"><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="30" /></clipPath></defs>`,
    )
    lines.push(
      `<image href="${escapeXml(set.frameImage)}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${frameClipId})" />`,
    )
  } else {
    drawPlaceholderImage(lines, {
      x: x + 20,
      y: y + 20,
      width: width - 40,
      height: height - 40,
      label: '이미지 없음',
    })
  }

  lines.push(`<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="30" fill="rgba(15,23,42,0.14)" />`)

  const avatarLabel = set.nickname?.trim()?.charAt(0)?.toUpperCase() ?? ' '

  if (set.profileImage) {
    lines.push(
      `<defs><clipPath id="${avatarClipId}"><circle cx="${x + 46}" cy="${y + 46}" r="20" /></clipPath></defs>`,
      `<image href="${escapeXml(set.profileImage)}" x="${x + 26}" y="${y + 26}" width="40" height="40" preserveAspectRatio="xMidYMid slice" clip-path="url(#${avatarClipId})" />`,
      `<circle cx="${x + 46}" cy="${y + 46}" r="20" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="2" />`,
    )
  } else {
    lines.push(
      `<circle cx="${x + 46}" cy="${y + 46}" r="20" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" />`,
    )
    drawText(lines, {
      x: x + 46,
      y: y + 53,
      value: avatarLabel,
      size: 22,
      weight: 800,
      fill: '#ffffff',
      anchor: 'middle',
    })
  }

  drawText(lines, {
    x: x + 78,
    y: y + 45,
    value: set.nickname,
    size: 18,
    weight: 800,
    fill: '#ffffff',
  })
  drawText(lines, {
    x: x + 78,
    y: y + 63,
    value: '댓글',
    size: 13,
    fill: 'rgba(255,255,255,0.74)',
  })

  lines.push(
    `<circle cx="${x + width - 62}" cy="${y + 46}" r="16" fill="rgba(255,255,255,0.08)" />`,
    `<text x="${x + width - 62}" y="${y + 52}" text-anchor="middle" fill="#ffffff" font-size="13" font-family="Arial, sans-serif">↩</text>`,
    `<circle cx="${x + width - 28}" cy="${y + 46}" r="16" fill="rgba(255,255,255,0.08)" />`,
    `<text x="${x + width - 28}" y="${y + 52}" text-anchor="middle" fill="#ffffff" font-size="13" font-family="Arial, sans-serif">♡</text>`,
  )

  const textLines = wrapText(set.oneLineText, 34).slice(0, 2)
  textLines.forEach((line, index) => {
    drawText(lines, {
      x: x + width / 2,
      y: y + 118 + index * 24,
      value: line,
      size: 18,
      weight: 700,
      fill: '#ffffff',
      anchor: 'middle',
    })
  })

  drawText(lines, {
    x: x + width / 2,
    y: y + height - 34,
    value: `${normalizedFrameTime}:00`,
    size: 15,
    weight: 700,
    fill: '#ffffff',
    anchor: 'middle',
  })

  const comments = Array.isArray(set.comments) ? set.comments.slice(0, 3) : []
  if (comments.length > 0) {
    let commentY = y + height - 82
    comments.forEach((comment) => {
      const author = String(comment.authorName ?? '익명').trim() || '익명'
      const body = String(comment.body ?? '').trim()
      if (!body) return

      const text = `${author} ${body}`
      const chipWidth = Math.min(width - 32, Math.max(120, text.length * 7.2 + 28))

      drawRect(lines, {
        x: x + 16,
        y: commentY,
        width: chipWidth,
        height: 30,
        fill: 'rgba(15,23,42,0.62)',
        stroke: 'rgba(255,255,255,0.12)',
        radius: 999,
      })
      drawText(lines, {
        x: x + 26,
        y: commentY + 19,
        value: text,
        size: 12,
        weight: 700,
        fill: '#ffffff',
      })

      commentY -= 36
    })
  }
}

function getCardHeight(width) {
  return Math.round(width * 9 / 16)
}

function getLayout(sets, boardWidth, gap) {
  const isGrid = sets.length >= 5
  const cardWidth = isGrid ? Math.floor((boardWidth - gap) / 2) : boardWidth
  const cardHeight = getCardHeight(cardWidth)
  return { isGrid, cardWidth, cardHeight }
}

export function buildFrameExportSvg({ title, note, frameTime, sets }) {
  const pageWidth = 1440
  const margin = 56
  const gap = 20
  const boardWidth = pageWidth - margin * 2
  const headerHeight = 122
  const startY = margin + headerHeight + 24
  const { isGrid, cardWidth, cardHeight } = getLayout(sets, boardWidth, gap)

  const lines = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${pageWidth}" height="1600" viewBox="0 0 ${pageWidth} 1600">`,
    `<rect x="1" y="1" width="${pageWidth - 2}" height="1598" rx="32" fill="#f1f5f9" stroke="#d946ef" stroke-width="2" />`,
    `<rect x="${margin}" y="${margin}" width="${boardWidth}" height="${headerHeight}" rx="28" fill="#ffffff" stroke="#dbe4f0" />`,
    `<text x="${margin + 24}" y="${margin + 38}" fill="#d946ef" font-size="18" font-family="Arial, sans-serif" font-weight="700">프레임 편집기</text>`,
    `<text x="${margin + 24}" y="${margin + 76}" fill="#0f172a" font-size="30" font-family="Arial, sans-serif" font-weight="800">${escapeXml(title)}</text>`,
    `<text x="${margin + 24}" y="${margin + 104}" fill="#64748b" font-size="15" font-family="Arial, sans-serif">${escapeXml(note)}</text>`,
  ]

  let y = startY

  if (!isGrid) {
    sets.forEach((set, index) => {
      drawFrameCard(lines, {
        set,
        frameTime,
        x: margin,
        y,
        width: cardWidth,
        height: cardHeight,
        isActive: index === 0,
      })
      y += cardHeight + 18
    })
  } else {
    for (let index = 0; index < sets.length; index += 2) {
      const pair = sets.slice(index, index + 2)
      const isLastOddSingle = pair.length === 1 && sets.length % 2 === 1
      const leftX = isLastOddSingle ? margin + Math.floor((boardWidth - cardWidth) / 2) : margin
      const rightX = margin + cardWidth + gap

      drawFrameCard(lines, {
        set: pair[0],
        frameTime,
        x: leftX,
        y,
        width: cardWidth,
        height: cardHeight,
        isActive: index === 0,
      })

      if (pair[1]) {
        drawFrameCard(lines, {
          set: pair[1],
          frameTime,
          x: rightX,
          y,
          width: cardWidth,
          height: cardHeight,
          isActive: false,
        })
      }

      y += cardHeight + 18
    }
  }

  const totalHeight = Math.max(1600, y + 80)
  lines[0] = `<svg xmlns="http://www.w3.org/2000/svg" width="${pageWidth}" height="${totalHeight}" viewBox="0 0 ${pageWidth} ${totalHeight}">`
  lines[1] = `<rect x="1" y="1" width="${pageWidth - 2}" height="${totalHeight - 2}" rx="32" fill="#f1f5f9" stroke="#d946ef" stroke-width="2" />`
  lines.push('</svg>')
  return lines.join('')
}

export async function exportFrameAsPng(payload) {
  const svg = buildFrameExportSvg(payload)
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const objectUrl = URL.createObjectURL(blob)

  try {
    const image = new Image()
    image.decoding = 'async'

    const loadPromise = new Promise((resolve, reject) => {
      image.onload = () => resolve(image)
      image.onerror = reject
    })

    image.src = objectUrl
    await loadPromise

    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight

    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas context unavailable')

    context.drawImage(image, 0, 0)

    return await new Promise((resolve, reject) => {
      canvas.toBlob((result) => {
        if (!result) {
          reject(new Error('PNG export failed'))
          return
        }

        resolve(result)
      }, 'image/png')
    })
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export async function exportElementAsPng(element, { backgroundColor = '#f1f5f9' } = {}) {
  if (!element) {
    throw new Error('Export target not found')
  }

  const svg = await serializeElementToSvgString(element, backgroundColor)
  const blob = new Blob([svg], {
    type: 'image/svg+xml;charset=utf-8',
  })
  const objectUrl = URL.createObjectURL(blob)

  try {
    const image = new Image()
    image.decoding = 'async'

    const loadPromise = new Promise((resolve, reject) => {
      image.onload = () => resolve(image)
      image.onerror = reject
    })

    image.src = objectUrl
    await loadPromise

    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight

    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas context unavailable')

    context.drawImage(image, 0, 0)

    return await new Promise((resolve, reject) => {
      canvas.toBlob((result) => {
        if (!result) {
          reject(new Error('PNG export failed'))
          return
        }

        resolve(result)
      }, 'image/png')
    })
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
