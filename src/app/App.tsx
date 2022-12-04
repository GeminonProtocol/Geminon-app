import { getErrorMessage } from "utils/error"
import Layout, { Page } from "components/layout"
import { Banner, Content, Header, Actions, Sidebar } from "components/layout"
import { ErrorBoundary, Wrong } from "components/feedback"

/* routes */
import { useNav } from "./routes"

/* banner */
import BannerText from "./sections/BannerText"

/* sidebar */
import Nav from "./sections/Nav"
import Aside from "./sections/Aside"

/* header */
import NetworkName from "./sections/NetworkName"
import Refresh from "./sections/Refresh"
import Preferences from "./sections/Preferences"
import SelectTheme from "./sections/SelectTheme"
import ConnectWallet from "./sections/ConnectWallet"


const App = () => {
  const { element: routes } = useNav()

  return (
    <Layout>
      <Banner>
        <BannerText />
      </Banner>

      <Sidebar>
        <Nav />
        <Aside />
      </Sidebar>

      <Header>
        <NetworkName />

        <Actions>
          <section>
            <Refresh />
            <Preferences />
            <SelectTheme />
          </section>
          <ConnectWallet />
        </Actions>
      </Header>

      <Content>
        <ErrorBoundary fallback={fallback}>
          {routes}
        </ErrorBoundary>
      </Content>
    </Layout>
  )
}

export default App

/* error */
export const fallback = (error: Error) => (
  <Page>
    <Wrong>{getErrorMessage(error)}</Wrong>
  </Page>
)
