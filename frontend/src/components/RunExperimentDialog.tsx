import React, { useState } from "react";
import { useKeycloakAuth } from "@/contexts/useKeycloakContext";
import { addExperimentRun } from "@/api/apiCalls";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  MenuItem,
  Select,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import { Check, X } from "lucide-react";
import {
  MODEL_OPTIONS,
  thresholdSliderMarks,
  entity_types_placeholder,
} from "@/utils/constants";
import { RequestFormData } from "@/types";

interface RunExperimentDialogProps {
  open: boolean;
  onClose: () => void;
  experimentId?: string;
  onRunSuccess?: () => void;
}

const RunExperimentDialog: React.FC<RunExperimentDialogProps> = ({
  open,
  onClose,
  experimentId,
  onRunSuccess,
}) => {
  const { token } = useKeycloakAuth();
  const [form, setForm] = useState<RequestFormData>({
    text: "",
    entity_types: "",
    threshold: 0.5,
    allow_multi_labeling: false,
    model: Object.keys(MODEL_OPTIONS)[0],
    allowTrainingUse: true,
  });
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleRun = async () => {
    if (form.entity_types.trim().length === 0) {
      setValidationError("Please select at least one label to extract.");
      return;
    }
    setRunning(true);
    setError("");
    setValidationError("");
    setSuccess(false);
    try {
      await addExperimentRun(token, experimentId!, {
        model: form.model,
        labels_to_extract: form.entity_types,
        allow_multilabeling: form.allow_multi_labeling,
        threshold: form.threshold,
      });
      setRunning(false);
      setSuccess(true);
      if (onRunSuccess) onRunSuccess();
    } catch (err: any) {
      setRunning(false);
      setError(
        err?.message ||
          "Something went wrong. Please try again or contact an administrator."
      );
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError("");
    setValidationError("");
    setRunning(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      sx={{ backdropFilter: "blur(4px)" }}
    >
      <DialogTitle>Run Experiment</DialogTitle>
      <DialogContent>
        {(!success && !error && !running) || validationError ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                Model
              </Typography>
              <FormControl fullWidth variant="outlined">
                <Select
                  value={form.model}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, model: e.target.value }))
                  }
                  displayEmpty
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgb(23, 131, 239)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgb(23, 131, 239)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgb(23, 131, 239)",
                    },
                    "& .MuiSelect-icon": {
                      color: "rgb(23, 131, 239)",
                    },
                    "& .MuiMenuItem-root.Mui-selected": {
                      backgroundColor: "rgba(23, 131, 239, 0.1) !important",
                      "&:hover": {
                        backgroundColor: "rgba(23, 131, 239, 0.2) !important",
                      },
                    },
                    "& .MuiMenuItem-root:hover": {
                      backgroundColor: "rgba(23, 131, 239, 0.08)",
                    },
                    "& .MuiMenuItem-root.Mui-selected.MuiButtonBase-root": {
                      backgroundColor: "rgba(23, 131, 239, 0.1) !important",
                    },
                  }}
                >
                  {Object.entries(MODEL_OPTIONS).map(([key, label]) => (
                    <MenuItem key={key} value={key}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            {form.model.toLowerCase().includes("gliner") && (
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Confidence Threshold
                </Typography>
                <Box sx={{ px: 1, py: 2 }}>
                  <Slider
                    value={form.threshold}
                    onChange={(_, newValue) =>
                      setForm((f) => ({ ...f, threshold: newValue as number }))
                    }
                    min={0}
                    max={1}
                    step={0.1}
                    marks={thresholdSliderMarks}
                    valueLabelDisplay="auto"
                  />
                </Box>
              </Box>
            )}
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.allow_multi_labeling}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        allow_multi_labeling: e.target.checked,
                      }))
                    }
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Allow Multi-labeling
                  </Typography>
                }
              />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                Labels to Extract
              </Typography>
              <TextField
                fullWidth
                placeholder={entity_types_placeholder}
                value={form.entity_types}
                onChange={(e) => {
                  setForm((f) => ({ ...f, entity_types: e.target.value }));
                  if (validationError && e.target.value.trim().length > 0) {
                    setValidationError("");
                  }
                }}
                variant="outlined"
                error={!!validationError}
                helperText={validationError}
              />
            </Box>
          </Box>
        ) : null}
        {success && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 4,
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                bgcolor: "#4caf50",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}
            >
              <Check size={30} color="white" />
            </Box>
            <Typography
              variant="h6"
              sx={{ color: "#4caf50", textAlign: "center" }}
            >
              Experiment ran successfully. Please check the results in the
              documents pages.
            </Typography>
          </Box>
        )}
        {error && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 4,
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                bgcolor: "#f44336",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}
            >
              <X size={30} color="white" />
            </Box>
            <Typography
              variant="h6"
              sx={{ color: "#f44336", textAlign: "center", px: 2 }}
            >
              {error}
            </Typography>
          </Box>
        )}

        {running && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 4,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Running experiment...
            </Typography>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                bgcolor: "#e3eafc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span className="loader" />
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {success ? (
          <Button variant="contained" onClick={handleClose}>
            Close
          </Button>
        ) : error ? (
          <>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="contained" onClick={handleRun}>
              Try Again
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="contained" onClick={handleRun} disabled={running}>
              Run
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default RunExperimentDialog;
