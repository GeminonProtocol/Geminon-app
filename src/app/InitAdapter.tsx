import { PropsWithChildren } from "react"
import InitNetworks from "app/InitNetworks"
import InitWallet from "app/InitWallet"


const InitAdapter = ({ children }: PropsWithChildren<{}>) => {

    return (
        <InitNetworks>
            <InitWallet>
                {children} 
            </InitWallet>
        </InitNetworks>
    )
}


export default InitAdapter