import React from 'react'

export default function ConfirmModal({
  isOpen,
  title = 'Clear Canvas?',
  message = 'This will reset all layers and erase your current artwork. This action cannot be undone.',
  confirmLabel = 'Clear Canvas',
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button
            className="btn-icon"
            onClick={onCancel}
            title="Cancel"
            aria-label="Cancel"
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
          <p
            style={{
              fontSize: '14px',
              lineHeight: 1.5,
              color: 'var(--color-text)',
            }}
          >
            {message}
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="btn-primary"
            style={{
              backgroundColor: 'var(--color-danger)',
              borderColor: 'var(--color-danger)',
            }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
