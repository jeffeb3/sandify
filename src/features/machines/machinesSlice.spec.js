import { resetUniqueId } from "@/common/mocks"
import machinesReducer, {
  defaultMachineState,
  addMachine,
  deleteMachine,
  updateMachine,
  setCurrentMachine,
} from "./machinesSlice"

beforeEach(() => {
  resetUniqueId()
})

describe("machines reducer", () => {
  it("should handle initial state", () => {
    const machineState = {
      ...defaultMachineState,
      id: "1",
    }

    expect(machinesReducer(undefined, {})).toEqual({
      ids: ["1"],
      entities: {
        1: machineState,
      },
      current: "1",
    })
  })

  it("should handle addMachine", () => {
    expect(
      machinesReducer(
        {
          ids: [],
          entities: {},
        },
        addMachine({
          name: "foo",
        }),
      ),
    ).toEqual({
      ids: ["1"],
      entities: {
        1: {
          id: "1",
          name: "foo",
        },
      },
      current: "1",
    })
  })

  it("should handle deleteMachine", () => {
    expect(
      machinesReducer(
        {
          ids: ["1"],
          entities: {
            1: {
              id: "1",
              name: "foo",
            },
          },
        },
        deleteMachine("1"),
      ),
    ).toEqual({
      entities: {},
      ids: [],
    })
  })

  it("should handle updateMachine", () => {
    expect(
      machinesReducer(
        {
          ids: ["1"],
          entities: {
            1: {
              id: "1",
              name: "foo",
            },
          },
        },
        updateMachine({ id: "1", name: "bar" }),
      ),
    ).toEqual({
      ids: ["1"],
      entities: {
        1: {
          id: "1",
          name: "bar",
        },
      },
    })
  })

  it("should handle setCurrentMachine", () => {
    expect(
      machinesReducer(
        {
          entities: {
            0: {},
            1: {},
          },
          current: "0",
        },
        setCurrentMachine("1"),
      ),
    ).toEqual({
      entities: {
        0: {},
        1: {},
      },
      current: "1",
    })
  })
})
