function drawGraphiteStroke(ctx, points, color, size) {
  if (!points || points.length === 0) return

  ctx.save()
  ctx.globalAlpha = 0.55
  ctx.strokeStyle = color || '#252329'
  ctx.lineWidth = (size || 2) * 1.2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)

  for (let i = 1; i < points.length - 1; i++) {
    const mx = (points[i].x + points[i + 1].x) / 2
    const my = (points[i].y + points[i + 1].y) / 2
    ctx.quadraticCurveTo(points[i].x, points[i].y, mx, my)
  }

  if (points.length > 1) {
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y)
  }

  ctx.stroke()

  // Fine graphite grain, positioned consistently along the stroke
  ctx.globalAlpha = 0.12
  ctx.fillStyle = color || '#252329'

  const step = Math.max(2, Math.floor((size || 2) * 1.5))

  for (let i = 0; i < points.length; i += step) {
    const point = points[i]

    for (let j = 0; j < 3; j++) {
      const offsetX = Math.sin(i * 12.9898 + j * 78.233) * size * 0.7
      const offsetY = Math.cos(i * 4.1414 + j * 39.346) * size * 0.7

      ctx.fillRect(
        point.x + offsetX,
        point.y + offsetY,
        0.8,
        0.8
      )
    }
  }

  ctx.restore()
}/**
 * Single source of truth for rendering an individual stroke onto a 2D canvas context.
 * Used for live stroke rendering, overlay shape previews, and full-layer redraws.
 */
