import { useState, useEffect, useRef, useCallback } from 'react'
import { serialize, deserialize } from '../utils/serialization'

const STORAGE_KEY = 'inkwell:v1'

export function getStoredData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return deserialize(raw)
  } catch (err) {
    console.error('Failed to read from localStorage:', err)
    return null
  }
}

export default function usePersistence(layers, backgroundPattern, onRestore) {
  const [saveStatus, setSaveStatus] = useState('saved') // 'saved' | 'saving' | 'error' | 'unsaved'
  const isFirstMount = useRef(true)
  const timerRef = useRef(null)

  // Restore data on mount
  useEffect(() => {
    const stored = getStoredData()
    if (
      stored &&
      stored.layers &&
      Array.isArray(stored.layers) &&
      stored.layers.length > 0
    ) {
      if (onRestore) {
        onRestore(stored.layers, stored.backgroundPattern || 'blank')
      }
    }
  }, []) // run once on mount

  // Debounced auto-save (500ms)
  useEffect(() => {
    // Skip auto-save on initial render
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }

    setSaveStatus('saving')

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      try {
        const payload = serialize(layers, backgroundPattern)
        localStorage.setItem(STORAGE_KEY, payload)
        setSaveStatus('saved')
      } catch (err) {
        console.error('Autosave failed:', err)
        setSaveStatus('error')
      }
    }, 500)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [layers, backgroundPattern])

  const clearStorage = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    try {
      localStorage.removeItem(STORAGE_KEY)
      setSaveStatus('saved')
    } catch (err) {
      console.error('Failed to clear storage:', err)
      setSaveStatus('error')
    }
  }, [])

  return {
    saveStatus,
    clearStorage,
  }
}
