import { useTranslation } from "react-i18next"
// import { isDenomLuna, isDenomTerra } from "@terra.kitchen/utils"
// import { readPercent } from "@terra.kitchen/utils"
// import { toPrice } from "utils/num"
// import { useMarketParams } from "data/queries/market"
// import { useOracleParams } from "data/queries/oracle"
import { Read } from "components/token"
// import { TooltipIcon } from "components/display"
// import { PayloadOnchain, PayloadTerraswap } from "../useSwapUtils"
// import { PayloadRouteswap } from "../useSwapUtils"
// import { SwapMode } from "../useSwapUtils"
// import { SlippageParams, SwapSpread, useSingleSwap } from "../SingleSwapContext"
import Price, { FiatPrice } from "./Price"


export interface ExpectedPriceProps  {
  offerAsset: string
  offerDecimals: number
  askAsset: string
  askDecimals: number
  offerAssetPrice: string
  askAssetPrice: string
  askAssetRatio?: string
  feeAmount: string
  isLoading: boolean
  mode?: string
}

const ExpectedPrice = ({ ...props }: ExpectedPriceProps) => {
  const { offerAsset, offerDecimals, askAsset, askDecimals } = props
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
        assetSymbol={askAsset}
      />
    )  
    // return (
    //   <Price {...props} 
    //     price={askAssetPrice} 
    //     priceDecimals={askDecimals} 
    //     offerAsset={"USD"}
    //   />
    // )
  }

  const renderUsdOfferPrice = () => {
    return (
      <FiatPrice {...props} 
        price={offerAssetPrice} 
        priceDecimals={offerDecimals} 
        assetSymbol={offerAsset}
      />
    )  
    // return (
    //   <Price {...props} 
    //     price={offerAssetPrice} 
    //     priceDecimals={offerDecimals}
    //     offerAsset={"USD"}
    //     askAsset={offerAsset}
    //   />
    // )
  }

  const renderExpectedPrice = () => {
    return (
      <>
        <dt>{t("Expected price")}</dt>
        <dd>{!isLoading && renderPrice(askAssetRatio)}</dd>
      </>
    )
  }

  const renderUsdPrices = () => {
    const offerLabel = offerAsset == 'GEX' ? 'Pool price' : 'Oracle price'
    const askLabel = askAsset == 'GEX' ? 'Pool price' : 'Oracle price'
    return (
      <>
        <dt>{offerAsset}{" "}{t(offerLabel)}</dt>
        <dd>{!isLoading && renderUsdOfferPrice()}</dd>
        <dt>{askAsset}{" "}{t(askLabel)}</dt>
        <dd>{!isLoading && renderUsdAskPrice()}</dd>
      </>
    )
  }

  // (10) CANTIDAD MÍNIMA RECIBIDA EN EL SWAP
  // const renderMinimumReceived = () => {
    
  //   return (
  //     <>
  //       <dt>{t("Minimum received")}</dt>
  //       {/* COMPONENTE READ MATEMÁTICAS INSEGURAS */}
  //       <dd>
  //         {!isLoading && (
  //           <Read
  //             amount={minimum_receive}
  //             token={askAsset}
  //             decimals={askDecimals}
  //           />
  //         )}
  //       </dd>
  //     </>
  //   )
  // }


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

        {/* COMPONENTE READ MATEMÁTICAS INSEGURAS */}
        {/* <dt>{t("Trading fee")}</dt>
        <dd>
          {!isLoading && (
            <Read amount={feeAmount} token={"GEX"} decimals={askDecimals} />
          )}
        </dd> */}

        {/* {renderMinimumReceived()} */}
      </>
    )
  }

  const renderSCMint = () => {
    return (
      <>
        {renderUsdPrices()}

        {/* COMPONENTE READ MATEMÁTICAS INSEGURAS */}
        <dt>{t("Trading fee")}</dt>
        <dd>
          {!isLoading && (
            <Read amount={feeAmount} token={"GEX"} decimals={askDecimals} />
          )}
        </dd>

        {/* {renderMinimumReceived()} */}
      </>
    )
  }
  
  

  // (7-10) VALORES ESPERADOS DEL SWAP
  return (
    <dl>
      {mode == "SCMint" ? 
       renderSCMint() : 
       renderGLPswap()
      }
    </dl>
  )
}



export default ExpectedPrice



/* hooks */
// const useSwapSpread = () => {
//   const { data: marketParams } = useMarketParams()
//   const minSpread = marketParams?.min_stability_spread
//   return minSpread?.toString()
// }

