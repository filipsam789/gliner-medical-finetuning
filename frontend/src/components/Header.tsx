import React from "react";
import { Box, Typography } from "@mui/material";
import { HeartRate } from "./HeartRate";

export const Header = () => {
  return (
    <Box sx={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 1.5 }}>
      <HeartRate />
      <Typography variant="h4" component="h1" sx={{ color: "text.primary" }}>
        💉Analyze Clinical Text with{" "}
        <span
          style={{
            background: "linear-gradient(135deg, #3e84bf, #67b1ed",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
        AI Intelligence
        </span>
        &nbsp;🩺
      </Typography>

      <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 600, mx: "auto" }}>
        Identify and classify named entities in text using state-of-the-art
        GLiNER models. Perfect for information extraction and text analysis.
      </Typography>
    </Box>
  );
};