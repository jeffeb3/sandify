import sawtooth from "./sawtooth"
import spiral from "./spiral"
import springs from "./springs"
import squiggle from "./squiggle"
import polyspiral from "./polyspiral"
import waves from "./waves"

export const subtypes = {
  Squiggle: {
    algorithm: squiggle,
    settings: [
      "imageFrequency",
      "imageLineCount",
      "imageAmplitude",
      "imageSampling",
      "imageModulation",
    ],
  },
  Spiral: {
    algorithm: spiral,
    settings: ["imageFrequency", "imageAmplitude", "imageSpacing"],
  },
  "Polygon Spiral": {
    algorithm: polyspiral,
    settings: [
      "imageFrequency",
      "imagePolygon",
      "imageLineCount",
      "imageAmplitude",
      "imageSpacing",
    ],
  },
  Sawtooth: {
    algorithm: sawtooth,
    settings: [
      "imageFrequency",
      "imageLineCount",
      "imageAmplitude",
      "imageSpacing",
    ],
  },
  Springs: {
    algorithm: springs,
    settings: [
      "imageFrequency",
      "imageLineCount",
      "imageAmplitude",
      "imageSampling",
      "imageDirection",
    ],
  },
  Waves: {
    algorithm: waves,
    settings: ["imageAngle", "imageStepSize"],
  },
}

// some protection against bad data
export const getSubtype = (subtype) => {
  return subtypes[subtype] || subtypes["Squiggle"]
}
