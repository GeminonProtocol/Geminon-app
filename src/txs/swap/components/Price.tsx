import { ethers } from "ethers"
import { Read } from "components/token"
// import { SwapAssets } from "../useSwapUtils"


interface Props {
  offerAsset?: string
  askAsset?: string
  price?: string // expected in wei units
  priceDecimals?: number
  className?: string
}

const Price = ({ price, priceDecimals=18, offerAsset, askAsset, className }: Props) => {
  if (!price || !offerAsset || !askAsset || price=="0") return null

  const denom = ethers.utils.parseUnits("1", priceDecimals)  // BigNumber 1e18
  // BigNumber is Integer. Multiply and divide by 1000 trick to handle decimals
  const smallNumPrice = ethers.BigNumber.from(price).mul(1000).div(denom).toNumber() / 1000  
  
  return smallNumPrice > 1 ? (
    <span className={className}>
      <Read amount={String(1)} token={askAsset} decimals={0} /> ={" "}
      <Read amount={String(smallNumPrice)} token={offerAsset} decimals={0} auto />
    </span>
  ) : (
    <span className={className}>
      <Read amount={String(1)} token={offerAsset} decimals={0} /> ={" "}
      <Read amount={String(1 / smallNumPrice)} token={askAsset} decimals={0} auto />
    </span>
  )
}

export default Price



// interface Props extends SwapAssets {
//   price?: Price
//   className?: string
// }

// const Price = ({ price, offerAsset, askAsset, className }: Props) => {
//   if (!price) return null

//   return price > 1 ? (
//     <span className={className}>
//       <Read amount={String(1)} token={askAsset} decimals={0} /> ={" "}
//       <Read amount={String(price)} token={offerAsset} decimals={0} auto />
//     </span>
//   ) : (
//     <span className={className}>
//       <Read amount={String(1)} token={offerAsset} decimals={0} /> ={" "}
//       <Read amount={String(1 / price)} token={askAsset} decimals={0} auto />
//     </span>
//   )
// }