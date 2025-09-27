import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RoleTestPage from "./pages/RoleTestPage";
import NavBar from "./components/NavBar";
import { ThemeProvider } from "@emotion/react";
import { customTheme } from "./theme/theme";
import { CssBaseline, Box } from "@mui/material";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import ExperimentsPage from "./pages/ExperimentsPage";
import ExperimentDetailsPage from "./pages/ExperimentDetailsPage";
import DocumentDetailsPage from "./pages/DocumentDetailsPage";

const App = () => (
  <ThemeProvider theme={customTheme}>
    <CssBaseline />
    <BrowserRouter>
      <NavBar />
      <Box sx={{ paddingTop: '100px' }}>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/role-test" element={<ProtectedRoute><RoleTestPage /></ProtectedRoute>} />
          <Route path="/experiments" element={<ProtectedRoute><ExperimentsPage /></ProtectedRoute>} />
          <Route path="/experiments/:id" element={<ProtectedRoute><ExperimentDetailsPage /></ProtectedRoute>} />
          <Route path="/documents/:id" element={<ProtectedRoute><DocumentDetailsPage /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
