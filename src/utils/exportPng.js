import { drawBackground } from '../canvas/drawBackground'
import { renderStroke } from '../canvas/renderStroke'

/**
 * Composites all visible layers onto an offscreen canvas and triggers PNG download.
 */
export function exportPng({ layers, backgroundPattern, width, height }) {
  const offscreen = document.createElement('canvas')
  offscreen.width = width
  offscreen.height = height
  const ctx = offscreen.getContext('2d')

  if (!ctx) {
    return Promise.reject(
      new Error('Could not initialize canvas context for export')
    )
  }

  // 1. Draw background pattern & solid white surface
  drawBackground(ctx, width, height, backgroundPattern)

  // 2. Render each visible layer in ascending z-order
  const visibleLayers = layers.filter((l) => l.visible !== false)
  for (const layer of visibleLayers) {
    if (layer.strokes && layer.strokes.length > 0) {
      // Isolate layer drawing so destination-out eraser does not erase background or lower layers
      const layerCanvas = document.createElement('canvas')
      layerCanvas.width = width
      layerCanvas.height = height
      const layerCtx = layerCanvas.getContext('2d')
      if (layerCtx) {
        for (const stroke of layer.strokes) {
          renderStroke(layerCtx, stroke)
        }
        ctx.drawImage(layerCanvas, 0, 0)
      }
    }
  }

  // 3. Format filename: inkwell-YYYY-MM-DD-HHmm.png
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const yyyy = now.getFullYear()
  const mm = pad(now.getMonth() + 1)
  const dd = pad(now.getDate())
  const hh = pad(now.getHours())
  const min = pad(now.getMinutes())
  const filename = `inkwell-${yyyy}-${mm}-${dd}-${hh}${min}.png`

  // 4. Download file
  return new Promise((resolve, reject) => {
    try {
      offscreen.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas export failed to produce blob'))
          return
        }
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = filename
        document.body.appendChild(anchor)
        anchor.click()
        document.body.removeChild(anchor)
        setTimeout(() => URL.revokeObjectURL(url), 2000)
        resolve(filename)
      }, 'image/png')
    } catch (err) {
      reject(err)
    }
  })
}
