import React from 'react'
import shortcuts from '../data/shortcuts'

export default function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Keyboard Shortcuts</h2>
          <button
            className="btn-icon"
            onClick={onClose}
            title="Close"
            aria-label="Close Shortcuts"
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
        </div>

        <div className="modal-body">
          <div className="shortcuts-grid">
            {shortcuts.map((sc, i) => (
              <div key={i} className="shortcut-row">
                <span className="shortcut-label">{sc.label}</span>
                <div className="shortcut-keys">
                  {sc.keys.map((k, j) => (
                    <kbd key={j} className="keycap">
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
