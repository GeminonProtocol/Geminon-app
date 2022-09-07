import { PropsWithChildren } from "react"
import { useTranslation } from "react-i18next"
import createContext from "utils/createContext"
import { GasPrices } from "data/Terra/TerraAPI"
// import { useGasPrices } from "data/Terra/TerraAPI"
import { Card } from "components/layout"
import { ErrorBoundary, Wrong } from "components/feedback"
// import { useTxKey } from "./Tx"


export const [useTx, TxProvider] = createContext<{ gasPrices: GasPrices }>("useTx")

// Este contexto se utiliza únicamente en el componente de la transacción Tx
// Si integramos el ErrorBoundary en SwapTx, podríamos eliminarlo junto con SwapContext
const TxContext = ({ children }: PropsWithChildren<{}>) => {
  const { t } = useTranslation()
  const txKey = ""
  const gasPrices = {uluna: "0.15", uusd: "0.15", ueur: "0.125"}
  // console.log('[TXCONTEXT] Gas prices:')
  // console.log(gasPrices)

  /* on error */
  const fallback = () => (
    <Card>
      <Wrong>{t("Transaction is not available at the moment")}</Wrong>
    </Card>
  )
  
  // If the gas prices doesn't exist, nothing is worth rendering.
  // if (!gasPrices) {
  //   console.log("TxContext: gas prices NOT OK")
  //   return null
  // }

  // console.log("TxContext OK")
  return (
    <TxProvider value={{ gasPrices }} key={txKey}>
      <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>
    </TxProvider>
  )
}

export default TxContext



// const TxContext = ({ children }: PropsWithChildren<{}>) => {
//   const { t } = useTranslation()
//   const txKey = useTxKey()
//   const { data: gasPrices } = useGasPrices()

//   /* on error */
//   const fallback = () => (
//     <Card>
//       <Wrong>{t("Transaction is not available at the moment")}</Wrong>
//     </Card>
//   )

//   // If the gas prices doesn't exist, nothing is worth rendering.
//   if (!gasPrices) return null

//   return (
//     <TxProvider value={{ gasPrices }} key={txKey}>
//       <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>
//     </TxProvider>
//   )
// }



