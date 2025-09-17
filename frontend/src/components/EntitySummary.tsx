import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import {
  getEntityLabelBgColor,
  getUniqueLabels,
} from "../utils/utils";

interface EntitySummaryProps {
  entities: Array<{ label: string }>;
}

export const EntitySummary = ({ entities }: EntitySummaryProps) => {
  const uniqueLabels = getUniqueLabels(entities);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Typography
        variant="body2"
        sx={{
          fontSize: "0.875rem",
          fontWeight: 500,
          color: "text.secondary",
        }}
      >
        Entity Summary
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {Object.entries(uniqueLabels).map(([label, count]) => (
          <Paper
            key={label}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 1,
              backgroundColor: "hsl(0, 0%, 98%)", 
              borderRadius: 2,
              border: "1px solid hsl(240, 5.9%, 90%)",
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: getEntityLabelBgColor(label),
              }}
            />
            <Typography
              sx={{
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "text.primary",
              }}
            >
              {label}
            </Typography>
            <Typography
              sx={{
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "text.primary",
                backgroundColor: "hsl(240, 4.8%, 95.9%)",
                px: 1,
                py: 0.25,
                borderRadius: 1,
              }}
            >
              {count}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};