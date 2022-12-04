import { useTranslation } from "react-i18next"
import { Page, Card } from "components/layout"
import { ErrorBoundary, Wrong } from "components/feedback"

import SCMinterContext from "./SCMinterContext"
import MintForm from "./MintForm"



const MintTx = () => {
  const { t } = useTranslation()
  const description = t("Mint/redeem stablecoins using GEX")

  const fallback = () => <Card><Wrong/></Card>

  return (
    <Page title={t("Stablecoins Minter")} small extra={description}>
      <ErrorBoundary fallback={fallback}>
        <SCMinterContext>
          <MintForm />
        </SCMinterContext>
      </ErrorBoundary>
    </Page>
  )
}

export default MintTx



