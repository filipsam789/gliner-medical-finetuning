import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  Tooltip,
  IconButton,
  Slider,
  Chip,
} from "@mui/material";
import { HelpCircle, Brain } from "lucide-react";
import { RequestFormData, UsageStatus } from "@/types";
import {
  entity_types_placeholder,
  text_placeholder,
  tooltips,
  thresholdSliderMarks,
  MODEL_OPTIONS,
} from "@/utils/constants";
import { getUsageStatus } from "@/api/apiCalls";
import { useKeycloakAuth } from "@/contexts/useKeycloakContext";

interface NERFormProps {
  formData: RequestFormData;
  setFormData: React.Dispatch<React.SetStateAction<RequestFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  isProcessing: boolean;
}

export const NERForm = ({
  formData,
  setFormData,
  onSubmit,
  isProcessing,
}: NERFormProps) => {
  const { token } = useKeycloakAuth();
  const [usageStatus, setUsageStatus] = useState<UsageStatus | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    text: string;
    entity_types: string;
  }>({
    text: "",
    entity_types: "",
  });

  useEffect(() => {
    const fetchUsageStatus = async () => {
      if (token) {
        try {
          const status = await getUsageStatus(token);
          setUsageStatus(status);
        } catch (error) {
          console.error("Error fetching usage status:", error);
        }
      }
    };
    fetchUsageStatus();
  }, [token]);

  const isDisabled = usageStatus
    ? usageStatus.remaining === 0 && !usageStatus.is_premium
    : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newValidationErrors = {
      text: "",
      entity_types: "",
    };

    if (formData.text.trim().length === 0) {
      newValidationErrors.text = "Please enter some text to analyze.";
    }

    if (formData.entity_types.trim().length === 0) {
      newValidationErrors.entity_types =
        "Please enter at least one entity label.";
    }

    setValidationErrors(newValidationErrors);

    if (newValidationErrors.text || newValidationErrors.entity_types) {
      return;
    }

    await onSubmit(e);

    if (token && !usageStatus?.is_premium) {
      try {
        const status = await getUsageStatus(token);
        setUsageStatus(status);
      } catch (error) {
        console.error("Error refreshing usage status:", error);
      }
    }
  };

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1,
            justifyContent: "center",
          }}
        >
          <Brain size={25} color="#0a75cdff" />
          <Typography variant="h6" component="h2">
            Configure Analysis
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ mb: 3, textAlign: "center" }}>
          Set up your named entity recognition parameters
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          <Box>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 0.2, mb: 1 }}
            >
              <Typography
                variant="body2"
                component="label"
                sx={{ fontWeight: 500, fontSize: "0.875rem" }}
              >
                Input Text
              </Typography>
              <Tooltip title={tooltips.text} placement="top">
                <IconButton size="small">
                  <HelpCircle size={16} color="hsl(240, 3.8%, 46.1%)" />
                </IconButton>
              </Tooltip>
            </Box>
            <TextField
              fullWidth
              multiline
              minRows={4}
              placeholder={text_placeholder}
              value={formData.text}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, text: e.target.value }));
                if (validationErrors.text && e.target.value.trim().length > 0) {
                  setValidationErrors((prev) => ({ ...prev, text: "" }));
                }
              }}
              required
              variant="outlined"
              disabled={isDisabled}
              error={!!validationErrors.text}
              helperText={validationErrors.text}
            />
          </Box>

          <Box>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 0.2, mb: 1 }}
            >
              <Typography
                variant="body2"
                component="label"
                sx={{ fontWeight: 500, fontSize: "0.875rem" }}
              >
                Entity Labels
              </Typography>
              <Tooltip title={tooltips.labels} placement="top">
                <IconButton size="small">
                  <HelpCircle size={16} color="hsl(240, 3.8%, 46.1%)" />
                </IconButton>
              </Tooltip>
            </Box>
            <TextField
              fullWidth
              placeholder={entity_types_placeholder}
              value={formData.entity_types}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  entity_types: e.target.value,
                }));
                if (
                  validationErrors.entity_types &&
                  e.target.value.trim().length > 0
                ) {
                  setValidationErrors((prev) => ({
                    ...prev,
                    entity_types: "",
                  }));
                }
              }}
              required
              variant="outlined"
              error={!!validationErrors.entity_types}
              helperText={validationErrors.entity_types}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 1,
            }}
          >
            <Box>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 0.2, mb: 1 }}
              >
                <Typography
                  variant="body2"
                  component="label"
                  sx={{ fontWeight: 500, fontSize: "0.875rem" }}
                >
                  Confidence Threshold
                </Typography>
                <Tooltip title={tooltips.threshold} placement="top">
                  <IconButton size="small">
                    <HelpCircle size={16} color="hsl(240, 3.8%, 46.1%)" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ px: 1, py: 2 }}>
                <Slider
                  value={formData.threshold}
                  onChange={(_, newValue) =>
                    setFormData((prev) => ({
                      ...prev,
                      threshold: newValue as number,
                    }))
                  }
                  min={0}
                  max={1}
                  step={0.1}
                  marks={thresholdSliderMarks}
                  valueLabelDisplay="auto"
                />
              </Box>
            </Box>

            <Box>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 0.2, mb: 1 }}
              >
                <Typography
                  variant="body2"
                  component="label"
                  sx={{ fontWeight: 500, fontSize: "0.875rem" }}
                >
                  Model
                </Typography>
                <Tooltip title={tooltips.model} placement="top">
                  <IconButton size="small">
                    <HelpCircle size={16} color="hsl(240, 3.8%, 46.1%)" />
                  </IconButton>
                </Tooltip>
              </Box>
              <FormControl fullWidth variant="outlined">
                <Select
                  value={formData.model}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, model: e.target.value }))
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
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.allow_multi_labeling}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      allow_multi_labeling: e.target.checked,
                    }))
                  }
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.2 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, fontSize: "0.875rem" }}
                  >
                    Allow Multi-labeling
                  </Typography>
                  <Tooltip title={tooltips.multiLabeling} placement="top">
                    <IconButton size="small">
                      <HelpCircle size={16} color="hsl(240, 3.8%, 46.1%)" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            />
          </Box>

          <Box sx={{ mb: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.allowTrainingUse}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      allowTrainingUse: e.target.checked,
                    }))
                  }
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.2 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, fontSize: "0.875rem" }}
                  >
                    Allow use of text for training (optional)
                  </Typography>
                  <Tooltip title={tooltips.trainingConsent} placement="top">
                    <IconButton size="small">
                      <HelpCircle size={16} color="hsl(240, 3.8%, 46.1%)" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={isProcessing || isDisabled}
            sx={{ mt: 2 }}
          >
            {isProcessing
              ? "Processing..."
              : isDisabled
              ? "Daily Limit Reached"
              : "Analyze Entities"}
          </Button>
          {usageStatus && (
            <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
              {usageStatus.is_premium ? null : (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Chip
                    label={`${usageStatus.used_today || 0}/${
                      usageStatus.daily_limit || 5
                    } extractions used today`}
                    color={usageStatus.remaining === 0 ? "error" : "primary"}
                    variant="outlined"
                  />
                  {usageStatus.remaining === 0 && (
                    <Typography
                      variant="body2"
                      color="error"
                      sx={{ fontWeight: "bold" }}
                    >
                      Daily limit reached! Upgrade to Premium for unlimited
                      access.
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
