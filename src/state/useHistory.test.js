import { describe, it, expect } from 'vitest'
import { historyReducer, createHistoryReducer } from './useHistory'

describe('useHistory reducer', () => {
  it('Add action -> undo -> state reverts', () => {
    const reducer = createHistoryReducer('Initial State')
    let state = { past: [], present: 'Initial State', future: [] }

    state = reducer(state, { type: 'ADD_ACTION', payload: 'State 1' })
    expect(state.present).toBe('State 1')
    expect(state.past).toEqual(['Initial State'])

    state = reducer(state, { type: 'UNDO' })
    expect(state.present).toBe('Initial State')
    expect(state.past).toEqual([])
    expect(state.future).toEqual(['State 1'])
  })

  it('Undo -> redo -> state re-applies', () => {
    let state = {
      past: ['Step 0'],
      present: 'Step 1',
      future: [],
    }

    state = historyReducer(state, { type: 'UNDO' })
    expect(state.present).toBe('Step 0')
    expect(state.future).toEqual(['Step 1'])

    state = historyReducer(state, { type: 'REDO' })
    expect(state.present).toBe('Step 1')
    expect(state.future).toEqual([])
    expect(state.past).toEqual(['Step 0'])
  })

  it('New action after undo clears redo stack', () => {
    let state = {
      past: ['Step 0'],
      present: 'Step 1',
      future: [],
    }

    // Undo back to Step 0
    state = historyReducer(state, { type: 'UNDO' })
    expect(state.present).toBe('Step 0')
    expect(state.future).toEqual(['Step 1'])

    // New action Step 2
    state = historyReducer(state, { type: 'ADD_ACTION', payload: 'Step 2' })
    expect(state.present).toBe('Step 2')
    expect(state.past).toEqual(['Step 0'])
    expect(state.future).toEqual([]) // redo stack must be cleared
  })

  it('Undo on empty stack does nothing', () => {
    const emptyState = {
      past: [],
      present: 'Only State',
      future: [],
    }

    const stateAfterUndo = historyReducer(emptyState, { type: 'UNDO' })
    expect(stateAfterUndo).toEqual(emptyState)
    expect(stateAfterUndo.present).toBe('Only State')
  })
})

