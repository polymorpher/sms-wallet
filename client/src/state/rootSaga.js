import { sagaMiddleware } from './store'
import { walletSagas } from './modules/wallet'
import { balanceSagas } from './modules/balance'
import { globalSagas } from './modules/global'

function run () {
  sagaMiddleware.run(walletSagas)
  sagaMiddleware.run(balanceSagas)
  sagaMiddleware.run(globalSagas)
}

export default { run }
