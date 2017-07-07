## Sandify 

Sandify is working on a solution to turn your cold, empty hearted, emotionless sand tables into cold, empty hearted emotionless sand table robots with enchanting patterns.

The output of sandify is gcode you can run on your MPCNC based sand table. The requirements of this
gcode are:
 - Continuous, since the ball can't lift to travel to another location
 - Can't exceed machine limits, since the firmware isn't smart enough about how the limits are
 handled.
 - Not a requirement, but the patterns would be better if they mostly cover the area.

Different designs are possible, and input is welcome from the community. The inputs are currently in
heavy development, but we hope to have a simple example that someone could follow to allow someone
with limited programming experience help us develop new and interesting patterns as input. The
sandify preview window, gcode generator, and machine limits will come to you for free.

## Using the tool

It's currently hosted at:

https://jeffeb3.github.io/sandify/

 - Visit the webpage
 - Adjust the machine limits to match your build
 - Play with the inputs until you have a pleasing pattern.
 - Save the gcode with the generate GCode button.

## More info

See the birthplace here:

https://www.vicious1.com/forum/topic/does-this-count-as-a-build/

## Running sandify from source on a local machine

AFAIK, the steps to replicate this on your machine are:

 - Install npm and node.js
 - Run 'npm install' from here
 - Run 'npm start' and it should open your browser to http://127.0.0.1:3000

When we want to "deploy" the website, we can do so with 'npm run deploy' command. So much magic. 

