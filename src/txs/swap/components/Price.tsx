import BigNumber from "bignumber.js"
import { Read } from "components/token"
import { SafeRead } from "components/token/Read"


interface Props {
  offerSymbol?: string
  askSymbol?: string
  price?: string // expected in wei units
  priceDecimals?: number
  className?: string
}

const Price = ({ price, priceDecimals=18, offerSymbol, askSymbol, className }: Props) => {
  if (!price || !offerSymbol || !askSymbol || price=="0") return null

  const smallNumPrice =  new BigNumber(price).shiftedBy(-priceDecimals).toNumber()
  
  return smallNumPrice > 1 ? (
    <span className={className}>
      <Read amount={String(1)} token={askSymbol} decimals={0} /> ={" "}
      <Read amount={String(smallNumPrice)} token={offerSymbol} decimals={0} auto />
    </span>
  ) : (
    <span className={className}>
      <Read amount={String(1)} token={offerSymbol} decimals={0} /> ={" "}
      <Read amount={String(1 / smallNumPrice)} token={askSymbol} decimals={0} auto />
    </span>
  )
}

export default Price


interface FiatProps {
  price?: string // expected in wei units
  priceDecimals?: number
  assetSymbol?: string
  fiatSymbol?: string
  className?: string
}

export const FiatPrice = ({ price, priceDecimals=18, assetSymbol, fiatSymbol="USD", className }: FiatProps) => {
  if (!price || !assetSymbol || !fiatSymbol || price=="0") return null

  const etherPrice =  new BigNumber(price).shiftedBy(-priceDecimals).toFixed()
  
  return (
    <span className={className}>
      <SafeRead amount={"1"} token={assetSymbol} decimals={0} /> ={" "}
      <SafeRead amount={etherPrice} token={fiatSymbol} decimals={0} auto />
    </span>
  )
}
