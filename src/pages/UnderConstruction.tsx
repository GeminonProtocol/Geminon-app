import { useTranslation, Trans } from "react-i18next"
import { Page, Card } from "components/layout"
import { Wrong } from "components/feedback"


interface Props {
  when: string
}

const UnderConstruction = ({when}: Props) => {
  const { t } = useTranslation()

  return (
    <Page title={t("Module under construction")}>
      <Card>
        <Wrong>
          <Trans>
            This module is expected to be deployed in {{when}}
          </Trans>
        </Wrong>
      </Card>
    </Page>
  )
}

export default UnderConstruction
