import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Layout from './components/Layout'

export default function App(){
  const user = useSelector(state => state.user.user)
  const dispatch = useDispatch()

  useEffect(() => {
    // Trigger initialization when app loads (especially on refresh)
    if (user) {
      dispatch({ type: 'APP_INIT' })
    }
  }, [user, dispatch])

  return user ? (
    <Layout>
      <Dashboard />
    </Layout>
  ) : <Login />
}
