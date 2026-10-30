/**
 * Draws the canvas base background and optional guidelines (blank, dotted, graph).
 * Used for background stage rendering and export compositing.
 */
export function drawBackground(ctx, width, height, pattern = 'blank') {
  ctx.save()

  // Fill solid archival white base
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, width, height)

  const step = 24

  if (pattern === 'dotted') {
    ctx.fillStyle = 'rgba(37, 35, 41, 0.16)'
    for (let x = step; x < width; x += step) {
      for (let y = step; y < height; y += step) {
        ctx.beginPath()
        ctx.arc(x, y, 1.2, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  } else if (pattern === 'graph') {
    ctx.strokeStyle = '#E2DBD2'
    ctx.lineWidth = 1
    ctx.beginPath()

    for (let x = step; x < width; x += step) {
      ctx.moveTo(x + 0.5, 0)
      ctx.lineTo(x + 0.5, height)
    }

    for (let y = step; y < height; y += step) {
      ctx.moveTo(0, y + 0.5)
      ctx.lineTo(width, y + 0.5)
    }

    ctx.stroke()
  }

  ctx.restore()
}
