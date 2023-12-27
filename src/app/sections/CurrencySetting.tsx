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

