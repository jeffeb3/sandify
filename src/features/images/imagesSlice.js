import {
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
} from "@reduxjs/toolkit"
import { prepareAfterAdd } from "@/common/slice"

// ------------------------------
// Slice, reducers and atomic actions
// ------------------------------

const adapter = createEntityAdapter()

let loadCount = 0
export const imagesSlice = createSlice({
  name: "images",
  initialState: {
    ...adapter.getInitialState(),
    loaded: false,
  },
  reducers: {
    addImage: {
      reducer(state, action) {
        adapter.addOne(state, action)
      },
      prepare(image) {
        return prepareAfterAdd(image)
      },
    },
    deleteImage: (state, action) => {
      adapter.removeOne(state, action)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadImage.fulfilled, (state, action) => {
      loadCount++
      state.loaded = loadCount == state.ids.length
    })
  },
})

export default imagesSlice.reducer
export const { addImage, deleteImage } = imagesSlice.actions

// ------------------------------
// Selectors
// ------------------------------

export const { selectAll: selectAllImages } = adapter.getSelectors(
  (state) => state.images,
)

export const selectImagesLoaded = (state) => state.images.loaded

// ------------------------------
// Thunks
// ------------------------------

export const loadImage = createAsyncThunk(
  "images/getImage",
  async ({ imageId, imageSrc }) => {
    return new Promise((resolve, reject) => {
      const div = document.getElementById("image-importer")
      const canvas = document.createElement("canvas")
      const image = new Image()

      canvas.setAttribute("id", `${imageId}-canvas`)
      div.appendChild(canvas)

      image.onload = (event) => {
        const context = canvas.getContext("2d", {
          willReadFrequently: true,
        })

        // scale down resolution for both performance and aesthetic reasons
        let cw = 800
        let ch = 600
        const w = image.width
        const h = image.height

        if (w > cw || h > ch) {
          ch = Math.round((cw * h) / w)
        } else if (w > 10 && h > 10) {
          ch = h
          cw = w
        }

        canvas.height = ch
        canvas.width = cw
        context.clearRect(0, 0, canvas.width, canvas.height)
        context.drawImage(image, 0, 0, canvas.width, canvas.height)

        resolve()
      }

      image.src = imageSrc
    })
  },
)
