const shortcuts = [
  { keys: ['Ctrl+Z', '⌘Z'], label: 'Undo', action: 'undo' },
  { keys: ['Ctrl+Shift+Z', 'Ctrl+Y', '⌘⇧Z'], label: 'Redo', action: 'redo' },
  { keys: ['B'], label: 'Pen Tool', action: 'pen' },
  { keys: ['E'], label: 'Eraser Tool', action: 'eraser' },
  { keys: ['R'], label: 'Rectangle Tool', action: 'rectangle' },
  { keys: ['C'], label: 'Circle Tool', action: 'circle' },
  { keys: ['I'], label: 'Eyedropper', action: 'eyedropper' },
  { keys: ['Ctrl+E', '⌘E'], label: 'Export PNG', action: 'export' },
  { keys: ['Delete', 'Backspace'], label: 'Clear Canvas', action: 'clear' },
  { keys: ['Esc'], label: 'Dismiss / Cancel', action: 'escape' },
  { keys: ['?'], label: 'Keyboard Shortcuts', action: 'shortcuts' },
]

export default shortcuts

