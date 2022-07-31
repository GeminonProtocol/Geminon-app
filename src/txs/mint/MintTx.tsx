import { useTranslation } from "react-i18next"
import { Page } from "components/layout"
import TxContext from "../TxContext"
import MintContext from "./MintContext"
import SingleMintContext from "./SingleMintContext"
import MintForm from "./MintForm"



const MintTx = () => {
  const { t } = useTranslation()
  const description = t("Mint and redeem stablecoins with zero slippage")

  return (
    <Page title={t("Stablecoins Minter")} small extra={description}>
      <TxContext>
        <MintContext>
          <SingleMintContext>
            <MintForm />
          </SingleMintContext>
        </MintContext>
      </TxContext>
    </Page>
  )
}

export default MintTx



