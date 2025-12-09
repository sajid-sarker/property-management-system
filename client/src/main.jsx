import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { WishlistProvider } from './contexts/WishlistContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <WishlistProvider>
                <App />
            </WishlistProvider>
        </AuthProvider>
    </React.StrictMode>,
)
