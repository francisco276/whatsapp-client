import { Route, Switch } from 'wouter'
import HomePage from './page/home-page'
import ConfigurationPage from './page/configuration-page'

function App() {
  return (
    <>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/config" component={ConfigurationPage} />
      </Switch>
    </>
  )
}

export default App
