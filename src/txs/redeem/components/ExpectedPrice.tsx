import { useTranslation } from "react-i18next"
import { Read } from "components/token"
import { FiatPrice } from "txs/swap/components/Price"


export interface ExpectedPriceProps  {
  nativeSymbol: string
  share: string
  collatAmount: string 
  collatPrice: string
  usdValue: string
  isLoading: boolean
}

const ExpectedPrice = ({ ...props }: ExpectedPriceProps) => {
  const { nativeSymbol, share, collatAmount, collatPrice, usdValue, isLoading } = props
  const { t } = useTranslation()

  const renderRedeemGEX = () => {
    return (
      <>
        <dt>{t("Pool share")}</dt>
        <dd>
          <Read amount={share} token={"%"} decimals={16} />
        </dd>
        <dt>{t("Collateral amount")}{" ("}{nativeSymbol}{")"}</dt>
        <dd>
          <Read amount={collatAmount} token={nativeSymbol} decimals={18} />
        </dd>
        <dt>{t("Collateral price")}</dt>
        <dd>
          <FiatPrice {...props} price={collatPrice} priceDecimals={18} assetSymbol={nativeSymbol} />
        </dd>
        <dt>{t("Share total value")}</dt>
        <dd>
          <Read amount={usdValue} token={"USD"} decimals={18} />
        </dd>
      </>
    )
  }

  // (7-10) VALORES ESPERADOS DEL SWAP
  return (
    <dl>{!isLoading && renderRedeemGEX()}</dl>
  )
}


export default ExpectedPrice
