interface Window {
  ethereum?: {
    isMetaMask?: true
    isTrust?: true
    providers?: any[]
    request?: (...args: any[]) => Promise<any>
    selectedAddress?: string
    networkVersion?: string
    chainId?: string
  }
}
