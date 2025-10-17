import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom';
import { FoodProvider } from './Context/FoodContext';
import { OrderProvider } from './Context/OrderContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <FoodProvider>
        <OrderProvider>
          <App />
        </OrderProvider>
      </FoodProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
