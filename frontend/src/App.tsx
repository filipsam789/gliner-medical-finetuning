import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "@emotion/react";
import { customTheme } from "./theme/theme";
import { CssBaseline } from "@mui/material";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => (
  <ThemeProvider theme={customTheme}>
    <CssBaseline />
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
                <Index />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
