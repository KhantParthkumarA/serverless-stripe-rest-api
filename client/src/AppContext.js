import React, { useReducer, createContext } from 'react'

const initialState = {
  currentUser: {},
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'CURRENT_USER':
      return { ...state, currentUser: action.data }
    default:
      return {}
  }
}

const AppContext = createContext({
  state: initialState,
  dispatch: () => {},
})

function AppContextProvider(props) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const value = { state, dispatch }
  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  )
}

const AppContextConsumer = AppContext.Consumer

export { AppContext, AppContextProvider, AppContextConsumer }
