import { Fragment, ReactNode } from "react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import classNames from "classnames"
import BigNumber from "bignumber.js"

import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import { UserDenied, CreateTxFailed, TxFailed } from "@terra-money/wallet-types"

import { Contents } from "types/components"
import { has } from "utils/num"

import { Pre } from "components/general"
import { Flex, Grid } from "components/layout"
import { Submit } from "components/form"
import { FormWarning } from "components/form"
import { Modal } from "components/feedback"
import { Details } from "components/display"
import { Read } from "components/token"

import ConnectWallet from "app/sections/ConnectWallet"

import { validNetworkID } from 'config/networks'
import { useRedeemValues, useRedeemTx, useRedeemAllTx } from "./useRedeem"


import styles from "../Tx.module.scss"



// Interfaz TxValues definido en SwapForm
interface Props<TxValues> {
  /* Only when the token is paid out of the balance held */
  symbol: string
  nativeSymbol: string
  decimals: number
  amount: string
  balance?: string

  /* TxProps */
  resetForm: () => void
  updateBalances: () => void
  networkID: number
  isConnected: boolean

  /* render */
  disabled?: string | false
  children: (props: RenderProps<TxValues>) => ReactNode

  /* on tx success */
  onPost?: () => void
}


type RenderMax = (onClick?: (max: string) => void) => ReactNode

interface RenderProps<TxValues> {
  max: { amount: string; render: RenderMax; reset: () => void }
  fee: { render: (descriptions?: Contents) => ReactNode }
  submit: { fn: (values: TxValues) => void; button: ReactNode }
}



