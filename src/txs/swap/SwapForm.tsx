import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { useAccount } from 'wagmi'


/* helpers */
import { has } from "utils/num"
import BigNumber from "bignumber.js"

/* components */
import { Form, FormArrow, FormError } from "components/form"
import { Checkbox, RadioButton } from "components/form"
import { Read } from "components/token"

/* tx modules */
import { getPlaceholder, toInput } from "../utils"
import validate from "../validate"
import Tx, { TxProps } from "../Tx"

/* swap modules */
import AssetFormItem from "./components/AssetFormItem"
import { AssetInput, AssetReadOnly } from "./components/AssetFormItem"
import SelectToken from "./components/SelectToken"
import SlippageControl from "./components/SlippageControl"
import ExpectedPrice, { ExpectedPriceProps } from "./components/ExpectedPrice"
import { SwapMode } from "./useSwapUtils"
import { SlippageParams } from "./SingleSwapContext"
// import styles from "./SwapForm.module.scss"
import {useGLP} from "./GLPContext"


import { useReadBalances, usePoolSymbol, usePoolInfo } from "./useContractsEVM"
import { defaultDecimals } from "config/assets.js"




interface TxValues extends Partial<SlippageParams> {
  mode?: SwapMode
}


const SwapForm = () => {
  // console.log("[SWAPFORM] START")
  const { t } = useTranslation()
  const { isConnected } = useAccount()
  const { networkID, nativeAsset, tokensList } = useGLP()
  const [showAll, setShowAll] = useState(false)
  
  // ASSETS
  const initialOfferSymbol = nativeAsset.symbol
  // console.log("[SWAPFORM] initialOfferSymbol, nativeAsset", initialOfferSymbol, nativeAsset)

  // BALANCES
  const { assetsList, refetchNative, refetchTokens } = useReadBalances(nativeAsset, tokensList)
  // console.log("[SWAPFORM] assetsList ", assetsList)
  
  
  
  // LISTA DE TOKENS DEL FORMULARIO
  const getCoinsOptions = (key: "offerAsset" | "askAsset") => {
    return [{ 
      title: t("Coins"), 
      children: assetsList.map((asset) => {
        const { symbol: value, balance } = asset

        // Sombrear en la lista, si hay un activo seleccionado en el otro
        // formulario, diferente a GEX, todas las opciones que no sean GEX 
        const muted = { 
          offerAsset: !!askAsset && (askAsset!="GEX" && value!="GEX") || (askAsset==value),
          askAsset: !!offerAsset && (offerAsset!="GEX" && value!="GEX") || (offerAsset==value)
        }[key]

        const hidden = key === "offerAsset" && !showAll && !has(balance) && isConnected
        
        return { ...asset, value, muted, hidden }
      })
   }]
  }


  // FORMULARIO
  const form = useForm<TxValues>({
    mode: "onChange", // what triggers validation of form inputs. onChange is expensive. Alt: onSubmit
    defaultValues: { offerAsset: initialOfferSymbol, askAsset: "GEX", slippageInput: 1 },
  })

  const { register, trigger, watch, setValue, resetField, handleSubmit, reset, formState } = form
  const { errors } = formState
  const { offerAsset, askAsset, input, slippageInput } = watch() // Esta desestructuración viene definida por el interfaz TxValues
  
  // console.log("[SWAPFORM] offerAsset, initialOfferSymbol ", offerAsset, initialOfferSymbol)

  if (Number.isNaN(input)) resetField("input")  // A veces aparece un NaN, causa desconocida.


  // Change assets position in the form
  const swapAssets = () => {
    setValue("offerAsset", askAsset)
    setValue("askAsset", offerAsset)
    resetField("input")
  }

  const updateBalances = () => {
    if (!isConnected) return
    // console.log("[SWAPFORM][updateBalances]");
    (async () => {
      const {data: nativeBalance} = await refetchNative()
      const {data: tokensBalances} = await refetchTokens()

      assetsList[0].balance = nativeBalance ? nativeBalance.formatted : assetsList[0].balance
      
      if (tokensBalances) {
        tokensBalances.forEach((balance, index) => {
          assetsList[index+1].balance = balance ? balance.toString() : assetsList[index+1].balance
        })
      }
    })()
  }
  
  useEffect(() => {
    updateBalances()
  }, [offerAsset, askAsset])
  
  const offerAssetItem: PoolAsset = offerAsset ? findAssetBySymbol(offerAsset, assetsList, assetsList[0]) : assetsList[0]
  const offerDecimals = offerAssetItem ? offerAssetItem.decimals : defaultDecimals
  const askAssetItem: PoolAsset = askAsset ? findAssetBySymbol(askAsset, assetsList, assetsList[0]) : assetsList[1]
  const askDecimals = askAsset ? findAssetDecimalsBySymbol(askAsset, assetsList, assetsList[0]) : defaultDecimals

  const inAmount = new BigNumber(input ?? 0).shiftedBy(offerDecimals).toFixed(0)
  
  

  // FETCH SWAP ESTIMATES
  const enableHooks = isConnected && !!offerAsset && !!askAsset && !!input
  
  const poolSymbol = usePoolSymbol(offerAssetItem, askAssetItem)
  const tradeInfo = usePoolInfo(poolSymbol, offerAssetItem.symbol, inAmount, enableHooks)
  
  const { offerAssetPrice, askAssetPrice, askAssetRatio, feePerc, feeAmount, outAmount, priceImpact } = tradeInfo
  // console.log("[SwapForm] Tradeinfo:", tradeInfo)  

  const minReceive = calcMinimumReceived(outAmount, slippageInput ?? 1)

  
  // Handle select asset on form
  const onSelectAsset = (key: "offerAsset" | "askAsset") => {
    return async (value: Token) => {
      const assets = {
        offerAsset: { offerAsset: value, askAsset },
        askAsset: { offerAsset, askAsset: value },
      }[key]

      // Enforce swap always against GEX
      if (value != "GEX") {
        setValue(key === "offerAsset" ? "askAsset" : "offerAsset", "GEX")
      }
      // empty opposite asset if select the same asset
      else if (assets.offerAsset === assets.askAsset) {
        setValue(key === "offerAsset" ? "askAsset" : "offerAsset", undefined)
      }
      
      // focus on input if select offer asset
      if (key === "offerAsset") {
        form.resetField("input")
        form.setFocus("input") // Pone el cursor para escribir en el formulario 1. Como hacer click.
      }

      setValue(key, value)
    }
  }


  // tx
  const balance = ""
  

  // PARÁMETROS QUE SE PASAN AL COMPONENTE TX
  const txProps: TxProps = {
    offerAssetItem,
    askAssetItem,
    inAmount,
    outAmount,
    feeAmount,
    minReceive,
    priceImpact,
    nativeSymbol: nativeAsset.symbol,
    poolSymbol, 
    resetForm: () => reset(),
    updateBalances,
    networkID,
    isConnected
  }

  const symbol = offerAssetItem?.symbol ?? ""
  const decimals = offerDecimals
  const tx = {
    newProps: txProps,
    token: offerAsset,
    symbol,
    decimals,
    amount: inAmount,
    balance,
    onPost: () => {} // Función para añadir token personalizado al wallet tras comprarlo -> implementar,
  }

  // No está muy claro que tenga algún efecto: en el componente Tx se define de nuevo
  const disabled = enableHooks ? false: "Input data" //isFetching ? t("Simulating...") : false


  // RENDER FUNCTIONS
  const isFetching = false

  // type guard
  const validateExpectedPriceProps = (
    params: Partial<ExpectedPriceProps>
    ): params is ExpectedPriceProps => {
      const { offerAsset, askAsset, offerAssetPrice, askAssetPrice, 
        askAssetRatio, feeAmount } = params
      return !!(offerAsset && askAsset && offerAssetPrice && 
        askAssetPrice && askAssetRatio && feeAmount)
    }

  // render: expected price
  const renderExpected = () => {
    if (!input) return null

    const isLoading = false
    const props = { offerAsset, offerDecimals, askAsset, askDecimals, 
      offerAssetPrice, askAssetPrice, askAssetRatio, feeAmount, isLoading}

    if (!(isConnected && validateExpectedPriceProps(props))){
      // console.log("[SWAPFORM][renderExpected] props NOT VALIDATED", props)
      return null
    } 
    // (7-10) DATOS DEBAJO DEL PAR, APARECEN SOLO
    // SI SE INTRODUCE UNA CANTIDAD ARRIBA PARA CAMBIAR
    // console.log("[SWAPFORM][renderExpected] props VALIDATED", props)
    return <ExpectedPrice {...props} isLoading={isFetching} />
  }

    

  return (
    <Tx {...tx} disabled={disabled}>
      {({ max, fee, submit }) => (
        <Form onSubmit={handleSubmit(submit.fn)}>
          {/* (1) PESTAÑAS MERCADOS SWAP */}
          {/* {renderRadioGroup()} */}
        
          {/* (3) PRIMER FORMULARIO TOKEN */}
          <AssetFormItem
            label={t("From")}
            extra={max.render(async (value) => {// (2) BALANCE TOKEN 1 (MÁXIMO GASTABLE)
              // Do not use automatic max here
              // Confusion arises as the amount changes and simulates again
              setValue("input", toInput(value, offerDecimals))
              await trigger("input")
            })}
            error={errors.input?.message}
          >
            <SelectToken
              value={offerAsset}
              onChange={onSelectAsset("offerAsset")}
              options={getCoinsOptions("offerAsset")}
              checkbox={
                <Checkbox
                  checked={showAll}
                  onChange={() => setShowAll(!showAll)}
                >
                  {t("Show all")}
                </Checkbox>
              }
              addonAfter={
                <AssetInput
                  {...register("input", {
                    valueAsNumber: true,
                    validate: validate.input(
                      toInput(max.amount, offerDecimals),
                      offerDecimals
                    ),
                  })}
                  inputMode="decimal"
                  placeholder={"0.000"}
                  onFocus={max.reset}
                  autoFocus
                />
              }
            />
          </AssetFormItem>

          {/* (4) FLECHA INVERTIR SWAP */}
          <FormArrow onClick={swapAssets} />

          {/* (5) SEGUNDO FORMULARIO TOKEN */}
          <AssetFormItem label={t("To")}>
            <SelectToken
              value={askAsset}
              onChange={onSelectAsset("askAsset")}
              options={getCoinsOptions("askAsset")}
              addonAfter={
                <AssetReadOnly>
                  {outAmount ? (
                    <Read
                    // TODO: Descontar fees del importe de salida mostrado
                      amount={outAmount}
                      decimals={askDecimals}
                      approx
                    />
                  ) : (
                    <p className="muted">
                      {isFetching ? t("Simulating...") : "0"}
                    </p>
                  )}
                </AssetReadOnly>
              }
            />
          </AssetFormItem>

          {/* (6) CONTROL SLIPPAGE */}
          {isConnected && (
            <SlippageControl
              {...register("slippageInput", {
                valueAsNumber: true,
                validate: validate.input(50, 2, "Slippage tolerance"),
              })}
              input={slippageInput} // to warn
              inputMode="decimal"
              placeholder={getPlaceholder(2)}
              error={errors.slippageInput?.message}
            />
          )}

          {/* (7-10) DATOS RESULTADO SWAP */}
          {renderExpected()}
          
          {/* (11) DETALLES FEE. COMPONENTE renderFee() DE Tx */}
          {isConnected && fee.render()}

          {/* {( Banner rojo error parte inferior caja
            <FormError>{t("Pair does not exist")}</FormError>
          )} */}

          {/* (12) BOTÓN ENVIAR TRANSACCIÓN */}
          {submit.button}
        </Form>
      )}
    </Tx>
  )
}


