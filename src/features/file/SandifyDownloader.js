import React, { useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import Modal from "react-bootstrap/Modal"
import Button from "react-bootstrap/Button"
import InputOption from "@/components/InputOption"
import { updateFile, selectFileState, fileOptions, download } from "./fileSlice"

const SandifyDownloader = ({ showModal, toggleModal }) => {
  const dispatch = useDispatch()
  const fileState = useSelector(selectFileState)
  const { fileName } = fileState
  const inputRef = useRef()

  const handleChange = (attrs) => {
    dispatch(updateFile(attrs))
  }

  const handleInitialFocus = () => {
    inputRef.current.focus()
  }

  const handleDownload = () => {
    let name = fileName
    if (!fileName.includes(".")) {
      name += ".sdf"
    }

    dispatch(download(name))
    toggleModal()
  }

  return (
    <Modal
      show={showModal}
      onHide={toggleModal}
      onEntered={handleInitialFocus}
    >
      <Modal.Header closeButton>
        <Modal.Title>Save pattern as...</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <InputOption
          onChange={handleChange}
          options={fileOptions}
          key="fileName"
          optionKey="fileName"
          data={{ fileName }}
          inputRef={inputRef}
          focusOnSelect={true}
        />
        <div className="mt-4 fs-6 fst-italic">
          Downloads a text-based .sdf file that contains no personal or browser
          information. You can share this file with others, who can import your
          design.
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button
          id="code-close"
          variant="light"
          onClick={toggleModal}
        >
          Close
        </Button>
        <Button
          id="code-download"
          variant="primary"
          onClick={handleDownload}
        >
          Download
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default React.memo(SandifyDownloader)
