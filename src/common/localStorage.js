export const loadState = (key='state') => {
  try {
    const serializedState = localStorage.getItem(key)
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState)
  } catch (err) {
    return undefined
  }
}

export const saveState = (state, key='state') => {
  try {
    const serializedState = JSON.stringify(state)
    localStorage.setItem(key, serializedState)
  } catch(err) {
    // ignore write errors
  }
}
