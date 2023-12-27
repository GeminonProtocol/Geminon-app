import { Fragment, ReactNode } from "react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { QueryKey } from "react-query"
import classNames from "classnames"
import BigNumber from "bignumber.js"

import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import CheckIcon from "@mui/icons-material/Check"
import { ConnectType, UserDenied } from "@terra-money/wallet-types"
import { CreateTxFailed, TxFailed } from "@terra-money/wallet-types"

import { Contents } from "types/components"
import { has } from "utils/num"
// import { getErrorMessage } from "utils/error"
// import { isBroadcastingState, latestTxState } from "data/queries/tx"


import { Pre } from "components/general"
import { Flex, Grid } from "components/layout"
import { Submit, FormItem } from "components/form"
import { FormError, FormWarning, FormHelp } from "components/form"
import Approve from "components/form/Approve"
import { Modal } from "components/feedback"
import { Details } from "components/display"
import { Read, SafeReadPercent, AddToken } from "components/token"
import ConnectWallet from "app/sections/ConnectWallet"
import styles from "../Tx.module.scss"


import { validNetworkID } from 'config/networks'
import { useFetchAllowance, useInfiniteApprove, useSubmitTx } from "./useContractsGLP"
import { defaultDecimals } from "config/assets"



// Interfaz TxValues definido en SwapForm
interface Props<TxValues> {
  /* Only when the token is paid out of the balance held */
  newProps?: any
  symbol?: string
  decimals?: number
  amount?: Amount
  balance?: Amount

  /* tx simulation */
  // initialGasDenom: CoinDenom
  // estimationTxValues?: TxValues
  // createTx?: (values: TxValues) => CreateTxOptions | undefined
  // excludeGasDenom?: (denom: string) => boolean

  /* render */
  disabled?: string | false
  children: (props: RenderProps<TxValues>) => ReactNode
  onChangeMax?: (input: number) => void

  /* on tx success */
  onPost?: () => void
  redirectAfterTx?: { label: string; path: string }
  queryKeys?: QueryKey[]
}


type RenderMax = (onClick?: (max: Amount) => void) => ReactNode

interface RenderProps<TxValues> {
  max: { amount: Amount; render: RenderMax; reset: () => void }
  fee: { render: (descriptions?: Contents) => ReactNode }
  submit: { fn: (values: TxValues) => void; button: ReactNode }
}


export interface TxProps {
  offerAssetItem: PoolAsset,
  askAssetItem: PoolAsset,
  inAmount: string,
  outAmount: string | undefined,
  feeAmount: string,
  minReceive: string,
  priceImpact: string,
  nativeSymbol: string,
  poolSymbol: string,
  resetForm: () => void,
  updateBalances: () => void
  networkID: number,
  isConnected: boolean,
}




