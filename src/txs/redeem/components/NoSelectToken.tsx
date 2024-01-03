import { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { flatten } from "ramda"
import { Flex } from "components/layout"
import { TokenIcon } from "components/token"
import styles from "./SelectToken.module.scss"


interface GroupProps {
  title: string
  children: ItemProps[]
}

interface ItemProps extends TokenItem {
  balance?: string
  value: string
  muted?: boolean
  hidden?: boolean
}

interface Props {
  value?: string
  onChange: (value: string) => void
  options: GroupProps[]
  addonAfter: ReactNode // input
  checkbox?: ReactNode
}


const NoSelectToken = ({ value: selected, onChange, ...props }: Props) => {
  const { options, addonAfter } = props
  const { t } = useTranslation()

  const items = flatten(Object.values(options.map(({ children }) => children)))
  const current = items.find((item) => item.value === selected)

  return (
    <div className={styles.component}>
      <Flex>
        <button type="button" className={styles.toggle}>
          {current ? (
            <>
              <TokenIcon icon={current.icon} />
              {current.symbol}
            </>
          ) : (
            t("Select a coin")
          )}
        </button>

        {addonAfter}
      </Flex>
    </div>
  )
}

export default NoSelectToken
