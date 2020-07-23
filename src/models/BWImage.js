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
    colorDifference: {
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
    }
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
        colorDifference: 8,
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

    if (file_loaded){
      try{
        const colorDifference = state.shape.colorDifference
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
        let spacing = state.shape.lineSpacing || 1

        // need to save the file into a canvas and load from it
        // cannot save any value of the image into the state (because it is not serializable and it will slow down everything too much)
        let canvas = document.getElementById(canvasId)
        let ctx = canvas.getContext('2d')
        const image = ctx.getImageData(0, 0, canvas.width, canvas.height)

        const w = image.width
        const h = image.height
        const scale = Math.max(w/sizeX, h/sizeY)

        let leftSidePoint = true
        let lastRemappedBorderPosition = mapXY(state, -2, -2)
        let isDarkLine = false
        let darkLineOffset = 0
        let remapped = null
        
        if ((this.getPixelDarkness(ctx.getImageData(w,0,1,1).data) < darknessThreshold) ^ darknessInversion){ 
          darkLineOffset = colorDifference
          isDarkLine = true
        }

        // padding line function
        function addPaddingLine(i){
          // create padding lines
          remapped = mapXY(state, position_on_border, (i + darkLineOffset)/h)
          if(!leftSidePoint){
            remapped.x = -remapped.x 
          }
          points.push(new Victor(remapped.x, lastRemappedBorderPosition.y))
          points.push(new Victor(remapped.x, remapped.y))
          
          // save data for next iteration
          lastRemappedBorderPosition = remapped
          leftSidePoint = !leftSidePoint
        }

        // TODO center the image on creation
        // TODO general cleanup
        // TODO improve mapXY
        // TODO fix the wrong line bug
        // TODO merge the 3 cycles
        // TODO add more control to change the lines orientation

        // first add padding lines so can scale and move the image
        for(let i=-2*h; i<0; i+=spacing*scale){
          addPaddingLine(i)
        }

        for(let i=0; i<h+spacing*scale;  i+=spacing*scale){ // iterating rows
          addPaddingLine(i)

          // create vertex inside the picture
          for(let j=0; j<w; j+=1){                          // iterating columns
            if ((this.getPixelDarkness(ctx.getImageData(w-j,i,1,1).data) < darknessThreshold) ^ darknessInversion){ 
              if(!isDarkLine){
                isDarkLine = true
                let tmp = mapXY(state, j/w, (i+darkLineOffset)/h)
                points.push(new Victor(tmp.x, tmp.y))
                darkLineOffset = colorDifference
                tmp = mapXY(state, j/w, (i+darkLineOffset)/h)
                points.push(new Victor(tmp.x, tmp.y))
              }
            }else{
              if(isDarkLine){
                isDarkLine = false
                let tmp = mapXY(state, j/w, (i+darkLineOffset)/h)
                points.push(new Victor(tmp.x, tmp.y))
                darkLineOffset = 0
                tmp = mapXY(state, j/w, (i+darkLineOffset)/h)
                points.push(new Victor(tmp.x, tmp.y))
              }
            }
          }
        }
        // add more padding line on top
        for(let i=h+spacing*scale; i<3*h; i+=spacing*scale){
          addPaddingLine(i)
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
function mapXY(state, x, y){
  return { x: (x-0.5)*state.machine.maxX, y: (y-0.5)*state.machine.maxY}
}
