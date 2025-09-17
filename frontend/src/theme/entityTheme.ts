import { createTheme } from "@mui/material";

export const entityTheme = createTheme({
  cssVariables: true,
  palette: {
    primary: {
      main: "hsl(263, 70%, 50.4%)",
    },
    background: {
      default: "hsl(0, 0%, 100%)",
      paper: "hsl(0, 0%, 98%)",
    },
    text: {
      primary: "hsl(240, 10%, 3.9%)",
      secondary: "hsl(240, 3.8%, 46.1%)",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "hsl(240, 4.8%, 95.9%)",
          border: "1px solid hsl(240, 5.9%, 90%)",
        },
      },
    },
  },
});