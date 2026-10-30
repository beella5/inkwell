/**
 * Single source of truth for rendering an individual stroke onto a 2D canvas context.
 * Used for live stroke rendering, overlay shape previews, and full-layer redraws.
 */
export function renderStroke(ctx, stroke) {
  if (!stroke) return

  ctx.save()
  ctx.globalCompositeOperation =
    stroke.tool === 'eraser' ? 'destination-out' : 'source-over'
  ctx.strokeStyle = stroke.color || '#252329'
  ctx.lineWidth = stroke.size || 2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (stroke.tool === 'pen' || stroke.tool === 'eraser') {
    const pts = stroke.points
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