export default SwapForm


// HELPERS
const findAssetBySymbol = (symbol: string, assetsList: PoolAsset[], defaultAsset: PoolAsset) => {
  return assetsList.find((item) => item.symbol === symbol) ?? defaultAsset
}
const findAssetDecimalsBySymbol = (symbol: string, assetsList: PoolAsset[], defaultAsset: PoolAsset) => {
  return findAssetBySymbol(symbol, assetsList, defaultAsset).decimals
}

const calcMinimumReceived = (expOutAmount: string, slippageInput: number) => {
  const max_spread = new BigNumber(slippageInput).div(100).toString()
  const minRatio = new BigNumber(1).minus(max_spread)
  // console.log("[calcMinimumReceived] slippageInput, max_spread, minRatio", slippageInput, max_spread, minRatio.toString())
  const value = new BigNumber(expOutAmount).times(minRatio).toFixed(0)
  // const round_value = value.integerValue(BigNumber.ROUND_FLOOR).toString()
  // console.log("[calcMinimumReceived] expOutAmount, value, round_value", expOutAmount, value)//, round_value)
  return value
}


// const SwapForm = () => {
//   const { t } = useTranslation()
//   const address = useAddress()
//   const { state } = useLocation()
//   const bankBalance = useBankBalance()
//   const { add } = useCustomTokensCW20()

