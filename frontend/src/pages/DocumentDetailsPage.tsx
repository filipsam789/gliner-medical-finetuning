import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CardMedia,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useParams } from "react-router-dom";
import {
  getDocumentDetails,
  getExperimentRuns,
  getExperimentRunResults,
  ExperimentRun,
} from "@/api/apiCalls";
import { useKeycloakAuth } from "@/contexts/useKeycloakContext";
import { NERResults } from "@/components/NERResults";
import { EntityHighlighter } from "@/components/EntityHighlighter";
import { EntitySummary } from "@/components/EntitySummary";
import { EntityList } from "@/components/EntityList";
import { RepresentationResults } from "@/types";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const DocumentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useKeycloakAuth();
  const [document, setDocument] = useState<any | null>(null);
  const [experimentRuns, setExperimentRuns] = useState<ExperimentRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<string>("");
  const [results, setResults] = useState<RepresentationResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDocumentAndRuns = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getDocumentDetails(token, id!);
        setDocument(data.document || data);

        if (data.experiment_id) {
          const runs = await getExperimentRuns(
            token,
            data.experiment_id.toString()
          );
          setExperimentRuns(runs);

          if (runs.length > 0) {
            const latestRunId = runs[0].id.toString();
            setSelectedRun(latestRunId);

            const documentData = data.document || data;
            const fetchLatestResults = async () => {
              setResultsLoading(true);
              setError("");
              try {
                const resultsData = await getExperimentRunResults(
                  token,
                  latestRunId
                );

                const documentResult = resultsData.results.find(
                  (result: any) => result.document_id === parseInt(id!)
                );

                if (documentResult) {
                  setResults({
                    text: documentData.text,
                    entities: documentResult.predictions,
                  });
                } else {
                  setResults(null);
                }
              } catch (err: unknown) {
                setError(
                  (err as Error).message || "Error loading experiment results"
                );
                setResults(null);
              } finally {
                setResultsLoading(false);
              }
            };

            fetchLatestResults();
          }
        }
      } catch (err: unknown) {
        setError((err as Error).message || "Error loading document details");
      } finally {
        setLoading(false);
      }
    };
    if (id && token) fetchDocumentAndRuns();
  }, [id, token]);

  const fetchResults = async (runId: string) => {
    if (!runId) return;

    setResultsLoading(true);
    setError("");
    try {
      const data = await getExperimentRunResults(token, runId);

      const documentResult = data.results.find(
        (result: any) => result.document_id === parseInt(id!)
      );

      if (documentResult && document) {
        setResults({
          text: document.text,
          entities: documentResult.predictions,
        });
      } else {
        setResults(null);
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Error loading experiment results");
      setResults(null);
    } finally {
      setResultsLoading(false);
    }
  };

  const handleRunChange = (runId: string) => {
    setSelectedRun(runId);
    if (runId) {
      fetchResults(runId);
    } else {
      setResults(null);
    }
  };

  const formatRunOption = (run: ExperimentRun): string => {
    const date = new Date(run.date_ran).toLocaleDateString();
    const isGliner = run.model.toLowerCase().includes("gliner");

    let option = `Experiment ran on ${date}, with parameters: model - ${run.model}`;

    if (isGliner && run.threshold !== null && run.threshold !== undefined) {
      option += `, threshold - ${run.threshold}`;
    }

    option += `, allow multilabeling: ${run.allow_multilabeling}`;

    return option;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "#f5f7fa",
          pt: 12,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !document) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "#f5f7fa",
        }}
      >
        <Alert severity="error">{error || "Document not found."}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "#f5f7fa",
        p: 3,
        pt: 12,
      }}
    >
      {experimentRuns.length > 0 && (
        <Box sx={{ width: "100%", maxWidth: 900, mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel
              id="experiment-runs-select-label"
              sx={{
                color: "rgba(37, 150, 190)",
                "&.Mui-focused": {
                  color: "rgba(37, 150, 190)",
                },
              }}
            >
              Select Experiment Run
            </InputLabel>
            <Select
              labelId="experiment-runs-select-label"
              value={selectedRun}
              label="Select Experiment Run"
              onChange={(e) => handleRunChange(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(37, 150, 190)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(37, 150, 190)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(37, 150, 190)",
                },
                "& .MuiSelect-icon": {
                  color: "rgba(37, 150, 190)",
                },
                "& .MuiMenuItem-root.Mui-selected": {
                  backgroundColor: "rgba(37, 150, 190, 0.1) !important",
                  "&:hover": {
                    backgroundColor: "rgba(37, 150, 190, 0.2) !important",
                  },
                },
                "& .MuiMenuItem-root:hover": {
                  backgroundColor: "rgba(37, 150, 190, 0.08)",
                },
                "& .MuiMenuItem-root.Mui-selected.MuiButtonBase-root": {
                  backgroundColor: "rgba(37, 150, 190, 0.1) !important",
                },
              }}
            >
              {experimentRuns.map((run) => (
                <MenuItem key={run.id} value={run.id.toString()}>
                  {formatRunOption(run)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      <Card
        sx={{ maxWidth: 900, width: "100%", mx: "auto", boxShadow: 4, p: 3 }}
      >
        <CardMedia
          component="img"
          height="220"
          image={
            document.image_url ||
            "https://via.placeholder.com/600x200?text=Document+Image"
          }
          alt={document.title}
          sx={{ objectFit: "cover", borderRadius: 2 }}
        />
        <CardContent sx={{ textAlign: "center" }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            {document.title}
          </Typography>
          <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
            Date added: {formatDate(document.date_added)}
          </Typography>
          <Box
            sx={{
              bgcolor: "#f0f2f5",
              borderRadius: 2,
              p: 4,
              mt: 2,
              display: "flex",
              justifyContent: "center",
            }}
          >
            {results ? (
              <EntityHighlighter results={results} />
            ) : (
              <Typography variant="body1" sx={{ textAlign: "center" }}>
                {document.text}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {selectedRun && results && (
        <Box sx={{ width: "100%", maxWidth: 900, mt: 3 }}>
          {resultsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <EntitySummary entities={results.entities} />
              <EntityList entities={results.entities} />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default DocumentDetailsPage;
