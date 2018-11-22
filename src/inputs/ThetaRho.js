import React, { Component } from 'react';
import {
    Col,
    ControlLabel,
    Form,
    FormControl,
    FormGroup,
    ListGroupItem,
    Panel,
    Well,
} from 'react-bootstrap'
import { connect } from 'react-redux'
import {
  setThrName,
  setThrComment,
  setThrVertices,
  setThrZoom,
  toggleThrAspectRatio,
} from '../reducers/Index.js';
import './ThetaRho.css'

const thrProps = (state, ownProps) => {
  return {
    name: state.thrName,
    comments: state.thrComment,
    vertices: state.thrVertices,
    zoom: state.thrZoom,
    aspectRatio: state.thrAspectRatio,
  }
}


const thrDispatch = (dispatch, ownProps) => {

  var convertToXY = (thetaRhos) => {
    var vertices = []
    var previous = undefined;
    var max_angle = Math.PI / 64.0;
    for (let ii = 0; ii < thetaRhos.length; ii++) {
      var next = thetaRhos[ii];
      if (previous) {
        if (Math.abs(next[0] - previous[0]) < max_angle) {
          // These sin, cos elements are inverted. I'm not sure why
          vertices.push({
                        x: previous[1] * Math.sin(previous[0]),
                        y: previous[1] * Math.cos(previous[0]),
                        f: 1000,
          });
        } else {
          // We need to do some interpolating.
          let deltaAngle = next[0] - previous[0];
          let rhoStep = max_angle / Math.abs(deltaAngle) * (next[1] - previous[1]);
          var rho = previous[1];
          if (deltaAngle > 0.0) {
            var emergency_break = 0;
            for (let angle = previous[0]; angle < next[0]; angle += max_angle, rho += rhoStep) {
              vertices.push({
                            x: rho * Math.sin(angle),
                            y: rho * Math.cos(angle),
                            f: 1000,
              });
              if (emergency_break++ > 100000) {
                break;
              }
            }
          } else {
            for (let angle = previous[0]; angle > next[0]; angle -= max_angle, rho += rhoStep) {
              vertices.push({
                            x: rho * Math.sin(angle),
                            y: rho * Math.cos(angle),
                            f: 1000,
              });
              if (emergency_break++ > 100000) {
                break;
              }
            }
          }
        }
      }
      previous = next;
    }
    return vertices;
  }

  var parseThrFile = (file) => {
    var rv = {};
    rv.comments = [];
    rv.vertices = [];

    var reader = new FileReader();

    reader.onload = (event) => {
      var text = reader.result;
      var lines = text.split('\n');
      var has_vertex = false;
      for (let ii = 0; ii < lines.length; ii++) {
        var line = lines[ii].trim();
        if (line.length === 0) {
          // blank lines
          continue;
        }
        if (line.indexOf("#") === 0 && !has_vertex) {
          rv.comments.push(lines[ii]);
        }

        if (line.indexOf("#") !== 0) {
          has_vertex = true;
          // This is a point, let's try to read it.
          var pointStrings = line.split(/\s+/);
          if (pointStrings.length !== 2) {
            // AAAH
            console.log(pointStrings);
            continue;
          }
          rv.vertices.push([parseFloat(pointStrings[0]), parseFloat(pointStrings[1])]);
        }
      }

      dispatch(setThrComment(rv.comments));
      dispatch(setThrVertices(convertToXY(rv.vertices)));
    }

    reader.readAsText(file);
  }

  return {
    setVertices: (event: any) => {
      var file = event.target.files[0];
      console.log(file)
      dispatch(setThrName(file.name));
      parseThrFile(file);
    },
    setZoom: (event) => {
      dispatch(setThrZoom(parseFloat(event.target.value)));
    },
    toggleAspectRatio: (event) => {
      dispatch(toggleThrAspectRatio());
    },
  }
}

class ThetaRho extends Component {

  render() {
    var aspectRatioActive = "";
    if (this.props.aspectRatio) {
      aspectRatioActive = "active";
    }

    return (
      <div className="ThetaRho">
        <Panel className="thr-panel">
          <h4>Theta Rho Input</h4>
          <ControlLabel className="thr-panel" htmlFor="fileUpload" style={{ cursor: "pointer" }}>
            <ListGroupItem header="Click to Load" className="" >Import a sisyphus style theta rho (.thr) file into sandify.</ListGroupItem>
            <FormControl
                id="fileUpload"
                type="file"
                accept=".thr"
                onChange={this.props.setVertices}
                style={{ display: "none" }}
            />
          </ControlLabel>
          <Well> Name: {this.props.name} <br/> Comments: { this.props.comments.join('\n') } <br/> Number of points: {this.props.vertices.length }</Well>
          <Form horizontal>
            <FormGroup controlId="thr-zoom">
              <Col componentClass={ControlLabel} sm={2}>
                Zoom
              </Col>
              <Col sm={8}>
                <FormControl type="number" value={this.props.zoom} onChange={this.props.setZoom}/>
              </Col>
            </FormGroup>
          </Form>
          <ListGroupItem header="Keep Aspect Ratio" className={aspectRatioActive} onClick={this.props.toggleAspectRatio}>Keeps original aspect ratio.</ListGroupItem>
          <br/>
          <h5>Where to get thr files:
          <ul>
            <li><h5><a href="https://reddit.com/r/SisyphusIndustries">Sisyphus on Reddit</a></h5></li>
            <li><h5><a href="https://sisyphus-industries.com/community/community-tracks">Sisyphus Community</a></h5></li>
          </ul>
          </h5>
          <h6>Note about Copyrights:</h6>
          <h6>Be careful and respectful. Understand that the original author put their labor, intensity, and ideas into this art. The creators have a right to own it (and they have a copyright, even if it doesn't say so).</h6>
          <h6>If you don't have permisson (a license) to use their art, then you shouldn't be.</h6>
          <h6>If you do have permission to use their art, then you should be thankful, and I'm sure they would appreciate you sending them a note of thanks. A picture of your table creating their shared art would probably make them smile.</h6>
          <h6>Someone posting the .thr file to a forum or subreddit probably wants it to be shared, and drawing it on your home table is probably OK. Just be careful if you want to use them for something significant without explicit permission.</h6>
          <h6>I am not a lawyer.</h6>
        </Panel>
      </div>
    );
  }
}
ThetaRho = connect(thrProps, thrDispatch)(ThetaRho);

export default ThetaRho

