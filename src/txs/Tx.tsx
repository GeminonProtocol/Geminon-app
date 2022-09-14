import { Fragment, ReactNode } from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { QueryKey, useQuery } from "react-query"
import { useAccount, useNetwork } from 'wagmi'
import { useRecoilValue, useSetRecoilState } from "recoil"
import classNames from "classnames"
import BigNumber from "bignumber.js"
import { head, isNil } from "ramda"

import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import CheckIcon from "@mui/icons-material/Check"
import { Coin, Coins, LCDClient } from "@terra-money/terra.js"
import { ConnectType, UserDenied } from "@terra-money/wallet-types"
import { CreateTxFailed, TxFailed } from "@terra-money/wallet-types"

import { Contents } from "types/components"
import { has } from "utils/num"
import { getAmount, sortCoins } from "utils/coin"
// import { getErrorMessage } from "utils/error"
import { isBroadcastingState, latestTxState } from "data/queries/tx"


import { Pre } from "components/general"
import { Flex, Grid } from "components/layout"
import { Submit, Select, Input, FormItem } from "components/form"
import { FormError, FormWarning, FormHelp } from "components/form"
import Approve from "components/form/Approve"
import { Modal } from "components/feedback"
import { Details } from "components/display"
import { Read, SafeReadPercent } from "components/token"
import ConnectWallet from "app/sections/ConnectWallet"
import styles from "./Tx.module.scss"


import { validNetworkID, defaultNetworkID } from 'config/networks'
import { useReadBalances, useFetchAllowance, useInfiniteApprove, useSubmitTx } from "./swap/useContractsEVM"
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
  // const { isConnected } = useAccount()
  // const { chain } = useNetwork()
  
  // const networkID = chain?.id ?? defaultNetworkID
  // // console.log("[TX] networkID=", networkID, " defaultNetworkID=", defaultNetworkID, " wagmi chain id=", chain?.id)

  // const { nativeAsset, tokensList } = getAssetsList(networkID)
  // const assetsList: PoolAsset[] = useReadBalances(nativeAsset, tokensList)

  // const findAssetBySymbol = (symbol: string) => assetsList.find((item) => item.symbol === symbol)
  
  // const offerAssetItem = symbol ? findAssetBySymbol(symbol) : undefined
  const balance = offerAssetItem.balance
  const insufficient = new BigNumber(balance).lt(inAmount)
  const offerTokenAddress = offerAssetItem.address ?? ""

  const enabled = !!offerAssetItem && !!inAmount && !!outAmount && !!poolSymbol && !error && 
    !insufficient && validatePoolSymbol(poolSymbol, offerAssetItem.symbol, askAssetItem.symbol)
  // console.log("[TX] inAmount, balance", inAmount, balance)
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
  // useEffect avoids infinite rendering loop
  // useEffect(() => {
  //   if (symbol == nativeSymbol) {
  //     return !isApproved ? setIsApproved(true) : undefined
  //   } else if (!!allowedAmount && inAmount!="0") {
  //       if (!isApproved && isAmountApproved(allowedAmount, inAmount)) 
  //         setIsApproved(true)
  //       else if (isApproved && !isAmountApproved(allowedAmount, inAmount)) 
  //         setIsApproved(false)

  //   // console.log("[TX][useEffect] isApproved, enabled:", isApproved, enabled)
  //   }
  // }, [isConnected, symbol, inAmount])
  

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
  const disabled = ""
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
          {...{title: "Approved"}}
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
          {...{title: "Success"}}
          icon={<CheckCircleOutlineIcon fontSize="inherit" className="success" />}
          onRequestClose={() => {
            setSubmitting(false)
            resetForm()
            updateBalances()
          }}
          isOpen
        />
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
export const getInitialGasDenom = (bankBalance: Coins) => {
  const denom = head(sortCoins(bankBalance))?.denom ?? "uusd"
  const uusd = getAmount(bankBalance, "uusd")
  return has(uusd) ? "uusd" : denom
}

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

