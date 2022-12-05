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
import { toInput } from "../utils"
import validate from "../validate"
import Tx, { TxProps } from "./Tx"

/* swap modules */
import AssetFormItem from "../swap/components/AssetFormItem"
import { AssetInput, AssetReadOnly } from "../swap/components/AssetFormItem"
import SelectToken from "../swap/components/SelectToken"
import ExpectedPrice, { ExpectedPriceProps } from "../swap/components/ExpectedPrice"


import { useSCM } from "./SCMinterContext"
import { useReadBalances, useMinterInfo, useStableAsset } from "./useContractsSCM"
import { defaultDecimals } from "config/assets.js"

// import styles from "./SwapForm.module.scss"



interface TxValues {
  input?: number
  offerSymbol?: string
  askSymbol?: string
}


const MintForm = () => {
  // console.log("[MINTFORM] START")
  const { t } = useTranslation()
  const { isConnected } = useAccount()
  const { networkID, tokensList } = useSCM()
  const [showAll, setShowAll] = useState(false)


  // BALANCES
  const { assetsList, refetchTokens } = useReadBalances(tokensList)
  


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


  // FORM
  const form = useForm<TxValues>({
    mode: "onSubmit", // what triggers validation of form inputs. onChange is expensive. Alt: onSubmit
    defaultValues: { offerSymbol: "GEX", askSymbol: "USDI" },
  })

  const { register, trigger, watch, setValue, resetField, handleSubmit, reset, formState } = form
  const { errors } = formState
  const { offerSymbol, askSymbol, input } = watch() // Esta desestructuración viene definida por el interfaz TxValues
  


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
      const {data: tokensBalances} = await refetchTokens()
      
      if (tokensBalances) {
        tokensBalances.forEach((balance, index) => {
          assetsList[index].balance = balance ? balance.toString() : assetsList[index].balance
        })
      }
    })()
  }
  
  useEffect(() => {
    updateBalances()
  }, [offerSymbol, askSymbol])

  const offerAssetItem: PoolToken = offerSymbol ? findAssetBySymbol(offerSymbol, assetsList, assetsList[0]) : assetsList[0]
  const offerDecimals = offerAssetItem ? offerAssetItem.decimals : defaultDecimals
  const askAssetItem: PoolToken = askSymbol ? findAssetBySymbol(askSymbol, assetsList, assetsList[0]) : assetsList[1]
  const askDecimals = askSymbol ? findAssetDecimalsBySymbol(askSymbol, assetsList, assetsList[0]) : defaultDecimals

  const inAmount = new BigNumber(input ?? 0).shiftedBy(offerDecimals).toFixed()



  // FETCH SWAP ESTIMATES
  const enableHooks = isConnected && !!offerSymbol && !!askSymbol && !!input 
  
  const stableAsset = useStableAsset(offerAssetItem, askAssetItem)
  const tradeInfo = useMinterInfo(offerAssetItem.symbol, inAmount, stableAsset.address, enableHooks)
  
  const { offerAssetPrice, askAssetPrice, feePerc, feeAmount, outAmount } = tradeInfo
  // console.log("[MINTFORM] Tradeinfo:", tradeInfo)
  

  

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
  const disabled = enableHooks ? false: "Input data" //isFetching ? t("Simulating...") : false



  // RENDER FUNCTIONS
  const isFetching = false

  // type guard
  const validateExpectedPriceProps = (params: Partial<ExpectedPriceProps>): params is ExpectedPriceProps => {
    const { offerSymbol, askSymbol, offerAssetPrice, askAssetPrice, feeAmount} = params      
    return !!(offerSymbol && askSymbol && offerAssetPrice && askAssetPrice && feeAmount)
  }

  // render: expected price
  const renderExpected = () => {
    if (!input) return null

    const isLoading = false
    const props = { offerSymbol, offerDecimals, askSymbol, askDecimals, 
      offerAssetPrice, askAssetPrice, feeAmount, isLoading, mode:"SCMint"}

    if (!(isConnected && validateExpectedPriceProps(props))){
      // console.log("[MINTFORM][renderExpected] props NOT VALIDATED", props)
      return null
    } 
    // (7-10) DATOS DEBAJO DEL PAR, APARECEN SOLO
    // SI SE INTRODUCE UNA CANTIDAD ARRIBA PARA CAMBIAR
    // console.log("[MINTFORM][renderExpected] props VALIDATED", props)
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
                  <Read
                    amount={outAmount - feeAmount}
                    decimals={askDecimals}
                    approx
                  />
                </AssetReadOnly>
              }
            />
          </AssetFormItem>

          {/* (7-10) DATOS RESULTADO SWAP */}
          {renderExpected()}
          
          {/* (11) DETALLES FEE. COMPONENTE renderFee() DE Tx */}
          {/* {isConnected && fee.render()} */}

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


export default MintForm


// HELPERS
function findAssetBySymbol<AssetType extends AssetEVM>(symbol: string, assetsList: AssetType[], defaultAsset: AssetType): AssetType {
  return assetsList.find((item) => item.symbol === symbol) ?? defaultAsset
}
const findAssetDecimalsBySymbol = (symbol: string, assetsList: AssetEVM[], defaultAsset: AssetEVM) => {
  return findAssetBySymbol(symbol, assetsList, defaultAsset).decimals
}
