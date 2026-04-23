import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import MyAppNav from './components/Navbar.jsx'
import ThemeProvider from './context/ThemeProvider.jsx'
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <MyAppNav />
  </BrowserRouter>,
);