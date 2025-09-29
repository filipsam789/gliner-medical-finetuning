import {
  createContext,
  PropsWithChildren,
  useContext,
  useState,
  useMemo,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";
import { useLocation } from "react-router-dom";

import { AccountType } from "@/utils/types";
import { getUser } from "@/api/apiCalls";
import { EMPTY_STRING } from "@/utils/constants";
import { Box, CircularProgress } from "@mui/material";
import { useKeycloakAuth } from "@/contexts/useKeycloakContext.tsx";

type AuthProviderData = PropsWithChildren<{
  account: AccountType;
  setAccount: Dispatch<SetStateAction<AccountType>>;
  roles: string[] | undefined;
  setRoles: Dispatch<SetStateAction<string[] | undefined>>;
  loginError: string | undefined;
  setLogInError: Dispatch<SetStateAction<string | undefined>>;
  handleLogoutRedirect: () => void;
}>;

export const AuthContext = createContext<AuthProviderData>({
  account: {},
  setAccount: () => {},
  roles: undefined,
  setRoles: () => {},
  loginError: undefined,
  setLogInError: () => {},
  handleLogoutRedirect: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [account, setAccount] = useState<AccountType>({});
  const [roles, setRoles] = useState<string[]>();
  const [loginError, setLogInError] = useState<string>();
  const { isAuthenticated, authInProgress, login, logout, userProfile, token } =
    useKeycloakAuth();
  const location = useLocation();

  const publicRoutes = ["/subscriptions"];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  useEffect(() => {
    const fetchRoles = async () => {
      if (isAuthenticated && userProfile && token) {
        try {
          const response = await getUser(token);
          const roles = response.roles || [];
          setRoles(roles);

          setAccount({
            Name: userProfile?.name,
            Email: userProfile?.email,
          });
          setLogInError(EMPTY_STRING);
        } catch (error) {
          setRoles([]);
          console.error("Failed to fetch roles:", error);
          setLogInError(error instanceof Error ? error.message : String(error));
        }
      }
    };

    fetchRoles();
  }, [isAuthenticated, userProfile, token]);

  const handleLoginRedirect = async () => {
    try {
      login();
    } catch (error) {
      setLogInError("Error: Failed to redirect to login.");
    }
  };

  const handleLogoutRedirect = () => {
    logout();
    localStorage.clear();
  };

  useEffect(() => {
    if (!isAuthenticated && !authInProgress && !isPublicRoute) {
      handleLoginRedirect();
    }
  }, [isAuthenticated, authInProgress, isPublicRoute]);

  const providerValues = useMemo(
    () => ({
      account,
      setAccount,
      roles,
      setRoles,
      loginError,
      setLogInError,
      handleLogoutRedirect,
    }),
    [account, setAccount, roles, setRoles]
  );

  return (
    <AuthContext.Provider value={providerValues}>
      {(((loginError !== undefined && roles !== undefined) || isPublicRoute) &&
        children) || (
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
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
