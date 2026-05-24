import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Temporarily disable React Strict Mode to prevent double auth initializations
// React Strict Mode causes useEffect to run twice in development, which creates
// race conditions with Supabase auth initialization
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
