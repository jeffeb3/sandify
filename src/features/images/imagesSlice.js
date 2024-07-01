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

// returns a sensibly downscaled dimensions for an loaded image (aesthetics and performance)
const downscaledDimensions = (image) => {
  let cw = 800
  let ch = 600
  const w = image.width
  const h = image.height

  if (w > cw || h > ch) {
    const aspectRatio = w / h

    if (w > h) {
      ch = Math.round(cw / aspectRatio)

      if (ch > 600) {
        ch = 600
        cw = Math.round(ch * aspectRatio)
      }
    } else {
      cw = Math.round(ch * aspectRatio)

      if (cw > 800) {
        cw = 800
        ch = Math.round(cw / aspectRatio)
      }
    }
  } else {
    cw = w
    ch = h
  }

  return { width: cw, height: ch }
}

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
        const { width, height } = downscaledDimensions(image)

        canvas.height = height
        canvas.width = width
        context.imageSmoothingEnabled = true
        context.imageSmoothingQuality = "low"
        context.clearRect(0, 0, width, height)
        context.drawImage(image, 0, 0, width, height)

        resolve()
      }

      image.src = imageSrc
    })
  },
)
