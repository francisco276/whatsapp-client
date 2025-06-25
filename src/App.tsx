import { Route, Switch } from 'wouter'
import HomePage from './page/home-page'
import ConfigurationPage from './page/configuration-page'
import SingleChatPage from './page/single-chat-page'

function App() {
  return (
    <>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/config" component={ConfigurationPage} />
        <Route path="/single" component={SingleChatPage} />
      </Switch>
    </>
  )
}

export default App
