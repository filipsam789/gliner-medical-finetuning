import { createTheme, Shadows } from "@mui/material/styles";

const baseTheme = createTheme();

declare module "@mui/material/styles" {
  interface Palette {
    surface: {
      elevated: string;
      subtle: string;
    };
  }

  interface PaletteOptions {
    surface?: {
      elevated: string;
      subtle: string;
    };
    entity?: {
      person: string;
      location: string;
      organization: string;
      misc: string;
      date: string;
    };
  }
}

export const customTheme = createTheme({
  cssVariables: true,
  palette: {
    primary: {
      main: "rgb(23, 131, 239)",
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
    error: {
      main: "hsl(0, 84.2%, 60.2%)",
      contrastText: "hsl(0, 0%, 98%)",
    },
    surface: {
      elevated: "hsl(0, 0%, 98%)",
      subtle: "hsl(240, 4.8%, 95.9%)",
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: baseTheme.shadows.map((shadow, index) => {
    if (index === 6) return "0 10px 30px -10px hsl(0 0% 0% / 0.1)";
    if (index === 7) return "0 0 40px hsl(263 70% 50.4% / 0.15)";
    return shadow;
  }) as Shadows,
  typography: {
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "*": {
          borderColor: "hsl(240, 5.9%, 90%)",
        },
        body: {
          backgroundColor: "hsl(0, 0%, 100%)",
          color: "hsl(240, 10%, 3.9%)",
        },
        ":root": {
          "--gradient-primary":
            "linear-gradient(135deg, rgb(23, 131, 239), rgba(66, 165, 245, 0.9))",
          "--gradient-subtle":
            "linear-gradient(180deg, hsl(0, 0%, 98%), hsl(240, 4.8%, 95.9%))",
          "--shadow-glow": "0 0 40px rgba(23, 131, 239, 0.15)",
          "--shadow-elegant": "0 10px 30px -10px hsl(0 0% 0% / 0.1)",
          "--transition-smooth": "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        },
      },
    },
  },
});
