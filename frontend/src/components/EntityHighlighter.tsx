import React from "react";
import {
  Box,
  Paper,
  ThemeProvider,
} from "@mui/material";
import { EntityHighlighterProps } from "@/types";
import { entityTheme } from "@/theme/entityTheme";
import { HighlightedEntity } from "./HighlightedEntity";
import { EntitySummary } from "./EntitySummary";
import { EntityList } from "./EntityList";

export const EntityHighlighter = ({ results }: EntityHighlighterProps) => {
  const renderHighlightedText = () => {
    const { text, entities } = results;
    const sortedEntities = [...entities].sort((a, b) => a.start - b.start);

    let currentIndex = 0;
    const elements: React.ReactNode[] = [];
    let keyIndex = 0;

    sortedEntities.forEach((entity, entityIndex) => {
      if (currentIndex < entity.start) {
        const textBefore = text.slice(currentIndex, entity.start);
        if (textBefore.length) {
          elements.push(
            <Box
              component="span"
              key={`text-${keyIndex++}`}
              sx={{
                color: "text.primary",
                whiteSpace: "pre-wrap",
              }}
            >
              {textBefore}
            </Box>
          );
        }
      }

      elements.push(
        <HighlightedEntity 
          entity={entity}
          entityIndex={entityIndex}
          key={`entity-${entityIndex}`}
        />
      );

      currentIndex = entity.end;
    });

    if (currentIndex < text.length) {
      const remainingText = text.slice(currentIndex);
      if (remainingText.length) {
        elements.push(
          <Box
            component="span"
            key={`text-${keyIndex++}`}
            sx={{
              color: "text.primary",
              whiteSpace: "pre-wrap",
            }}
          >
            {remainingText}
          </Box>
        );
      }
    }

    return elements;
  };

  return (
    <ThemeProvider theme={entityTheme}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              fontSize: "1rem",
              lineHeight: 1.75,
              minHeight: "4rem", 
              pb: 2,
            }}
          >
            {renderHighlightedText()}
          </Box>
        </Paper>
        <EntitySummary entities={results.entities} />
        <EntityList entities={results.entities} />
      </Box>
    </ThemeProvider>
  );
};