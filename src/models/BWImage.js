import Victor from 'victor'
import Shape, { shapeOptions } from './Shape'

const options = {
  ...shapeOptions,
  ...{
    lineSpacing: {
      title: 'Line spacing',
      min: 0.1
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
    lineType: {
      title: 'Line type',
      type: 'dropdown',
      choices: ['Straight', 'Sine', 'Triangular', 'Spiral', 'Density', 'Squiggle'],
    },
    frequency: {
      title: 'Frequency',
      min:1,
      max: 200
    },
    colorDifferenceStep: {
      title: 'Amplitude'
    },
    canvasId: {
      isVisible: function(){return false}
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
        lineSpacing: 4,
        colorDifferenceStep: 4,
        darkness: 254/2,
        inversion: false,
        lineType: "Straight",
        frequency: 20,
        startingSize: 1,
        canvasId: 'false',
        usesMachine: true,
        numLoops:1,                       // do not need to repeat the shape
        transformMethod: "intact",        // do not want to distort the shape
        repeatEnable: false,
        canTransform: false,
        selectGroup: "import",            // the user cannot select the image directly
        addToLocalStorage: false
      }
    }
  }

  getVertices(state) {
    const file_loaded = state.shape.canvasId
    let points = []

    // produces points only if a file has been loaded. 
    // To update the shape preview when changing picture also the input value must change: at the beginning the value is "false", the when a file is loaded is a random number
    if (file_loaded !== "false"){
      try{
        const darknessThreshold = state.shape.darkness
        const darknessInversion = state.shape.inversion
        const lineType = state.shape.lineType
        const frequency = 2*Math.PI * (state.shape.frequency || 1 )

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
        let canvas = document.getElementById(state.shape.canvasId)
        let ctx = canvas.getContext('2d')
        const image = ctx.getImageData(0, 0, canvas.width, canvas.height)

        const w = image.width
        const h = image.height
        const scale = Math.max(w/sizeX, h/sizeY)
        // calculate offsets to center the shape
        // -0.5*xxxxx to center the shape to the bed (0, 0 is in the middle of the drawing)
        const xoffset = -(w/scale)/2 
        const yoffset = -(h/scale)/2
        const spacing = state.shape.lineSpacing*scale || 1
        const amplitude = (state.shape.colorDifferenceStep || 1)*scale/h
        const positionOnBorder = 2

        let leftSidePoint = true
        let isDarkLine = false
        let lastX = -positionOnBorder
        
        // check if the first pixel is dark
        if ((this.getPixelDarkness(ctx.getImageData(w,0,1,1).data) < darknessThreshold) ^ darknessInversion){ 
          isDarkLine = true
        }

        // map an image pixel to a point of the machine bed
        function mapXY(x, y){
          return new Victor(x*w/(scale) + xoffset, y*h/(scale) + yoffset)
        }

        function addLine(startx, endx, centery){
          if (lineType === "Straight") {
            points.push(mapXY(startx, centery+amplitude));
            points.push(mapXY(endx,   centery+amplitude));
          }else if (lineType === "Sine") {
            if (startx < endx){
              for(let s = startx; s <= endx; s+=1/(frequency)){
                points.push(mapXY(s, centery + amplitude*Math.sin(s*frequency)))
              }
            }else{
              for(let s = startx; s >= endx; s-=1/(frequency)){
                points.push(mapXY(s, centery + amplitude*Math.sin(s*frequency)))
              }
            }
          }else if (lineType === "Triangular"){
            let diff_sign = 1
            // aligning the waves
            startx = Math.floor(startx*2*frequency)/(2*frequency)
            if (Math.floor(startx*frequency)/(frequency) !== startx){
              diff_sign *= -1
            }
            // creating the waves
            if (startx < endx){
              for(let s = startx; s <= endx; s+=1/(2*frequency)){
                points.push(mapXY(s, centery + amplitude/2*diff_sign))
                diff_sign *= -1
              }
            }else{
              for(let s = startx; s >= endx; s-=1/(2*frequency)){
                points.push(mapXY(s, centery + amplitude/2*diff_sign))
                diff_sign *= -1
              }
            }
          }else if(lineType === "Spiral"){
            if (startx < endx){
              for(let s = startx; s <= endx; s+=0.001){
                points.push(mapXY(s + amplitude*Math.cos(s*frequency*5), centery + amplitude*Math.sin(s*frequency*5)))
              }
            }else{
              for(let s = startx; s >= endx; s-=0.001){
                points.push(mapXY(s + amplitude*Math.cos(s*frequency*5), centery + amplitude*Math.sin(s*frequency*5)))
              }
            }
          }else if (lineType === "Density"){
            centery = (Math.floor(centery*1000*amplitude))/(amplitude*1000)-amplitude/2
            points.push(mapXY(startx, centery+amplitude));
            points.push(mapXY(endx,   centery+amplitude));
          }
        }

        // border points function
        function addBorderPoints(i, isDarkLine){
          // create padding lines
          let pos = positionOnBorder
          if(!leftSidePoint){
            pos = -pos+1
          }
          if(isDarkLine){
            addLine(lastX, pos, (i-spacing)/h)
          }else{
            points.push(mapXY(pos, (i-spacing)/h))
          }
          points.push(mapXY(pos, i/h))
          lastX = pos
          
          // change direction of the scanning line
          leftSidePoint = !leftSidePoint
        }

        // the cycle iterate from -h to +h in addition to the image size
        // the cycle will add padding lines until i reaches 0 and when i is over h in order to add padding lines
        // the padding lines are necessary when the image is moved around
        for(let i=-h; i<2*h;  i+=spacing){              // iterating rows
          addBorderPoints(i, isDarkLine)

          if(i>0 && i<h+spacing){
            // if i is in the h range create vertex from the color change
            for(let j=0, tmpJ=0; j<w; j+=1){            // iterating columns
              //check if it's moving from left to right or right to left
              tmpJ = leftSidePoint ? j : w-j
              if (lineType === "Squiggle"){
                let dk = this.getPixelDarkness(ctx.getImageData(tmpJ,h-i,1,1).data)
                let r = (255 - dk)/255 * amplitude
                let a = (255 - dk)/frequency
                points.push(mapXY(tmpJ/w, i/h + Math.sin(a)*r))
              }else{
                if ((this.getPixelDarkness(ctx.getImageData(tmpJ,h-i,1,1).data) < darknessThreshold) ^ darknessInversion){ 
                  if(!isDarkLine){
                    isDarkLine = true
                    points.push(mapXY(tmpJ/w, i/h))
                    lastX = tmpJ/w
                  }
                }else{
                  if(isDarkLine){
                    isDarkLine = false
                    addLine(lastX, tmpJ/w, i/h)
                    points.push(mapXY(tmpJ/w, i/h))
                  }
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
    if(points === []) {
      points.push(new Victor(0,0))
      points.push(new Victor(0,0))
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