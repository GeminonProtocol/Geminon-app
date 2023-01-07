import { useTranslation } from "react-i18next"
// import { LinkButton } from "components/general"
import { Page } from "components/layout"
import TxContext from "../TxContext"
import SwapContext from "./SwapContext"
import GLPContext from "./GLPContext"
import CollatForm from "./CollatForm"

// The sequence below is required before rendering the Swap form:
// 1. `TxContext` - Fetch gas prices through, like other forms.
// 2. `SwapContext` - Complete the network request related to swap.
// 3. `SwapSingleContext` - Complete the network request not related to multiple swap

const CollatTx = () => {
  const { t } = useTranslation()
  const description = t("Provide collateral to mint GEX")

  return (
    <Page title={t("Genesis Liquidity Pools")} small extra={description}>
      <TxContext>
        <SwapContext>
          <GLPContext>
            <CollatForm />
          </GLPContext>
        </SwapContext>
      </TxContext>
    </Page>
  )
}


/* const SwapTx = () => {
  const { t } = useTranslation()

  const extra = (
    <LinkButton to="/swap/multiple" size="small">
      {t("Swap multiple coins")}
    </LinkButton>
  )

  return (
    <Page title={t("Swap")} small extra={extra}>
      <TxContext>
        <SwapContext>
          <SingleSwapContext>
            <SwapForm />
          </SingleSwapContext>
        </SwapContext>
      </TxContext>
    </Page>
  )
} */


export default CollatTx