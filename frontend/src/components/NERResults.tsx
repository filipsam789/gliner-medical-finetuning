import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { EntityHighlighter } from "./EntityHighlighter";
import { RepresentationResults } from "@/types";

interface NERResultsProps {
  results: RepresentationResults;
}

export const NERResults = ({ results }: NERResultsProps) => {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
          Analysis Results
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          Detected entities are highlighted and labeled below
        </Typography>
        <EntityHighlighter results={results} />
      </CardContent>
    </Card>
  );
};