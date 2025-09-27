import { createTheme } from "@mui/material";

export const mainTheme = createTheme({
  cssVariables: true,
  palette: {
    primary: {
      main: "#3e84bf",
      contrastText: "hsl(0, 0%, 98%)",
    },
    secondary: {
      main: "hsl(240, 4.8%, 95.9%)",
      contrastText: "hsl(240, 5.9%, 10%)",
    },
    background: {
      default: "hsl(0, 0%, 100%)",
      paper: "hsl(0, 0%, 98%)",
    },
    text: {
      primary: "hsl(240, 10%, 3.9%)",
      secondary: "hsl(240, 3.8%, 46.1%)",
    },
    grey: {
      100: "hsl(240, 4.8%, 95.9%)",
      200: "hsl(240, 5.9%, 90%)",
      300: "hsl(240, 3.8%, 46.1%)",
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: "2.5rem",
      lineHeight: 1.2,
    },
    h6: {
      fontWeight: 600,
      fontSize: "1.375rem",
    },
    body1: {
      fontSize: "1.125rem",
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "1rem",
      color: "hsl(240, 3.8%, 46.1%)",
    },
    subtitle1: {
      fontSize: "1rem",
      fontWeight: 700,
      color: "#555",
      fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 10px 30px -10px hsl(0 0% 0% / 0.1)",
          border: "1px solid hsl(240, 5.9%, 90%)",
          backgroundColor: "hsl(0, 0%, 98%)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: "hsl(0, 0%, 100%)",
            '& fieldset': {
              borderColor: "hsl(240, 5.9%, 90%)",
            },
            '&:hover fieldset': {
              borderColor: "#3e84bf",
            },
            '&.Mui-focused fieldset': {
              borderColor: "#3e84bf",
              boxShadow: "0 0 0 2px #3e84bf / 0.15",
            },
            '& input::placeholder, & textarea::placeholder': {
              fontSize: "1rem",
              opacity: 0.7,
              color: "hsl(240, 3.8%, 46.1%)",
            },
            '& input, & textarea': {
              fontSize: "1rem",
            },
            '& input:-webkit-autofill, & textarea:-webkit-autofill': {
              WebkitBoxShadow: '0 0 0 1000px hsl(0 0% 100%) inset',
              WebkitTextFillColor: 'hsl(240, 10%, 3.9%)',
              caretColor: 'hsl(240, 10%, 3.9%)',
              transition: 'background-color 9999s ease-out 0s',
            },
            '& input:-webkit-autofill:focus, & textarea:-webkit-autofill:focus': {
              WebkitBoxShadow: '0 0 0 1000px hsl(0 0% 100%) inset',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          borderRadius: "6px",
          padding: "10px 32px",
          fontSize: "0.875rem",
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #3e84bf, #67b1ed)",
          boxShadow: "none",
          '&:hover': {
            background: "linear-gradient(135deg, #197aca, #85c0f1)",
            boxShadow: "0 0 40px #3e84bf / 0.15 ",
            transform: "scale(1.02)",
          },
          '&:disabled': {
            background: "hsl(240, 4.8%, 95.9%)",
            color: "hsl(240, 3.8%, 46.1%)",
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: "hsl(0, 0%, 100%)",
            '& fieldset': {
              borderColor: "hsl(240, 5.9%, 90%)",
            },
            '&:hover fieldset': {
              borderColor: "#3e84bf",
            },
            '&.Mui-focused fieldset': {
              borderColor: "#3e84bf",
            },
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: "#3e84bf",
          '&.Mui-checked': {
            color: "#3e84bf",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          fontSize: "1rem",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: "1rem",
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: "#3e84bf",
          maxWidth: "90%",
          '& .MuiSlider-markLabel': {
            fontSize: '0.875rem',
            color: 'hsl(240, 3.8%, 46.1%)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#fafafa',
          color: '#333',
          borderBottom: '1px solid #e0e0e0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          height: '100px',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '100px !important',
          height: '100px',
          justifyContent: 'space-between',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: '#e0e0e0', // Light grey instead of dark grey
          width: 32,
          height: 32,
        },
      },
    },
  },
});