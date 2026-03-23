import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { RewardsProvider } from './context/RewardsContext'
import './global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider value={defaultSystem}>
      <HashRouter>
        <RewardsProvider>
          <App />
        </RewardsProvider>
      </HashRouter>
    </ChakraProvider>
  </React.StrictMode>,
)
