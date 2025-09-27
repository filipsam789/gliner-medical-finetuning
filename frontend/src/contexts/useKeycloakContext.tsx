import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  createContext,
  ReactNode,
  useContext,
} from "react";
import { LOCAL_STORAGE_KEYS } from "@/utils/constants";
import keycloak from "@/lib/keycloak";
import { getFromLocalStorage, setToLocalStorage } from "@/shared/shared";
interface UserProfile {
  name?: string;
  email?: string;
  roles?: string[];
}
interface KeycloakContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: () => void;
  logout: () => void;
  userProfile: UserProfile | null;
  authInProgress: boolean;
}
const KeycloakContext = createContext<KeycloakContextType | null>(null);
interface KeycloakProviderProps {
  children: ReactNode;
}
export const KeycloakProvider: React.FC<KeycloakProviderProps> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authInProgress, setAuthInProgress] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    const cachedProfile = getFromLocalStorage(
      LOCAL_STORAGE_KEYS.USER_PROFILE
    ) as UserProfile;
    const cachedToken = localStorage.getItem(LOCAL_STORAGE_KEYS.ID_TOKEN);
    if (cachedProfile && cachedToken) {
      setUserProfile(cachedProfile);
      setToken(cachedToken);
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    keycloak
      .init({
        onLoad: "login-required",
        scope: "openid profile email",
        checkLoginIframe: false,
      })
      .then((success: boolean) => {
        if (success) {
          setIsAuthenticated(true);
          setToken(keycloak.token ?? null);
          localStorage.setItem(
            LOCAL_STORAGE_KEYS.ID_TOKEN,
            keycloak.token ?? null,
          );
          if (!userProfile) {
            if (keycloak.tokenParsed?.email) {
              const profile: UserProfile = {
                name:
                  (keycloak.tokenParsed.given_name || "") +
                  (keycloak.tokenParsed.family_name
                    ? ` ${keycloak.tokenParsed.family_name}`
                    : ""),
                email: keycloak.tokenParsed.email || "",
                roles:
                  keycloak.tokenParsed?.realm_access?.roles || [],
              };
              setUserProfile(profile);
              setToLocalStorage(LOCAL_STORAGE_KEYS.USER_PROFILE, profile);
            } else {
              console.warn("Cannot find user profile");
            }
          }
          setInterval(() => {
            keycloak
              .updateToken(30)
              .then((refreshed: boolean) => {
                if (refreshed) {
                  setToken(keycloak.token ?? null);
                }
              })
              .catch(error => console.error("Failed to refresh token", error));
          }, 20000);
        }
      })
      .catch((err: Error) => {
        console.error("Keycloak init failed", err);
      })
      .finally(() => setAuthInProgress(false));
  }, []);


  const value = useMemo<KeycloakContextType>(
    () => ({
      isAuthenticated,
      token,
      login: () =>
        keycloak.login({
          redirectUri: import.meta.env.VITE_APP_REDIRECT_URL,
          scope: "openid profile email",
        }),
      logout: () => keycloak.logout(),
      userProfile,
      authInProgress,
    }),
    [isAuthenticated, token, userProfile, authInProgress]
  );

  return (
    <KeycloakContext.Provider value={value}>
      {children}
    </KeycloakContext.Provider>
  );
};

export const useKeycloakAuth = (): KeycloakContextType => {
  const context = useContext(KeycloakContext);
  if (!context) {
    throw new Error("useKeycloakAuth must be used within a KeycloakProvider");
  }
  return context;
};
