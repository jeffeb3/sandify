import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import Tab from "react-bootstrap/Tab"
import Tabs from "react-bootstrap/Tabs"
import { useDispatch, useSelector } from "react-redux"
import MachineManager from "@/features/machines/MachineManager"
import LayerManager from "@/features/layers/LayerManager"
import PreviewStats from "@/features/preview/PreviewStats"
import { selectSelectedLayer } from "@/features/layers/layersSlice"
import { loadImage, selectAllImages } from "@/features/images/imagesSlice"

const Sidebar = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const layer = useSelector(selectSelectedLayer)
  const images = useSelector(selectAllImages)

  useEffect(() => {
    images.forEach((image) =>
      dispatch(loadImage({ imageId: image.id, imageSrc: image.src })),
    )
  }, [dispatch])

  if (layer) {
    return (
      <Tabs defaultActiveKey="draw">
        <Tab
          eventKey="draw"
          title={t("Layers")}
          className="full-page-tab"
        >
          <LayerManager />
        </Tab>

        <Tab
          eventKey="machines"
          title={t("Machines")}
          className="full-page-tab"
        >
          <MachineManager />
        </Tab>

        <Tab
          eventKey="stats"
          title={t("Stats")}
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
