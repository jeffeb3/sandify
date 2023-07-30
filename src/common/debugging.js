import { compact } from "lodash"

// set to true to enable console logging
const debug = false

// limit which keys are shown, e.g., const keys = ['getLayer']
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
