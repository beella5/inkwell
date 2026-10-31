import React, { useState } from 'react'
import TopBar from './components/TopBar'
import Toolbar from './components/Toolbar'
import CanvasStage, {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from './components/CanvasStage'
import LayerPanel from './components/LayerPanel'
import ColorPopover from './components/ColorPopover'
import ShapesPopover from './components/ShapesPopover'
import ShortcutsModal from './components/ShortcutsModal'
import ConfirmModal from './components/ConfirmModal'
import Toast from './components/Toast'
import useLayers from './state/useLayers'
import useTools from './state/useTools'
import usePersistence from './state/usePersistence'
import useShortcuts from './state/useShortcuts'
import { exportPng } from './utils/exportPng'

/* prettier-ignore */
export default function App() {
  const [toast, setToast] = useState(null)
  const [isMobileLayersOpen, setIsMobileLayersOpen] = useState(false)
  const tools = useTools()
  const layers = useLayers()
  const persistence = usePersistence(layers.layers, tools.backgroundPattern, (l, bg) => {
    layers.resetLayers(l)
    if (bg) tools.setBackgroundPattern(bg)
  })

  const handleExport = () => {
    exportPng({ layers: layers.layers, backgroundPattern: tools.backgroundPattern, width: CANVAS_WIDTH, height: CANVAS_HEIGHT })
      .then((f) => setToast({ message: `Exported ${f}`, type: 'success' }))
      .catch(() => setToast({ message: 'Export failed', type: 'error' }))
  }

  const handleClear = () => {
    layers.resetLayers()
    persistence.clearStorage()
    tools.setIsConfirmClearOpen(false)
    setToast({ message: 'Canvas cleared', type: 'success' })
  }

  useShortcuts({
    onUndo: layers.undo, onRedo: layers.redo,
    onPen: () => tools.setTool('pen'), onEraser: () => tools.setTool('eraser'),
    onRectangle: () => tools.setTool('rectangle'), onCircle: () => tools.setTool('circle'),
    onEyedropper: tools.startEyedropper, onExport: handleExport,
    onClear: () => tools.setIsConfirmClearOpen(true),
    onEscape: tools.closeAllOverlays, onShortcuts: () => tools.setIsShortcutsOpen(true),
  })

  return (
    <div className="inkwell-app">
      <TopBar saveStatus={persistence.saveStatus} canUndo={layers.canUndo} canRedo={layers.canRedo} onUndo={layers.undo} onRedo={layers.redo} onExport={handleExport} onClear={() => tools.setIsConfirmClearOpen(true)} onOpenShortcuts={() => tools.setIsShortcutsOpen(true)} />
      <div className="inkwell-body">
        <Toolbar tool={tools.tool} color={tools.color} size={tools.size} onSelectTool={tools.setTool} onToggleShapesPopover={() => tools.setIsShapesPopoverOpen(!tools.isShapesPopoverOpen)} isShapesPopoverOpen={tools.isShapesPopoverOpen} onToggleColorPopover={() => tools.setIsColorPopoverOpen(!tools.isColorPopoverOpen)} isColorPopoverOpen={tools.isColorPopoverOpen} onChangeSize={tools.setSize} />
        <CanvasStage layers={layers.layers} activeLayerId={layers.activeLayerId} tool={tools.tool} color={tools.color} size={tools.size} backgroundPattern={tools.backgroundPattern} isEyedropperActive={tools.isEyedropperActive} onFinishEyedropper={tools.finishEyedropper} onAddStroke={layers.addStroke} 
          onUpdateStroke={layers.updateStroke}/>
        <LayerPanel layers={layers.layers} activeLayerId={layers.activeLayerId} onSelectLayer={layers.setActiveLayerId} onAddLayer={layers.addLayer} onDeleteLayer={layers.deleteLayer} onRenameLayer={layers.renameLayer} onToggleVisibility={layers.toggleLayerVisibility} onReorderLayers={layers.reorderLayers} backgroundPattern={tools.backgroundPattern} onChangeBackgroundPattern={tools.setBackgroundPattern} isMobileOpen={isMobileLayersOpen} onCloseMobile={() => setIsMobileLayersOpen(false)} />
      </div>
      <ColorPopover isOpen={tools.isColorPopoverOpen} color={tools.color} onSelectColor={tools.setColor} onStartEyedropper={tools.startEyedropper} onClose={() => tools.setIsColorPopoverOpen(false)} />
      <ShapesPopover isOpen={tools.isShapesPopoverOpen} activeTool={tools.tool} onSelectShape={tools.setTool} onClose={() => tools.setIsShapesPopoverOpen(false)} />
      <ShortcutsModal isOpen={tools.isShortcutsOpen} onClose={() => tools.setIsShortcutsOpen(false)} />
      <ConfirmModal isOpen={tools.isConfirmClearOpen} onConfirm={handleClear} onCancel={() => tools.setIsConfirmClearOpen(false)} />
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  )
}