/* hooks */
export const useTxKey = () => {
  const { txhash } = useRecoilValue(latestTxState)
  const [key, setKey] = useState(txhash)

  useEffect(() => {
    if (txhash) setKey(txhash)
  }, [txhash])

  return key
}










// function Tx<TxValues>(props: Props<TxValues>) {
//   const { token, decimals, amount, balance } = props
//   const { initialGasDenom, estimationTxValues, createTx } = props
//   const { excludeGasDenom } = props
//   const { children, onChangeMax } = props
//   const { onPost, redirectAfterTx, queryKeys } = props

//   const [isMax, setIsMax] = useState(false)
//   const [gasDenom, setGasDenom] = useState(initialGasDenom)

//   // context
//   const { t } = useTranslation()
//   const isClassic = useIsClassic()
//   const currency = useCurrency()
//   const network = useNetwork()
//   const { post } = useWallet()
//   const connectedWallet = useConnectedWallet()
//   const { wallet, validatePassword, ...auth } = useAuth()
//   const address = useAddress()
//   const isWalletEmpty = useIsWalletEmpty()
//   const setLatestTx = useSetRecoilState(latestTxState)
//   const isBroadcasting = useRecoilValue(isBroadcastingState)
//   const bankBalance = useBankBalance()
//   const { gasPrices } = useTx()

//   // simulation: estimate gas
//   const simulationTx = estimationTxValues && createTx(estimationTxValues)
//   const gasAdjustment = getLocalSetting<number>(SettingKey.GasAdjustment)
//   const key = {
//     address,
//     network,
//     initialGasDenom,
//     gasPrices,
//     gasAdjustment,
//     tx: simulationTx,
//   }

//   const { data: estimatedGas, ...estimatedGasState } = useQuery(
//     [queryKey.tx.create, key],
//     async () => {
//       if (!address || isWalletEmpty) return 0
//       if (!(wallet || connectedWallet?.availablePost)) return 0
//       if (!simulationTx || !simulationTx.msgs.length) return 0

//       const config = {
//         ...network,
//         URL: network.lcd,
//         gasAdjustment,
//         gasPrices: { [initialGasDenom]: gasPrices[initialGasDenom] },
//       }

//       const lcd = new LCDClient(config)

//       const unsignedTx = await lcd.tx.create([{ address }], {
//         ...simulationTx,
//         feeDenoms: [initialGasDenom],
//       })

//       return unsignedTx.auth_info.fee.gas_limit
//     },
//     {
//       ...RefetchOptions.INFINITY,
//       // To handle sequence mismatch
//       retry: 3,
//       retryDelay: 1000,
//       // Because the focus occurs once when posting back from the extension
//       refetchOnWindowFocus: false,
//       enabled: !isBroadcasting,
//     }
//   )

//   const getGasAmount = useCallback(
//     (denom: CoinDenom) => {
//       const gasPrice = gasPrices[denom]
//       if (isNil(estimatedGas) || !gasPrice) return "0"
//       return new BigNumber(estimatedGas)
//         .times(gasPrice)
//         .integerValue(BigNumber.ROUND_CEIL)
//         .toString()
//     },
//     [estimatedGas, gasPrices]
//   )

//   const gasAmount = getGasAmount(gasDenom)
//   const gasFee = { amount: gasAmount, denom: gasDenom }

//   // max 
//   const getNativeMax = () => {
//     if (!balance) return
//     const gasAmount = gasFee.denom === token ? gasFee.amount : "0"
//     return calcMax({ balance, gasAmount })
//   }

//   const max = !gasFee.amount
//     ? undefined
//     : isDenom(token)
//     ? getNativeMax()
//     : balance

//   // (effect): Call the onChangeMax function whenever the max changes 
//   useEffect(() => {
//     if (max && isMax && onChangeMax) onChangeMax(toInput(max, decimals))
//   }, [decimals, isMax, max, onChangeMax])

