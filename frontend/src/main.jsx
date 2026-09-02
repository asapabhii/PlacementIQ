import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1726',
              color: '#e2e8f0',
              border: '1px solid rgba(99, 102, 241, 0.2)',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#1a1726' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#1a1726' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
