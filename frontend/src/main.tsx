import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* СЮДА ВСТАВЛЯЕМ ТВОЙ CLIENT ID */}
    <GoogleOAuthProvider clientId="188343556519-ph1jqvm5j9phg8cosee3gcbqr98l3l71.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)