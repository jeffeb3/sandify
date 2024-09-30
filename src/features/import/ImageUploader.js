import { toast } from "react-toastify"
import React, { useEffect, useRef } from "react"
import Form from "react-bootstrap/Form"
import { useSelector, useDispatch } from "react-redux"
import { selectCurrentMachine } from "@/features/machines/machinesSlice"
import { addLayerWithImage } from "@/features/layers/layersSlice"

const ImageUploader = ({ toggleModal, showModal }) => {
  const machineState = useSelector(selectCurrentMachine)
  const dispatch = useDispatch()
  const inputRef = useRef()

  useEffect(() => {
    if (showModal && inputRef.current) {
      inputRef.current.click()
    }
  }, [showModal])

  const handleFileSelected = (event) => {
    const file = event.target.files[0]
    const maxSize = 1024 * 1024 // 1 MB

    if (file) {
      if (file.size > maxSize) {
        toast.error("This file is too large to import (maximum size 1 MB).")
      } else {
        const reader = new FileReader()
        reader.onload = (event) => {
          const image = new Image()

          image.onload = () => {
            const layerProps = {
              machine: machineState,
              width: image.width,
              height: image.height,
              name: file.name,
            }

            dispatch(
              addLayerWithImage({
                layerProps,
                image: {
                  src: reader.result,
                  height: image.height,
                  width: image.width,
                },
              }),
            )
            inputRef.current.value = "" // reset to allow more uploads
          }

          image.src = reader.result
        }

        reader.readAsDataURL(file)
      }
    }
  }

  return (
    <div>
      <Form.Control
        id="imageImportUpload"
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp"
        onChange={handleFileSelected}
        style={{ display: "none" }}
      />
      <div
        id="image-importer"
        className="d-none"
      ></div>
    </div>
  )
}

export default React.memo(ImageUploader)
