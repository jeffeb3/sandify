// https://fonts.google.com/attribution; see NOTICE for license details
// Bubblegum, Caveat, EBGaramond, FiraCode, Holtwood, Lobster, Montserrat, Rouge, NotoEmoji - SIL Open Font License 1.1
// OpenSans, PermanentMarker, Roboto, Mountains of Christmas - Apache License 2.0
// SourceHanSerifCN - SIL Open Font License 1.1, Copyright 2017-2022 Adobe

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import opentype from "opentype.js"

const globalFonts = {}

// Fonts with available weight variants
// Format: { fontName: { weight: url } }
export const fontVariants = {
  Caveat: {
    Regular: "fonts/Caveat-Regular.ttf",
    Bold: "fonts/Caveat-Bold.ttf",
  },
  "Fira Code": {
    Regular: "fonts/FiraCode-Regular.ttf",
    Bold: "fonts/FiraCode-Bold.ttf",
  },
  Garamond: {
    Regular: "fonts/EBGaramond-Regular.ttf",
    Bold: "fonts/EBGaramond-Bold.ttf",
  },
  Montserrat: {
    Regular: "fonts/Montserrat-Regular.ttf",
    Bold: "fonts/Montserrat-Bold.ttf",
  },
  "Open Sans": {
    Regular: "fonts/OpenSans-Regular.ttf",
    Bold: "fonts/OpenSans-Bold.ttf",
  },
  Roboto: {
    Regular: "fonts/Roboto-Regular.ttf",
    Black: "fonts/Roboto-Black.ttf",
  },
  "Source Han Serif": {
    Regular: "fonts/SourceHanSerifCN-Regular.ttf",
    Bold: "fonts/SourceHanSerifCN-Bold.ttf",
  },
}

// Fonts without weight variants (single weight only)
const singleWeightFonts = {
  "fonts/BubblegumSans-Regular.ttf": "Bubblegum Sans",
  "fonts/HoltwoodOneSC-Regular.ttf": "Holtwood",
  "fonts/Lobster-Regular.ttf": "Lobster",
  "fonts/MountainsofChristmas-Regular.ttf": "Mountains of Christmas",
  "fonts/NotoEmoji-VariableFont_wght.ttf": "Noto Emoji",
  "fonts/PermanentMarker-Regular.ttf": "Permanent Marker",
  "fonts/RougeScript-Regular.ttf": "Rouge Script",
}

// Build supportedFonts from both sources (for backwards compatibility)
export const supportedFonts = {
  ...singleWeightFonts,
  ...Object.fromEntries(
    Object.entries(fontVariants).flatMap(([fontName, weights]) =>
      Object.entries(weights).map(([weight, url]) => [
        url,
        `${fontName}|${weight}`,
      ]),
    ),
  ),
}

// List of font names for the dropdown (without weight suffix)
export const fontNames = [
  "Bubblegum Sans",
  "Caveat",
  "Fira Code",
  "Garamond",
  "Holtwood",
  "Lobster",
  "Montserrat",
  "Mountains of Christmas",
  "Noto Emoji",
  "Open Sans",
  "Permanent Marker",
  "Roboto",
  "Rouge Script",
  "Source Han Serif",
]

// Get available weights for a font (returns null if single-weight font)
export const getFontWeights = (fontName) => {
  return fontVariants[fontName] ? Object.keys(fontVariants[fontName]) : null
}

// Get the URL for a font + weight combo
export const getFontUrl = (fontName, weight = "Regular") => {
  if (fontVariants[fontName]) {
    return fontVariants[fontName][weight] || fontVariants[fontName].Regular
  }
  // Single-weight font - find by name
  return Object.entries(singleWeightFonts).find(
    ([, name]) => name === fontName,
  )?.[0]
}

// Get the cache key for a font (used in globalFonts)
const getFontKey = (fontName, weight) => {
  return fontVariants[fontName] ? `${fontName}|${weight}` : fontName
}

// Load font by URL
export const loadFont = createAsyncThunk(
  "fonts/getFont",
  async (url, { getState }) => {
    const fontKey = supportedFonts[url]

    if (globalFonts[fontKey]) {
      return fontKey
    }

    const font = await opentype.load(url)

    globalFonts[fontKey] = font

    return fontKey
  },
  {
    condition: (url, { getState }) => {
      const fontKey = supportedFonts[url]
      const state = getState().fonts

      return !state.loadedFonts[fontKey] && !state.loadingFonts[fontKey]
    },
  },
)

// Load font by name and optional weight
export const loadFontByName = createAsyncThunk(
  "fonts/loadByName",
  async ({ fontName, weight = "Regular" }, { dispatch }) => {
    const url = getFontUrl(fontName, weight)

    if (!url) {
      throw new Error(`Unknown font: ${fontName} ${weight}`)
    }

    await dispatch(loadFont(url))

    return getFontKey(fontName, weight)
  },
  {
    condition: ({ fontName, weight = "Regular" }, { getState }) => {
      const fontKey = getFontKey(fontName, weight)
      const state = getState().fonts

      return !state.loadedFonts[fontKey] && !state.loadingFonts[fontKey]
    },
  },
)

// Get a loaded font by name and optional weight
export const getFont = (fontName, weight = "Regular") => {
  const fontKey = getFontKey(fontName, weight)
  return globalFonts[fontKey]
}

export const fontsSlice = createSlice({
  name: "fonts",
  initialState: {
    loadedFonts: {},
    loadingFonts: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadFont.pending, (state, action) => {
        const url = action.meta.arg
        const fontName = supportedFonts[url]
        state.loadingFonts[fontName] = true
      })
      .addCase(loadFont.fulfilled, (state, action) => {
        const fontName = action.payload
        state.loadedFonts[fontName] = true
        delete state.loadingFonts[fontName]
      })
      .addCase(loadFont.rejected, (state, action) => {
        const url = action.meta.arg
        const fontName = supportedFonts[url]
        delete state.loadingFonts[fontName]
      })
  },
})

// Selectors
export const selectFontLoaded = (state, fontName, weight = "Regular") => {
  const fontKey = getFontKey(fontName, weight)
  return !!state.fonts.loadedFonts[fontKey]
}

export const selectFontLoading = (state, fontName, weight = "Regular") => {
  const fontKey = getFontKey(fontName, weight)
  return !!state.fonts.loadingFonts[fontKey]
}

export default fontsSlice.reducer