export function renderStroke(ctx, stroke) {
  if (!stroke) return

  ctx.save()
  ctx.globalCompositeOperation =
    stroke.tool === 'eraser' ? 'destination-out' : 'source-over'
 ctx.strokeStyle = stroke.color || '#252329'

ctx.globalAlpha =
  stroke.tool === 'highlighter' ? 0.3 :
  stroke.tool === 'pencil' ? 0.55 : 1

ctx.lineWidth =
  stroke.tool === 'highlighter' ? (stroke.size || 2) * 3 :
  stroke.tool === 'pencil' ? (stroke.size || 2) * 1.2 :
  stroke.size || 2
ctx.lineCap = 'round'
ctx.lineJoin = 'round'

if (
  stroke.tool === 'pen' ||
  stroke.tool === 'pencil' ||
  stroke.tool === 'eraser' ||
  stroke.tool === 'highlighter'
) {
  const pts = stroke.points

  if (!pts || pts.length === 0) {
    ctx.restore()
    return
  }

  if (stroke.tool === 'pencil') {
    drawGraphiteStroke(ctx, pts, stroke.color, stroke.size)
  } else if (pts.length === 1) {
    ctx.beginPath()
    ctx.arc(
      pts[0].x,
      pts[0].y,
      Math.max(0.5, (stroke.size || 2) / 2),
      0,
      Math.PI * 2
    )
    ctx.fillStyle =
      stroke.tool === 'eraser' ? 'rgba(0,0,0,1)' : stroke.color || '#252329'
    ctx.fill()
  } else {
    ctx.beginPath()
    ctx.moveTo(pts[0].x, pts[0].y)

    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i].x + pts[i + 1].x) / 2
      const my = (pts[i].y + pts[i + 1].y) / 2
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my)
    }

    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y)
    ctx.stroke()
  }
    if (!pts || pts.length === 0) {
      ctx.restore()
      return
    }

    if (pts.length === 1) {
      ctx.beginPath()
      ctx.arc(
        pts[0].x,
        pts[0].y,
        Math.max(0.5, (stroke.size || 2) / 2),
        0,
        Math.PI * 2
      )
      ctx.fillStyle =
        stroke.tool === 'eraser' ? 'rgba(0,0,0,1)' : stroke.color || '#252329'
      ctx.fill()
    } else {
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i].x + pts[i + 1].x) / 2
        const my = (pts[i].y + pts[i + 1].y) / 2
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my)
      }
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y)
      ctx.stroke()
    }
  } else if (stroke.tool === 'rectangle') {
    ctx.strokeRect(stroke.x, stroke.y, stroke.width, stroke.height)
  } else if (stroke.tool === 'circle') {
    ctx.beginPath()
    const rx = Math.max(0.1, Math.abs(stroke.rx || 0))
    const ry = Math.max(0.1, Math.abs(stroke.ry || 0))
    ctx.ellipse(stroke.cx, stroke.cy, rx, ry, 0, 0, Math.PI * 2)
    ctx.stroke()
  } else if (stroke.tool === 'line') {
    ctx.beginPath()
    ctx.moveTo(stroke.x1, stroke.y1)
    ctx.lineTo(stroke.x2, stroke.y2)
    ctx.stroke()
  } else if (stroke.tool === 'triangle') {
    ctx.beginPath()
    ctx.moveTo((stroke.x1 + stroke.x2) / 2, stroke.y1)
    ctx.lineTo(stroke.x1, stroke.y2)
    ctx.lineTo(stroke.x2, stroke.y2)
    ctx.closePath()
    ctx.stroke()
    } else if (stroke.tool === 'star') {
    const cx = (stroke.x1 + stroke.x2) / 2
    const cy = (stroke.y1 + stroke.y2) / 2
    const outerRadius = Math.min(
      Math.abs(stroke.x2 - stroke.x1),
      Math.abs(stroke.y2 - stroke.y1)
    ) / 2
    const innerRadius = outerRadius * 0.45

    ctx.beginPath()

    for (let i = 0; i < 10; i++) {
      const angle = -Math.PI / 2 + (i * Math.PI) / 5
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      const x = cx + Math.cos(angle) * radius
      const y = cy + Math.sin(angle) * radius

      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }

    ctx.closePath()
    ctx.stroke()
    } else if (stroke.tool === 'heart') {
    const cx = (stroke.x1 + stroke.x2) / 2
    const cy = (stroke.y1 + stroke.y2) / 2
    const width = Math.abs(stroke.x2 - stroke.x1)
    const height = Math.abs(stroke.y2 - stroke.y1)

    ctx.beginPath()
    ctx.moveTo(cx, cy + height / 2)
    ctx.bezierCurveTo(
      cx - width / 2, cy,
      cx - width / 2, cy - height / 2,
      cx, cy - height / 4
    )
    ctx.bezierCurveTo(
      cx + width / 2, cy - height / 2,
      cx + width / 2, cy,
      cx, cy + height / 2
    )
    ctx.stroke()
    } else if (stroke.tool === 'diamond') {
    const cx = (stroke.x1 + stroke.x2) / 2
    const cy = (stroke.y1 + stroke.y2) / 2

    ctx.beginPath()
    ctx.moveTo(cx, stroke.y1)
    ctx.lineTo(stroke.x2, cy)
    ctx.lineTo(cx, stroke.y2)
    ctx.lineTo(stroke.x1, cy)
    ctx.closePath()
    ctx.stroke()
    } else if (stroke.tool === 'hexagon') {
    const cx = (stroke.x1 + stroke.x2) / 2
    const cy = (stroke.y1 + stroke.y2) / 2
    const rx = Math.abs(stroke.x2 - stroke.x1) / 2
    const ry = Math.abs(stroke.y2 - stroke.y1) / 2

    ctx.beginPath()

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 - Math.PI / 6
      const x = cx + Math.cos(angle) * rx
      const y = cy + Math.sin(angle) * ry

      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }

    ctx.closePath()
    ctx.stroke()
  } else if (stroke.tool === 'arrow') {
    const angle = Math.atan2(stroke.y2 - stroke.y1, stroke.x2 - stroke.x1)
    const headLen = Math.max(10, (stroke.size || 2) * 2.5)

    ctx.beginPath()
    ctx.moveTo(stroke.x1, stroke.y1)
    ctx.lineTo(stroke.x2, stroke.y2)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(stroke.x2, stroke.y2)
    ctx.lineTo(
      stroke.x2 - headLen * Math.cos(angle - Math.PI / 6),
      stroke.y2 - headLen * Math.sin(angle - Math.PI / 6)
    )
    ctx.moveTo(stroke.x2, stroke.y2)
    ctx.lineTo(
      stroke.x2 - headLen * Math.cos(angle + Math.PI / 6),
      stroke.y2 - headLen * Math.sin(angle + Math.PI / 6)
    )
    ctx.stroke()
  }

  ctx.restore()
}
