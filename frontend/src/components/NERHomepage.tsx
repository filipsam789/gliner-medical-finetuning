import React, { useState, useRef, useEffect } from "react";
import { Box, ThemeProvider, Snackbar, Alert, Button } from "@mui/material";
import { mainTheme } from "@/theme/mainTheme";
import { analyzeEntities, subscribeUser } from "@/api/apiCalls";
import { Header } from "./Header";
import { NERForm } from "./NERForm";
import { NERResults } from "./NERResults";
import { RepresentationResults, RequestFormData } from "@/types";
import { useKeycloakAuth } from "@/contexts/useKeycloakContext";
import { useAuth } from "@/contexts/useAuth";

export const NERHomepage = () => {
  const [formData, setFormData] = useState<RequestFormData>({
    text: "",
    entity_types: "",
    threshold: 0.5,
    allowMultiLabeling: false,
    model: "contrastive-gliner",
    allowTrainingUse: true,
  });

  const [results, setResults] = useState<RepresentationResults>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const { token } = useKeycloakAuth();
  const { setRoles, handleLogoutRedirect } = useAuth();

  const pay = () => {
    subscribeUser(token);
  };

  const logout = () => {
    handleLogoutRedirect();
    setRoles(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    try {
      const analysisResults = await analyzeEntities(formData);
      setResults(analysisResults);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to analyze entities. Please try again.";
      setError(errorMessage);
      console.error("Error analyzing entities:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (results && !isProcessing && resultsRef.current) {
      const handle = window.setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);
      return () => window.clearTimeout(handle);
    }
  }, [results, isProcessing]);

  return (
    <ThemeProvider theme={mainTheme}>
      <Box
        sx={{
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, hsl(0 0% 98%), hsl(240 4.8% 95.9%))",
          p: 3,
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            mx: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <Button onClick={logout} variant="contained">
            Log out
          </Button>
          <Button onClick={pay} variant="contained">
            Pay
          </Button>
          <Header />

          <NERForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            isProcessing={isProcessing}
          />

          {results && (
            <Box ref={resultsRef}>
              <NERResults results={results} />
            </Box>
          )}
        </Box>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={() => setError(null)}
            severity="error"
            variant="filled"
            sx={{ width: "100%" }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};
