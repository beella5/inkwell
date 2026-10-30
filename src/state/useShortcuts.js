import { useEffect } from 'react'

export default function useShortcuts({
  onUndo,
  onRedo,
  onPen,
  onEraser,
  onRectangle,
  onCircle,
  onEyedropper,
  onExport,
  onClear,
  onEscape,
  onShortcuts,
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      const tag = e.target.tagName
      const isInput =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        e.target.isContentEditable

      // Always handle Escape regardless of target
      if (e.key === 'Escape') {
        if (onEscape) {
          e.preventDefault()
          onEscape()
        }
        return
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey

      // Ctrl/Cmd + Shift + Z OR Ctrl/Cmd + Y -> Redo
      if (
        (isCmdOrCtrl && e.shiftKey && (e.key === 'z' || e.key === 'Z')) ||
        (isCmdOrCtrl && (e.key === 'y' || e.key === 'Y'))
      ) {
        e.preventDefault()
        if (onRedo) onRedo()
        return
      }

      // Ctrl/Cmd + Z -> Undo
      if (isCmdOrCtrl && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault()
        if (onUndo) onUndo()
        return
      }

      // Ctrl/Cmd + E -> Export PNG
      if (isCmdOrCtrl && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault()
        if (onExport) onExport()
        return
      }

      // If user is currently typing in an input/textarea, ignore all single-key shortcuts
      if (isInput) return

      // Single-key shortcuts
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault()
        if (onPen) onPen()
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault()
        if (onEraser) onEraser()
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        if (onRectangle) onRectangle()
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault()
        if (onCircle) onCircle()
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault()
        if (onEyedropper) onEyedropper()
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        if (onClear) onClear()
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault()
        if (onShortcuts) onShortcuts()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    onUndo,
    onRedo,
    onPen,
    onEraser,
    onRectangle,
    onCircle,
    onEyedropper,
    onExport,
    onClear,
    onEscape,
    onShortcuts,
  ])
}

