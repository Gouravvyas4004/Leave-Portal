import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import store, { persistor } from './store'
import App from './App'
import './index.css'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import Toast from './components/Toast'

const theme = createTheme({
  palette: {
    primary: { main: '#0ea5e9' },
    secondary: { main: '#6366f1' }
  },
  typography: { fontFamily: 'Inter, Roboto, Arial' }
})

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ThemeProvider theme={theme}>
        <App />
        <Toast />
        <div id="portal"></div>
      </ThemeProvider>
    </PersistGate>
  </Provider>
)
