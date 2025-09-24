import { useAuth } from "@/contexts/useAuth";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { roles } = useAuth();

  if (!roles || roles.length == 0) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
 