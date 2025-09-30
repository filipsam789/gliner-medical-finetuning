import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import NavBar from "./components/NavBar";
import ScrollToTop from "./components/ScrollToTop";
import { ThemeProvider } from "@emotion/react";
import { customTheme } from "./theme/theme";
import { CssBaseline, Box } from "@mui/material";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import ExperimentsPage from "./pages/ExperimentsPage";
import ExperimentDetailsPage from "./pages/ExperimentDetailsPage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import DocumentDetailsPage from "./pages/DocumentDetailsPage";
import { NERHomepage } from "./components/NERHomepage";
import { AuthProvider } from "./contexts/useAuth";

const App = () => (
  <ThemeProvider theme={customTheme}>
    <CssBaseline />
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <NavBar />
        <Box sx={{ paddingTop: "100px" }}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/extract-entities"
              element={
                <ProtectedRoute>
                  <NERHomepage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/experiments"
              element={
                <ProtectedRoute>
                  <ExperimentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/experiments/:id"
              element={
                <ProtectedRoute>
                  <ExperimentDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/documents/:id"
              element={
                <ProtectedRoute>
                  <DocumentDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Box>
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
