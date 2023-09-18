import { compact } from "lodash"

// set to true to enable console logging
const debug = false

// set to true to clear console before logging each state change
const debugConsoleClear = false

// limit which keys are shown, e.g., const keys = ['selectLayerById']
const keys = null

// keep count of log occurrences by key
const logCounts = {}

export const log = (key, id) => {
  if (debug) {
    if (!keys || keys.includes(key)) {
      const keyId = compact([id, key]).join("/")
      logCounts[keyId] ||= 0
      logCounts[keyId]++

      const message = [logCounts[keyId], keyId].join(" - ")
      console.log(message)
    }
  }
}

export const resetLogCounts = () => {
  if (debug) {
    for (const key of Object.getOwnPropertyNames(logCounts)) {
      delete logCounts[key]
    }

    if (debugConsoleClear) {
      console.clear()
    }
  }
}
