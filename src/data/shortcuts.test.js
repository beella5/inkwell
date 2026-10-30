import { describe, it, expect } from 'vitest'
import shortcuts from './shortcuts'

describe('shortcuts data', () => {
  it('shortcuts.js has at least 4 entries', () => {
    expect(Array.isArray(shortcuts)).toBe(true)
    expect(shortcuts.length).toBeGreaterThanOrEqual(4)
  })

  it('every entry has keys, label, action', () => {
    shortcuts.forEach((item) => {
      expect(item).toHaveProperty('keys')
      expect(Array.isArray(item.keys)).toBe(true)
      expect(item.keys.length).toBeGreaterThan(0)

      expect(item).toHaveProperty('label')
      expect(typeof item.label).toBe('string')
      expect(item.label.trim().length).toBeGreaterThan(0)

      expect(item).toHaveProperty('action')
      expect(typeof item.action).toBe('string')
      expect(item.action.trim().length).toBeGreaterThan(0)
    })
  })
})

