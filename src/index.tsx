import { StrictMode } from "react"
import { render } from "react-dom"
import { BrowserRouter } from "react-router-dom"
import { ReactQueryDevtools } from "react-query/devtools"
import { RecoilRoot } from "recoil"
import "tippy.js/dist/tippy.css"

import "config/lang"
import { debug } from "utils/env"

import "index.scss"
import ScrollToTop from "app/ScrollToTop"
import InitWeb3 from "app/InitWeb3"
import InitTheme from "app/InitTheme"
// import ElectronVersion from "app/ElectronVersion"
import App from "app/App"



render(
  <StrictMode>
    <RecoilRoot>
      <BrowserRouter>
        <ScrollToTop />
          <InitWeb3>
            <InitTheme />
            {/* <ElectronVersion /> */}
            <App />
          </InitWeb3>
        {debug.query && <ReactQueryDevtools position="bottom-right" />}
      </BrowserRouter>
    </RecoilRoot>
  </StrictMode>,
  document.getElementById("root")
)
