import React from "react"

const CommentsBox = ({ options, optionKey, data, comments }) => {
  const option = options[optionKey]
  const renderedComments = data.comments.map((comment, index) => {
    return (
      <span key={index}>
        {comment}
        <br />
      </span>
    )
  })

  return (
    <div>
      <div>{option.title}</div>
      <div className="mt-2 p-3 border">{renderedComments}</div>
    </div>
  )
}

export default CommentsBox
