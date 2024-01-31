import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { blue, cyan } from '@mui/material/colors';

import { AuthProvider } from './contexts/AuthContext';
import Routes from './routes';

const theme = createTheme({
  palette: {
    primary: {
      main: blue[700],
      dark: blue[800],
      light: blue[500],
      contrastText: '#fff',
    },
    secondary: {
      main: cyan[700],
      dark: cyan[800],
      light: cyan[500],
      contrastText: '#fff',
    },
    background: {
      paper: '#fff',
      default: '#bababa',
    },
  },
});

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <CssBaseline />
          <Routes />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