//   // (effect): Log error on console 
//   const failed = getErrorMessage(estimatedGasState.error)
//   useEffect(() => {
//     if (process.env.NODE_ENV === "development" && failed) {
//       console.groupCollapsed("Fee estimation failed")
//       console.info(simulationTx?.msgs.map((msg) => msg.toData(isClassic)))
//       console.info(failed)
//       console.groupEnd()
//     }
//   }, [failed, isClassic, simulationTx])

//   // submit
//   const passwordRequired = isWallet.single(wallet)
//   const [password, setPassword] = useState("")
//   const [incorrect, setIncorrect] = useState<string>()

//   const disabled =
//     passwordRequired && !password
//       ? t("Enter password")
//       : estimatedGasState.isLoading
//       ? t("Estimating fee...")
//       : estimatedGasState.error
//       ? t("Fee estimation failed")
//       : isBroadcasting
//       ? t("Broadcasting a tx...")
//       : props.disabled || ""

//   const [submitting, setSubmitting] = useState(false)
//   const [error, setError] = useState<Error>()

//   const navigate = useNavigate()
//   const toPostMultisigTx = useToPostMultisigTx()
//   const submit = async (values: TxValues) => {
//     setSubmitting(true)

//     try {
//       if (disabled) throw new Error(disabled)
//       if (!estimatedGas || !has(gasAmount))
//         throw new Error("Fee is not estimated")

//       const tx = createTx(values)

//       if (!tx) throw new Error("Tx is not defined")

//       const gasCoins = new Coins([Coin.fromData(gasFee)])
//       const fee = new Fee(estimatedGas, gasCoins)

//       if (isWallet.multisig(wallet)) {
//         const unsignedTx = await auth.create({ ...tx, fee })
//         navigate(toPostMultisigTx(unsignedTx))
//       } else if (wallet) {
//         const result = await auth.post({ ...tx, fee }, password)
//         setLatestTx({ txhash: result.txhash, queryKeys, redirectAfterTx })
//       } else {
//         const { result } = await post({ ...tx, fee })
//         setLatestTx({ txhash: result.txhash, queryKeys, redirectAfterTx })
//       }

//       onPost?.()
//     } catch (error) {
//       if (error instanceof PasswordError) setIncorrect(error.message)
//       else setError(error as Error)
//     }

//     setSubmitting(false)
//   }

//   const submittingLabel = isWallet.ledger(wallet) ? t("Confirm in ledger") : ""

//   // render
//   const balanceAfterTx =
//     balance &&
//     amount &&
//     new BigNumber(balance)
//       .minus(amount)
//       .minus((gasFee.denom === token && gasFee.amount) || 0)
//       .toString()

//   const insufficient = balanceAfterTx
//     ? new BigNumber(balanceAfterTx).lt(0)
//     : false

//   const availableGasDenoms = useMemo(() => {
//     return sortCoins(bankBalance, currency)
//       .map(({ denom }) => denom)
//       .filter(
//         (denom) =>
//           !excludeGasDenom?.(denom) &&
//           !isDenomIBC(denom) &&
//           new BigNumber(getAmount(bankBalance, denom)).gte(getGasAmount(denom))
//       )
//   }, [bankBalance, currency, excludeGasDenom, getGasAmount])

//   useEffect(() => {
//     if (availableGasDenoms.includes(initialGasDenom)) return
//     setGasDenom(availableGasDenoms[0])
//   }, [availableGasDenoms, initialGasDenom])

//   // element
//   const resetMax = () => setIsMax(false)
//   const renderMax: RenderMax = (onClick) => {
//     if (!(max && has(max))) return null

