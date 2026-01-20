/* global FileReader, Image */

import { toast } from "react-toastify"
import React, { useEffect, useRef } from "react"
import Form from "react-bootstrap/Form"
import { useSelector, useDispatch } from "react-redux"
import { selectCurrentMachine } from "@/features/machines/machinesSlice"
import { addLayer, addLayerWithImage } from "@/features/layers/layersSlice"
import Layer from "@/features/layers/Layer"

const ImageUploader = ({ showModal }) => {
  const machineState = useSelector(selectCurrentMachine)
  const dispatch = useDispatch()
  const inputRef = useRef()

  useEffect(() => {
    if (showModal && inputRef.current) {
      inputRef.current.click()
    }
  }, [showModal])

  const handleSvgFile = (file) => {
    const reader = new FileReader()

    reader.onload = () => {
      const layer = new Layer("svgImport")
      const attrs = {
        ...layer.getInitialState({
          machine: machineState,
          svgContent: reader.result,
        }),
        name: file.name,
      }

      dispatch(addLayer(attrs))
      inputRef.current.value = ""
    }

    reader.readAsText(file)
  }

  const handleImageFile = (file) => {
    const reader = new FileReader()

    reader.onload = () => {
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
        inputRef.current.value = ""
      }

      image.src = reader.result
    }

    reader.readAsDataURL(file)
  }

  const handleFileSelected = (event) => {
    const file = event.target.files[0]
    const maxSize = 1024 * 1024 // 1 MB

    if (file) {
      if (file.size > maxSize) {
        toast.error("This file is too large to import (maximum size 1 MB).")
      } else if (file.name.toLowerCase().endsWith(".svg")) {
        handleSvgFile(file)
      } else {
        handleImageFile(file)
      }
    }
  }

  return (
    <div>
      <Form.Control
        id="imageImportUpload"
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,.svg"
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
