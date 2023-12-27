import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { useAccount } from 'wagmi'

/* helpers */
import { has } from "utils/num"
import BigNumber from "bignumber.js"

/* components */
import { Form, FormArrow, FormError } from "components/form"
import { Checkbox } from "components/form"
import { Read } from "components/token"

/* tx modules */
import { getPlaceholder, toInput } from "../utils"
import validate from "../validate"
import Tx, { TxProps } from "./Tx"

/* swap modules */
import AssetFormItem from "./components/AssetFormItem"
import { AssetInput, AssetReadOnly } from "./components/AssetFormItem"
import SelectToken from "./components/SelectToken"
import SlippageControl from "./components/SlippageControl"
import ExpectedPrice, { ExpectedPriceProps } from "./components/ExpectedPrice"

import { useGLP } from "./GLPContext"
import { useReadBalances, usePoolSymbol, usePoolInfo } from "./useContractsGLP"
import { defaultDecimals } from "config/assets.js"

// import styles from "./SwapForm.module.scss"


interface TxValues {
  input?: number
  offerSymbol?: string
  askSymbol?: string
  slippageInput?: number
}


const CollatForm = () => {
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
  const getCoinsOptions = (key: "offerSymbol" | "askSymbol") => {
    return [{ 
      title: t("Coins"), 
      children: assetsList.map((asset) => {
        const { symbol: value, balance } = asset

        // Sombrear en la lista, si hay un activo seleccionado en el otro
        // formulario, diferente a GEX, todas las opciones que no sean GEX 
        const muted = { 
          offerSymbol: !!askSymbol && (askSymbol!="GEX" && value!="GEX") || (askSymbol==value),
          askSymbol: !!offerSymbol && (offerSymbol!="GEX" && value!="GEX") || (offerSymbol==value)
        }[key]

        const hidden = key === "offerSymbol" && !showAll && !has(balance) && isConnected
        
        return { ...asset, value, muted, hidden }
      })
   }]
  }


  // FORMULARIO
  const form = useForm<TxValues>({
    mode: "onChange", // what triggers validation of form inputs. onChange is expensive. Alt: onSubmit
    defaultValues: { offerSymbol: initialOfferSymbol, askSymbol: "GEX", slippageInput: 1 },
  })

  const { register, trigger, watch, setValue, resetField, handleSubmit, reset, formState } = form
  const { errors } = formState
  const { offerSymbol, askSymbol, input, slippageInput } = watch() // Esta desestructuración viene definida por el interfaz TxValues
  
  // console.log("[SWAPFORM] offerSymbol, initialOfferSymbol ", offerSymbol, initialOfferSymbol)

  if (Number.isNaN(input)) resetField("input")  // A veces aparece un NaN, causa desconocida.


  // Change assets position in the form
  const swapAssets = () => {
    setValue("offerSymbol", askSymbol)
    setValue("askSymbol", offerSymbol)
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
  }, [offerSymbol, askSymbol])
  
  const offerAssetItem: PoolAsset = offerSymbol ? findAssetBySymbol(offerSymbol, assetsList, assetsList[0]) : assetsList[0]
  const offerDecimals = offerAssetItem ? offerAssetItem.decimals : defaultDecimals
  const askAssetItem: PoolAsset = askSymbol ? findAssetBySymbol(askSymbol, assetsList, assetsList[0]) : assetsList[1]
  const askDecimals = askSymbol ? findAssetDecimalsBySymbol(askSymbol, assetsList, assetsList[0]) : defaultDecimals

  const inAmount = new BigNumber(input ?? 0).shiftedBy(offerDecimals).toFixed(0)
  
  

  // FETCH SWAP ESTIMATES
  const enableHooks = isConnected && !!offerSymbol && !!askSymbol && !!input
  
  const poolSymbol = usePoolSymbol(offerAssetItem, askAssetItem)
  const tradeInfo = usePoolInfo(poolSymbol, offerAssetItem.symbol, inAmount, enableHooks)
  
  const { offerAssetPrice, askAssetPrice, askAssetRatio, feePerc, feeAmount, outAmount, priceImpact } = tradeInfo
  // console.log("[SwapForm] Tradeinfo:", tradeInfo)  

  const minReceive = calcMinimumReceived(outAmount, slippageInput ?? 1)

  
  // Handle select asset on form
  const onSelectAsset = (key: "offerSymbol" | "askSymbol") => {
    return async (value: Token) => {
      const assets = {
        offerSymbol: { offerSymbol: value, askSymbol },
        askSymbol: { offerSymbol, askSymbol: value },
      }[key]

      // Enforce swap always against GEX
      if (value != "GEX") {
        setValue(key === "offerSymbol" ? "askSymbol" : "offerSymbol", "GEX")
      }
      // empty opposite asset if select the same asset
      else if (assets.offerSymbol === assets.askSymbol) {
        setValue(key === "offerSymbol" ? "askSymbol" : "offerSymbol", undefined)
      }
      
      // focus on input if select offer asset
      if (key === "offerSymbol") {
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
    token: offerSymbol,
    symbol,
    decimals,
    amount: inAmount,
    balance,
    onPost: () => {} // Función para añadir token personalizado al wallet tras comprarlo -> implementar,
  }

  // No está muy claro que tenga algún efecto: en el componente Tx se define de nuevo
  // const disabled = enableHooks ? false: "Input data" //isFetching ? t("Simulating...") : false
  const disabled = false


  // RENDER FUNCTIONS
  const isFetching = false

  // type guard
  const validateExpectedPriceProps = (
    params: Partial<ExpectedPriceProps>
    ): params is ExpectedPriceProps => {
      const { offerSymbol, askSymbol, offerAssetPrice, askAssetPrice, 
        askAssetRatio, feeAmount } = params
      return !!(offerSymbol && askSymbol && offerAssetPrice && 
        askAssetPrice && askAssetRatio && feeAmount)
    }

  // render: expected price
  const renderExpected = () => {
    if (!input) return null

    const isLoading = false
    const props = { offerSymbol, offerDecimals, askSymbol, askDecimals, 
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
              value={offerSymbol}
              onChange={onSelectAsset("offerSymbol")}
              options={getCoinsOptions("offerSymbol")}
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
              value={askSymbol}
              onChange={onSelectAsset("askSymbol")}
              options={getCoinsOptions("askSymbol")}
              addonAfter={
                <AssetReadOnly>
                  {outAmount ? (
                    <Read
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

          {/* {( Banner rojo error parte inferior caja)} */}
          {disabled && <FormError>{disabled}</FormError>}

          {/* (12) BOTÓN ENVIAR TRANSACCIÓN */}
          {submit.button}
        </Form>
      )}
    </Tx>
  )
}


export default CollatForm


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

const diffStrings = (minuend: string, subtrahend: string) => {
  const num1 = new BigNumber(minuend)
  const num2 = new BigNumber(subtrahend)
  return num1.minus(num2).toFixed(0)
}
