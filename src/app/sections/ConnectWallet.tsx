import { useTranslation } from "react-i18next"
import { useConnect, useAccount } from 'wagmi'
import { RenderButton } from "types/components"
import { Button } from "components/general"
import { Grid } from "components/layout"
import { List } from "components/display"
import { ModalButton } from "components/feedback"
import Connected from "./Connected"

import { walletLogosMap } from "config/wallets"


interface Props {
  renderButton?: RenderButton
}


const ConnectWallet = ({ renderButton }: Props) => {
  const { t } = useTranslation()
  const { connect, connectors } = useConnect()
  const { isConnected } = useAccount()

  const defaultRenderButton: Props["renderButton"] = (open) => (
    <Button onClick={open} size="small" outline>
      {t("Connect")}
    </Button>
  )

  const list = [
    ...connectors.map((connector) => ({
      src: walletLogosMap[connector.id], // Icono
      children: connector.name,
      onClick: () => connect({ connector }),
    }))
  ]
  
  if (isConnected) return <Connected />

  return (
    <ModalButton
      title={t("Connect wallet")}
      renderButton={renderButton ?? defaultRenderButton}
      maxHeight
    >
      <Grid gap={20}>
        <List list={list} />
      </Grid>
    </ModalButton>
  )
}


export default ConnectWallet
