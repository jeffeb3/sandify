export default class Exporter {
  constructor(props) {
    this.props = props
    this.lines = []
  }

  export() {
    this.lines = this.lines.concat(this.props.comments)

    this.startComments()
    this.line()
    this.keyValueLine('File name', "'" + this.props.fileName + "'")
    this.line()
    this.line('BEGIN PRE')
    this.endComments()
    this.line(this.props.pre, this.props.pre !== '')
    this.startComments()
    this.line('END PRE')
    this.endComments()

    let vertices = this.props.vertices
    if (this.props.reverse) {
      vertices = vertices.reverse()
    }

    this.exportCode(vertices)
    this.line()

    this.startComments()
    this.line('BEGIN POST')
    this.endComments()
    this.line(this.props.post, this.props.post !== '')
    this.startComments()
    this.line('END POST')

    return this.lines
  }

  line(content='', add=true) {
    if (add) {
      let padding = ''
      if (this.commenting) {
        padding = this.commentChar + ' '
        for (let i=0; i<this.indentLevel; i++) {
          padding += '  '
        }
      }
      this.lines.push(padding + content)
    }
  }

  keyValueLine(key, value, add=true) {
    this.line(key + ': ' + value, add)
  }

  optionLine(metamodel, instance, option, add=true) {
    this.line(metamodel.getOptions()[option].title + ': ' + instance[option], add)
  }

  optionLines(metamodel, instance, options, add=true) {
    options.forEach(option => {
      this.optionLine(metamodel, instance, option, add)
    })
  }

  indent() {
    this.indentLevel++
  }

  dedent() {
    this.indentLevel--
  }

  startComments() {
    this.commenting = true
  }

  endComments() {
    this.commenting = false
  }
}
