import React, { useRef, useEffect } from 'react'
import { PRESET_COLORS } from '../data/palette'

export default function ColorPopover({
  isOpen,
  color,
  onSelectColor,
  onStartEyedropper,
  onClose,
}) {
  const popoverRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        isOpen &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        !e.target.closest('.color-swatch-btn')
      ) {
        onClose()
      }
    }
    document.addEventListener('pointerdown', handleClickOutside)
    return () => document.removeEventListener('pointerdown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="popover color-popover" ref={popoverRef}>
      <div className="palette-grid">
        {PRESET_COLORS.map((hex) => (
          <button
            key={hex}
            className={`swatch-chip ${color.toLowerCase() === hex.toLowerCase() ? 'active' : ''}`}
            style={{ backgroundColor: hex }}
            title={hex}
            aria-label={`Color swatch ${hex}`}
            onClick={() => {
              onSelectColor(hex)
            }}
          />
        ))}
      </div>

      <div className="color-tools-row">
        <label className="custom-picker-label" title="Custom color picker">
          <input
            type="color"
            value={
              color.startsWith('#') && color.length === 7 ? color : '#252329'
            }
            onChange={(e) => onSelectColor(e.target.value)}
            className="custom-color-input"
          />
          <span>Custom</span>
        </label>

        <button
          className="btn-eyedropper"
          title="Sample color from canvas (I)"
          onClick={onStartEyedropper}
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
            <path d="m14 2-8.5 8.5a2.12 2.12 0 1 0 3 3L17 5" />
            <path d="m16 4 4 4" />
            <path d="m19 1 4 4" />
            <path d="M2 22l5.5-1.5L21 6" />
          </svg>
          Eyedropper
        </button>
      </div>
    </div>
  )
}
