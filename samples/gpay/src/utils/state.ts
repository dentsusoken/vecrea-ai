import type { ResultState } from "../types/state.js"

export const resultState: ResultState = {
  value: "",
  version: 0,
  updatedAt: Date.now(),
}

export function setResult(value: string) {
  resultState.value = value
  resultState.version++
  resultState.updatedAt = Date.now()
}
