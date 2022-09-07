import { useTranslation } from "react-i18next"
import { Page, Card } from "components/layout"
import { Wrong } from "components/feedback"


const UnderConstruction = () => {
  const { t } = useTranslation()
  return (
    <Page title={t("Module under construction")}>
      <Card>
        <Wrong>
          {t("This module is expected to be deployed in early Q4 2022")}
        </Wrong>
      </Card>
    </Page>
  )
}

export default UnderConstruction
