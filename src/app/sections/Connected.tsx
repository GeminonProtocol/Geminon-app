import { useTranslation } from "react-i18next"
import { useAccount, useDisconnect } from 'wagmi'
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import GroupsIcon from "@mui/icons-material/Groups"
import QrCodeIcon from "@mui/icons-material/QrCode"
import { truncate } from "@terra.kitchen/utils"
import { Button, Copy, FinderLink } from "components/general"
import CopyStyles from "components/general/Copy.module.scss"
import { Flex, Grid } from "components/layout"
import { Tooltip, Popover } from "components/display"
import PopoverNone from "../components/PopoverNone"
import WalletQR from "./WalletQR"
import styles from "./Connected.module.scss"


const Connected = () => {
  const { t } = useTranslation()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  
  if (!isConnected) return null

  const footer = { onClick: disconnect, children: t("Disconnect") }

  return (
    <Popover
      content={
        <PopoverNone className={styles.popover} footer={footer}>
          <Grid gap={16}>
            <Grid gap={4}>
              <section>
                <Tooltip content={t("View on block explorer")}>
                  <FinderLink className={styles.link} short>
                    {address}
                  </FinderLink>
                </Tooltip>
              </section>

              <Flex gap={4} start>
                <Copy text={address ?? ""} />
                <WalletQR
                  renderButton={(open) => (
                    <Tooltip content={t("Show address as QR code")}>
                      <button className={CopyStyles.button} onClick={open}>
                        <QrCodeIcon fontSize="inherit" />
                      </button>
                    </Tooltip>
                  )}
                />
              </Flex>
            </Grid>
          </Grid>
        </PopoverNone>
      }
      placement="bottom-end"
      theme="none"
    >
      <Button
        icon={
          false ? (
            <GroupsIcon style={{ fontSize: 16 }} />
          ) : (
            <AccountBalanceWalletIcon style={{ fontSize: 16 }} />
          )
        }
        size="small"
        outline
      >
        {truncate(address)}
      </Button>
    </Popover>
  )
}

export default Connected


