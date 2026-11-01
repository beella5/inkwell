import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react'
import { renderStroke } from '../canvas/renderStroke'
import { drawBackground } from '../canvas/drawBackground'
import { penCursorSvg, ERASER_CURSOR_SVG, toCursorValue } from '../utils/cursors'

export const CANVAS_WIDTH = 1000
export const CANVAS_HEIGHT = 700

export default function CanvasStage({
  layers,
  activeLayerId,
  tool,
  color,
  size,
  backgroundPattern,
  theme,
  isEyedropperActive,
  onFinishEyedropper,
  onAddStroke,
  onUpdateStroke,
  onCommitStrokeUpdate,
  onDeleteStroke,
}) {
  const containerRef = useRef(null)
  const bgCanvasRef = useRef(null)
  const overlayCanvasRef = useRef(null)
  const layerCanvasesRef = useRef({})

  const isDrawingRef = useRef(false)
  const currentStrokeRef = useRef(null)
  const pointerIdRef = useRef(null)
  const [selectedStroke, setSelectedStroke] = useState(null)
const [isMoving, setIsMoving] = useState(false)
const [isResizing, setIsResizing] = useState(false)

const moveStartRef = useRef(null)
const originalStrokeRef = useRef(null)
const originalLayersRef = useRef(null)
const previewStrokeRef = useRef(null)
const resizeHandleRef = useRef(null)
  // Pen / eraser cursor derived from the active tool
  const canvasCursor = useMemo(() => {
    if (isEyedropperActive) return 'crosshair'
    if (tool === 'pen') return toCursorValue(penCursorSvg(color), 2, 30, 'cell')
    if (tool === 'eraser')
      return toCursorValue(ERASER_CURSOR_SVG, 16, 16, 'cell')
    return 'crosshair'
  }, [tool, color, isEyedropperActive])

  // 1. Render Background & Pattern
    // Set up overlay canvas dimensions
  useEffect(() => {
    const overlay = overlayCanvasRef.current
    if (!overlay) return

    const dpr = window.devicePixelRatio || 1

    overlay.width = CANVAS_WIDTH * dpr
    overlay.height = CANVAS_HEIGHT * dpr

    const ctx = overlay.getContext('2d')
    if (!ctx) return

    ctx.scale(dpr, dpr)
  }, [])
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
  }, [backgroundPattern, theme])

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
    // Don't trigger shortcuts while typing
    if (
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'TEXTAREA' ||
      e.target.isContentEditable
    ) {
      return
    }

    // Escape: cancel drawing, moving, or resizing
    if (e.key === 'Escape') {
      if (isDrawingRef.current) {
        isDrawingRef.current = false
        currentStrokeRef.current = null
        clearOverlay()

        if (activeLayerId) {
          redrawLayer(activeLayerId)
        }
      }

      if (isMoving || isResizing) {
        if (selectedStroke && originalStrokeRef.current) {
          onUpdateStroke(
            selectedStroke.layerId,
            selectedStroke.strokeIndex,
            originalStrokeRef.current,
            false
          )
        }

        setIsMoving(false)
        setIsResizing(false)
        moveStartRef.current = null
        originalStrokeRef.current = null
        originalLayersRef.current = null
        previewStrokeRef.current = null
        resizeHandleRef.current = null
        pointerIdRef.current = null
      }

      setSelectedStroke(null)
      return
    }

    // Delete or Backspace: delete selected drawing
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedStroke) {
        e.preventDefault()
        onDeleteStroke(
          selectedStroke.layerId,
          selectedStroke.strokeIndex
        )
        setSelectedStroke(null)
      }
    }
  }

  window.addEventListener('keydown', handleKeyDown)

  return () => {
    window.removeEventListener('keydown', handleKeyDown)
  }
}, [
  activeLayerId,
  redrawLayer,
  clearOverlay,
  isMoving,
  isResizing,
  selectedStroke,
  onUpdateStroke,
  onDeleteStroke,
])

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

  // Get the bounding box of a drawing
  const getStrokeBounds = (stroke) => {
    let xs = []
    let ys = []

    if (stroke.points?.length) {
      xs = stroke.points.map((p) => p.x)
      ys = stroke.points.map((p) => p.y)
    } else {
      ;['x', 'x1', 'x2', 'startX', 'cx'].forEach((key) => {
        if (typeof stroke[key] === 'number') xs.push(stroke[key])
      })

      ;['y', 'y1', 'y2', 'startY', 'cy'].forEach((key) => {
        if (typeof stroke[key] === 'number') ys.push(stroke[key])
      })

      if (typeof stroke.width === 'number' && typeof stroke.x === 'number') {
        xs.push(stroke.x + stroke.width)
      }

      if (typeof stroke.height === 'number' && typeof stroke.y === 'number') {
        ys.push(stroke.y + stroke.height)
      }

      if (typeof stroke.rx === 'number' && typeof stroke.cx === 'number') {
        xs.push(stroke.cx - stroke.rx, stroke.cx + stroke.rx)
      }

      if (typeof stroke.ry === 'number' && typeof stroke.cy === 'number') {
        ys.push(stroke.cy - stroke.ry, stroke.cy + stroke.ry)
      }
    }

    if (!xs.length || !ys.length) return null

    return {
      minX: Math.min(...xs),
      minY: Math.min(...ys),
      maxX: Math.max(...xs),
      maxY: Math.max(...ys),
    }
  }

  // Find the topmost drawing under the pointer
  const findStrokeAtPoint = (point) => {
    const tolerance = 8

    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i]
      if (layer.visible === false || !layer.strokes) continue

      for (let j = layer.strokes.length - 1; j >= 0; j--) {
        const bounds = getStrokeBounds(layer.strokes[j])
        if (!bounds) continue

        if (
          point.x >= bounds.minX - tolerance &&
          point.x <= bounds.maxX + tolerance &&
          point.y >= bounds.minY - tolerance &&
          point.y <= bounds.maxY + tolerance
        ) {
          return { layerId: layer.id, strokeIndex: j }
        }
      }
    }

    return null
  }

  // Draw the selection frame and its four resize handles
  const drawSelectionOutline = () => {
    if (!selectedStroke) return

    const layer = layers.find((l) => l.id === selectedStroke.layerId)
    const stroke = layer?.strokes?.[selectedStroke.strokeIndex]
    if (!stroke) return

    const bounds = getStrokeBounds(stroke)
    if (!bounds) return

    const overlay = overlayCanvasRef.current
    if (!overlay) return

    const ctx = overlay.getContext('2d')
    if (!ctx) return

    const left = bounds.minX - 5
    const top = bounds.minY - 5
    const width = bounds.maxX - bounds.minX + 10
    const height = bounds.maxY - bounds.minY + 10

    ctx.save()
    ctx.setLineDash([6, 4])
    ctx.strokeStyle = '#4A90E2'
    ctx.lineWidth = 1.5
    ctx.strokeRect(left, top, width, height)

    ctx.setLineDash([])
    ctx.fillStyle = '#ffffff'
    ctx.strokeStyle = '#4A90E2'

    const corners = [
      { id: 'nw', x: left, y: top },
      { id: 'ne', x: left + width, y: top },
      { id: 'sw', x: left, y: top + height },
      { id: 'se', x: left + width, y: top + height },
    ]

    corners.forEach(({ x, y }) => {
      ctx.fillRect(x - 4, y - 4, 8, 8)
      ctx.strokeRect(x - 4, y - 4, 8, 8)
    })

    ctx.restore()
  }

  // Update selection outline whenever the selection or layers change
  useEffect(() => {
    clearOverlay()
    drawSelectionOutline()
  }, [selectedStroke, layers, clearOverlay])
  // Pointer Down
  
