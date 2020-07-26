import Victor from 'victor'
import Shape, { shapeOptions } from './Shape'

const canvasId = 'bwimage_canvas'

const options = {
  ...shapeOptions,
  ...{
    imageFile: {
      title: 'Load image',
      type: 'file',
      canvasId: canvasId,           // canvas element id
      canvasVisible: false          // hide the canvas (will show up once an image is loaded)
    },
    lineSpacing: {
      title: 'Line spacing',
      min: 0.1
    },
    colorDifferenceStep: {
      title: 'Line step'
    },
    darkness: {
      title: 'Darkness threshold',
      min: 1,
      max: 254
    },
    inversion: {
      title: 'Invert dark and white',
      type: 'checkbox'
    },
  }
}

export default class BWImage extends Shape {
  constructor() {
    super('Image')
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        type: 'bwimage',
        imageFile: false,
        lineSpacing: 2,
        colorDifferenceStep: 8,
        darkness: 254/2,
        inversion: false
      }
    }
  }

  getInitialTransformState() {
    return {
      ...super.getInitialTransformState(),
      ...{
        startingSize: 1,
        canChangeSize: false,             // need this to get the machine state and calculate the borders of the area
        numLoops:1,                       // do not need to repeat the shape
        transformMethod: "intact",        // do not want to distort the shape
        repeatEnable: false 
      }
    }
  }

  getVertices(state) {
    const file_loaded = state.shape.imageFile
    let points = []

    if (file_loaded){                     // produces points only if a file has been loaded
      try{
        const darknessThreshold = state.shape.darkness
        const darknessInversion = state.shape.inversion
        const position_on_border = 2

        // get machine size
        const machine = state.machine
        let sizeX, sizeY
        if (machine.rectangular) {
          sizeX = machine.maxX - machine.minX
          sizeY = machine.maxY - machine.minY
        } else {
          sizeX = sizeY = machine.maxRadius * 2.0
        }

        // need to save the file into a canvas and load from it
        // cannot save any value of the image into the state (because it is not serializable and it will slow down everything too much)
        let canvas = document.getElementById(canvasId)
        let ctx = canvas.getContext('2d')
        const image = ctx.getImageData(0, 0, canvas.width, canvas.height)

        const w = image.width
        const h = image.height
        const scale = Math.max(w/sizeX, h/sizeY)
        const spacing = state.shape.lineSpacing*scale || 1
        const colorDifferenceStep = state.shape.colorDifferenceStep*scale

        let leftSidePoint = true
        let isDarkLine = false
        let darkLineOffset = 0

        // check if the first pixel is dark
        if ((this.getPixelDarkness(ctx.getImageData(w,0,1,1).data) < darknessThreshold) ^ darknessInversion){ 
          darkLineOffset = colorDifferenceStep
          isDarkLine = true
        }

        // map an image pixel to a pointo of the machine bed
        function mapXY(state, x, y){
          return new Victor((x-0.5)*state.machine.maxX, (y-0.5)*state.machine.maxY)
        }

        // border points function
        function addBorderPoints(i, shape){
          // create padding lines
          let pos = position_on_border
          if(!leftSidePoint){
            pos = -pos
          }
          points.push(mapXY(state, pos, (i+darkLineOffset-spacing)/h))
          points.push(mapXY(state, pos, (i+darkLineOffset)/h))
          
          // change direction of the scanning line
          leftSidePoint = !leftSidePoint
        }

        // TODO center the image on creation
        // TODO check error with vertical lines
        // TODO add padding to canvas to make the image smaller?
        // TODO add different line tipes for the colors (instead of straight use a different curve like sin or triangular)
        // TODO use different line density for the colors instead of line step
        // TODO add image rotation with respect to the lines
        // TODO fix css/visualization for the canvas?

        // the cycle iterate from -h to +h in addition to the image size
        // the cycle will add padding lines until i reaches 0 and when i is over h in order to add padding lines
        // the padding lines are necessary when the image is moved around
        for(let i=-h; i<2*h;  i+=spacing){              // iterating rows
          addBorderPoints(i)

          if(i>0 && i<h+spacing){
            // if i is in the h range create vertex from the color change
            for(let j=0, tmpJ=0; j<w; j+=1){            // iterating columns
              //check if it's moving from left to right or right to left
              tmpJ = leftSidePoint ? j : w-j
              if ((this.getPixelDarkness(ctx.getImageData(tmpJ,h-i,1,1).data) < darknessThreshold) ^ darknessInversion){ 
                if(!isDarkLine){
                  isDarkLine = true
                  points.push(mapXY(state, tmpJ/w, (i+darkLineOffset)/h))
                  darkLineOffset = colorDifferenceStep
                  points.push(mapXY(state, tmpJ/w, (i+darkLineOffset)/h))
                }
              }else{
                if(isDarkLine){
                  isDarkLine = false
                  points.push(mapXY(state, tmpJ/w, (i+darkLineOffset)/h))
                  darkLineOffset = 0
                  points.push(mapXY(state, tmpJ/w, (i+darkLineOffset)/h))
                }
              }
            }
          }
        }
      }
      catch(err){
        console.log(err)
      }
    }
    return points
  }

  getPixelDarkness(pixel){
    return (pixel[0]+pixel[1]+pixel[2])/3
  }

  getOptions() {
    return options
  }
}