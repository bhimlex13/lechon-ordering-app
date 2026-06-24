import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Import Router
import { BrowserRouter } from 'react-router-dom';

// Import MUI and Font
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Import Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext'; // <-- ADD THIS

import './index.css';

// Define your custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#DA291C', // McDonald's Red
    },
    secondary: {
      main: '#333333', // Dark text
    },
    warning: {
      main: '#FFC72C', // McDonald's Yellow
    },
    background: {
      default: '#f7f7f7', // Light gray background
    },
  },
  typography: {
    fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif',
    h2: {
      fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif',
      fontWeight: 700,
      fontSize: '2.5rem',
      color: '#333',
      marginBottom: '30px',
      textAlign: 'center',
    },
    h1: { fontFamily: '"Poppins", sans-serif' },
    h3: { fontFamily: '"Poppins", sans-serif' },
    h4: { fontFamily: '"Poppins", sans-serif' },
    h5: { fontFamily: '"Poppins", sans-serif' },
    h6: { fontFamily: '"Poppins", sans-serif' },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider> {/* <-- ADD THIS WRAPPER */}
        <ThemeProvider theme={theme}>
          <BrowserRouter>
            <CssBaseline />
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </CartProvider> {/* <-- AND THIS CLOSING TAG */}
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();