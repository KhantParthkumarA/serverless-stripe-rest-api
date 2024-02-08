import React, { Fragment, useContext } from 'react'
import { AppContext } from 'AppContext'
import { authLogout } from '.'

export default function () {
  const { dispatch } = useContext(AppContext)
  dispatch({ type: 'CURRENT_USER', data: {} })
  authLogout()
  return <Fragment />
}
