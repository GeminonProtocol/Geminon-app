import { useTranslation } from "react-i18next"
import { useAccount, useNetwork } from 'wagmi'
import styles from "./IsClassicNetwork.module.scss"

import { validNetworkID } from 'config/networks'


const NetworkName = () => {
  const { t } = useTranslation()
  const { isConnected } = useAccount()
  const { chain } = useNetwork()

  const isValidNetwork = chain && validNetworkID.includes(chain.id)

  if (!isConnected) return <div/>

  return (
    <div className={styles.component}>
      {isValidNetwork ? chain?.name : t("Wrong network")}
    </div>
  )
}


export default NetworkName
