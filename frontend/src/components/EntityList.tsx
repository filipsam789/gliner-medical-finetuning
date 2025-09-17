import React from "react";
import { Box, Typography, Paper, Chip } from "@mui/material";
import { getEntityChipStyle } from "../utils/utils";

interface EntityListProps {
  entities: Array<{
    text: string;
    label: string;
  }>;
}

export const EntityList = ({ entities }: EntityListProps) => {
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
        All Detected Entities
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {entities.map((entity, index) => (
          <Paper
            elevation={0}
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 1.5,
              backgroundColor: "hsl(0, 0%, 98%)", 
              borderRadius: 2,
              border: "1px solid hsla(0, 0%, 81%, 1.00)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Chip
                label={entity.label}
                size="small"
                sx={getEntityChipStyle(entity.label)}
              />
              <Typography
                sx={{
                  fontWeight: 500,
                  color: "text.primary",
                }}
              >
                {entity.text}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};