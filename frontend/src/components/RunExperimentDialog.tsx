import React, { useState } from "react";
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
}

const RunExperimentDialog: React.FC<RunExperimentDialogProps> = ({
  open,
  onClose,
}) => {
  const [form, setForm] = useState({
    model: Object.keys(MODEL_OPTIONS)[0],
    threshold: 0.5,
    allowMultilabeling: false,
    labels: "",
  });

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
                onChange={(e) =>
                  setForm((f) => ({ ...f, model: e.target.value }))
                }
                displayEmpty
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
                  checked={form.allowMultilabeling}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, allowMultilabeling: e.target.checked }))
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
              value={form.labels}
              onChange={(e) => setForm((f) => ({ ...f, labels: e.target.value }))}
              variant="outlined"
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => {
            // TODO: connect API call
            console.log("Running with form:", form);
            onClose();
          }}
        >
          Run
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RunExperimentDialog;
