import React from "react"
import { useTranslation } from "react-i18next"
import { Dropdown } from "react-bootstrap"

const LanguageSelector = () => {
  const { i18n, t } = useTranslation()

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
  }

  const getCurrentLanguageLabel = () => {
    switch (i18n.language) {
      case "zh":
        return t("language.chinese")
      case "en":
      default:
        return t("language.english")
    }
  }

  return (
    <Dropdown>
      <Dropdown.Toggle
        variant="outline-secondary"
        size="sm"
        id="language-selector"
      >
        {getCurrentLanguageLabel()}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item
          onClick={() => changeLanguage("en")}
          active={i18n.language === "en"}
        >
          {t("language.english")}
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() => changeLanguage("zh")}
          active={i18n.language === "zh"}
        >
          {t("language.chinese")}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default LanguageSelector