import { Route, Switch } from 'wouter'
import HomePage from './page/home-page'

function App() {
  return (
    <>
      <Switch>
        <Route path="/" component={HomePage} />
      </Switch>
    </>
  )
}

export default App
