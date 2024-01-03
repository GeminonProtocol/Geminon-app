import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { useAccount } from 'wagmi'

/* helpers */
import BigNumber from "bignumber.js"

/* components */
import { Form, FormError } from "components/form"
import { Checkbox } from "components/form"

/* tx modules */
import { toInput } from "../utils"
import validate from "../validate"
import Tx from "./Tx"

/* swap modules */
import AssetFormItem from "../swap/components/AssetFormItem"
import { AssetInput } from "../swap/components/AssetFormItem"
import NoSelectToken from "./components/NoSelectToken"
import ExpectedPrice, { ExpectedPriceProps } from "./components/ExpectedPrice"

import { useRedeem } from "./RedeemContext"
import { useGEXBalance, useRedeemInfo } from "./useRedeem"
import { defaultDecimals } from "config/assets.js"



interface TxValues {
  input?: number
  offerSymbol?: string
}


const RedeemForm = () => {
  const { t } = useTranslation()
  const { isConnected } = useAccount()
  const { networkID, gexToken, nativeAsset } = useRedeem()
  const [showAll, setShowAll] = useState(false)
  
  const nativeSymbol = nativeAsset.symbol
  
  
  // LISTA DE TOKENS DEL FORMULARIO
  const getCoinsOptions = () => {
    return [{ 
      title: t("Coins"), 
      children: [{ ...gexToken, value: "GEX" }]
   }]
  }


  // FORMULARIO
  const form = useForm<TxValues>({
    mode: "onChange", // what triggers validation of form inputs. onChange is expensive. Alt: onSubmit
    defaultValues: { offerSymbol: "GEX" },
  })

  const { register, trigger, watch, setValue, resetField, handleSubmit, reset, formState } = form
  const { errors } = formState
  const { offerSymbol, input } = watch() // Esta desestructuración viene definida por el interfaz TxValues

  if (Number.isNaN(input)) resetField("input")  // A veces aparece un NaN, causa desconocida.


  let { gexBalance, refetch } = useGEXBalance()
  console.log("[RedeemForm] GEX balance:", gexBalance)
  const updateBalances = () => {
    if (!isConnected) return
    (async () => {
      const { data } = await refetch()
      gexBalance = data?.value.toString()
    })()
  }
  
  const offerDecimals = defaultDecimals
  const inAmount = new BigNumber(input ?? 0).shiftedBy(offerDecimals).toFixed(0)
  
  

  // FETCH SWAP ESTIMATES
    const { share, collatAmount, collatPrice, usdValue, isFetching } = useRedeemInfo()
  console.log("[RedeemForm] share, amount, price, usdValue:", share, collatAmount, collatPrice, usdValue)
  
  
  const tx = {
    symbol: "GEX",
    nativeSymbol,
    decimals: 18,
    amount: inAmount,
    balance: gexBalance,
    resetForm: () => reset(),
    updateBalances,
    networkID,
    isConnected
  }

  // No está muy claro que tenga algún efecto: en el componente Tx se define de nuevo
  // const disabled = enableHooks ? false: "Input data" //isFetching ? t("Simulating...") : false
  const disabled = collatAmount === "0" ? "Vault is empty / not initialized" : false


  // RENDER FUNCTIONS
  // type guard
  const validateExpectedPriceProps = (
    params: Partial<ExpectedPriceProps>
    ): params is ExpectedPriceProps => {
      const { nativeSymbol, share, collatAmount, collatPrice, usdValue } = params
      return !!(nativeSymbol && share && collatAmount && collatPrice && usdValue)
    }

  // render: expected price
  const renderExpected = () => {
    if (!input) return null

    const props = { nativeSymbol, share, collatAmount, collatPrice, usdValue, isFetching }

    if (!(isConnected && validateExpectedPriceProps(props))){
      return null
    } 
    // (7-10) DATOS DEBAJO DEL PAR, APARECEN SOLO
    // SI SE INTRODUCE UNA CANTIDAD ARRIBA PARA CAMBIAR
    return <ExpectedPrice {...props} isLoading={isFetching} />
  }

  
  return (
    <Tx {...tx} disabled={disabled}>
      {({ max, fee, submit }) => (
        <Form onSubmit={handleSubmit(submit.fn)}>
          
          {/* (3) PRIMER FORMULARIO TOKEN */}
          <AssetFormItem
            label={t("Redeem")}
            extra={max.render(async (value) => {// (2) BALANCE TOKEN 1 (MÁXIMO GASTABLE)
              // Do not use automatic max here
              // Confusion arises as the amount changes and simulates again
              setValue("input", toInput(value, offerDecimals))
              await trigger("input")
            })}
            error={errors.input?.message}
          >
            <NoSelectToken
              value={offerSymbol}
              onChange={() => {}}
              options={getCoinsOptions()}
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


export default RedeemForm