function Tx<TxValues>(props: Props<TxValues>) {
  const { symbol, nativeSymbol, decimals, amount, balance, resetForm, updateBalances, networkID, isConnected, disabled } = props
  const { children } = props

  // INTERNAL STATE
  const [isMax, setIsMax] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<Error>()

  // context
  const { t } = useTranslation()

  
  const insufficient = new BigNumber(balance ?? '0').lt(amount)
  const enabled = !!amount && !error && !insufficient && !disabled
  console.log("[TX] amount, error, insufficient, disabled?", amount, error, insufficient, disabled)
  if (!enabled) console.log("[TX] Hooks DISABLED: token, error", symbol, error)

  const { share, collatAmount, collatPrice, usdValue, isFetching } = useRedeemValues(amount, enabled)
  
  const {write: writeRedeem, ...redeemStatus} = useRedeemTx(amount, enabled)
  const {write: writeRedeemAll, ...redeemAllStatus} = useRedeemAllTx(enabled)


  // useEffect avoids error window repeating after closing it
  useEffect(() => {
    if (redeemAllStatus.error && !error) {
      // console.log("[TX][useEffect] SUBMIT ERROR:", redeemAllStatus.error)
      setError(redeemAllStatus.error as Error)
      setSubmitting(false)
    }
  }, [redeemAllStatus.error])


  const max = !balance ? "0" : balance
    
    

    
  // SEND TRANSACTIONS  
  // FUNCIÓN QUE SE PASA A handleSubmit (onClick)
  const onSubmit = () => {
    if (enabled) {
      setSubmitting(true)
      if (amount !== "0" && amount < max) {
        writeRedeem?.()
      }
      else if (amount === max) {
        writeRedeemAll?.()
      }
    }
  }

  const submittingLabel = ""


    
  // element
  const resetMax = () => setIsMax(false)
  const renderMax: RenderMax = (onClick) => {
    if (!(max && has(max))) return null // has() función de big number, dejar

    // (2) BOTÓN Y VALOR BALANCE MÁXIMO SOBRE INPUT CAJA 1 (TOKEN ENTRADA)
    return (
      <button
        type="button"
        className={classNames({ muted: !isMax })}
        onClick={onClick ? () => onClick(max) : () => setIsMax(!isMax)}
      >
        <Flex gap={4} start>
          <AccountBalanceWalletIcon
            fontSize="inherit"
            className={styles.icon}
          />
          {/* Componente que renderiza el valor y el icono de tipo de moneda */}
          <Read amount={max} token={symbol} decimals={decimals} />
        </Flex>
      </button>
    )
  }

  
  // (11) DETALLES TRANSACCIÓN: CAJA NEGRA QUE APARECE JUSTO SOBRE
  // EL BOTÓN DE SUBMIT CON FEE, BALANCE Y BALANCE AFTER TX.
  const renderFee = (descriptions?: Contents) => {
    
    if (!isConnected || !enabled) return null    
    
    return (
      <Details>
        <dl>
          {descriptions?.map(({ title, content }, index) => (
            <Fragment key={index}>
              <dt>{title}</dt>
              <dd>{content}</dd>
            </Fragment>
          ))}

          {share && (
            <>
              <dt>{t("Pool share redeemed")}</dt>
              <dd>
                <Read amount={share} token={"%"} decimals={16} />
              </dd>
            </>
          )}

          {collatAmount && (
            <>
              <dt>{t("Collateral amount received")}</dt>
              <dd>
                <Read amount={collatAmount} token={nativeSymbol} decimals={18} />
              </dd>
            </>
          )}

          {usdValue && (
            <>
              <dt>{t("Value redeemed")}</dt>
              <dd>
                <Read amount={usdValue} token={"USD"} decimals={18} />
              </dd>
            </>
          )}
        </dl>
      </Details>
    )
  }

  const isWrongNetwork = !validNetworkID.includes(networkID)

  const submitButton = (
    <>
      {isWrongNetwork && <FormWarning>{t("Wrong network")}</FormWarning>}

      {!isConnected ? (
        <ConnectWallet
          renderButton={(open) => (
            <Submit type="button" onClick={open}>
              {t("Connect wallet")}
            </Submit>
          )}
        />
      ) : (
        <Grid gap={4}>
          {!!amount && amount!=="0" && amount < max ? (
            <Submit
              disabled={!!disabled || redeemStatus.isLoading || !enabled || isWrongNetwork}
              submitting={submitting}
            >
            {submitting ? submittingLabel : disabled}
            </Submit>
          ) : !!amount && amount!=="0" && amount == max ? (
            <Submit
              disabled={!!disabled || redeemStatus.isLoading || !enabled || isWrongNetwork}
              submitting={submitting}
            >
            {submitting ? submittingLabel : disabled}
            </Submit>
          ) : null }
        </Grid>
      )}
    </>
  )

  // TEXTO DEL MODAL QUE APARECE SI HAY UN ERROR
  const errorDescription = !error
    ? undefined
    : {
        title:
          error instanceof UserDenied
            ? t("User denied")
            : error instanceof CreateTxFailed
            ? t("Failed to create tx")
            : error instanceof TxFailed
            ? t("Tx failed")
            : t("Error"),
        children:
          error instanceof UserDenied ? null : (
            <Pre height={120} normal break>
              {error.message}
            </Pre>
          ),
      }

  // (0) ESTE FRAGMENTO ES LA CAJA DEL SWAP: LOS FRAGMENTOS
  // DEFINIDOS AQUÍ SE PASAN A SWAPFORM EN LOS OBJETOS
  // max, fee y submit Y SE RENDERIZAN
  // JUNTO CON LOS DEMÁS ELEMENTOS QUE ESTÁN ALLÍ.    
  return (
    <>
      {children({
        max: { amount: max, render: renderMax, reset: resetMax },
        fee: { render: renderFee },
        submit: { fn: onSubmit, button: submitButton },
      })}

      {/* VENTANA DE ERROR, MUESTRA EL TEXTO DEFINIDO EN errorModal */}
      {errorDescription && (
        <Modal
          {...errorDescription}
          icon={<ErrorOutlineIcon fontSize="inherit" className="danger" />}
          onRequestClose={() => {
            setError(undefined)
            setSubmitting(false)
            resetForm()
          }}
          isOpen
        />
      )}

      {(redeemStatus.isSuccess || redeemAllStatus.isSuccess) && submitting && (
        <Modal
          {...{title: t("Success")}}
          icon={<CheckCircleOutlineIcon fontSize="inherit" className="success" />}
          onRequestClose={() => {
            setSubmitting(false)
            resetForm()
            updateBalances()
          }}
          isOpen
        >
        </Modal>
      )}
    </>
  )
}




export default Tx


// HELPERS
// const isAmountApproved = (allowed: string, requested: string) => {
//   if (allowed == "0") return false
//   return new BigNumber(allowed).gte(new BigNumber(requested))
// }
