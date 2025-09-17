import React from "react";
import { Box } from "@mui/material";
import { getEntityBorderColor } from "../utils/utils";

interface TextSegmentProps {
  text: string;
  label: string;
}

export const TextSegment = ({ text, label }: TextSegmentProps) => {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        border: `2px solid ${getEntityBorderColor(label)}`,
        backgroundColor: "white",
        borderRadius: "4px 4px 0 0", 
        px: 1,
        py: 0.375,
        lineHeight: 1.25,
        color: "black",
        fontWeight: 500,
        fontSize: "0.875rem",
        borderBottom: "none",
        margin: 0,
      }}
    >
      {text}
    </Box>
  );
};