import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { BankingProvider } from './context/BankingContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <BankingProvider>
        <App />
      </BankingProvider>
    </BrowserRouter>
  </React.StrictMode>,
)