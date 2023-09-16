import React, { useEffect, useRef } from "react"
import Form from "react-bootstrap/Form"
import { useSelector, useDispatch } from "react-redux"
import { selectCurrentMachine } from "@/features/machines/machinesSlice"
import ThetaRhoImporter from "@/features/import/ThetaRhoImporter"
import GCodeImporter from "@/features/import/GCodeImporter"
import { addLayer } from "@/features/layers/layersSlice"
import Layer from "@/features/layers/Layer"

const ImportUploader = ({ toggleModal, showModal }) => {
  const machineState = useSelector(selectCurrentMachine)
  const dispatch = useDispatch()
  const inputRef = useRef()

  useEffect(() => {
    if (showModal && inputRef.current) {
      inputRef.current.click()
    }
  }, [showModal])

  const handleFileImported = (importer, importedProps) => {
    const layer = new Layer("fileImport")
    const layerProps = {
      ...importedProps,
      machine: machineState,
    }
    const attrs = {
      ...layer.getInitialState(layerProps),
      name: importer.fileName,
    }

    dispatch(addLayer(attrs))
  }

  const handleFileSelected = (event) => {
    const file = event.target.files[0]

    if (file) {
      const reader = new FileReader()

      reader.onload = (event) => {
        const text = reader.result

        let importer
        if (file.name.toLowerCase().endsWith(".thr")) {
          importer = new ThetaRhoImporter(file.name, text)
        } else if (
          file.name.toLowerCase().endsWith(".gcode") ||
          file.name.toLowerCase().endsWith(".nc")
        ) {
          importer = new GCodeImporter(file.name, text)
        }

        importer.import(handleFileImported)
      }

      reader.readAsText(file)
    }
  }

  return (
    <Form.Control
      id="importUpload"
      ref={inputRef}
      type="file"
      accept=".thr,.gcode,.nc"
      onChange={handleFileSelected}
      style={{ display: "none" }}
    />
  )
}

export default React.memo(ImportUploader)
