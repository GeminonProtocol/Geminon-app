import { useTranslation } from "react-i18next"
import { Read } from "components/token"
import Price, { FiatPrice } from "./Price"


export interface ExpectedPriceProps  {
  offerSymbol: string
  offerDecimals: number
  askSymbol: string
  askDecimals: number
  offerAssetPrice: string
  askAssetPrice: string
  askAssetRatio?: string
  feeAmount: string
  isLoading: boolean
  mode?: string
}

const ExpectedPrice = ({ ...props }: ExpectedPriceProps) => {
  const { offerSymbol, offerDecimals, askSymbol, askDecimals } = props
  const { offerAssetPrice, askAssetPrice, askAssetRatio, feeAmount } = props
  const { isLoading, mode } = props
  const { t } = useTranslation()
  
  
  // RENDER COMPONENTS
  const renderPrice = (price?: string, priceDecimals?:number) => {
    return <Price {...props} price={price} priceDecimals={priceDecimals}/>
  }

  const renderUsdAskPrice = () => {
    return (
      <FiatPrice {...props} 
        price={askAssetPrice} 
        priceDecimals={askDecimals} 
        assetSymbol={askSymbol}
      />
    )  
  }

  const renderUsdOfferPrice = () => {
    return (
      <FiatPrice {...props} 
        price={offerAssetPrice} 
        priceDecimals={offerDecimals} 
        assetSymbol={offerSymbol}
      />
    )  
  }

  const renderUsdPrices = () => {
    const gexLabel = mode == "SCMint" ? 'Oracle price' : 'Pool price'
    const otherLabel = mode == "SCMint" || mode == "Swap" ? 'Peg value' : 'Oracle price'
    const offerLabel = offerSymbol == 'GEX' ? gexLabel : otherLabel
    const askLabel = askSymbol == 'GEX' ? gexLabel : otherLabel
    return (
      <>
        <dt>{offerSymbol}{" "}{t(offerLabel)}</dt>
        <dd>{!isLoading && renderUsdOfferPrice()}</dd>
        <dt>{askSymbol}{" "}{t(askLabel)}</dt>
        <dd>{!isLoading && renderUsdAskPrice()}</dd>
      </>
    )
  }


  // (7-9) INFORMACIÓN DEL SWAP DEPENDIENDO DEL MODO DE SWAP ELEGIDO
  // RENDER OPTIONS
  const renderGLPswap = () => {
    return (
      <>
        {renderUsdPrices()}
        {!!askAssetRatio && (
          <>
            <dt>{t("Pair price")}</dt>
            <dd>{renderPrice(askAssetRatio)}</dd>
          </>
        )}
      </>
    )
  }

  const renderSCMint = () => {
    return (
      <>
        {renderUsdPrices()}
        <dt>{t("Trading fee")}</dt>
        <dd>
          {!isLoading && (
            <Read amount={feeAmount} token={"GEX"} decimals={askDecimals} />
          )}
        </dd>
      </>
    )
  }

  const renderStableSwap = () => {
    return (
      <>
        {renderUsdPrices()}
        <dt>{t("Pair price")}</dt>
        <dd>{renderPrice(askAssetRatio)}</dd>
        <dt>{t("Trading fee")}</dt>
        <dd>
          <Read amount={feeAmount} token={askSymbol} decimals={askDecimals} />
        </dd>
      </>
    )
  }

  // (7-10) VALORES ESPERADOS DEL SWAP
  return (
    <dl>
      {mode == "SCMint" ? 
       renderSCMint() :
       mode == "Swap" ? 
       renderStableSwap() :
       mode == "GLP" ?
       renderGLPswap() :
       null
      }
    </dl>
  )
}



export default ExpectedPrice
