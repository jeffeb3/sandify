import React, { useEffect } from "react"
import Tab from "react-bootstrap/Tab"
import Tabs from "react-bootstrap/Tabs"
import { useDispatch, useSelector } from "react-redux"
import MachineManager from "@/features/machines/MachineManager"
import LayerManager from "@/features/layers/LayerManager"
import PreviewStats from "@/features/preview/PreviewStats"
import { selectSelectedLayer } from "@/features/layers/layersSlice"
import { loadFont, supportedFonts } from "@/features/fonts/fontsSlice"
import { loadImage, selectAllImages } from "@/features/images/imagesSlice"

const Sidebar = () => {
  const dispatch = useDispatch()
  const layer = useSelector(selectSelectedLayer)
  const images = useSelector(selectAllImages)

  useEffect(() => {
    Object.keys(supportedFonts).forEach((url) => dispatch(loadFont(url)))
    images.forEach((image) =>
      dispatch(loadImage({ imageId: image.id, imageSrc: image.src })),
    )
  }, [dispatch])

  if (layer) {
    return (
      <Tabs defaultActiveKey="draw">
        <Tab
          eventKey="draw"
          title="Layers"
          className="full-page-tab"
        >
          <LayerManager />
        </Tab>

        <Tab
          eventKey="machines"
          title="Machines"
          className="full-page-tab"
        >
          <MachineManager />
        </Tab>

        <Tab
          eventKey="stats"
          title="Stats"
          className="full-page-tab"
        >
          <PreviewStats />
        </Tab>
      </Tabs>
    )
  } else {
    return <div></div>
  }
}

export default React.memo(Sidebar)
