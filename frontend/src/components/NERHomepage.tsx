import React, { useState } from "react";
import { Box, ThemeProvider, Snackbar, Alert } from "@mui/material";
import { mainTheme } from "@/theme/mainTheme";
import { analyzeEntities } from "@/api/apiCalls";
import { Header } from "./Header";
import { NERForm } from "./NERForm";
import { NERResults } from "./NERResults";
import { RepresentationResults, RequestFormData } from "@/types";

export const NERHomepage = () => {
  const [formData, setFormData] = useState<RequestFormData>({
    text: "",
    entity_types: "",
    threshold: 0.5,
    allowMultiLabeling: false,
    model: "contrastive-gliner",
  });

  const [results, setResults] = useState<RepresentationResults>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          <Header />

          <NERForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            isProcessing={isProcessing}
          />

          {results && <NERResults results={results} />}
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
