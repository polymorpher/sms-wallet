import { sagaMiddleware } from './store'
import { walletSagas } from './modules/wallet'
import { balanceSagas } from './modules/balance'

function run () {
  sagaMiddleware.run(walletSagas)
  sagaMiddleware.run(balanceSagas)
}

export default { run }
