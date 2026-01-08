import React from 'react'
import { useSelector } from 'react-redux'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Layout from './components/Layout'

export default function App(){
  const user = useSelector(state => state.user.user)
  return user ? (
    <Layout>
      <Dashboard />
    </Layout>
  ) : <Login />
}
