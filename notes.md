# Sandify v1.3.0

This is a whopper of a release. Lots of cool new features for you to try!

## New Features

### SVG Import

Import SVG files directly into Sandify. Upload any SVG to convert into a continuous drawing path. The importer handles most SVGs fairly well. Use the Min stroke width and Fill brightness filters to focus in on the elements you want. For best results, convert text to paths in your SVG editor before importing.

To try it out, click the Import button and select an SVG file.

<img height="350" alt="car" src="https://github.com/user-attachments/assets/760d201f-9577-4866-9cda-879a0ec21f4b" />
<img height="350" alt="tiger" src="https://github.com/user-attachments/assets/d2d91c0c-c505-470c-b10c-9c3e0f437d8a" />

### Layer Masks

Customize a layer (any shape and/or effects), and then use that layer as an outline to clip another layer. This feature opens up infinite creative possibilities like filling text with patterns or creating custom-shaped designs. We can't wait to see what you come up with.

Sandify tries to automatically detect the best outline for your mask based on the shape, but if  doesn't look right, you can override it by changing the Border Type.

To try it out, add the 'Mask' effect to a layer and then select another layer as the source. The selected mask layer is automatically hidden.

<img height="300" alt="image" src="https://github.com/user-attachments/assets/762473f6-0c79-4d95-9e67-2032afbfee19" />
<img height="300" alt="image" src="https://github.com/user-attachments/assets/fea38663-b2f1-4a72-921d-463085f37e48" />
<img height="300" alt="image" src="https://github.com/user-attachments/assets/f23a25cb-df59-472d-b648-1e68af638584" />
<img height="300" alt="image" src="https://github.com/user-attachments/assets/066f7c11-8f35-40de-a424-6b9f9be1c3ac" />

### Vibrations Shape

Chladni figures are patterns Ernst Chladni discovered by bowing metal plates covered in sand - the sand collects along lines where the plate doesn't move. Choose from three methods that roughly model real-world vibration interactions, Interference, Harmonic, and Excitation. Each method has a ton of different options to play around with, all of which produce really cool designs.

To try it out, select 'Vibrations' as the layer type.

<img height="300" alt="image" src="https://github.com/user-attachments/assets/d7bb7694-8881-4b7e-9867-fd6f5246324c" />
<img height="300" alt="image" src="https://github.com/user-attachments/assets/84ffd01f-55a3-48be-a279-b2e0d9491e41" />
<img height="300" alt="image" src="https://github.com/user-attachments/assets/fef0d599-b51a-4be3-aeae-e2323b4c5a2e" />
<img height="300" alt="image" src="https://github.com/user-attachments/assets/ddb1598f-4409-4f09-8066-c1c39d6d9328" />
<img height="300" alt="image" src="https://github.com/user-attachments/assets/799558fe-36d9-446f-91cb-bae5c8c909cd" />

### Flow Tiles Shape

Create flowing maze-like patterns using Truchet tiles. These deceptively simple tiles - squares with two orientation options - connect to form continuous winding paths. Choose between Arc and Diagonal styles. You can adjust the grid size, stroke width, and seed to explore different configurations.

To try it out, select 'Flow Tile' as the layer type.

<img height="300" alt="image" src="https://github.com/user-attachments/assets/a06fd26e-abd7-4b80-b60c-f1fe63be51fa" />
<img height="300" alt="image" src="https://github.com/user-attachments/assets/29c03ac3-5225-4560-b31a-d2d70050f44b" />
<img height="300" alt="image" src="https://github.com/user-attachments/assets/9c03b403-dc60-48d9-a8eb-b0923ae386b6" />
<img height="300" alt="image" src="https://github.com/user-attachments/assets/0c9cd0e6-ba5a-4d55-b43f-4c69b800b001" />

### Pixelate Effect

Turn any pattern into pixel art! The Pixelate effect converts shapes into a grid of filled squares, with an adjustable pixel size.

To try it out, add the 'Pixelate' effect to any layer.

<img height="300" alt="image" src="https://github.com/user-attachments/assets/0dc89e22-3490-4039-9125-a66711ba040e" />
<img height="300" alt="image" src="https://github.com/user-attachments/assets/58bd9ac8-b4ec-47f2-920e-9f995ffb2fa1" />

## Other improvements and Fixes

- Added several performance optimizations to speed up rendering and dramatically reduce browser hanging issues with very complex patterns.
- Improved the drawing of accurate borders when using the Fine Tuning effect, and added a Border Type option for more control when needed.
- Fixed Fancy Text rendering of Noto Emoji characters.
- Fixed range slider inputs not updating correctly when typing values.

## Forum Discussion

Head over to the [V1 Engineering forum](https://forum.v1e.com) to discuss this release, ask questions, or share what you've created!
