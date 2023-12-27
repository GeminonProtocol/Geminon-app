import { useTranslation } from "react-i18next"
import { Page, Card} from "components/layout"
import { ErrorBoundary, Wrong } from "components/feedback"

import GLPContext from "./GLPContext"
import CollatForm from "./CollatForm"



const CollatTx = () => {
  const { t } = useTranslation()
  const description = t("Provide collateral to mint GEX")

  const fallback = () => <Card><Wrong/></Card>

  return (
    <Page title={t("Genesis Liquidity Pools")} small extra={description}>
      <ErrorBoundary fallback={fallback}>
        <GLPContext>
          <CollatForm />
        </GLPContext>
      </ErrorBoundary>
    </Page>
  )
}

export default CollatTx
