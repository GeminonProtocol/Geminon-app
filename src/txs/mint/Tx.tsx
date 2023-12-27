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
import { UserDenied, CreateTxFailed, TxFailed } from "@terra-money/wallet-types"

import { Contents } from "types/components"
import { has } from "utils/num"

import { Pre } from "components/general"
import { Flex, Grid } from "components/layout"
import { Submit, FormItem } from "components/form"
import { FormError, FormWarning, FormHelp } from "components/form"
import Approve from "components/form/Approve"
import { Modal } from "components/feedback"
import { Details } from "components/display"
import { Read, SafeReadPercent, AddToken } from "components/token"

import ConnectWallet from "app/sections/ConnectWallet"

import { validNetworkID } from 'config/networks'
import { useFetchAllowance, useInfiniteApprove, useSubmitTx, useStableAsset } from "./useContractsSCM"
import { defaultDecimals } from "config/assets"

import styles from "../Tx.module.scss"



// Interfaz TxValues definido en SwapForm
interface Props<TxValues> {
  /* Only when the token is paid out of the balance held */
  newProps?: any
  symbol?: string
  decimals?: number
  amount?: Amount
  balance?: Amount

  /* render */
  disabled?: string | false
  children: (props: RenderProps<TxValues>) => ReactNode

  /* on tx success */
  onPost?: () => void
}


type RenderMax = (onClick?: (max: Amount) => void) => ReactNode

interface RenderProps<TxValues> {
  max: { amount: Amount; render: RenderMax; reset: () => void }
  fee: { render: (descriptions?: Contents) => ReactNode }
  submit: { fn: (values: TxValues) => void; button: ReactNode }
}


export interface TxProps {
  offerAssetItem: PoolToken,
  askAssetItem: PoolToken,
  inAmount: string,
  outAmount: string | undefined,
  feeAmount: string,
  resetForm: () => void,
  updateBalances: () => void
  networkID: number,
  isConnected: boolean,
}




function Tx<TxValues>(props: Props<TxValues>) {
  const { newProps } = props
  const { offerAssetItem, askAssetItem, inAmount, outAmount, feeAmount } = newProps as TxProps
  const { resetForm, updateBalances, networkID, isConnected } = newProps as TxProps
  // console.log("[TX] START - newProps:", newProps)
  const { children } = props
  const stableAsset = useStableAsset(offerAssetItem, askAssetItem)

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
  
  const enabled = !!offerAssetItem && !!inAmount && !!outAmount && !error && !insufficient
  // console.log("[TX] inAmount, balance, insufficient?", inAmount, balance, insufficient)
  // if (!enabled) // console.log("[TX] Hooks DISABLED: token, error", offerAssetItem, error)

  
  const { allowedAmount, refetchAllowance } = useFetchAllowance(offerTokenAddress, enabled)
  // console.log("[TX] Allowed Amount:", allowedAmount)
  // console.log("[TX] is Amount Approved:", allowedAmount && isAmountApproved(allowedAmount, inAmount))

  
    
  if (!!allowedAmount && inAmount!="0") {
    if (!isApproved && isAmountApproved(allowedAmount, inAmount)) 
      setIsApproved(true)
    else if (isApproved && !isAmountApproved(allowedAmount, inAmount)) 
      setIsApproved(false)
  }
  

  const {write: writeApprove, ...approveStatus} = useInfiniteApprove(offerTokenAddress, enabled)
  
  const {write: writeSubmit, ...submitStatus} = 
    useSubmitTx(offerAssetItem.symbol, stableAsset.address, inAmount, enabled && isApproved)


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


  const max = !balance ? undefined : balance
    
  
  // TODO: Este lo usaremos si el slippage es mayor q el establecido para que muestre 
  // la advertencia en rojo debajo del formulario y desactive los botones
  const disabled = offerAssetItem.symbol == "GEX" && "Mint paused"
  

    
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
        </dl>
      </Details>
    )
  }

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
          {askAssetItem && <AddToken networkID={networkID} tokenSymbol={askAssetItem.symbol}/>}
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