function Tx<TxValues>(props: Props<TxValues>) {
  const { newProps } = props
  const { offerAssetItem, askAssetItem, inAmount, outAmount, feeAmount, minReceive, priceImpact} = newProps as TxProps
  const { nativeSymbol, poolSymbol, resetForm, updateBalances, networkID, isConnected } = newProps as TxProps
  // console.log("[TX] START - newProps:", newProps)
  const { children, onChangeMax } = props

  // INTERNAL STATE
  const [isApproved, setIsApproved] = useState(false)
  const [isMax, setIsMax] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<Error>()

  // context
  const { t } = useTranslation()

  const balance = offerAssetItem.balance
  const insufficient = new BigNumber(balance).lt(inAmount)
  const offerTokenAddress = offerAssetItem.address ?? ""
  // console.log("[TX] validatePoolSymbol(poolSymbol, offerSymbol, askSymbol)", validatePoolSymbol(poolSymbol, offerAssetItem.key, askAssetItem.key), poolSymbol, offerAssetItem.key, askAssetItem.key)

  const enabled = !!offerAssetItem && !!inAmount && !!outAmount && !!poolSymbol && !error && 
    !insufficient && validatePoolSymbol(poolSymbol, offerAssetItem.key, askAssetItem.key)
  // console.log("[TX] inAmount, balance, insufficient?", inAmount, balance, insufficient)
  // if (!enabled) // console.log("[TX] Hooks DISABLED: token, error", offerAssetItem, error)

  
  const { allowedAmount, refetchAllowance } = useFetchAllowance(offerTokenAddress, poolSymbol, enabled)
  // console.log("[TX] Allowed Amount:", allowedAmount)
  // console.log("[TX] is Amount Approved:", allowedAmount && isAmountApproved(allowedAmount, inAmount))

  
  
  
  
  if (offerAssetItem.symbol == nativeSymbol) {
    if (!isApproved) setIsApproved(true)
  } 
  else if (!!allowedAmount && inAmount!="0") {
    if (!isApproved && isAmountApproved(allowedAmount, inAmount)) 
      setIsApproved(true)
    else if (isApproved && !isAmountApproved(allowedAmount, inAmount)) 
      setIsApproved(false)
  }
  

  const {write: writeApprove, ...approveStatus} = useInfiniteApprove(offerTokenAddress, poolSymbol, enabled)
  
  const {write: writeSubmit, ...submitStatus} = 
    useSubmitTx(nativeSymbol, offerAssetItem.symbol, poolSymbol, inAmount, minReceive, enabled && isApproved)


  // useEffect avoids error window repeating after closing it
  useEffect(() => {
    if (approveStatus.error && !error) {
      // console.log("[TX][useEffect] APPROVE ERROR:", approveStatus.error)
      setError(approveStatus.error as Error)
      setSubmitting(false)
    }
    else if (submitStatus.error && !error) {
      // console.log("[TX][useEffect] SUBMIT ERROR:", submitStatus.error)
      setError(submitStatus.error as Error)
      setSubmitting(false)
    }
  }, [approveStatus.error, submitStatus.error])

  
  if (approveStatus.isSuccess && !isApproved && !submitting) {
    // console.log("[TX] APPROVE SUCCESS, REFETCHING ALLOWANCE")
    refetchAllowance()
    // console.log("[TX] APPROVE SUCCESS, allowedAmount", allowedAmount)
  }


  // VALOR PARA EL AMOUNT MÁXIMO DEL FORMULARIO 1 (2) 
  // const getNativeMax = () => {
  //   if (!balance) return
  //   const gasAmount = gasFee.denom === token ? gasFee.amount : "0"
  //   return calcMax({ balance, gasAmount })
  // }

  const max = !balance ? undefined : balance
    


  // (effect): Call the onChangeMax function whenever the max changes 
  // useEffect(() => {
  //   if (max && isMax && onChangeMax) onChangeMax(toInput(max, decimals))
  // }, [decimals, isMax, max, onChangeMax])

  
  // TODO: Este lo usaremos si el slippage es mayor q el establecido para que muestre 
  // la advertencia en rojo debajo del formulario y desactive los botones
  const disabled = askAssetItem.symbol == "GEX" && "Mint paused"
    // passwordRequired && !password
    //   ? t("Enter password")
    //   : estimatedGasState.isLoading
    //   ? t("Estimating fee...")
    //   : estimatedGasState.error
    //   ? t("Fee estimation failed")
    //   : isBroadcasting
    //   ? t("Broadcasting a tx...")
    //   : props.disabled || ""

  

    
  // SEND TRANSACTIONS  
  // FUNCIÓN QUE SE PASA A handleSubmit (onClick)
  const onSubmit = () => {
    if (enabled) {
      setSubmitting(true)
      
      if (!isApproved) {
        writeApprove?.()
        // console.log("[TX] APPROVAL SUBMITTED")
      }
      else {
        writeSubmit?.()
        // console.log("[TX] TRANSACTION SUBMITTED")
      }
    }
  }

  const submittingLabel = "" // isWallet.ledger(wallet) ? t("Confirm in ledger") : ""


  // render
  // const balanceAfterTx =
  //   balance &&
  //   inAmount &&
  //   new BigNumber(balance).minus(inAmount).toString()
  
  // Pone la cantidad en rojo si es menor que 0
  // const insufficient = balanceAfterTx ? new BigNumber(balanceAfterTx).lt(0) : false
  

  
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
          <Read amount={max} token={offerAssetItem.symbol} decimals={offerAssetItem.decimals} />
        </Flex>
      </button>
    )
  }

  
  // (11) DETALLES TRANSACCIÓN: CAJA NEGRA QUE APARECE JUSTO SOBRE
  // EL BOTÓN DE SUBMIT CON FEE, BALANCE Y BALANCE AFTER TX.
  const renderFee = (descriptions?: Contents) => {
    
    if (!isConnected || !enabled || !isApproved) return null    
    
    return (
      <Details>
        <dl>
          {descriptions?.map(({ title, content }, index) => (
            <Fragment key={index}>
              <dt>{title}</dt>
              <dd>{content}</dd>
            </Fragment>
          ))}

          {feeAmount && (
            <>
              <dt>{t("Trading fee")}</dt>
              <dd>
                <Read amount={feeAmount} token={"GEX"} decimals={defaultDecimals} />
              </dd>
            </>
          )}

          {minReceive && (
            <>
              <dt>{t("Minimum received")}</dt>
              <dd>
                <Read amount={minReceive} token={askAssetItem.symbol} decimals={askAssetItem.decimals} />
              </dd>
            </>
          )}

          {priceImpact && (
            <>
              <dt>{t("Price impact")}</dt>
              <dd>
                <SafeReadPercent amount={Number(priceImpact)/10000} decimals={6}/>
              </dd>
            </>
          )}
        </dl>
      </Details>
    )
  }

  // const walletError = ""
    // connectedWallet?.connectType === ConnectType.READONLY
    //   ? t("Wallet is connected as read-only mode")
    //   : !availableGasDenoms.length
    //   ? t("Insufficient balance to pay transaction fee")
    //   : isWalletEmpty
    //   ? t("Coins required to post transactions")
    //   : ""

    const isWrongNetwork = !validNetworkID.includes(networkID)

    const submitButton = (
    <>
      {isWrongNetwork && <FormWarning>{t("Wrong network")}</FormWarning>}
      {disabled && <FormWarning>{disabled}</FormWarning>}

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
          {/* {passwordRequired && (
            <FormItem label={t("Password")} error={incorrect}>
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setIncorrect(undefined)
                  setPassword(e.target.value)
                }}
              />
            </FormItem>
          )} */}

          {/* {failed && <FormError>{failed}</FormError>} */}

          {!!inAmount && inAmount!="0" && !isApproved ? (
            <Approve
              disabled={!!disabled || approveStatus.isLoading || !enabled || isWrongNetwork}
              submitting={submitting}
            >
            {submitting ? submittingLabel : disabled}
            </Approve>
          ) : !!inAmount && inAmount!="0" ? (
            <Submit
              disabled={!!disabled || submitStatus.isLoading || !enabled || isWrongNetwork}
              submitting={submitting}
            >
            {submitting ? submittingLabel : disabled}
            </Submit>
          ) : null}
          
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
        max: { amount: max ?? "0", render: renderMax, reset: resetMax },
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

      {approveStatus.isSuccess && submitting && !isApproved && (
        <Modal
          {...{title: t("Approved")}}
          icon={<CheckIcon fontSize="inherit" className="success" />}
          onRequestClose={() => {
            setSubmitting(false)
            setIsApproved(true)
          }}
          isOpen
        />
      )}

      {submitStatus.isSuccess && submitting && isApproved && (
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
          {askAssetItem.symbol != nativeSymbol && 
            <AddToken networkID={networkID} tokenSymbol={askAssetItem.symbol}/>}
        </Modal>
      )}
    </>
  )
}




export default Tx


// HELPERS
const isAmountApproved = (allowed: string, requested: string) => {
  if (allowed == "0") return false
  return new BigNumber(allowed).gte(new BigNumber(requested))
}

const validatePoolSymbol = (poolSymbol: string, offerSymbol: string, askSymbol: string): boolean => {
  return [offerSymbol.toLowerCase(), askSymbol.toLowerCase()].includes(poolSymbol)
}


/* utils */
interface Params {
  balance: Amount
  gasAmount: Amount
}

// Receive gas and return the maximum payment amount
export const calcMax = ({ balance, gasAmount }: Params) => {
  const available = new BigNumber(balance).minus(gasAmount)

  const max = BigNumber.max(new BigNumber(available), 0)
    .integerValue(BigNumber.ROUND_FLOOR)
    .toString()

  return max
}
