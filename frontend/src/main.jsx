import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import StoreContextProvider from './Context/StoreContext'   // export default
import { OrderProvider } from './Context/OrderContext'      // export named
import { RestaurantProvider } from "./Context/RestaurantContext";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <StoreContextProvider>
        <OrderProvider>
          <RestaurantProvider>
            <App />
          </RestaurantProvider>
        </OrderProvider>
      </StoreContextProvider>
    </BrowserRouter>
  </React.StrictMode>
)