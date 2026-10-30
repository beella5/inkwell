import { useState, useCallback } from 'react'
import { DEFAULT_COLOR } from '../data/palette'

export default function useTools() {
  const [tool, setTool] = useState('pen') // 'pen' | 'eraser' | 'rectangle' | 'circle' | 'line' | 'triangle' | 'arrow'
  const [color, setColor] = useState(DEFAULT_COLOR)
  const [size, setSize] = useState(4)
  const [backgroundPattern, setBackgroundPattern] = useState('blank') // 'blank' | 'dotted' | 'graph'

  // Popovers & Modals
  const [isColorPopoverOpen, setIsColorPopoverOpen] = useState(false)
  const [isShapesPopoverOpen, setIsShapesPopoverOpen] = useState(false)
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false)
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false)

  // Eyedropper state
  const [isEyedropperActive, setIsEyedropperActive] = useState(false)
  const [prevToolBeforeEyedropper, setPrevToolBeforeEyedropper] =
    useState('pen')

  const selectTool = useCallback((newTool) => {
    setTool(newTool)
    setIsEyedropperActive(false)
    setIsShapesPopoverOpen(false)
  }, [])

  const selectColor = useCallback((newColor) => {
    setColor(newColor)
  }, [])

  const startEyedropper = useCallback(() => {
    setPrevToolBeforeEyedropper(tool)
    setIsEyedropperActive(true)
    setIsColorPopoverOpen(false)
    setIsShapesPopoverOpen(false)
  }, [tool])

  const finishEyedropper = useCallback(
    (sampledColor) => {
      if (sampledColor) {
        setColor(sampledColor)
      }
      setIsEyedropperActive(false)
      setTool(prevToolBeforeEyedropper || 'pen')
    },
    [prevToolBeforeEyedropper]
  )

  const cancelEyedropper = useCallback(() => {
    setIsEyedropperActive(false)
    setTool(prevToolBeforeEyedropper || 'pen')
  }, [prevToolBeforeEyedropper])

  const closeAllOverlays = useCallback(() => {
    setIsColorPopoverOpen(false)
    setIsShapesPopoverOpen(false)
    setIsShortcutsOpen(false)
    setIsConfirmClearOpen(false)
    if (isEyedropperActive) {
      cancelEyedropper()
    }
  }, [isEyedropperActive, cancelEyedropper])

  return {
    tool,
    setTool: selectTool,
    color,
    setColor: selectColor,
    size,
    setSize,
    backgroundPattern,
    setBackgroundPattern,

    // Eyedropper
    isEyedropperActive,
    startEyedropper,
    finishEyedropper,
    cancelEyedropper,

    // Overlays
    isColorPopoverOpen,
    setIsColorPopoverOpen,
    isShapesPopoverOpen,
    setIsShapesPopoverOpen,
    isShortcutsOpen,
    setIsShortcutsOpen,
    isConfirmClearOpen,
    setIsConfirmClearOpen,
    closeAllOverlays,
  }
}
