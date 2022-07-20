import { StrictMode } from "react"
import { render } from "react-dom"
import { BrowserRouter } from "react-router-dom"
import { ReactQueryDevtools } from "react-query/devtools"
import { RecoilRoot } from "recoil"
// import { getChainOptions } from "@terra-money/wallet-controller"
// import { WalletProvider } from "@terra-money/wallet-provider"
import "tippy.js/dist/tippy.css"

import "config/lang"
// import { BRIDGE } from "config/constants"
import { debug } from "utils/env"

import "index.scss"
import ScrollToTop from "app/ScrollToTop"
import InitAdapter from "app/InitAdapter"
// import InitNetworks from "app/InitNetworks"
// import InitWallet from "app/InitWallet"
import InitTheme from "app/InitTheme"
import ElectronVersion from "app/ElectronVersion"
import App from "app/App"

// const connectorOpts = { bridge: BRIDGE }

// getChainOptions().then((chainOptions) =>
render(
  <StrictMode>
    <RecoilRoot>
      <BrowserRouter>
        <ScrollToTop />
          <InitAdapter>
            <InitTheme />
            <ElectronVersion />
            <App />
          </InitAdapter>
        {debug.query && <ReactQueryDevtools position="bottom-right" />}
      </BrowserRouter>
    </RecoilRoot>
  </StrictMode>,
  document.getElementById("root")
)
