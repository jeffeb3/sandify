# This is a utility to convert the text from Ray to a format we can easily use in sandify.

import string

def getLetterCodex(infont):
    letters = \
        [' '] + \
        [letter for letter in string.digits + \
            string.ascii_uppercase + \
            string.ascii_lowercase] + \
        [' '] + \
        [letter + "*" for letter in string.ascii_lowercase] + \
        [',','?','&','$','!','%']

    if 'sanserif' in infont:
        # Add a vertex to the right, to increase the spacing a little.
        addSpace = True
    else:
        addSpace = False
    letterIndex = 0
    letterVertices = []
    letterCodex = []
    with open(infont, 'r') as abcd:
        for line in abcd:
            if not line.strip():
                continue
            values = line.split()
            xScale = 2.0
            scale = 8.5
            offsetY = -0.175-(0.149/8.5)
            vertex = (scale * float(values[1]) * xScale, scale * (float(values[2])+offsetY))
            # This is a new letter
            if values[0] == '1':
                if not letterVertices:
                    print ("Empty Letter")
                else:
                    if addSpace:
                        # This distance, 0.02, gets varied in the original code... A lot.
                        extraDistance = 0.02
                        spaceVertex = (scale * xScale * extraDistance + letterVertices[-1][0], letterVertices[-1][1])
                        letterVertices.append(spaceVertex)
                    if letterIndex != 63:
                        letterCodex.append((letters[letterIndex], letterVertices))
                    letterIndex += 1
                    letterVertices = []
                    continue

            letterVertices.append(vertex)
    return letterCodex


fonts = [ ('raysol_cursive.txt', 'raysol_cursive'),
          ('raysol_sanserif.txt','raysol_sanserif') ]

for infont, outfont in fonts:
    with open(outfont + '.js', 'w') as output:
        output.write('export let ' + outfont + ' = {\n')
        for letter, vertices in getLetterCodex(infont):
            vertexString = ''
            for vertex in vertices:
                vertexString += "[%0.03f,%0.03f], " % vertex
            output.write("  '%s' : [ %s ],\n" % (letter, vertexString))
        output.write('}\n')

