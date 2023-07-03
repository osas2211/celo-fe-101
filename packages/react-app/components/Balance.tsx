import React from "react"

// Import Tag from antd
import { Tag } from "antd"

export const Balance: React.FC<{
  cusdBalance: any
}> = ({ cusdBalance }) => {
  return (
    <div className="balance">
      Balance:
      <Tag
        color="blue"
        style={{ fontSize: 17, padding: 8, marginLeft: "1rem" }}
      >
        {" "}
        {Number(cusdBalance?.formatted || 0).toFixed(2)} cUSD
      </Tag>
    </div>
  )
}
