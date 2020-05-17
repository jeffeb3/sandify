export default class Exporter {
  constructor(props) {
    this.props = props
    this.lines = []
  }

  export() {
    let vertices = this.props.vertices
    if (this.props.reverse) {
      vertices = vertices.reverse()
    }

    this.pre = this.props.pre
    this.post = this.props.post
    if (vertices.lenth !== 0) {
      this.variableReplace(vertices)
    }

    this.header()
    this.startComments()
    this.props.comments.forEach( comment => this.line(comment) )
    this.line()
    this.keyValueLine('File name', "'" + this.props.fileName + "'")
    this.line()
    this.endComments()
    if (this.pre !== '') {
      this.startComments()
      this.line('BEGIN PRE')
      this.endComments()
      this.line(this.pre, this.pre !== '')
      this.startComments()
      this.line('END PRE')
      this.endComments()
    }

    this.line()
    this.exportCode(vertices)
    this.line()

    if (this.post !== '') {
      this.startComments()
      this.line('BEGIN POST')
      this.endComments()
      this.line(this.post, this.post !== '')
      this.startComments()
      this.line('END POST')
      this.endComments()
    }
    this.footer()
    this.line()

    return this.lines
  }

  header() {
    // default does nothing
  }

  footer() {
    // default does nothing
  }

  variableReplace(vertices) {
    // default does nothing
  }

  line(content='', add=true) {
    if (add) {
      let padding = ''
      if (this.commenting) {
        padding = this.commentChar + (content.length > 0 ? ' ' : '')
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
