import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Stack,
  Button,
  ThemeProvider,
  Alert,
} from "@mui/material";
import { UserCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useKeycloakAuth } from "@/contexts/useKeycloakContext";
import { useAuth } from "@/contexts/useAuth";
import { subscribeUser } from "@/api/apiCalls";
import { mainTheme } from "@/theme/mainTheme";
import { Link } from "react-router-dom";

const NavBar: React.FC = () => {
  const { userProfile, isAuthenticated, token } = useKeycloakAuth();
  const { setRoles, handleLogoutRedirect } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string>("");

  const publicRoutes = ["/subscriptions", "/login"];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  const logout = () => {
    handleLogoutRedirect();
    setRoles(undefined);
  };

  const goToExtractEntities = () => {
    navigate("/extract-entities");
  };

  const goToExperiments = () => {
    navigate("/experiments");
  };

  if (!isAuthenticated && !isPublicRoute) {
    return null;
  }

  return (
    <ThemeProvider theme={mainTheme}>
      <AppBar position="fixed" elevation={2}>
        <Toolbar>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Link to="/">
              <Typography variant="h6">GLiNER Medical</Typography>
            </Link>
          </Box>
          <Stack direction="row" spacing={2}>
            {isAuthenticated ? (
              <>
                <Button
                  onClick={goToExtractEntities}
                  variant="contained"
                  color="primary"
                  size="small"
                >
                  Extract entities
                </Button>
                <Button
                  onClick={() => navigate("/subscriptions")}
                  variant="contained"
                  color="secondary"
                  size="small"
                >
                  Subscription plans
                </Button>
                {userProfile &&
                  Array.isArray(userProfile.roles) &&
                  userProfile.roles.includes("premium_user") && (
                    <Button
                      onClick={goToExperiments}
                      variant="contained"
                      color="primary"
                      size="small"
                    >
                      Create experiments
                    </Button>
                  )}
              </>
            ) : (
              <Button
                onClick={() => navigate("/login")}
                variant="contained"
                color="primary"
                size="small"
              >
                Login
              </Button>
            )}
          </Stack>

          {isAuthenticated && (
            <Stack direction="row" alignItems="center" spacing={2}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <UserCircle size={32} color="#9e9e9e" />
                <Typography variant="subtitle1">
                  {userProfile?.name || "User"}
                </Typography>
              </Stack>
              <Button
                onClick={logout}
                variant="contained"
                color="primary"
                size="small"
              >
                Logout
              </Button>
            </Stack>
          )}
        </Toolbar>
        {error && (
          <Box
            sx={{ position: "fixed", top: 80, left: 0, right: 0, zIndex: 1300 }}
          >
            <Alert severity="error" onClose={() => setError("")}>
              {error}
            </Alert>
          </Box>
        )}
      </AppBar>
    </ThemeProvider>
  );
};

export default NavBar;
