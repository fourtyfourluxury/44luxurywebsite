import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { applyCachedThemeBeforePaint } from './services/themeService.js'

// Apply cached active seasonal theme before first paint to prevent a color flash
applyCachedThemeBeforePaint()

// Temporarily disable React Strict Mode to prevent double auth initializations
// React Strict Mode causes useEffect to run twice in development, which creates
// race conditions with Supabase auth initialization
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
