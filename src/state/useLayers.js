import { useState, useCallback, useEffect } from 'react'
import useHistory from './useHistory'

const createInitialLayer = () => ({
  id: 'layer-1',
  name: 'Layer 1',
  visible: true,
  strokes: [],
})

export default function useLayers(initialLayers) {
  const defaultLayers =
    initialLayers && initialLayers.length > 0
      ? initialLayers
      : [createInitialLayer()]

  const history = useHistory(defaultLayers)
  const layers = history.present || [createInitialLayer()]

  const [activeLayerId, setActiveLayerId] = useState(
    layers[layers.length - 1]?.id || 'layer-1'
  )

  // Keep activeLayerId pointing to a valid layer whenever layers change
  useEffect(() => {
    if (!layers.some((l) => l.id === activeLayerId)) {
      setActiveLayerId(layers[layers.length - 1]?.id || 'layer-1')
    }
  }, [layers, activeLayerId])

  const addStroke = useCallback(
    (stroke) => {
      const updated = layers.map((layer) => {
        if (layer.id === activeLayerId) {
          return {
            ...layer,
            strokes: [...layer.strokes, stroke],
          }
        }
        return layer
      })
      history.setPresent(updated)
    },
    [layers, activeLayerId, history]
  )
  const updateStroke = useCallback(
    (layerId, strokeIndex, updatedStroke) => {
      const updated = layers.map((layer) => {
        if (layer.id === layerId) {
          const strokes = [...layer.strokes]
          strokes[strokeIndex] = updatedStroke

          return {
            ...layer,
            strokes,
          }
        }

        return layer
      })

      history.setPresent(updated)
    },
    [layers, history]
  )
  const addLayer = useCallback(() => {
    const layerNumber = layers.length + 1
    const newLayer = {
      id: `layer-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: `Layer ${layerNumber}`,
      visible: true,
      strokes: [],
    }
    const updated = [...layers, newLayer]
    history.setPresent(updated)
    setActiveLayerId(newLayer.id)
    return newLayer.id
  }, [layers, history])

  const deleteLayer = useCallback(
    (layerId) => {
      if (layers.length <= 1) return

      const updated = layers.filter((l) => l.id !== layerId)
      history.setPresent(updated)

      if (activeLayerId === layerId) {
        const nextActive = updated[updated.length - 1]?.id
        if (nextActive) setActiveLayerId(nextActive)
      }
    },
    [layers, activeLayerId, history]
  )

  const renameLayer = useCallback(
    (layerId, newName) => {
      const trimmed = newName.trim()
      if (!trimmed) return

      const updated = layers.map((l) =>
        l.id === layerId ? { ...l, name: trimmed } : l
      )
      history.setPresent(updated)
    },
    [layers, history]
  )

  const toggleLayerVisibility = useCallback(
    (layerId) => {
      const updated = layers.map((l) =>
        l.id === layerId ? { ...l, visible: !l.visible } : l
      )
      history.setPresent(updated)
    },
    [layers, history]
  )

  const reorderLayers = useCallback(
    (draggedIndex, targetIndex) => {
      if (draggedIndex === targetIndex) return
      const next = [...layers]
      const [removed] = next.splice(draggedIndex, 1)
      next.splice(targetIndex, 0, removed)
      history.setPresent(next)
    },
    [layers, history]
  )

  const resetLayers = useCallback(
    (newLayers) => {
      const resetState =
        newLayers && newLayers.length > 0 ? newLayers : [createInitialLayer()]
      history.reset(resetState)
      setActiveLayerId(resetState[resetState.length - 1].id)
    },
    [history]
  )

  return {
    layers,
    activeLayerId,
    setActiveLayerId,
    addStroke,
    updateStroke,
    addLayer,
    deleteLayer,
    renameLayer,
    toggleLayerVisibility,
    reorderLayers,
    resetLayers,
    undo: history.undo,
    redo: history.redo,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
  }
}