//   // swap context
//   const utils = useSwapUtils()
//   const { getIsSwapAvailable, getAvailableSwapModes } = utils
//   const { getMsgsFunction, getSimulateFunction, getSimulateQuery } = utils
//   const { options, findTokenItem, findDecimals, calcExpected } = useSingleSwap()

//   const initialOfferSymbol =
//     (state as Token) ??
//     (getAmount(bankBalance, "uusd") ? "uusd" : sortCoins(bankBalance)[0].denom)
//   const initialGasDenom = getInitialGasDenom(bankBalance)

//   // options
//   const [showAll, setShowAll] = useState(false)

//   const getCoinsOptions = (key: "offerAsset" | "askAsset") => {
//     const { coins, tokens } = options

//     const getOptionList = (list: TokenItemWithBalance[]) =>
//       list.map((item) => {
//         const { token: value, balance } = item

//         const muted = {
//           offerAsset:
//             !!askAsset && !getIsSwapAvailable({ offerAsset: value, askAsset }),
//           askAsset:
//             !!offerAsset &&
//             !getIsSwapAvailable({ offerAsset, askAsset: value }),
//         }[key]

//         const hidden = key === "offerAsset" && !showAll && !has(balance)
//         return { ...item, value, muted, hidden }
//       })

//     return [
//       { title: t("Coins"), children: getOptionList(coins) },
//       { title: t("Tokens"), children: getOptionList(tokens) },
//     ]
//   }

