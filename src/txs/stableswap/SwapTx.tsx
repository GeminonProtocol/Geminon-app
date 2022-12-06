import { useTranslation } from "react-i18next"
import { Page, Card } from "components/layout"
import { ErrorBoundary, Wrong } from "components/feedback"

import StableSwapContext from "./StableSwapContext"
import MintForm from "./SwapForm"



const SwapTx = () => {
  const { t } = useTranslation()
  const description = t("Swap stablecoins with zero slippage")

  const fallback = () => <Card><Wrong/></Card>

  return (
    <Page title={t("Stablecoins Swap")} small extra={description}>
      <ErrorBoundary fallback={fallback}>
        <StableSwapContext>
          <MintForm />
        </StableSwapContext>
      </ErrorBoundary>
    </Page>
  )
}

export default SwapTx
