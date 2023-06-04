import { useTranslation } from "react-i18next"
import classNames from "classnames"
import styles from "./NetworkName.module.scss"
//import { useNetworkName } from "data/wallet"

const BannerText = () => {
  // return null
  const { t } = useTranslation()
  const text = t("Token minting has been paused until v2 release. More info in this post: ") + "https://tinyurl.com/47dwnehh"

  return <div className={classNames(styles.text, styles.info)}>{text}</div>
}


// const NetworkName = () => {
//   const name = useNetworkName()
//   if (name === "mainnet") return null
//   return <div className={classNames(styles.text, styles.warning)}>{name}</div>
// }

export default BannerText
