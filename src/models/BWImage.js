import Victor from 'victor'
import Shape, { shapeOptions } from './Shape'

const options = {
  ...shapeOptions,
  ...{
    image_file: {
      title: 'Load image',
      type: 'file'
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
        image_file: ""
      }
    }
  }

  getVertices(state) {
    let value = state.shape.image_file
    let points = []

    if (value !== ""){
      try{
        let im = new Image()
        let canvas = document.createElement("canvas")
        im.onload = function(){
            let ctx = canvas.getContext('2d')
            ctx.drawImage(im, 0, 0)
            let w = canvas.width
            let h = canvas.height
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
        im.src = value
        //document.body.appendChild(canvas);
      }
      catch(err){
        console.log(err)
      }
    }
    // need to add a way to wait for the points to be ready
    //TODO remove repetitions (or loop)
    return points
  }

  getOptions() {
    return options
  }
}
