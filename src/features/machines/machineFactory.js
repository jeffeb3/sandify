import RectMachine from "./RectMachine"
import PolarMachine from "./PolarMachine"

export const machineFactory = {
  rectangular: RectMachine,
  polar: PolarMachine,
}

export const getMachine = (state) => {
  if (typeof state === "string") {
    // "new" case
    state = { type: state }
  }

  // todo: legacy case. remove this
  const type = state.type || (state.rectangular ? "rectangular" : "polar")

  return new machineFactory[type](state)
}

export const getDefaultMachineType = () => {
  return localStorage.getItem("defaultMachine") || "rectangular"
}

export const getDefaultMachine = () => {
  return getMachine(getDefaultMachineType())
}

export const getMachineSelectOptions = () => {
  const types = Object.keys(machineFactory)

  return types.map((type) => {
    return { value: type, label: getMachine(type).label }
  })
}
