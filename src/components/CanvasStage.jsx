import React, { useRef, useEffect, useCallback, useMemo  } from 'react'
import { renderStroke } from '../canvas/renderStroke'
import { drawBackground } from '../canvas/drawBackground'
import {
  penCursorSvg,
  ERASER_CURSOR_SVG,
  toCursorValue,
} from '../utils/cursors'
export const CANVAS_WIDTH = 1000
export const CANVAS_HEIGHT = 700

export default function CanvasStage({
  layers,
  activeLayerId,
  tool,
  color,
  size,
  backgroundPattern,
  isEyedropperActive,
  onFinishEyedropper,
  onAddStroke,
}) {
  const containerRef = useRef(null)
  const bgCanvasRef = useRef(null)
  const overlayCanvasRef = useRef(null)
  const layerCanvasesRef = useRef({})
  const cursorRef = useRef(null)

  const isDrawingRef = useRef(false)
  const currentStrokeRef = useRef(null)
  const pointerIdRef = useRef(null)
    const canvasCursor = useMemo(() => {
    if (isEyedropperActive) return 'crosshair'
    if (tool === 'pen') return toCursorValue(penCursorSvg(color), 2, 30)
    if (tool === 'eraser') return toCursorValue(ERASER_CURSOR_SVG, 16, 16, 'cell')
    return 'crosshair'
  }, [tool, color, isEyedropperActive])

  // 1. Render Background & Pattern
  useEffect(() => {
    const bgCanvas = bgCanvasRef.current
    if (!bgCanvas) return
    const dpr = window.devicePixelRatio || 1
    bgCanvas.width = CANVAS_WIDTH * dpr
    bgCanvas.height = CANVAS_HEIGHT * dpr
    const ctx = bgCanvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)
    drawBackground(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, backgroundPattern)
  }, [backgroundPattern])

  // 2. Redraw each layer whenever strokes or visibility changes
  useEffect(() => {
    const dpr = window.devicePixelRatio || 1
    layers.forEach((layer) => {
      const canvas = layerCanvasesRef.current[layer.id]
      if (!canvas) return
      canvas.width = CANVAS_WIDTH * dpr
      canvas.height = CANVAS_HEIGHT * dpr
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      if (layer.visible !== false && layer.strokes) {
        layer.strokes.forEach((stroke) => {
          renderStroke(ctx, stroke)
        })
      }
    })
  }, [layers])

  // Helper to redraw a single layer (e.g. to discard cancelled strokes)
  const redrawLayer = useCallback(
    (layerId) => {
      const targetLayer = layers.find((l) => l.id === layerId)
      if (!targetLayer) return
      const canvas = layerCanvasesRef.current[layerId]
      if (!canvas) return
      const dpr = window.devicePixelRatio || 1
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      if (targetLayer.visible !== false && targetLayer.strokes) {
        targetLayer.strokes.forEach((stroke) => {
          renderStroke(ctx, stroke)
        })
      }
    },
    [layers]
  )

  // Helper to clear overlay
  const clearOverlay = useCallback(() => {
    const overlay = overlayCanvasRef.current
    if (!overlay) return
    const dpr = window.devicePixelRatio || 1
    const ctx = overlay.getContext('2d')
    if (!ctx) return
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, overlay.width, overlay.height)
    ctx.restore()
  }, [])

  // Eyedropper pixel sampler
  const sampleColorAt = useCallback(
    (clientX, clientY) => {
      const card = containerRef.current
      if (!card) return
      const rect = card.getBoundingClientRect()
      const x = Math.max(0, Math.min(CANVAS_WIDTH, clientX - rect.left))
      const y = Math.max(0, Math.min(CANVAS_HEIGHT, clientY - rect.top))

      const dpr = window.devicePixelRatio || 1
      const offscreen = document.createElement('canvas')
      offscreen.width = CANVAS_WIDTH * dpr
      offscreen.height = CANVAS_HEIGHT * dpr
      const octx = offscreen.getContext('2d')
      if (!octx) return
      octx.scale(dpr, dpr)

      // Draw background
      drawBackground(octx, CANVAS_WIDTH, CANVAS_HEIGHT, backgroundPattern)

      // Draw visible layers in order
      layers
        .filter((l) => l.visible !== false)
        .forEach((l) => {
          const lCanvas = document.createElement('canvas')
          lCanvas.width = CANVAS_WIDTH * dpr
          lCanvas.height = CANVAS_HEIGHT * dpr
          const lCtx = lCanvas.getContext('2d')
          if (lCtx) {
            lCtx.scale(dpr, dpr)
            l.strokes.forEach((s) => renderStroke(lCtx, s))
            octx.drawImage(lCanvas, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
          }
        })

      // Sample pixel multiplied by dpr
      const pxX = Math.min(
        offscreen.width - 1,
        Math.max(0, Math.round(x * dpr))
      )
      const pxY = Math.min(
        offscreen.height - 1,
        Math.max(0, Math.round(y * dpr))
      )
      const pixel = octx.getImageData(pxX, pxY, 1, 1).data

      const hex =
        '#' +
        [pixel[0], pixel[1], pixel[2]]
          .map((c) => c.toString(16).padStart(2, '0'))
          .join('')
      onFinishEyedropper(hex)
    },
    [layers, backgroundPattern, onFinishEyedropper]
  )

  // Listen for Escape during drawing to cleanly cancel
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isDrawingRef.current) {
        isDrawingRef.current = false
        currentStrokeRef.current = null
        clearOverlay()
        if (activeLayerId) {
          redrawLayer(activeLayerId)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeLayerId, redrawLayer, clearOverlay])

  // Get point coordinates relative to canvas
  const getCanvasPoint = (e) => {
    const card = containerRef.current
    if (!card) return { x: 0, y: 0 }
    const rect = card.getBoundingClientRect()
    return {
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top),
    }
  }

  // Pointer Down
  const handlePointerDown = (e) => {
    // If eyedropper is active, sample immediately and do not draw
    if (isEyedropperActive) {
      sampleColorAt(e.clientX, e.clientY)
      return
    }

    if (e.button !== 0) return // Left click only

    const pt = getCanvasPoint(e)
    isDrawingRef.current = true
    pointerIdRef.current = e.pointerId

    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // ignore if unsupported
    }

    if (tool === 'pen' || tool === 'eraser') {
      const stroke = {
        tool,
        color: tool === 'eraser' ? 'rgba(0,0,0,1)' : color,
        size,
        points: [pt],
      }
      currentStrokeRef.current = stroke

      // Render first point on active layer canvas
      const canvas = layerCanvasesRef.current[activeLayerId]
      if (canvas) {
        const ctx = canvas.getContext('2d')
        renderStroke(ctx, stroke)
      }
    } else {
      // Shapes: rectangle, circle, line, triangle, arrow
      const stroke = {
        tool,
        color,
        size,
        startX: pt.x,
        startY: pt.y,
        x: pt.x,
        y: pt.y,
        width: 0,
        height: 0,
        cx: pt.x,
        cy: pt.y,
        rx: 0,
        ry: 0,
        x1: pt.x,
        y1: pt.y,
        x2: pt.x,
        y2: pt.y,
      }
      currentStrokeRef.current = stroke
    }
  }

  // Pointer Move
  const handlePointerMove = (e) => {
    // ---- brush cursor preview (always runs) ----
    const rect = containerRef.current?.getBoundingClientRect()
    const cursorEl = cursorRef.current
    if (rect && cursorEl) {
      cursorEl.style.left = `${e.clientX - rect.left}px`
      cursorEl.style.top = `${e.clientY - rect.top}px`
      cursorEl.style.display = 'block'
    }
    // ---- end cursor preview ----

    if (!isDrawingRef.current || !currentStrokeRef.current) return
    const pt = getCanvasPoint(e)
    const stroke = currentStrokeRef.current

    if (stroke.tool === 'pen' || stroke.tool === 'eraser') {
      stroke.points.push(pt)

      // Redraw active layer with updated points to preserve smooth Bézier curve
      const canvas = layerCanvasesRef.current[activeLayerId]
      if (canvas) {
        const ctx = canvas.getContext('2d')
        // Clear active layer and re-render its committed strokes + active stroke
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
        const activeLayer = layers.find((l) => l.id === activeLayerId)
        if (activeLayer && activeLayer.strokes) {
          activeLayer.strokes.forEach((s) => renderStroke(ctx, s))
        }
        renderStroke(ctx, stroke)
      }
    } else {
      // Live shape preview on overlay canvas
      const sx = stroke.startX
      const sy = stroke.startY
      const currX = pt.x
      const currY = pt.y

      stroke.x = Math.min(sx, currX)
      stroke.y = Math.min(sy, currY)
      stroke.width = Math.abs(currX - sx)
      stroke.height = Math.abs(currY - sy)

      stroke.cx = (sx + currX) / 2
      stroke.cy = (sy + currY) / 2
      stroke.rx = Math.abs(currX - sx) / 2
      stroke.ry = Math.abs(currY - sy) / 2

      stroke.x1 = sx
      stroke.y1 = sy
      stroke.x2 = currX
      stroke.y2 = currY

      const overlay = overlayCanvasRef.current
      if (overlay) {
        const ctx = overlay.getContext('2d')
        clearOverlay()
        renderStroke(ctx, stroke)
      }
    }
  }

  // Pointer Leave — hide cursor preview unless we're mid-stroke
  const handlePointerLeave = () => {
    if (isDrawingRef.current) return
    if (cursorRef.current) cursorRef.current.style.display = 'none'
  }

  // Pointer Up
  const handlePointerUp = (e) => {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false

    try {
      if (pointerIdRef.current !== null) {
        e.currentTarget.releasePointerCapture(pointerIdRef.current)
      }
    } catch {
      // ignore
    }

    const stroke = currentStrokeRef.current
    currentStrokeRef.current = null
    clearOverlay()

    if (stroke) {
      if (stroke.tool === 'pen' || stroke.tool === 'eraser') {
        if (stroke.points && stroke.points.length > 0) {
          onAddStroke(stroke)
        }
      } else {
        // Only commit shape if it has non-zero size
        const isMeaningful =
          stroke.tool === 'line' || stroke.tool === 'arrow'
            ? Math.hypot(stroke.x2 - stroke.x1, stroke.y2 - stroke.y1) > 2
            : stroke.width > 2 || stroke.height > 2

        if (isMeaningful) {
          onAddStroke(stroke)
        }
      }
    }
  }

  // Pointer Cancel (cleanly discard in-progress stroke)
  const handlePointerCancel = () => {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false
    currentStrokeRef.current = null
    clearOverlay()
    if (activeLayerId) {
      redrawLayer(activeLayerId)
    }
  }

  return (
    <main className="canvas-stage">
      <div
        ref={containerRef}
        className={`canvas-card ${isEyedropperActive ? 'eyedropper-active' : ''}`}
        style={{
          width: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
          touchAction: 'none',
           cursor: canvasCursor, 
          position: 'relative',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerLeave}
      >
        {/* Background Canvas (solid white + blank/dotted/graph) */}
        <canvas
          ref={bgCanvasRef}
          className="canvas-layer"
          style={{
            zIndex: 0,
            width: `${CANVAS_WIDTH}px`,
            height: `${CANVAS_HEIGHT}px`,
          }}
        />

        {/* Stack of Layer Canvases */}
        {layers.map((layer, index) => (
          <canvas
            key={layer.id}
            ref={(el) => {
              if (el) layerCanvasesRef.current[layer.id] = el
            }}
            className="canvas-layer"
            style={{
              zIndex: index + 1,
              width: `${CANVAS_WIDTH}px`,
              height: `${CANVAS_HEIGHT}px`,
              display: layer.visible !== false ? 'block' : 'none',
              position: 'relative',
            }}
          />
        ))}

        {/* Overlay Canvas for shape preview & live drag */}
        <canvas
          ref={overlayCanvasRef}
          className="canvas-overlay"
          style={{
            zIndex: layers.length + 2,
            width: `${CANVAS_WIDTH}px`,
            height: `${CANVAS_HEIGHT}px`,
          }}
        />

        {/* Brush cursor preview (DOM element, never part of the drawing) */}
        <div
          ref={cursorRef}
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            display: 'none',
            zIndex: layers.length + 3,
            top: 0,
            left: 0,
            transform: 'translate(-50%, -50%)',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: 'rgba(37, 35, 41, 0.5)',
            border: '1px solid #252329',
          }}
        />
      </div>
    </main>
  )
}
