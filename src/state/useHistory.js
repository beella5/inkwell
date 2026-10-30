import { useReducer, useCallback } from 'react'

/**
 * Pure reducer handling command history (past, present, future).
 */
export function historyReducer(state, action) {
  if (!action) return state

  const type = (action.type || '').toUpperCase()

  switch (type) {
    case 'ADD_ACTION':
    case 'PUSH':
    case 'SET':
    case 'RECORD': {
      const nextPresent =
        action.payload !== undefined
          ? action.payload
          : action.action !== undefined
            ? action.action
            : action.state !== undefined
              ? action.state
              : action.data

      return {
        past: [...state.past, state.present],
        present: nextPresent,
        future: [],
      }
    }

    case 'UNDO': {
      if (!state.past || state.past.length === 0) {
        return state
      }
      const previous = state.past[state.past.length - 1]
      const newPast = state.past.slice(0, state.past.length - 1)
      return {
        past: newPast,
        present: previous,
        future: [state.present, ...state.future],
      }
    }

    case 'REDO': {
      if (!state.future || state.future.length === 0) {
        return state
      }
      const next = state.future[0]
      const newFuture = state.future.slice(1)
      return {
        past: [...state.past, state.present],
        present: next,
        future: newFuture,
      }
    }

    case 'RESET': {
      const resetValue =
        action.payload !== undefined ? action.payload : action.present
      return {
        past: [],
        present: resetValue,
        future: [],
      }
    }

    default:
      return state
  }
}

/**
 * Factory function for creating a history reducer (used for testing or custom initial states).
 */
export function createHistoryReducer(initialPresent = null) {
  const defaultInitial = {
    past: [],
    present: initialPresent,
    future: [],
  }
  return function (state = defaultInitial, action) {
    return historyReducer(state, action)
  }
}

/**
 * Custom React hook for managing undo/redo history.
 */
export default function useHistory(initialPresent) {
  const [history, dispatch] = useReducer(historyReducer, {
    past: [],
    present: initialPresent,
    future: [],
  })

  const canUndo = history.past.length > 0
  const canRedo = history.future.length > 0

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' })
  }, [])

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' })
  }, [])

  const setPresent = useCallback((newPresent) => {
    dispatch({ type: 'SET', payload: newPresent })
  }, [])

  const reset = useCallback((newPresent) => {
    dispatch({ type: 'RESET', payload: newPresent })
  }, [])

  return {
    state: history.present,
    present: history.present,
    past: history.past,
    future: history.future,
    canUndo,
    canRedo,
    undo,
    redo,
    set: setPresent,
    setPresent,
    reset,
    dispatch,
  }
}

