declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any
    apis?: any
  }
}

declare module 'history' {
  interface History {
    goBack: () => void
    goForward: () => void
  }
}

export {}