//     return (
//       <button
//         type="button"
//         className={classNames({ muted: !isMax })}
//         onClick={onClick ? () => onClick(max) : () => setIsMax(!isMax)}
//       >
//         <Flex gap={4} start>
//           <AccountBalanceWalletIcon
//             fontSize="inherit"
//             className={styles.icon}
//           />
//           <Read amount={max} token={token} decimals={decimals} />
//         </Flex>
//       </button>
//     )
//   }

//   const renderFee = (descriptions?: Contents) => {
//     if (!estimatedGas) return null

//     return (
//       <Details>
//         <dl>
//           {descriptions?.map(({ title, content }, index) => (
//             <Fragment key={index}>
//               <dt>{title}</dt>
//               <dd>{content}</dd>
//             </Fragment>
//           ))}

//           <dt className={styles.gas}>
//             {t("Fee")}
//             {availableGasDenoms.length > 1 && (
//               <Select
//                 value={gasDenom}
//                 onChange={(e) => setGasDenom(e.target.value)}
//                 className={styles.select}
//                 small
//               >
//                 {availableGasDenoms.map((denom) => (
//                   <option value={denom} key={denom}>
//                     {readDenom(denom)}
//                   </option>
//                 ))}
//               </Select>
//             )}
//           </dt>
//           <dd>{gasFee.amount && <Read {...gasFee} />}</dd>

//           {balanceAfterTx && (
//             <>
//               <dt>{t("Balance")}</dt>
//               <dd>
//                 <Read amount={balance} token={token} decimals={decimals} />
//               </dd>

//               <dt>{t("Balance after tx")}</dt>
//               <dd>
//                 <Read
//                   amount={balanceAfterTx}
//                   token={token}
//                   decimals={decimals}
//                   className={classNames(insufficient && "danger")}
//                 />
//               </dd>
//             </>
//           )}
//         </dl>
//       </Details>
//     )
//   }

//   const walletError = 
//     connectedWallet?.connectType === ConnectType.READONLY
//       ? t("Wallet is connected as read-only mode")
//       : !availableGasDenoms.length
//       ? t("Insufficient balance to pay transaction fee")
//       : isWalletEmpty
//       ? t("Coins required to post transactions")
//       : ""

//   const submitButton = (
//     <>
//       {walletError && <FormError>{walletError}</FormError>}

//       {!address ? (
//         <ConnectWallet
//           renderButton={(open) => (
//             <Submit type="button" onClick={open}>
//               {t("Connect wallet")}
//             </Submit>
//           )}
//         />
//       ) : (
//         <Grid gap={4}>
//           {passwordRequired && (
//             <FormItem label={t("Password")} error={incorrect}>
//               <Input
//                 type="password"
//                 value={password}
//                 onChange={(e) => {
//                   setIncorrect(undefined)
//                   setPassword(e.target.value)
//                 }}
//               />
//             </FormItem>
//           )}

//           {failed && <FormError>{failed}</FormError>}

//           <Submit
//             disabled={!estimatedGas || !!disabled}
//             submitting={submitting}
//           >
//             {submitting ? submittingLabel : disabled}
//           </Submit>
//         </Grid>
//       )}
//     </>
//   )

//   const modal = !error
//     ? undefined
//     : {
//         title:
//           error instanceof UserDenied
//             ? t("User denied")
//             : error instanceof CreateTxFailed
//             ? t("Failed to create tx")
//             : error instanceof TxFailed
//             ? t("Tx failed")
//             : t("Error"),
//         children:
//           error instanceof UserDenied ? null : (
//             <Pre height={120} normal break>
//               {error.message}
//             </Pre>
//           ),
//       }

//   return (
//     <>
//       {children({
//         max: { amount: max ?? "0", render: renderMax, reset: resetMax },
//         fee: { render: renderFee },
//         submit: { fn: submit, button: submitButton },
//       })}

//       {modal && (
//         <Modal
//           {...modal}
//           icon={<ErrorOutlineIcon fontSize="inherit" className="danger" />}
//           onRequestClose={() => setError(undefined)}
//           isOpen
//         />
//       )}
//     </>
//   )
// }