// Find which resize handle the pointer is touching
const getResizeHandle = (point, stroke) => {
  const bounds = getStrokeBounds(stroke)
  if (!bounds) return null

  const corners = [
    { id: 'nw', x: bounds.minX - 5, y: bounds.minY - 5 },
    { id: 'ne', x: bounds.maxX + 5, y: bounds.minY - 5 },
    { id: 'sw', x: bounds.minX - 5, y: bounds.maxY + 5 },
    { id: 'se', x: bounds.maxX + 5, y: bounds.maxY + 5 },
  ]

  const handle = corners.find(
    (corner) =>
      Math.abs(point.x - corner.x) <= 9 &&
      Math.abs(point.y - corner.y) <= 9
  )

  return handle?.id || null
}

// Move a drawing
const moveStroke = (original, dx, dy) => {
  const moved = { ...original }

  if (original.points) {
    moved.points = original.points.map((p) => ({
      ...p,
      x: p.x + dx,
      y: p.y + dy,
    }))
  }

  ;['x', 'x1', 'x2', 'startX', 'cx'].forEach((key) => {
    if (typeof original[key] === 'number') {
      moved[key] = original[key] + dx
    }
  })

  ;['y', 'y1', 'y2', 'startY', 'cy'].forEach((key) => {
    if (typeof original[key] === 'number') {
      moved[key] = original[key] + dy
    }
  })

  return moved
}

