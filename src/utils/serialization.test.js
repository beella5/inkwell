import { describe, it, expect } from 'vitest'
import { serialize, deserialize } from './serialization'

describe('serialization utilities', () => {
  it('round-trip: serialize -> deserialize returns equivalent object', () => {
    const mockLayers = [
      {
        id: 'layer-1',
        name: 'Layer 1',
        visible: true,
        strokes: [
          {
            tool: 'pen',
            color: '#722F43',
            size: 4,
            points: [
              { x: 10, y: 10 },
              { x: 20, y: 25 },
            ],
          },
        ],
      },
    ]

    const serialized = serialize(mockLayers)
    expect(typeof serialized).toBe('string')

    const deserialized = deserialize(serialized)
    expect(deserialized).not.toBeNull()
    expect(deserialized.version).toBe('v1')
    expect(deserialized.layers).toEqual(mockLayers)
  })

  it('deserialize missing version -> returns null, does not throw', () => {
    const invalidJson = JSON.stringify({
      layers: [{ id: '1', name: 'Test' }],
    })

    expect(() => {
      const result = deserialize(invalidJson)
      expect(result).toBeNull()
    }).not.toThrow()
  })

  it('deserialize corrupt JSON -> returns null, does not throw', () => {
    const corruptStrings = [
      '{',
      '{"version": "v1", layers: broken',
      'undefined',
      '',
      null,
      123,
    ]

    corruptStrings.forEach((str) => {
      expect(() => {
        const result = deserialize(str)
        expect(result).toBeNull()
      }).not.toThrow()
    })
  })
})

