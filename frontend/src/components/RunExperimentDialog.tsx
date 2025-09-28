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
import { MODEL_OPTIONS, thresholdSliderMarks, entity_types_placeholder } from "@/utils/constants";


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
  const [form, setForm] = useState({
    model: Object.keys(MODEL_OPTIONS)[0],
    threshold: 0.5,
    allowMultilabeling: false,
    labels: "",
  });
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  const handleRun = async () => {
    setRunning(true);
    setError("");
    try {
      await addExperimentRun(token, experimentId!, {
        model: form.model,
        labels_to_extract: form.labels,
        allow_multilabeling: form.allowMultilabeling,
        threshold: form.threshold,
      });
      if (onRunSuccess) onRunSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Error running experiment");
    } finally {
      setRunning(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      sx={{ backdropFilter: "blur(4px)" }}
    >
      <DialogTitle>Run Experiment</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
              Model
            </Typography>
            <FormControl fullWidth variant="outlined">
              <Select
                value={form.model}
                onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                displayEmpty
              >
                {Object.entries(MODEL_OPTIONS).map(([key, label]) => (
                  <MenuItem key={key} value={key}>{label}</MenuItem>
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
                  onChange={(_, newValue) => setForm((f) => ({ ...f, threshold: newValue as number }))}
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
                  checked={form.allowMultilabeling}
                  onChange={(e) => setForm((f) => ({ ...f, allowMultilabeling: e.target.checked }))}
                />
              }
              label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Allow Multi-labeling</Typography>}
            />
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>Labels to Extract</Typography>
            <TextField
              fullWidth
              placeholder={entity_types_placeholder}
              value={form.labels}
              onChange={(e) => setForm((f) => ({ ...f, labels: e.target.value }))}
              variant="outlined"
            />
          </Box>
        </Box>
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
        {running && (
          <Box sx={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", bgcolor: "rgba(245,247,250,0.7)", zIndex: 1300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>
            <Typography variant="h5" sx={{ mb: 2 }}>Running experiment...</Typography>
            <Box sx={{ width: 60, height: 60, borderRadius: "50%", bgcolor: "#e3eafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="loader" />
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleRun} disabled={running}>Run</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RunExperimentDialog;
