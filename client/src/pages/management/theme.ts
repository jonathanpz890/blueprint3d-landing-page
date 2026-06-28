import { createTheme } from '@mui/material/styles';

export const managementTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#f97316', // Orange 500
      light: '#fdba74',
      dark: '#ea580c',
    },
    secondary: {
      main: '#f59e0b', // Amber 500
    },
    background: {
      default: '#0f172a', // Slate 900
      paper: '#1e293b',   // Slate 800
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    },
    divider: 'rgba(255,255,255,0.05)',
  },
  typography: {
    fontFamily: '"Assistant", "Rubik", "Space Grotesk", sans-serif',
    h1: { fontFamily: '"Space Grotesk", sans-serif' },
    h2: { fontFamily: '"Space Grotesk", sans-serif' },
    h3: { fontFamily: '"Space Grotesk", sans-serif' },
    h4: { fontFamily: '"Space Grotesk", sans-serif' },
    h5: { fontFamily: '"Space Grotesk", sans-serif' },
    h6: { fontFamily: '"Space Grotesk", sans-serif' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(30, 41, 59, 0.5)',
          backdropFilter: 'blur(10px)',
          backgroundImage: 'none',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.05)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0f172a',
          backgroundImage: 'none',
          borderRadius: 24,
          border: '1px solid rgba(255,255,255,0.1)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        },
        head: {
          fontWeight: 700,
          color: '#94a3b8',
          textTransform: 'uppercase',
          fontSize: '0.75rem',
        },
      },
    },
  },
});
