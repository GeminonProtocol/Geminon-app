import { PropsWithChildren } from "react"
import { useInitialBankBalance } from "data/queries/bank"
import { BankBalanceProvider } from "data/queries/bank"



const InitBankBalance = ({ children }: PropsWithChildren<{}>) => {
  /* bankBalance tiene la forma:
    {
      _coins: {
        uluna: {
          denom: "uluna", 
          amount: {
            d: [757, 869711], 
            e: 4, 
            s: 1
          }
        },
        uusd: {...},
      }
    }
  */
  const { data: bankBalance } = useInitialBankBalance()

  console.log('Bank balance:')
  console.log(bankBalance)

  // If the balance doesn't exist, nothing is worth rendering.
  if (!bankBalance) {
    console.log('InitBankBalance: NOT OK')
    return null
    // return <BankBalanceProvider value={bankBalance}>{children}</BankBalanceProvider>
  }
  
  console.log('InitBankBalance: OK')
  return (
    <BankBalanceProvider value={bankBalance}>{children}</BankBalanceProvider>
  )
}


/* const InitBankBalance = ({ children }: PropsWithChildren<{}>) => {
  const { data: bankBalance } = useInitialBankBalance()
  // If the balance doesn't exist, nothing is worth rendering.
  if (!bankBalance) return null
  return (
    <BankBalanceProvider value={bankBalance}>{children}</BankBalanceProvider>
  )
} */

export default InitBankBalance
