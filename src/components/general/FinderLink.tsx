import { ForwardedRef, HTMLAttributes, PropsWithChildren } from "react"
import { forwardRef } from "react"
import classNames from "classnames"
import { useNetwork } from 'wagmi'
import { truncate } from "@terra.kitchen/utils"
import { blockExplorers } from "config/networks"
import ExternalLink from "./ExternalLink"
import styles from "./FinderLink.module.scss"

interface Props extends HTMLAttributes<HTMLAnchorElement> {
  value?: string

  /* path (default: address) */
  block?: boolean
  tx?: boolean
  validator?: boolean

  /* customize */
  short?: boolean
}

const FinderLink = forwardRef(
  (
    { children, short, ...rest }: PropsWithChildren<Props>,
    ref: ForwardedRef<HTMLAnchorElement>
  ) => {
    const { block, tx, validator, ...attrs } = rest
    const { chain } = useNetwork()

    const finder: string = blockExplorers.get(chain?.id)
    const path = "address"
    const address = children
    
    const link = [finder, path, address].join("/")
    
    const className = classNames(attrs.className, styles.link)

    return (
      <ExternalLink {...attrs} href={link} className={className} ref={ref} icon>
        {short && typeof children === "string" ? truncate(children) : children}
      </ExternalLink>
    )
  }
)

export default FinderLink

