﻿import { createContext, ReactNode, useContext, useMemo } from 'react'

import { Result } from '../../backend/sim/simTypes'

export interface SimContext {
  result: Result | null
}

export const SimContext = createContext<SimContext>({
  result: null,
})

interface Props extends SimContext {
  children: ReactNode
}

export function SimContextProvider({ result, children }: Props) {
  const simContext = useMemo(() => {
    return {
      result,
    }
  }, [result])

  return <SimContext.Provider value={simContext}>{children}</SimContext.Provider>
}

export const useSimContext = () => useContext(SimContext)
