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
    <div
      id="comments"
      className="mt-4 p-3"
    >
      {option.title}:<div className="ml-3">{renderedComments}</div>
    </div>
  )
}

export default CommentsBox
