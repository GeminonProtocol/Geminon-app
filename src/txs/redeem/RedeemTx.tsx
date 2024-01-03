import { useTranslation } from "react-i18next"
import { Page, Card } from "components/layout"
import { ErrorBoundary, Wrong } from "components/feedback"

import RedeemContext from "./RedeemContext"
import RedeemForm from "./RedeemForm"



const RedeemTx = () => {
  const { t } = useTranslation()
  const description = t("Get your share of the GEX collateral")

  const fallback = () => <Card><Wrong/></Card>

  return (
    <Page title={t("Redeem GEX")} small extra={description}>
      <ErrorBoundary fallback={fallback}>
        <RedeemContext>
          <RedeemForm />
        </RedeemContext>
      </ErrorBoundary>
    </Page>
  )
}

export default RedeemTx
