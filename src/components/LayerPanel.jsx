import React, { useState, useRef, useEffect } from 'react'
import { renderStroke } from '../canvas/renderStroke'

function LayerThumbnail({ strokes }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, 32, 26)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, 32, 26)

    if (strokes && strokes.length > 0) {
      ctx.save()
      // CanvasStage default width=1000, height=700
      ctx.scale(32 / 1000, 26 / 700)
      for (const stroke of strokes) {
        renderStroke(ctx, stroke)
      }
      ctx.restore()
    }
  }, [strokes])

  return (
    <div className="layer-thumbnail">
      <canvas
        ref={canvasRef}
        width="32"
        height="26"
        className="layer-thumb-canvas"
      />
    </div>
  )
}

export default function LayerPanel({
  layers,
  activeLayerId,
  onSelectLayer,
  onAddLayer,
  onDeleteLayer,
  onRenameLayer,
  onToggleVisibility,
  onReorderLayers,
  backgroundPattern,
  onChangeBackgroundPattern,
  isMobileOpen,
  onCloseMobile,
}) {
  const [editingLayerId, setEditingLayerId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [draggedIndex, setDraggedIndex] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (editingLayerId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingLayerId])

  const startRenaming = (layer) => {
    setEditingLayerId(layer.id)
    setEditingName(layer.name)
  }

  const commitRename = (id) => {
    if (editingName.trim()) {
      onRenameLayer(id, editingName.trim())
    }
    setEditingLayerId(null)
  }

  const cancelRename = () => {
    setEditingLayerId(null)
  }

  // Display layers top-to-bottom in UI (array has bottom layer at 0, top layer at length-1)
  const reversedLayers = [...layers].reverse()

  return (
    <aside className={`layer-panel ${isMobileOpen ? 'open-mobile' : ''}`}>
      <div className="layer-panel-header">
        <h2 className="layer-panel-title">Layers</h2>
        {isMobileOpen && (
          <button
            className="btn-icon"
            onClick={onCloseMobile}
            title="Close Layers Panel"
            aria-label="Close"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      <div className="layer-panel-helper">
        Stack drawings independently — only the active layer is edited.
      </div>

      <div className="layer-list">
        {reversedLayers.map((layer, index) => {
          // Actual index in the bottom-up layers array:
          const actualIndex = layers.length - 1 - index
          const isActive = layer.id === activeLayerId

          return (
            <div
              key={layer.id}
              className={`layer-item ${isActive ? 'active' : ''}`}
              draggable
              onDragStart={(e) => {
                setDraggedIndex(actualIndex)
                e.dataTransfer.setData('text/plain', String(actualIndex))
              }}
              onDragOver={(e) => {
                e.preventDefault()
              }}
              onDrop={(e) => {
                e.preventDefault()
                const from =
                  draggedIndex !== null
                    ? draggedIndex
                    : Number(e.dataTransfer.getData('text/plain'))
                if (!isNaN(from)) {
                  onReorderLayers(from, actualIndex)
                }
                setDraggedIndex(null)
              }}
              onClick={() => onSelectLayer(layer.id)}
            >
              <span className="layer-drag-handle" title="Drag to reorder">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <circle cx="8" cy="5" r="2" />
                  <circle cx="16" cy="5" r="2" />
                  <circle cx="8" cy="12" r="2" />
                  <circle cx="16" cy="12" r="2" />
                  <circle cx="8" cy="19" r="2" />
                  <circle cx="16" cy="19" r="2" />
                </svg>
              </span>

              <LayerThumbnail strokes={layer.strokes} />

              <div
                className="layer-name-wrapper"
                onDoubleClick={() => startRenaming(layer)}
              >
                {editingLayerId === layer.id ? (
                  <input
                    ref={inputRef}
                    type="text"
                    className="layer-name-input"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.stopPropagation()
                        commitRename(layer.id)
                      } else if (e.key === 'Escape') {
                        e.stopPropagation()
                        cancelRename()
                      }
                    }}
                    onBlur={() => commitRename(layer.id)}
                  />
                ) : (
                  <span
                    className="layer-name-text"
                    title="Double click to rename"
                  >
                    {layer.name}
                  </span>
                )}
              </div>

              <div
                className="layer-actions"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className={`layer-icon-btn ${layer.visible === false ? 'hidden-eye' : ''}`}
                  title={layer.visible === false ? 'Show layer' : 'Hide layer'}
                  aria-label="Toggle Visibility"
                  onClick={() => onToggleVisibility(layer.id)}
                >
                  {layer.visible !== false ? (
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" y1="2" x2="22" y2="22" />
                    </svg>
                  )}
                </button>

                <button
                  className="layer-icon-btn danger"
                  title={
                    layers.length <= 1
                      ? 'Cannot delete last layer'
                      : 'Delete layer'
                  }
                  aria-label="Delete Layer"
                  disabled={layers.length <= 1}
                  onClick={() => onDeleteLayer(layer.id)}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="layer-panel-footer">
        <button className="btn-add-layer" onClick={onAddLayer}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add layer
        </button>

        <div className="bg-control-section">
          <span className="bg-control-title">Canvas Background</span>
          <div className="segmented-control">
            <button
              className={`segment-btn ${backgroundPattern === 'blank' ? 'active' : ''}`}
              onClick={() => onChangeBackgroundPattern('blank')}
            >
              Blank
            </button>
            <button
              className={`segment-btn ${backgroundPattern === 'dotted' ? 'active' : ''}`}
              onClick={() => onChangeBackgroundPattern('dotted')}
            >
              Dotted
            </button>
            <button
              className={`segment-btn ${backgroundPattern === 'graph' ? 'active' : ''}`}
              onClick={() => onChangeBackgroundPattern('graph')}
            >
              Graph
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
