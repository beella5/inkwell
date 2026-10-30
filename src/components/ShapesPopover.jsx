import React, { useRef, useEffect } from 'react'

const SHAPES = [
  {
    id: 'rectangle',
    label: 'Rectangle',
    shortcut: 'R',
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
      </svg>
    ),
  },
  {
    id: 'circle',
    label: 'Circle',
    shortcut: 'C',
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  {
    id: 'line',
    label: 'Straight Line',
    shortcut: '',
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="4" y1="20" x2="20" y2="4" />
      </svg>
    ),
  },
  {
    id: 'triangle',
    label: 'Triangle',
    shortcut: '',
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polygon points="12 3 21 20 3 20" />
      </svg>
    ),
  },
  {
    id: 'arrow',
    label: 'Arrow',
    shortcut: '',
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="5" y1="19" x2="19" y2="5" />
        <polyline points="10 5 19 5 19 14" />
      </svg>
    ),
  },
]

export default function ShapesPopover({
  isOpen,
  activeTool,
  onSelectShape,
  onClose,
}) {
  const popoverRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        isOpen &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        !e.target.closest('[aria-label="Shapes"]')
      ) {
        onClose()
      }
    }
    document.addEventListener('pointerdown', handleClickOutside)
    return () => document.removeEventListener('pointerdown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="popover shapes-popover" ref={popoverRef}>
      {SHAPES.map((shape) => (
        <button
          key={shape.id}
          className={`shape-item-btn ${activeTool === shape.id ? 'active' : ''}`}
          onClick={() => {
            onSelectShape(shape.id)
            onClose()
          }}
        >
          {shape.icon}
          <span>{shape.label}</span>
          {shape.shortcut && (
            <span className="keycap" style={{ marginLeft: 'auto' }}>
              {shape.shortcut}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
