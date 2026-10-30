/**
 * Pure serialization utilities for Inkwell workspace state
 */

export function serialize(layers, backgroundPattern = 'blank') {
  if (
    layers &&
    typeof layers === 'object' &&
    !Array.isArray(layers) &&
    layers.layers
  ) {
    return JSON.stringify({
      version: 'v1',
      layers: layers.layers,
      backgroundPattern: layers.backgroundPattern || 'blank',
    })
  }
  return JSON.stringify({
    version: 'v1',
    layers,
    backgroundPattern,
  })
}

export function deserialize(str) {
  if (!str || typeof str !== 'string') return null
  try {
    const data = JSON.parse(str)
    if (!data || typeof data !== 'object' || data.version !== 'v1') {
      return null
    }
    return data
  } catch {
    return null
  }
}
