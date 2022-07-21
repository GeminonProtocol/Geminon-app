// import { useIsClassic } from "data/query"
import styles from "./IsClassicNetwork.module.scss"



// TODO: Cambiar por "Network" y que muestre el nombre
// de la red EVM seleccionada, o el icono. Ver si colocamos
// aquí el menú selector de red o a la derecha.
const NetworkName = () => {
  return (
    <div className={styles.component}>
      {"Testnet"}
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
