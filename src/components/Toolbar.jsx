import React from 'react'

export default function Toolbar({
  tool,
  color,
  size,
  onSelectTool,
  onToggleShapesPopover,
  isShapesPopoverOpen,
  onToggleColorPopover,
  isColorPopoverOpen,
  onChangeSize,
}) {
  const isShapeActive = [
    'rectangle',
    'circle',
    'line',
    'triangle',
    'arrow',
    'star',
  'heart',
  'diamond',
  'hexagon',
  ].includes(tool)

  const getShapeIcon = () => {
    switch (tool) {
      case 'rectangle':
        return (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
          </svg>
        )
      case 'circle':
        return (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="9" />
          </svg>
        )
      case 'line':
        return (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="4" y1="20" x2="20" y2="4" />
          </svg>
        )
      case 'triangle':
        return (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polygon points="12 3 21 20 3 20" />
          </svg>
        )
      case 'arrow':
        return (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="5" y1="19" x2="19" y2="5" />
            <polyline points="10 5 19 5 19 14" />
          </svg>
        )
      default:
        return (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
          </svg>
        )
    }
  }

  return (
    <aside className="toolbar" aria-label="Drawing Tools">
      <div className="toolbar-group">
        <button
          className={`tool-btn ${tool === 'pen' ? 'active' : ''}`}
          title="Pen Tool (B)"
          aria-label="Pen Tool"
          onClick={() => onSelectTool('pen')}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 19l7-7 3 3-7 7-3-3z" />
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18z" />
            <path d="M2 2l7.586 7.586" />
            <circle cx="11" cy="11" r="2" />
          </svg>
               </button>

        <button
          className={`tool-btn ${tool === 'pencil' ? 'active' : ''}`}
          title="Pencil Tool"
          aria-label="Pencil Tool"
          onClick={() => onSelectTool('pencil')}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 21 3-1 12-12a2.1 2.1 0 0 0-3-3L3 17l-0.5 4z" />
            <path d="m14 6 4 4" />
          </svg>
        </button>

        <button
          className={`tool-btn ${tool === 'highlighter' ? 'active' : ''}`}
  title="Highlighter Tool"
  aria-label="Highlighter Tool"
  onClick={() => onSelectTool('highlighter')}
>
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m4 16 9-9 5 5-9 9H4z" />
    <path d="m13 7 2-2a2.1 2.1 0 0 1 3 0l3 3a2.1 2.1 0 0 1 0 3l-2 2" />
    <path d="M4 21h16" />
  </svg>
</button>

        <button
          className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`}
          title="Eraser Tool (E)"
          aria-label="Eraser Tool"
          onClick={() => onSelectTool('eraser')}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
            <path d="M22 21H7" />
            <path d="m5 11 9 9" />
          </svg>
        </button>
<button
  className={`tool-btn ${tool === 'select' ? 'active' : ''}`}
  title="Select Tool (V)"
  aria-label="Select Tool"
  onClick={() => onSelectTool('select')}
>
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 3l14 11-7 1-3 6L5 3z" />
  </svg>
</button>
        <button
          className={`tool-btn ${isShapeActive || isShapesPopoverOpen ? 'active' : ''}`}
          title="Shapes (R for Rect, C for Circle)"
          aria-label="Shapes"
          onClick={onToggleShapesPopover}
        >
          {getShapeIcon()}
          <span className="tool-badge">▼</span>
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button
          className="color-swatch-btn"
          title="Color Palette"
          aria-label="Select Color"
          onClick={onToggleColorPopover}
        >
          <span
            className="color-swatch-inner"
            style={{ backgroundColor: color }}
          />
        </button>
      </div>

      <div className="size-control">
        <div
          className="size-preview-dot"
          style={{
            width: `${Math.max(4, Math.min(24, size))}px`,
            height: `${Math.max(4, Math.min(24, size))}px`,
            backgroundColor:
              tool === 'eraser' ? 'var(--color-text-muted)' : color,
          }}
        />
        <div className="size-slider-wrapper">
          <input
            type="range"
            min="1"
            max="40"
            value={size}
            onChange={(e) => onChangeSize(Number(e.target.value))}
            className="size-slider"
            title={`Brush Size: ${size}px`}
            aria-label="Brush Size Slider"
          />
        </div>
        <span className="size-label">{size}px</span>
      </div>
    </aside>
  )
}
