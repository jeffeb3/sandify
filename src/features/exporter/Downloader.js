import React, { Component } from "react";
import { connect } from "react-redux";
import { saveAs } from "file-saver";
import { Button, Modal, Col, Row } from "react-bootstrap";
import DropdownOption from "../../components/DropdownOption";
import InputOption from "../../components/InputOption";
import CheckboxOption from "../../components/CheckboxOption";
import { updateExporter } from "./exporterSlice";
import { getComments } from "./selectors";
import { getAllComputedVertices } from "../machine/selectors";
import { getLayers, getMain } from "../store/selectors";
import ReactGA from "react-ga";
import GCodeExporter from "./GCodeExporter";
import ScaraGCodeExporter from "./ScaraGCodeExporter";
import SvgExporter from "./SvgExporter";
import ThetaRhoExporter from "./ThetaRhoExporter";
import { Exporter, GCODE, THETARHO, SVG, SCARA } from "../../models/Exporter";
import { exportCurrentPreviewWindow } from "../preview/PreviewWindow";

const exporters = {
  [GCODE]: GCodeExporter,
  [THETARHO]: ThetaRhoExporter,
  [SVG]: SvgExporter,
  [SCARA]: ScaraGCodeExporter,
};

const mapStateToProps = (state, ownProps) => {
  const main = getMain(state);
  const layers = getLayers(state);

  return {
    reverse: state.exporter.reverse,
    pngPreview: state.exporter.pngPreview,
    show: state.exporter.show,
    vertices: getAllComputedVertices(state),
    comments: getComments(state),
    input: main.app.input,
    layer: layers.current,
    offsetX: main.machine.rectangular
      ? (main.machine.minX + main.machine.maxX) / 2.0
      : main.machine.maxRadius,
    offsetY: main.machine.rectangular
      ? (main.machine.minY + main.machine.maxY) / 2.0
      : main.machine.maxRadius,
    width: main.machine.rectangular
      ? main.machine.maxX - main.machine.minX
      : 2.0 * main.machine.maxRadius,
    height: main.machine.rectangular
      ? main.machine.maxY - main.machine.minY
      : 2.0 * main.machine.maxRadius,
    maxRadius: main.machine.rectangular
      ? Math.sqrt(
          Math.pow(main.machine.maxX - main.machine.minX, 2.0) +
            Math.pow(main.machine.maxY - main.machine.minY, 2.0)
        )
      : main.machine.maxRadius,
    fileName: main.exporter.fileName,
    fileType: main.exporter.fileType,
    isGCode:
      main.exporter.fileType === GCODE || main.exporter.fileType === SCARA,
    polarRhoMax: main.exporter.polarRhoMax,
    unitsPerCircle: main.exporter.unitsPerCircle,
    pre: main.exporter.fileType !== SVG ? main.exporter.pre : "",
    post: main.exporter.fileType !== SVG ? main.exporter.post : "",
    options: new Exporter().getOptions(),
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    open: () => {
      dispatch(updateExporter({ show: true }));
    },
    close: () => {
      dispatch(updateExporter({ show: false }));
    },
    onChange: (attrs) => {
      dispatch(updateExporter(attrs));
    },
  };
};

class Downloader extends Component {
  // Record this event to google analytics.
  gaRecord(fileType) {
    let savedCode = "Saved: " + this.props.input;
    if (this.props.input === "shape" || this.props.input === "Shape") {
      savedCode = savedCode + ": " + this.props.layer;
    }
    ReactGA.event({
      category: fileType,
      action: savedCode,
    });
  }

  async download() {
    let exporter = new exporters[this.props.fileType](this.props);
    let startTime = performance.now();
    let fileName = this.props.fileName;

    exporter.export();

    if (!fileName.includes(".")) {
      fileName += exporter.fileExtension;
    }

    this.gaRecord(exporter.label);
    saveAs(
      new Blob([exporter.lines.join("\n")], {
        type:
          this.props.fileType === SVG
            ? "image/svg+xml;charset=utf-8"
            : "text/plain;charset=utf-8",
      }),
      fileName
    );

    if (this.props.pngPreview) {
      const preview = await exportCurrentPreviewWindow();
      if (preview) {
        saveAs(preview, `${fileName.match(/(.*)\.\w+$/)[1]}.png`);
      }
    }
    this.props.close();

    let endTime = performance.now();
    ReactGA.timing({
      category: exporter.label,
      variable: "Save Code",
      value: endTime - startTime, // in milliseconds
    });
  }

  render() {
    return (
      <div>
        <Button
          className="ml-2 mr-3"
          variant="primary"
          onClick={this.props.open}
        >
          Export
        </Button>
        <Modal size="lg" show={this.props.show} onHide={this.props.close}>
          <Modal.Header closeButton>
            <Modal.Title>Export to a file</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <DropdownOption
              onChange={this.props.onChange}
              options={this.props.options}
              optionKey="fileType"
              key="fileType"
              index={0}
              model={this.props}
            />

            {this.props.fileType === SCARA && (
              <Row>
                <Col sm={5}></Col>
                <Col sm={7} className="mb-2">
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://github.com/jeffeb3/sandify/wiki/Scara-GCode"
                  >
                    Read more
                  </a>{" "}
                  about SCARA GCode.
                </Col>
              </Row>
            )}

            <InputOption
              onChange={this.props.onChange}
              options={this.props.options}
              key="fileName"
              optionKey="fileName"
              index={1}
              model={this.props}
            />

            {(this.props.fileType === THETARHO ||
              this.props.fileType === SCARA) && (
              <InputOption
                onChange={this.props.onChange}
                options={this.props.options}
                key="polarRhoMax"
                optionKey="polarRhoMax"
                index={2}
                model={this.props}
              />
            )}

            {this.props.fileType === SCARA && (
              <InputOption
                onChange={this.props.onChange}
                options={this.props.options}
                key="unitsPerCircle"
                optionKey="unitsPerCircle"
                index={2}
                model={this.props}
              />
            )}

            <InputOption
              onChange={this.props.onChange}
              options={this.props.options}
              key="pre"
              optionKey="pre"
              index={3}
              model={this.props}
            />

            <InputOption
              onChange={this.props.onChange}
              options={this.props.options}
              key="post"
              optionKey="post"
              index={4}
              model={this.props}
            />

            <Row>
              <Col sm={5}></Col>
              <Col sm={7}>
                See{" "}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://github.com/jeffeb3/sandify/wiki#export-variables"
                >
                  {" "}
                  the wiki{" "}
                </a>{" "}
                for details on available program export variables.
              </Col>
            </Row>

            <div className="mt-2">
              <CheckboxOption
                onChange={this.props.onChange}
                options={this.props.options}
                optionKey="reverse"
                key="reverse"
                index={5}
                model={this.props}
              />
            </div>
            <div className="mt-2">
              <CheckboxOption
                onChange={this.props.onChange}
                options={this.props.options}
                optionKey="pngPreview"
                key="pngPreview"
                index={5}
                model={this.props}
              />
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button id="code-close" variant="link" onClick={this.props.close}>
              Close
            </Button>
            <Button
              id="code-download"
              variant="primary"
              onClick={this.download.bind(this)}
            >
              Download
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Downloader);
