import BigNumber from "bignumber.js"
import { Read } from "components/token"
import { SafeRead } from "components/token/Read"
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

  const smallNumPrice =  new BigNumber(price).shiftedBy(-priceDecimals).toNumber()
  
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


interface Props {
  price?: string // expected in wei units
  priceDecimals?: number
  assetSymbol?: string
  fiatSymbol?: string
  className?: string
}

export const FiatPrice = ({ price, priceDecimals=18, assetSymbol, fiatSymbol="USD", className }: Props) => {
  if (!price || !assetSymbol || !fiatSymbol || price=="0") return null

  const etherPrice =  new BigNumber(price).shiftedBy(-priceDecimals).toFixed()
  
  return (
    <span className={className}>
      <SafeRead amount={"1"} token={assetSymbol} decimals={0} /> ={" "}
      <SafeRead amount={etherPrice} token={fiatSymbol} decimals={0} auto />
    </span>
  )
}





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