// const useTobinTax = (askAsset?: CoinDenom) => {
//   const { data: oracleParams } = useOracleParams()
//   const tobinTax = oracleParams?.whitelist.find(
//     ({ name }) => name === askAsset
//   )?.tobin_tax

//   return tobinTax?.toString()
// }


// interface Props extends SlippageParams, SwapSpread {
//   mode: SwapMode
//   isLoading: boolean
//   rate?: Price
//   payload?: PayloadOnchain | PayloadTerraswap | PayloadRouteswap
// }

// const ExpectedPrice = ({ mode, input, ...props }: Props) => {
//   const { offerAsset, askAsset } = props
//   const { price, rate, minimum_receive, payload, isLoading } = props
//   const { t } = useTranslation()

//   /* decimals */
//   const { findDecimals } = useSingleSwap()
//   const offerDecimals = findDecimals(offerAsset)
//   const askDecimals = findDecimals(askAsset)

//   /* query: native */
//   const minSpread = useSwapSpread()
//   const tobinTax = useTobinTax(askAsset)



//   // (7-9) INFORMACIÓN DEL SWAP DEPENDIENDO DEL MODO DE SWAP ELEGIDO
//   /* render: expected price */
//   const renderPrice = (price?: Price) => <Price {...props} price={price} />

//   const renderExpectedPrice = () => {
//     return (
//       <>
//         <dt>{t("Expected price")}</dt>
//         <dd>{!isLoading && renderPrice(price)}</dd>
//       </>
//     )
//   }


//   /* render: by mode */
//   const renderOnchain = () => {
//     const spread = payload as PayloadOnchain

//     const tooltip = (
//       <>
//         {[offerAsset, askAsset].some(isDenomLuna) && (
//           <p>
//             {t("Minimum Luna swap spread: {{minSpread}}", {
//               minSpread: readPercent(minSpread),
//             })}
//           </p>
//         )}

//         {askAsset && isDenomTerra(askAsset) && tobinTax && (
//           <p>
//             {t("Terra tobin tax: {{tobinTax}}", {
//               tobinTax: readPercent(tobinTax),
//             })}
//           </p>
//         )}
//       </>
//     )

//     return (
//       <>
//         <dt>{t("Oracle price")}</dt>
//         <dd>{renderPrice(rate)}</dd>
//         {renderExpectedPrice()}
//         <dt>
//           <TooltipIcon content={tooltip}>{t("Spread")}</TooltipIcon>
//         </dt>
//         <dd>
//           {!isLoading && (
//             <Read amount={spread} denom={askAsset} decimals={askDecimals} />
//           )}
//         </dd>
//       </>
//     )
//   }

//   const renderTerraswap = () => {
//     const fee = payload as PayloadTerraswap

//     const decimals = askDecimals - offerDecimals
//     const price = toPrice(Number(rate) * Math.pow(10, decimals))

//     return (
//       <>
//         {!!price && (
//           <>
//             <dt>{t("Pair price")}</dt>
//             <dd>{renderPrice(price)}</dd>
//           </>
//         )}

//         {renderExpectedPrice()}

//         <dt>{t("Trading fee")}</dt>
//         <dd>
//           {!isLoading && (
//             <Read amount={fee} denom={askAsset} decimals={askDecimals} />
//           )}
//         </dd>
//       </>
//     )
//   }

//   const renderRouteswap = () => {
//     return <>{renderExpectedPrice()}</>
//   }

//   const renderByMode = (mode: SwapMode) =>
//     ({
//       [SwapMode.ONCHAIN]: renderOnchain,
//       [SwapMode.TERRASWAP]: renderTerraswap,
//       [SwapMode.ASTROPORT]: renderTerraswap,
//       [SwapMode.ROUTESWAP]: renderRouteswap,
//     }[mode]())

  
//     /* render: minimum received */
//   const renderMinimumReceived = () => {
//     // (10) CANTIDAD MÍNIMA RECIBIDA EN EL SWAP
//     return (
//       <>
//         <dt>{t("Minimum received")}</dt>
//         <dd>
//           {!isLoading && (
//             <Read
//               amount={minimum_receive}
//               token={askAsset}
//               decimals={findDecimals(askAsset)}
//             />
//           )}
//         </dd>
//       </>
//     )
//   }

//   if (!Number.isFinite(price)) return null

//   // (7-10) VALORES ESPERADOS DEL SWAP
//   return (
//     <dl>
//       {mode && renderByMode(mode)}
//       {renderMinimumReceived()}
//     </dl>
//   )
// }