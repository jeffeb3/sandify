import React, { Component } from 'react'

class Slider extends Component {
  constructor(props) {
    super(props)
    this.state = {
      rangeValue: this.props.initialValue
    }
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({ rangeValue: event.target.value });
  }

  render() {
    return (
      <div>
        {this.props.sliderLabel}:<input id={this.props.id} value={this.props.initialValue} type="range" min={this.props.minValue} max={this.props.maxValue}   onChange={this.props.onChange}/>
      </div>
    )
  }
}

export default Slider
