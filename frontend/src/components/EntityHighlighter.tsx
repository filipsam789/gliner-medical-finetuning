import React from "react";
import { Box, Paper, ThemeProvider } from "@mui/material";
import { EntityHighlighterProps } from "@/types";
import { entityTheme } from "@/theme/entityTheme";
import { HighlightedEntity } from "./HighlightedEntity";

export const EntityHighlighter = ({ results }: EntityHighlighterProps) => {
  const renderHighlightedText = () => {
    const { text, entities } = results;

    const groupedEntities = entities.reduce((acc, entity) => {
      const start = entity.start - 1;
      const end = entity.end;
      const key = `${start}-${end}`;
      if (!acc[key]) {
        acc[key] = {
          start: start,
          end: end,
          text: entity.text,
          labels: [],
          scores: [],
        };
      }
      acc[key].labels.push(entity.label);
      acc[key].scores.push(entity.score);
      return acc;
    }, {} as Record<string, { start: number; end: number; text: string; labels: string[]; scores: number[] }>);

    const sortedEntities = Object.values(groupedEntities).sort(
      (a, b) => a.start - b.start
    );

    let currentIndex = 0;
    const elements: React.ReactNode[] = [];
    let keyIndex = 0;

    sortedEntities.forEach((groupedEntity, entityIndex) => {
      if (currentIndex <= groupedEntity.start) {
        const textBefore = text.slice(currentIndex, groupedEntity.start);
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

      const combinedEntity = {
        start: groupedEntity.start,
        end: groupedEntity.end,
        text: groupedEntity.text,
        label: groupedEntity.labels.join(", "),
        score: Math.max(...groupedEntity.scores),
      };

      elements.push(
        <HighlightedEntity
          entity={combinedEntity}
          entityIndex={entityIndex}
          key={`entity-${entityIndex}`}
        />
      );

      currentIndex = groupedEntity.end;
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
    </ThemeProvider>
  );
};
