# Sandify v1.3.0

This is a whopper of a release. Lots of cool new features for you to try!

## New Features

### SVG Import

Import SVG files directly into Sandify. Upload any SVG to convert into a continuous drawing path. The importer handles most SVGs fairly well.

Use the Min stroke width and Fill brightness filters to focus in on the elements you want. For best results, convert text to paths in your SVG editor before importing.

To try it out, click the Import button and select an SVG file.

<image: svg import tiger>

<image: svg import car>

### Layer Masks

Customize a layer (any shape and/or effects), and then use that layer as an outline to clip another layer. This feature opens up infinite creative possibilities like filling text with patterns or creating custom-shaped designs. We can't wait to see what you come up with.

Sandify tries to automatically detect the best outline for your mask based on the shape, but if  doesn't look right, you can override it by changing the Border Type.

To try it out, add the 'Mask' effect to a layer and then select another layer as the source. The the selected (mask) layer is automatically hidden.

<image: layer mask text filled>

<image: layer mask polygon>
s
### Vibrations Shape

Chladni figures are patterns Ernst Chladni discovered by bowing metal plates covered in sand - the sand collects along lines where the plate doesn't move.

Choose from three methods that roughly model real-world vibration interactions, Interference, Harmonic, and Excitation. Each method has a ton of different options to play around with, all of which produce really cool designs.

To try it out, select 'Vibrations' as the layer type.

<image: chladni rectangular interference>

<image: chladni circular>

### Flow Tiles Shape

Create flowing maze-like patterns using Truchet tiles. These deceptively simple tiles - squares with two orientation options - connect to form continuous winding paths.

Choose between Arc and Diagonal styles. You can adjust the grid size, stroke width, and seed to explore different configurations.

To try it out, select 'Flow Tile' as the layer type.

<image: flow tile arc>

<image: flow tile diagonal>

### Pixelate Effect

Turn any pattern into pixel art! The Pixelate effect converts shapes into a grid of filled squares, with an adjustable pixel size.

To try it out, add the 'Pixelate' effect to any layer.

<image: pixelate effect>

## Other improvements and Fixes

- Added several performance optimizations to speed up rendering and dramatically reduce browser hanging issues with very complex patterns
- Improved the drawing of accurate borders when using the Fine Tuning effect, and added a Border Type option for more control when needed.
- Fixed Fancy Text rendering of Noto Emoji characters
- Fixed range slider inputs not updating correctly when typing values

## Forum Discussion

Head over to the [V1 Engineering forum](https://forum.v1e.com) to discuss this release, ask questions, or share what you've created!
