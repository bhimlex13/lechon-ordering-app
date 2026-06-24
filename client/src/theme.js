import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Base theme configuration
let theme = createTheme({
  palette: {
    primary: {
      main: '#B45309',
      dark: '#92400E',
      light: '#FEF3C7',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#1F2937',
      dark: '#111827',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#DC2626',
    },
    background: {
      default: '#FAFAF9',
      paper: '#FFFFFF',
      footer: '#111827',
    },
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: {
      textTransform: 'none', // Standard app-style buttons (not all caps)
      fontWeight: 600,
    },
  },
  components: {
    // 1. Make buttons easier to tap on mobile
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          paddingTop: 8,
          paddingBottom: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
          },
          '@media (max-width:600px)': {
            minHeight: '48px', // Minimum touch target size for mobile
          },
        },
        containedPrimary: {
          color: '#ffffff',
        },
      },
    },
    // 2. Modernize Card Styling
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16, // Softer corners
          boxShadow: '0px 4px 12px rgba(0,0,0,0.05)', // Subtle shadow
          border: '1px solid rgba(0,0,0,0.05)',
        },
      },
    },
    // 3. Improve TextField inputs for mobile
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

// Automatically generate responsive font sizes (h1 becomes smaller on mobile, etc.)
theme = responsiveFontSizes(theme);

export { theme };