
import { useReducer, useCallback } from 'react'

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

    case 'REPLACE_PRESENT':
      return {
        ...state,
        present: action.payload,
      }

    case 'COMMIT_FROM':
      return {
        past: [...state.past, action.previousPresent],
        present: action.payload,
        future: [],
      }

    case 'UNDO': {
      if (!state.past.length) return state

      return {
        past: state.past.slice(0, -1),
        present: state.past[state.past.length - 1],
        future: [state.present, ...state.future],
      }
    }

    case 'REDO': {
      if (!state.future.length) return state

      return {
        past: [...state.past, state.present],
        present: state.future[0],
        future: state.future.slice(1),
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

  const replacePresent = useCallback((newPresent) => {
    dispatch({ type: 'REPLACE_PRESENT', payload: newPresent })
  }, [])

  const commitFrom = useCallback((previousPresent, newPresent) => {
    dispatch({
      type: 'COMMIT_FROM',
      previousPresent,
      payload: newPresent,
    })
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
    replacePresent,
    commitFrom,
    reset,
    dispatch,
  }
}