//   // form
//   const form = useForm<TxValues>({
//     mode: "onChange",
//     defaultValues: { offerAsset: initialOfferSymbol, slippageInput: 1 },
//   })

//   const { register, trigger, watch, setValue, handleSubmit, formState } = form
//   const { errors } = formState
//   const values = watch()
//   const { mode, offerAsset, askAsset, input, slippageInput, ratio } = values

//   useEffect(() => {
//     // validate input on change mode
//     if (mode) trigger("input")
//   }, [mode, trigger])

//   const assets = useMemo(
//     () => ({ offerAsset, askAsset }),
//     [offerAsset, askAsset]
//   )

//   const slippageParams = useMemo(
//     () => ({ offerAsset, askAsset, input, slippageInput, ratio }),
//     [askAsset, input, offerAsset, ratio, slippageInput]
//   )

//   const offerTokenItem = offerAsset ? findTokenItem(offerAsset) : undefined
//   const offerDecimals = offerAsset ? findDecimals(offerAsset) : undefined
//   const askTokenItem = askAsset ? findTokenItem(askAsset) : undefined
//   const askDecimals = askAsset ? findDecimals(askAsset) : undefined

//   const amount = toAmount(input, { decimals: offerDecimals })

//   const swapAssets = () => {
//     setValue("offerAsset", askAsset)
//     setValue("askAsset", offerAsset)
//     setValue("input", undefined)
//     trigger("input")
//   }

