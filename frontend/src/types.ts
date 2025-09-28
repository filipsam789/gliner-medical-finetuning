export interface Entity {
  text: string;
  label: string;
  start: number;
  end: number;
}

export interface Results {
  text: string;
  entities: Entity[];
}

export interface EntityHighlighterProps {
  results: RepresentationResults;
}

export interface RequestFormData {
  text: string;
  entity_types: string;
  threshold: number;
  allow_multi_labeling: boolean;
  model: string;
  allowTrainingUse: boolean;
}

export interface EntityResult {
  text: string;
  label: string;
  start: number;
  end: number;
  score: number;
}

export interface RepresentationResults {
  text: string;
  entities: EntityResult[];
}
