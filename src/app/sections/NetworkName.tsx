// import { useIsClassic } from "data/query"
import { useAccount, useNetwork } from 'wagmi'
import styles from "./IsClassicNetwork.module.scss"



const NetworkName = () => {
  const { isConnected } = useAccount()
  const { chain } = useNetwork()

  if (!isConnected) return <div/>
  // console.log("[NETWORKNAME] chain")
  // console.log(chain)

  return (
    <div className={styles.component}>
      {chain?.name}
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
