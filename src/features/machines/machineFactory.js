import RectMachine from "./RectMachine"
import PolarMachine from "./PolarMachine"

export const machineFactory = {
  rectangular: RectMachine,
  polar: PolarMachine,
}

export const getMachine = (state) => {
  if (typeof state === "string") {
    // "new" machine case
    state = { type: state }
  }

  return new machineFactory[state.type](state)
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
