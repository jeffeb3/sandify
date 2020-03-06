
import string
letters = \
    [' '] + \
    [letter for letter in string.digits + \
        string.ascii_uppercase + \
        string.ascii_lowercase] + \
    [' '] + \
    [letter + "*" for letter in string.ascii_lowercase] + \
    [',','?','&','$','!','%']

letterIndex = 0
letterVertices = []
letterCodex = []
with open('abcd.txt', 'r') as abcd:
    for line in abcd:
        if not line.strip():
            continue
        values = line.split()
        vertex = (float(values[1]), float(values[2]))

        # This is a new letter
        if values[0] == '1':
            if not letterVertices:
                print ("Empty Letter")
            else:
                if letterIndex != 63:
                    letterCodex.append((letters[letterIndex], letterVertices))
                letterIndex += 1
                letterVertices = []
                continue

        letterVertices.append(vertex)

with open('raysoloman_cursive.js', 'w') as output:
    output.write('let raysol = {\n')
    for letter, vertices in letterCodex:
        vertexString = ''
        for vertex in vertices:
            vertexString += "[%0.03f,%0.03f], " % vertex
        output.write("  '%s' : [ %s ],\n" % (letter, vertexString))
    output.write('};\n')

