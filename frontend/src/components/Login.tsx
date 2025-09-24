import { useAuth } from "@/contexts/useAuth";
import { Button, Stack, Typography, Box } from "@mui/material";
import { useEffect } from "react";
import { CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { backendNotAvailableMessage } from "@/utils/constants";
import { useKeycloakAuth } from "@/contexts/useKeycloakContext.tsx";

const Login = () => {
  const { isAuthenticated, authInProgress } = useKeycloakAuth();
  const { roles, setRoles, loginError, handleLogoutRedirect } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (isAuthenticated && roles && roles.length > 0) {
      navigate("/");
    }
  }, [isAuthenticated, roles, navigate]);

  const logout = () => {
    handleLogoutRedirect();
    setRoles(undefined);
  };

  return (
    <Box 
      sx={{ 
        margin: "auto", 
        height: "100vh", 
        marginTop: 8, 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center" 
      }}
    >
      {loginError === backendNotAvailableMessage ? (
        <Stack spacing={3} alignItems="center" sx={{ my: 5 }}>
          <Box 
            sx={{ 
              width: 128, 
              height: 128, 
              borderRadius: "50%", 
              backgroundColor: "error.main", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center" 
            }}
          >
            <Typography variant="h1" sx={{ color: "white", fontSize: "4rem" }}>
              ⚠
            </Typography>
          </Box>
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ fontSize: 18, mt: 2 }}
          >
            {backendNotAvailableMessage.split("\n").map((line, index) => (
              <Typography key={index}>{line}</Typography>
            ))}
          </Stack>
        </Stack>
      ) : (
        <Typography>Unauthorized.</Typography>
      )}
      {!isAuthenticated && authInProgress ? null : !isAuthenticated ? (
        <CircularProgress />
      ) : !roles?.length && isAuthenticated ? (
        <>
          <Button onClick={logout} variant="contained">Log out</Button>
        </>
      ) : null}
    </Box>
  );
};

export default Login;