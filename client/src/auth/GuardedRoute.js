import React, { useContext, useEffect, useState } from 'react'
import { Route } from 'react-router-dom'

import * as Auth from '.'
import Callback from './Callback'
import { AppContext } from 'AppContext'

function GuardedRoute(props) {
  const { component: Component, path } = props
  const [loading, setLoading] = useState(true)

  const isAuthenticated = Auth.isAuthenticated()
  const { dispatch } = useContext(AppContext)

  useEffect(() => {
    if (isAuthenticated !== undefined && isAuthenticated) {
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [dispatch, isAuthenticated])

  return loading ? (
    <Route component={Callback} />
  ) : (
    <Route
      path={path}
      render={(props) => {
        if (isAuthenticated !== undefined && !isAuthenticated)
          // return <Redirect to='/' />
          return <Component {...props} />
      }}
    />
  )
}

export default GuardedRoute
