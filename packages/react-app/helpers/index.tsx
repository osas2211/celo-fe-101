import Blockies from "react-blockies"

export const identiconTemplate = (address: string) => {
  return (
    <Blockies
      size={10} // number of pixels square
      scale={4} // width/height of each 'pixel'
      className="address-icon" // optional className
      seed={address} // seed used to generate icon data, default: random
    />
  )
}
