import React from 'react'

export default function TopBar({
  saveStatus,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onExport,
  onClear,
  onOpenShortcuts,
  theme,
  onToggleTheme,
}) {
  const getStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving…'
      case 'error':
        return "Couldn't save"
      case 'unsaved':
        return 'Not saved'
      case 'saved':
      default:
        return 'All changes saved'
    }
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-wordmark">
          Inkwell
          <span className="topbar-dot" />
        </h1>
        <span className="topbar-subtitle">Drawing Studio</span>
      </div>

      <div className="topbar-center">
        <div className="save-status">
          <span className={`save-dot ${saveStatus || 'saved'}`} />
          <span>{getStatusText()}</span>
        </div>
      </div>

      <div className="topbar-right">
        <button
  className="btn-icon"
  title={`Current theme: ${theme}. Click to change theme.`}
  aria-label={`Current theme: ${theme}. Click to change theme.`}
  onClick={onToggleTheme}
>
  {theme === 'light' ? (
    // Moon icon
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />
    </svg>
  ) : theme === 'dark' ? (
    // Sun icon
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
    </svg>
  ) : (
    // Pink theme icon
    <span style={{ fontSize: '18px' }}>🌸</span>
  )}
</button>
        <button
          className="btn-icon"
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
          disabled={!canUndo}
          onClick={onUndo}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
        </button>

        <button
          className="btn-icon"
          title="Redo (Ctrl+Shift+Z)"
          aria-label="Redo"
          disabled={!canRedo}
          onClick={onRedo}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 7v6h-6" />
            <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
          </svg>
        </button>

        <button
          className="btn-secondary"
          title="Export PNG (Ctrl+E)"
          onClick={onExport}
        >
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
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export PNG
        </button>

        <button
          className="btn-ghost"
          title="Clear canvas (Delete)"
          onClick={onClear}
        >
          Clear
        </button>

        <button
          className="btn-icon"
          title="Keyboard shortcuts (?)"
          aria-label="Keyboard Shortcuts"
          onClick={onOpenShortcuts}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>
      </div>
    </header>
  )
}
