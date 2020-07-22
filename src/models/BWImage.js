import Victor from 'victor'
import Shape, { shapeOptions } from './Shape'

const canvasId = 'bwimage_canvas'

const options = {
  ...shapeOptions,
  ...{
    image_file: {
      title: 'Load image',
      type: 'file',
      canvasId: canvasId,
      canvasVisible: false
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
        image_file: false,
      }
    }
  }

  getInitialTransformState() {
    return {
      startingSize: 10,
      canChangeSize: true,
      numLoops: 1,
      transformMethod: "intact"
    }
  }

  getVertices(state) {
    let file_loaded = state.shape.image_file
    let points = []

    if (file_loaded){
      try{
        // need to save the file into a canvas and load from it
        // cannot save any value of the image into the state (because it is not serializable and it will slow down everything too much)
        let canvas = document.getElementById(canvasId)
        let ctx = canvas.getContext('2d')
        let image = ctx.getImageData(0, 0, canvas.width, canvas.height)
        let w = image.width
        let h = image.height
        let step = 10
        let x_left_side = true
        points.push(new Victor(0,0))
        // must normalize the points scale to be between 0 and 1
        for(let i=0; i<h;  i+=step){
          if(x_left_side){
            points.push(new Victor(0,i/h))   // should use -Infinity/+Infinity but the library cannot handle it. Must check the preview how is done and set a boundary for the points there
          }else{
            points.push(new Victor(1,i/h))
          }
          x_left_side = !x_left_side
          for(let j=0; j<w; j++){
            
          }
        }
      }
      catch(err){
        console.log(err)
      }
    }
    return points
  }

  getOptions() {
    return options
  }
}
