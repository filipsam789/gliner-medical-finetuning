import { useAuth } from "@/contexts/useAuth";
import { useKeycloakAuth } from "@/contexts/useKeycloakContext";
import { Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { roles } = useAuth();
  const { isAuthenticated, authInProgress } = useKeycloakAuth();

  if (authInProgress) {
    return (
      <Box
        sx={{
          margin: "auto",
          height: "100vh",
          marginTop: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isAuthenticated && (!roles || roles.length == 0)) {
    return (
      <Box
        sx={{
          margin: "auto",
          height: "100vh",
          marginTop: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return children;
};

export default ProtectedRoute;
