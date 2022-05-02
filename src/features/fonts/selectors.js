import { createSelector } from 'reselect'
import { getFonts } from '../store/selectors'

export const getLoadedFonts = createSelector(getFonts, (fonts) => {
  return fonts.loaded ? fonts.fonts : null
})
