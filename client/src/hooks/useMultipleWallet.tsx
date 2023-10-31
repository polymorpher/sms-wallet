import React, { useCallback, useContext, useState } from "react"
import { useSelector } from "react-redux"
import { RootState } from "../state/rootReducer"
import { WalletState, Wallet } from "../state/modules/wallet/reducers"
import apis from '../api'

type WalletType = {
  wallet?: Wallet
  switchWallet: (phone: string) => Wallet | undefined
  containWallet: (phone: string) => boolean
}

const WalletContext = React.createContext<WalletType>({
  switchWallet: () => undefined,
  containWallet: () => true
})

type MultipleWalletProviderProps = {
  children: React.ReactNode
}

export const MultipleWalletProvider = ({ children }: MultipleWalletProviderProps) => {
  const wallets = useSelector<RootState, WalletState>(state => state.wallet || {})

  const [address, setAddress] = useState<string>()

  const containWallet = useCallback((phone: string) =>
    Object.keys(wallets).some(e => wallets[e].phone === phone && apis.web3.isValidAddress(e)),
    [wallets]
  )

  const switchWallet = useCallback((phone: string) => {
    const address = Object.keys(wallets).find(e => wallets[e].phone === phone && apis.web3.isValidAddress(e))

    if (!address) {
      return undefined
    }

    setAddress(address)

    return wallets[address]
  }, [wallets])

  return (
    <WalletContext.Provider
      value={{
        wallet: address ? wallets[address] : undefined,
        switchWallet,
        containWallet
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

const useWalletAddress = () => useContext(WalletContext)

export default useWalletAddress
