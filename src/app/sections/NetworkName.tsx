// import { useIsClassic } from "data/query"
import { useAccount, useNetwork } from 'wagmi'
import styles from "./IsClassicNetwork.module.scss"



const NetworkName = () => {
  const { isConnected } = useAccount()
  const { chain } = useNetwork()

  const validNetworks = [42]
  const isValidNetwork = chain && validNetworks.includes(chain.id)

  if (!isConnected) return <div/>
  // console.log("[NETWORKNAME] chain")
  // console.log(chain)

  return (
    <div className={styles.component}>
      {isValidNetwork ? chain?.name : "Wrong network"}
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
