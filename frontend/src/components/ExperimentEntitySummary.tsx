import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import { ExperimentRun, getExperimentRunResults } from "@/api/apiCalls";
import { useKeycloakAuth } from "@/contexts/useKeycloakContext";
import { EntitySummary } from "./EntitySummary";
import { EntityList } from "./EntityList";

interface ExperimentEntitySummaryProps {
  runs: ExperimentRun[];
}

interface AggregatedEntity {
  text: string;
  label: string;
  score: number;
  documentId: number;
  documentTitle: string;
}

const ExperimentEntitySummary: React.FC<ExperimentEntitySummaryProps> = ({
  runs,
}) => {
  const { token } = useKeycloakAuth();
  const [selectedRunId, setSelectedRunId] = useState<string>("");
  const [aggregatedEntities, setAggregatedEntities] = useState<
    AggregatedEntity[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (runs.length > 0 && !selectedRunId) {
      setSelectedRunId(runs[0].id.toString());
    }
  }, [runs, selectedRunId]);

  useEffect(() => {
    if (selectedRunId) {
      fetchRunResults();
    }
  }, [selectedRunId]);

  const fetchRunResults = async () => {
    if (!selectedRunId || !token) return;

    setLoading(true);
    setError("");
    try {
      const results = await getExperimentRunResults(token, selectedRunId);

      const allEntities: AggregatedEntity[] = [];

      results.results.forEach((documentResult: any) => {
        if (
          documentResult.predictions &&
          Array.isArray(documentResult.predictions)
        ) {
          documentResult.predictions.forEach((entity: any) => {
            allEntities.push({
              text: entity.text,
              label: entity.label,
              score: entity.score,
              documentId: documentResult.document_id,
              documentTitle:
                documentResult.document_title ||
                `Document ${documentResult.document_id}`,
            });
          });
        }
      });

      setAggregatedEntities(allEntities);
    } catch (err: unknown) {
      setError((err as Error).message || "Error fetching run results");
      setAggregatedEntities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRunChange = (runId: string) => {
    setSelectedRunId(runId);
  };

  const formatRunOption = (run: ExperimentRun): string => {
    const date = new Date(run.date_ran).toLocaleDateString();

    let option = `Experiment ran on ${date}, with parameters: model - ${run.model}`;

    if (run.threshold !== null && run.threshold !== undefined) {
      option += `, threshold - ${run.threshold}`;
    }

    option += `, allow multilabeling: ${run.allow_multilabeling}`;

    return option;
  };

  if (runs.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
            fontWeight: 500,
          }}
        >
          No experiment runs available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
            color: "primary.main",
            mb: 3,
          }}
        >
          Entity Summary by Experiment Run
        </Typography>
      </Box>

      <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
        <FormControl sx={{ maxWidth: 800, width: "100%" }}>
          <InputLabel>Select Experiment Run</InputLabel>
          <Select
            value={selectedRunId}
            onChange={(e) => handleRunChange(e.target.value)}
            label="Select Experiment Run"
          >
            {runs.map((run) => (
              <MenuItem key={run.id} value={run.id.toString()}>
                {formatRunOption(run)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {aggregatedEntities.length > 0 ? (
            <>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Summary Statistics
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total entities found: {aggregatedEntities.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Unique entity types:{" "}
                    {new Set(aggregatedEntities.map((e) => e.label)).size}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Documents processed:{" "}
                    {new Set(aggregatedEntities.map((e) => e.documentId)).size}
                  </Typography>
                </CardContent>
              </Card>

              <EntitySummary entities={aggregatedEntities} />
              <EntityList entities={aggregatedEntities} />
            </>
          ) : (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{
                  fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
                  fontWeight: 500,
                }}
              >
                No entities found in the selected experiment run.
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ExperimentEntitySummary;
