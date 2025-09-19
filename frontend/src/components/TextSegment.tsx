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
        display: "block",
        flex: "1 0 auto",
        width: "100%",
        border: `2px solid ${getEntityBorderColor(label)}`,
        backgroundColor: "white",
        borderRadius: "4px 4px 0 0",
        px: 1,
        py: 0.2,
        lineHeight: 1.25,
        color: "black",
        fontWeight: 500,
        fontSize: "0.875rem",
        borderBottom: "none",
        margin: 0,
        textAlign: "center",
      }}
    >
      {text}
    </Box>
  );
};