//   // simulate | execute
//   const params = { amount, ...assets }
//   const availableSwapModes = getAvailableSwapModes(assets)
//   const isSwapAvailable = getIsSwapAvailable(assets)
//   const simulateQuery = getSimulateQuery(params)

//   // simulate
//   const { data: simulationResults, isFetching } = useQuery({
//     ...simulateQuery,
//     onSuccess: ({ profitable }) => setValue("mode", profitable?.mode),
//   })

//   // Simulated value to create tx
//   // Simulated for all possible modes
//   // Do not simulate again even if the mode changes
//   const results = simulationResults?.values
//   const result = results && mode && results[mode]
//   const simulatedValue = result?.value
//   const simulatedRatio = result?.ratio

//   useEffect(() => {
//     // Set ratio on simulate
//     if (simulatedRatio) setValue("ratio", simulatedRatio)
//   }, [simulatedRatio, setValue])

//   // Select asset
//   const onSelectAsset = (key: "offerAsset" | "askAsset") => {
//     return async (value: Token) => {
//       const assets = {
//         offerAsset: { offerAsset: value, askAsset },
//         askAsset: { offerAsset, askAsset: value },
//       }[key]

//       // set mode if only one available
//       const availableSwapModes = getAvailableSwapModes(assets)
//       const availableSwapMode =
//         availableSwapModes?.length === 1 ? availableSwapModes[0] : undefined
//       setValue("mode", availableSwapMode)

//       // empty opposite asset if select the same asset
//       if (assets.offerAsset === assets.askAsset) {
//         setValue(key === "offerAsset" ? "askAsset" : "offerAsset", undefined)
//       }

//       // focus on input if select offer asset
//       if (key === "offerAsset") {
//         form.resetField("input")
//         form.setFocus("input")
//       }

//       setValue(key, value)
//     }
//   }

//   // tx
//   const balance = offerTokenItem?.balance
//   const createTx = useCallback(
//     (values: TxValues) => {
//       const { mode, offerAsset, askAsset, input, slippageInput, ratio } = values
//       if (!(mode && input && offerAsset && askAsset && slippageInput && ratio))
//         return

//       const offerDecimals = findDecimals(offerAsset)
//       const amount = toAmount(input, { decimals: offerDecimals })
//       if (!balance || new BigNumber(amount).gt(balance)) return

//       const params = { amount, offerAsset, askAsset }
//       if (!validateParams(params)) return

//       const getMsgs = getMsgsFunction(mode)

//       // slippage 
//       const expected = calcExpected({ ...params, input, slippageInput, ratio })
//       return { msgs: getMsgs({ ...params, ...expected }) }
//     },
//     [balance, calcExpected, findDecimals, getMsgsFunction]
//   )

//   // fee
//   const { data: estimationTxValues } = useQuery(
//     ["estimationTxValues", { mode, assets, balance }],
//     async () => {
//       if (!(mode && validateAssets(assets) && balance)) return
//       const { offerAsset, askAsset } = assets
//       const simulate = getSimulateFunction(mode)
//       // estimate fee only after ratio simulated
//       const { ratio } = await simulate({ ...assets, amount: balance })
//       const input = toInput(balance, findDecimals(offerAsset))
//       return { mode, offerAsset, askAsset, ratio, input, slippageInput: 1 }
//     }
//   )

//   const token = offerAsset
//   const decimals = offerDecimals
//   const tx = {
//     token,
//     decimals,
//     amount,
//     balance,
//     initialGasDenom,
//     estimationTxValues,
//     createTx,
//     onPost: () => {
//       // add custom token on ask cw20
//       if (!(askAsset && AccAddress.validate(askAsset) && askTokenItem)) return
//       const { balance, ...rest } = askTokenItem
//       add(rest as CustomTokenCW20)
//     },
//     queryKeys: [offerAsset, askAsset]
//       .filter((asset) => asset && AccAddress.validate(asset))
//       .map((token) => [
//         queryKey.wasm.contractQuery,
//         token,
//         { balance: address },
//       ]),
//   }

