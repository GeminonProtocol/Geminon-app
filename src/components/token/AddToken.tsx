import { useTranslation } from "react-i18next"
import { useAccount } from 'wagmi'
import { Button } from "components/general"


const AddToken = (asset: TokenEVM) => {
    const { t } = useTranslation()
    const { connector, isConnected } = useAccount()
    
    console.log("[AddToken] connector", connector?.name)
    if (!isConnected || !connector) return null

    function addToken() {
        (async () => {
            if (typeof connector?.watchAsset === 'function') {
                await connector?.watchAsset({
                    address: asset.address, // The address that the token is at.
                    symbol: asset.symbol, // A ticker symbol or shorthand, up to 5 chars.
                    image: asset.icon, // A string url of the token logo
                    }
                )
            }
        })()
    }

    

    return (
        <Button onClick={addToken} size="small" outline>
            {t("Add token to wallet")}
        </Button>
    )
}

export default AddToken



