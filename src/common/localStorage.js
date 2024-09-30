// if you want to save a multiple temporary states, use these keys. The first time
// you save a new state, change persistSaveKey. Make a change, then change
// persistLoadKey to the same value. These keys are obsolete now
// given that a user can save their pattern to a file.
const persistLoadKey = "state"
const persistSaveKey = "state"

export const loadState = (key = persistLoadKey) => {
  try {
    const serializedState = localStorage.getItem(key)
    if (serializedState === null) {
      return undefined
    }
    return JSON.parse(serializedState)
  } catch (err) {
    return undefined
  }
}

export const saveState = (state, key = persistSaveKey) => {
  try {
    const serializedState = JSON.stringify(state)
    localStorage.setItem(key, serializedState)
  } catch (err) {
    // ignore write errors
    console.log(err)
  }
}
