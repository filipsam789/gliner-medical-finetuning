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
  results: Results;
}

export interface RequestFormData {
  text: string;
  entity_types: string;
  threshold: number;
  allowMultiLabeling: boolean;
  model: string;
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
