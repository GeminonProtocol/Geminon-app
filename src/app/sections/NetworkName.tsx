import { useTranslation } from "react-i18next"
import { useAccount, useNetwork } from 'wagmi'
import Select from '@mui/material/Select' // https://mui.com/material-ui/react-select/
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


/* const IsClassicNetwork = () => {
  const isClassic = useIsClassic()

  return (
    <div className={styles.component}>
      {isClassic ? "Terra Classic" : "Terra 2.0"}
    </div>
  )
} */

export default NetworkName