// Resize a drawing from one of its corners
const resizeStroke = (original, handle, point) => {
  const bounds = getStrokeBounds(original)
  if (!bounds) return original

  let { minX, minY, maxX, maxY } = bounds

  if (handle.includes('w')) minX = point.x
  if (handle.includes('e')) maxX = point.x
  if (handle.includes('n')) minY = point.y
  if (handle.includes('s')) maxY = point.y

  const oldWidth = bounds.maxX - bounds.minX
  const oldHeight = bounds.maxY - bounds.minY
  const newWidth = maxX - minX
  const newHeight = maxY - minY

  if (newWidth < 5 || newHeight < 5) return original

  const scaleX = newWidth / (oldWidth || 1)
  const scaleY = newHeight / (oldHeight || 1)

  const resized = { ...original }

  const transformX = (x) => minX + (x - bounds.minX) * scaleX
  const transformY = (y) => minY + (y - bounds.minY) * scaleY

  if (original.points) {
    resized.points = original.points.map((p) => ({
      ...p,
      x: transformX(p.x),
      y: transformY(p.y),
    }))
  }

  ;['x', 'x1', 'x2', 'startX', 'cx'].forEach((key) => {
    if (typeof original[key] === 'number') {
      resized[key] = transformX(original[key])
    }
  })

  ;['y', 'y1', 'y2', 'startY', 'cy'].forEach((key) => {
    if (typeof original[key] === 'number') {
      resized[key] = transformY(original[key])
    }
  })

  if (typeof original.width === 'number') {
    resized.width = original.width * scaleX
  }
  if (typeof original.height === 'number') {
    resized.height = original.height * scaleY
  }
  if (typeof original.rx === 'number') {
    resized.rx = original.rx * scaleX
  }
  if (typeof original.ry === 'number') {
    resized.ry = original.ry * scaleY
  }

  return resized
}

  const handlePointerDown = (e) => {
     if (isEyedropperActive) {
      sampleColorAt(e.clientX, e.clientY)
      return
    }
        // Selection tool
if (tool === 'select') {
  if (e.button !== 0) return

  const pt = getCanvasPoint(e)

  // Check whether we already have a selected drawing
  if (selectedStroke) {
    const layer = layers.find((l) => l.id === selectedStroke.layerId)
    const stroke = layer?.strokes?.[selectedStroke.strokeIndex]

    if (stroke) {
      // First check whether a resize handle was clicked
      const handle = getResizeHandle(pt, stroke)

      if (handle) {
        originalStrokeRef.current = JSON.parse(JSON.stringify(stroke))
        originalLayersRef.current = layers
        previewStrokeRef.current = stroke
        resizeHandleRef.current = handle

        setIsResizing(true)
        pointerIdRef.current = e.pointerId

        try {
          e.currentTarget.setPointerCapture(e.pointerId)
        } catch {}

        return
      }

      // Otherwise check whether the drawing itself was clicked
      const bounds = getStrokeBounds(stroke)

      if (
        bounds &&
        pt.x >= bounds.minX - 5 &&
        pt.x <= bounds.maxX + 5 &&
        pt.y >= bounds.minY - 5 &&
        pt.y <= bounds.maxY + 5
      ) {
        moveStartRef.current = pt
        originalStrokeRef.current = JSON.parse(JSON.stringify(stroke))
        originalLayersRef.current = layers
        previewStrokeRef.current = stroke

        setIsMoving(true)
        pointerIdRef.current = e.pointerId

        try {
          e.currentTarget.setPointerCapture(e.pointerId)
        } catch {}

        return
      }
    }
  }

  // If we clicked somewhere else, select another drawing
  const found = findStrokeAtPoint(pt)
  setSelectedStroke(found)
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

    if (
  tool === 'pen' ||
  tool === 'pencil' ||
  tool === 'eraser' ||
  tool === 'highlighter'
) {
      const stroke = {
  tool,
  color:
    tool === 'eraser'
      ? 'rgba(0,0,0,1)'
      : tool === 'pencil'
        ? '#252329'
        : color,
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
    const pt = getCanvasPoint(e)

    // Resize selected drawing
    if (isResizing && selectedStroke && originalStrokeRef.current) {
      const resized = resizeStroke(
        originalStrokeRef.current,
        resizeHandleRef.current,
        pt
      )

      previewStrokeRef.current = resized

      onUpdateStroke(
        selectedStroke.layerId,
        selectedStroke.strokeIndex,
        resized,
        false
      )

      return
    }

    // Move selected drawing
    if (isMoving && selectedStroke && moveStartRef.current && originalStrokeRef.current) {
      const dx = pt.x - moveStartRef.current.x
      const dy = pt.y - moveStartRef.current.y

      const moved = moveStroke(originalStrokeRef.current, dx, dy)
      previewStrokeRef.current = moved

      onUpdateStroke(
        selectedStroke.layerId,
        selectedStroke.strokeIndex,
        moved,
        false
      )

      return
    }

    if (!isDrawingRef.current || !currentStrokeRef.current) return

    const stroke = currentStrokeRef.current

    if (
      tool === 'pen' ||
      tool === 'pencil' ||
      tool === 'eraser' ||
      tool === 'highlighter'
    ) {
      stroke.points.push(pt)

      const canvas = layerCanvasesRef.current[activeLayerId]
      if (canvas) {
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

        const activeLayer = layers.find((l) => l.id === activeLayerId)
        if (activeLayer?.strokes) {
          activeLayer.strokes.forEach((s) => renderStroke(ctx, s))
        }

        renderStroke(ctx, stroke)
      }
    } else {
      const sx = stroke.startX
      const sy = stroke.startY

      stroke.x = Math.min(sx, pt.x)
      stroke.y = Math.min(sy, pt.y)
      stroke.width = Math.abs(pt.x - sx)
      stroke.height = Math.abs(pt.y - sy)

      stroke.cx = (sx + pt.x) / 2
      stroke.cy = (sy + pt.y) / 2
      stroke.rx = Math.abs(pt.x - sx) / 2
      stroke.ry = Math.abs(pt.y - sy) / 2

      stroke.x1 = sx
      stroke.y1 = sy
      stroke.x2 = pt.x
      stroke.y2 = pt.y

      clearOverlay()
      const ctx = overlayCanvasRef.current?.getContext('2d')
      if (ctx) renderStroke(ctx, stroke)
    }
  }

  // Pointer Up
  const handlePointerUp = (e) => {
    // Finish moving or resizing
    if (isMoving || isResizing) {
      if (
        selectedStroke &&
        originalLayersRef.current &&
        previewStrokeRef.current
      ) {
        onCommitStrokeUpdate(
          originalLayersRef.current,
          selectedStroke.layerId,
          selectedStroke.strokeIndex,
          previewStrokeRef.current
        )
      }

      setIsMoving(false)
      setIsResizing(false)

      moveStartRef.current = null
      originalStrokeRef.current = null
      originalLayersRef.current = null
      previewStrokeRef.current = null
      resizeHandleRef.current = null

      try {
        if (pointerIdRef.current !== null) {
          e.currentTarget.releasePointerCapture(pointerIdRef.current)
        }
      } catch {}

      pointerIdRef.current = null
      return
    }

    if (!isDrawingRef.current) return

    isDrawingRef.current = false

    try {
      if (pointerIdRef.current !== null) {
        e.currentTarget.releasePointerCapture(pointerIdRef.current)
      }
    } catch {}

    pointerIdRef.current = null

    const stroke = currentStrokeRef.current
    currentStrokeRef.current = null
    clearOverlay()

    if (!stroke) return

    if (
      stroke.tool === 'pen' ||
      stroke.tool === 'pencil' ||
      stroke.tool === 'eraser' ||
      stroke.tool === 'highlighter'
    ) {
      if (stroke.points?.length > 0) onAddStroke(stroke)
    } else {
      const isMeaningful =
        stroke.tool === 'line' || stroke.tool === 'arrow'
          ? Math.hypot(stroke.x2 - stroke.x1, stroke.y2 - stroke.y1) > 2
          : stroke.width > 2 || stroke.height > 2

      if (isMeaningful) onAddStroke(stroke)
    }
  }

  // Pointer Cancel
  const handlePointerCancel = () => {
    if (isMoving || isResizing) {
      if (selectedStroke && originalStrokeRef.current) {
        onUpdateStroke(
          selectedStroke.layerId,
          selectedStroke.strokeIndex,
          originalStrokeRef.current,
          false
        )
      }

      setIsMoving(false)
      setIsResizing(false)
      moveStartRef.current = null
      originalStrokeRef.current = null
      originalLayersRef.current = null
      previewStrokeRef.current = null
      resizeHandleRef.current = null
      pointerIdRef.current = null
      return
    }

    if (!isDrawingRef.current) return

    isDrawingRef.current = false
    currentStrokeRef.current = null
    clearOverlay()

    if (activeLayerId) redrawLayer(activeLayerId)
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

    cursor: isEyedropperActive
      ? 'crosshair'
      : tool === 'pen'
        ? toCursorValue(penCursorSvg(color), 2, 30)
        : tool === 'eraser'
          ? toCursorValue(ERASER_CURSOR_SVG, 16, 16)
          : 'default',
  }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
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
      </div>
    </main>
  )
}
