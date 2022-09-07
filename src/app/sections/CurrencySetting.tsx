// import { readDenom } from "@terra.kitchen/utils"
// import { useActiveDenoms } from "data/queries/oracle"
// import { useCurrencyState } from "data/settings/Currency"
import { RadioGroup } from "components/form"


// label es lo que se muestra en la lista
// denom === currency para que aparezca el check
const CurrencySetting = () => {
  const activeDenoms = ['USD']
  const currency = 'USD'

  return (
    <RadioGroup
      options={activeDenoms.map((denom) => {
        return { value: denom, label: 'US Dollar' }
      })}
      value={currency}
      onChange={() => {}}
    />
  )
}

export default CurrencySetting



// const CurrencySetting = () => {
//   const { data: activeDenoms = [] } = useActiveDenoms()
//   const [currency, setCurrency] = useCurrencyState()

//   return (
//     <RadioGroup
//       options={activeDenoms.map((denom) => {
//         return { value: denom, label: readDenom(denom) }
//       })}
//       value={currency}
//       onChange={setCurrency}
//     />
//   )
// }