## Sandify 

Sandify is working on a solution to turn your cold, empty hearted, emotionless sand tables into cold, empty hearted emotionless sand table robots with enchanting patterns.

[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fjeffeb3%2Fsandify%2Fbadge&style=for-the-badge)](https://actions-badge.atrox.dev/jeffeb3/sandify/goto)

The output of sandify is code you can run on your sand table. The requirements of this
code are:
 - Continuous, since the ball can't lift to travel to another location
 - Can't exceed machine limits, since the firmware isn't smart enough about how the limits are
 handled.
 - Not a requirement, but the patterns would be better if they mostly cover the area.

Different designs are possible, and input is welcome from the community.

## Using the tool

It's currently hosted at:

https://sandify.org

 - Visit the webpage
 - Adjust the machine limits to match your build
 - Play with the inputs until you have a pleasing pattern.
 - Save the code with the export button.

[Check out the wiki](https://github.com/jeffeb3/sandify/wiki)

## More info

See the birthplace here:

https://forum.v1engineering.com/t/does-this-count-as-a-build/6037?u=jeffeb3

## Running sandify from source on a local machine

AFAIK, the steps to replicate this on your machine are:

 - Install npm and node.js
 - Run 'npm install' from here
 - Run 'npm start' and it should open your browser to http://127.0.0.1:3000
