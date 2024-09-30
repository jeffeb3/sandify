import React from "react"
import InputOption from "@/components/InputOption"
import DropdownOption from "@/components/DropdownOption"
import CheckboxOption from "@/components/CheckboxOption"
import ToggleButtonOption from "@/components/ToggleButtonOption"
import QuadrantButtonsOption from "@/components/QuadrantButtonsOption"
import SliderOption from "@/components/SliderOption"

const ModelOption = ({
  model,
  data,
  options,
  optionKey,
  onChange,
  label = true,
}) => {
  const props = {
    model,
    data,
    options,
    optionKey,
    onChange,
    label,
  }

  switch (options[optionKey].type) {
    case "dropdown":
      return (
        <DropdownOption
          key={optionKey}
          {...props}
        />
      )
    case "checkbox":
      return (
        <CheckboxOption
          key={optionKey}
          {...props}
        />
      )
    case "togglebutton":
      return (
        <ToggleButtonOption
          key={optionKey}
          {...props}
        />
      )
    case "quadrantbuttons":
      return (
        <QuadrantButtonsOption
          key={optionKey}
          {...props}
        />
      )
    case "slider":
      return (
        <SliderOption
          key={optionKey}
          {...props}
        />
      )
    default:
      return (
        <InputOption
          key={optionKey}
          {...props}
        />
      )
  }
}

export default React.memo(ModelOption)
