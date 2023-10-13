import { resetUniqueId } from "@/common/mocks"
import machinesReducer, {
  addMachine,
  deleteMachine,
  updateMachine,
  upsertImportedMachine,
  setCurrentMachine,
  changeMachineType,
} from "./machinesSlice"
import {
  getMachine,
  getDefaultMachineType,
} from "@/features/machines/machineFactory"

const defaultMachineState = getMachine(
  getDefaultMachineType(),
).getInitialState()

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

  describe("upsertImportedMachine", () => {
    it("should create a machine if one doesn't already exist", () => {
      expect(
        machinesReducer(
          {
            ids: [],
            entities: {},
          },
          upsertImportedMachine({
            minX: 500,
          }),
        ),
      ).toEqual({
        ids: ["1"],
        entities: {
          1: {
            id: "1",
            minX: 500,
            name: "[imported]",
            imported: true,
          },
        },
        current: "1",
      })
    })

    it("should update the existing machine if it exists", () => {
      expect(
        machinesReducer(
          {
            ids: ["1"],
            entities: {
              1: {
                id: "1",
                name: "[imported]",
                imported: true,
                minX: 500,
              },
            },
            current: "1",
          },
          upsertImportedMachine({
            minX: 100,
          }),
        ),
      ).toEqual({
        ids: ["1"],
        entities: {
          1: {
            id: "1",
            name: "[imported]",
            imported: true,
            minX: 100,
          },
        },
        current: "1",
      })
    })
  })

  describe("changeMachineType", () => {
    it("should add default values", () => {
      expect(
        machinesReducer(
          {
            entities: {
              0: {
                id: "0",
              },
            },
          },
          changeMachineType({ id: "0", type: "rectangular" }),
        ),
      ).toEqual({
        entities: {
          0: {
            id: "0",
            ...defaultMachineState,
          },
        },
      })
    })

    it("should not override values if provided", () => {
      expect(
        machinesReducer(
          {
            entities: {
              0: {
                id: "0",
                minX: 100,
              },
            },
          },
          changeMachineType({ id: "0", type: "rectangular" }),
        ),
      ).toEqual({
        entities: {
          0: {
            id: "0",
            ...defaultMachineState,
            minX: 100,
          },
        },
      })
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
