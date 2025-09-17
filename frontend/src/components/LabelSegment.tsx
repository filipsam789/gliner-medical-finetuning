import React from "react";
import { Box, Typography } from "@mui/material";
import { getEntityBorderColor, getEntityLabelBgColor } from "../utils/utils";

interface LabelSegmentProps {
  label: string;
}

export const LabelSegment = ({ label }: LabelSegmentProps) => {
  return (
    <Box
      component="span"
      sx={{
        position: "absolute",
        left: 0,
        width: "100%",
        top: "100%", 
        px: 0.5,
        py: 0.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "0 0 4px 4px", 
        backgroundColor: getEntityLabelBgColor(label),
        border: `2px solid ${getEntityBorderColor(label)}`,
        borderTop: "none",
        margin: 0,
        marginTop: "-2px",
      }}
    >
      <Typography
        component="span"
        sx={{
          fontSize: "10px",
          fontWeight: 700,
          color: "white",
          textTransform: "uppercase",
          letterSpacing: "0.05em", 
          lineHeight: 1,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};