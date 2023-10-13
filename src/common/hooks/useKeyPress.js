import { useState, useEffect } from "react"

const useKeyPress = (targetKey, inputRef) => {
  const [keyPressed, setKeyPressed] = useState(false)

  const handleKeyDown = ({ key }) => {
    if (key === targetKey) {
      setKeyPressed(true)
    }
  }

  const handleKeyUp = ({ key }) => {
    if (key === targetKey) {
      setKeyPressed(false)
    }
  }

  useEffect(() => {
    if (inputRef.current) {
      window.addEventListener("keydown", handleKeyDown)
      window.addEventListener("keyup", handleKeyUp)

      // remove event listeners on cleanup
      return () => {
        window.removeEventListener("keydown", handleKeyDown)
        window.removeEventListener("keyup", handleKeyUp)
      }
    }
  }, [inputRef])

  return keyPressed
}

export default useKeyPress
