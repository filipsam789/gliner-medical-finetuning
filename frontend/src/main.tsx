import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { KeycloakProvider } from "./contexts/useKeycloakContext.tsx";
import { AuthProvider } from "./contexts/useAuth.tsx";

createRoot(document.getElementById("root")!).render(
  <KeycloakProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </KeycloakProvider>
);
