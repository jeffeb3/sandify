import React from "react"
import { useTranslation } from "react-i18next"
import { Dropdown } from "react-bootstrap"

const LanguageSelector = () => {
  const { i18n, t } = useTranslation()

  const changeLanguage = (lng) => {
    if (i18n.language !== lng) {
      i18n.changeLanguage(lng)
      // 刷新整个页面以更新语言
      // window.location.reload()
    }
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
        style={{ 
          color: 'white', 
          borderColor: 'white',
          backgroundColor: 'transparent'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'white';
          e.target.style.color = 'black';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.color = 'white';
        }}
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