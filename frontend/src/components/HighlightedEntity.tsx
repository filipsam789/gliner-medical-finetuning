import React from "react";
import { Box } from "@mui/material";
import { TextSegment } from "./TextSegment";
import { LabelSegment } from "./LabelSegment";

interface HighlightedEntityProps {
  entity: {
    text: string;
    label: string;
  };
  entityIndex: number;
}

export const HighlightedEntity = ({ entity, entityIndex }: HighlightedEntityProps) => {
  return (
    <Box
      component="span"
      key={`entity-${entityIndex}`}
      sx={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "stretch",
        mx: 0.5,
        mb: 1,
        verticalAlign: "baseline",
      }}
    >
      <TextSegment text={entity.text} label={entity.label} />
      <LabelSegment label={entity.label} />
    </Box>
  );
};