//   const disabled = isFetching ? t("Simulating...") : false

//   // render
//   const renderRadioGroup = () => {
//     if (!(validateAssets(assets) && isSwapAvailable)) return null

//     return (
//       <section className={styles.modes}>
//         {availableSwapModes.map((key) => {
//           const checked = mode === key

//           return (
//             <RadioButton
//               {...register("mode")}
//               value={key}
//               checked={checked}
//               key={key}
//             >
//               {key}
//             </RadioButton>
//           )
//         })}
//       </section>
//     )
//   }

//   // render: expected price
//   const renderExpected = () => {
//     if (!(mode && validateSlippageParams(slippageParams))) return null
//     const expected = calcExpected(slippageParams)
//     const props = { mode, ...slippageParams, ...expected, ...result }
//     return <ExpectedPrice {...props} isLoading={isFetching} />
//   }

//   const slippageDisabled = [offerAsset, askAsset].every(isDenomTerra)

//   return (
//     <Tx {...tx} disabled={disabled}>
//       {({ max, fee, submit }) => (
//         <Form onSubmit={handleSubmit(submit.fn)}>
//           {renderRadioGroup()}

//           <AssetFormItem
//             label={t("From")}
//             extra={max.render(async (value) => {
//               // Do not use automatic max here
//               // Confusion arises as the amount changes and simulates again
//               setValue("input", toInput(value, offerDecimals))
//               await trigger("input")
//             })}
//             error={errors.input?.message}
//           >
//             <SelectToken
//               value={offerAsset}
//               onChange={onSelectAsset("offerAsset")}
//               options={getCoinsOptions("offerAsset")}
//               checkbox={
//                 <Checkbox
//                   checked={showAll}
//                   onChange={() => setShowAll(!showAll)}
//                 >
//                   {t("Show all")}
//                 </Checkbox>
//               }
//               addonAfter={
//                 <AssetInput
//                   {...register("input", {
//                     valueAsNumber: true,
//                     validate: validate.input(
//                       toInput(max.amount, offerDecimals),
//                       offerDecimals
//                     ),
//                   })}
//                   inputMode="decimal"
//                   placeholder={getPlaceholder(offerDecimals)}
//                   onFocus={max.reset}
//                   autoFocus
//                 />
//               }
//             />
//           </AssetFormItem>

//           <FormArrow onClick={swapAssets} />

//           <AssetFormItem label={t("To")}>
//             <SelectToken
//               value={askAsset}
//               onChange={onSelectAsset("askAsset")}
//               options={getCoinsOptions("askAsset")}
//               addonAfter={
//                 <AssetReadOnly>
//                   {simulatedValue ? (
//                     <Read
//                       amount={simulatedValue}
//                       decimals={askDecimals}
//                       approx
//                     />
//                   ) : (
//                     <p className="muted">
//                       {isFetching ? t("Simulating...") : "0"}
//                     </p>
//                   )}
//                 </AssetReadOnly>
//               }
//             />
//           </AssetFormItem>

//           {!slippageDisabled && (
//             <SlippageControl
//               {...register("slippageInput", {
//                 valueAsNumber: true,
//                 validate: validate.input(50, 2, "Slippage tolerance"),
//               })}
//               input={slippageInput} // to warn
//               inputMode="decimal"
//               placeholder={getPlaceholder(2)}
//               error={errors.slippageInput?.message}
//             />
//           )}

//           {renderExpected()}
//           {fee.render()}

//           {validateAssets(assets) && !isSwapAvailable && (
//             <FormError>{t("Pair does not exist")}</FormError>
//           )}

//           {submit.button}
//         </Form>
//       )}
//     </Tx>
//   )
// }
