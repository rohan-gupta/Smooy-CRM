import { useState } from 'react'

export function useInputValue(initial = '') {
  const [value, setValue] = useState(initial)
  const onChange = (e) => setValue(e.target.value)
  const reset = () => setValue(initial)
  return { value, setValue, onChange, reset }
}
