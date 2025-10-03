import { entityColorPalette } from "./constants";

const findEntityPositionsSequentially = (
  text: string,
  entities: Array<{ text: string; label: string }>
) => {
  const result = [];
  const entityUsageCount = new Map(); 

  for (const entity of entities) {
    const entityText = entity.text.toLowerCase();
    const currentUsageCount = entityUsageCount.get(entityText) || 0;

    const occurrences = [];
    let searchStart = 0;

    while (true) {
      const index = text.toLowerCase().indexOf(entityText, searchStart);
      if (index === -1) break;

      occurrences.push({
        start: index,
        end: index + entity.text.length,
      });

      searchStart = index + 1;
    }

    if (occurrences.length > currentUsageCount) {
      const selectedOccurrence = occurrences[currentUsageCount];

      result.push({
        text: entity.text,
        label: entity.label,
        start: selectedOccurrence.start,
        end: selectedOccurrence.end,
      });

      entityUsageCount.set(entityText, currentUsageCount + 1);
    }
  }

  return result.sort((a, b) => a.start - b.start);
};

export const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; 
  }
  return Math.abs(hash);
};

export const getColorForLabel = (label: string) => {
  const hash = hashString(label);
  const colorIndex = hash % entityColorPalette.length;
  return entityColorPalette[colorIndex];
};

export const getEntityBorderColor = (label: string) => {
  return getColorForLabel(label).main;
};

export const getEntityLabelBgColor = (label: string) => {
  return getColorForLabel(label).main;
};

export const getEntityChipStyle = (label: string) => {
  const colors = getColorForLabel(label);
  return {
    backgroundColor: colors.light,
    border: `1px solid ${colors.main}`,
    color: colors.dark,
  };
};

export const getUniqueLabels = (entities: Array<{ label: string }>) => {
  const labelCounts: { [key: string]: number } = {};
  entities.forEach((entity) => {
    labelCounts[entity.label] = (labelCounts[entity.label] || 0) + 1;
  });
  return labelCounts;
};
