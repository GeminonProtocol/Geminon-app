// import classNames from "classnames"
//import { useNetworkName } from "data/wallet"
// import styles from "./NetworkName.module.scss"

const NetworkName = () => {return null}

// Nombre de la red seleccionada. Se usa sólo en el banner amarillo 
// que aparece arriba si la red seleccionada no es la mainnet. 
// Lo apagamos para que no de por saco.
/* const NetworkName = () => {
  const name = useNetworkName()
  if (name === "mainnet") return null
  return <div className={classNames(styles.text, styles.warning)}>{name}</div>
} */

export default NetworkName
