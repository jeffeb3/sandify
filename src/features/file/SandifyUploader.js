import React, { useEffect, useRef } from "react"
import Form from "react-bootstrap/Form"
import { useDispatch } from "react-redux"
import { toast } from "react-toastify"
import { upsertImportedMachine } from "@/features/machines/machinesSlice"
import SandifyImporter from "./SandifyImporter"

const SandifyUploader = ({ toggleModal, showModal }) => {
  const dispatch = useDispatch()
  const inputRef = useRef()

  useEffect(() => {
    if (showModal && inputRef.current) {
      inputRef.current.click()
    }
  }, [showModal])

  const handleFileSelected = (event) => {
    const file = event.target.files[0]

    if (file) {
      const reader = new FileReader()

      reader.onload = (event) => {
        var text = reader.result

        try {
          const importer = new SandifyImporter()
          const newState = importer.import(text)

          dispatch(upsertImportedMachine(newState.machine))
          dispatch({ type: "LOAD_PATTERN", payload: newState })
        } catch (e) {
          toast.error(e.message)
        }

        // reset the input so we can load the same file again if needed
        event.preventDefault()
        inputRef.current.value = null
      }

      reader.readAsText(file)
    }
  }

  return (
    <Form.Control
      id="sandifyUpload"
      ref={inputRef}
      type="file"
      accept=".sdf"
      onChange={handleFileSelected}
      style={{ display: "none" }}
    />
  )
}

export default React.memo(SandifyUploader)
