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
        position: "relative",
        display: "inline-block",
        alignItems: "baseline",
        mx: 0.5,
        mb: 4,
      }}
    >
      <TextSegment text={entity.text} label={entity.label} />
      <LabelSegment label={entity.label} />
    </Box>
  );
};