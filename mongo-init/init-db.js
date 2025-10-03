db = db.getSiblingDB('gliner_training');

db.createCollection('ClientTexts');

db.ClientTexts.createIndex(
  { "text_hash": 1 }, 
  { 
    unique: true,
    name: "text_hash_unique_idx",
    background: true
  }
);

db.createCollection('ExperimentResults');

db.ExperimentResults.createIndex(
  { "experiment_id": 1 },
  {
    name: "experiment_id_idx",
    background: true
  }
);

db.ExperimentResults.createIndex(
  { "document_id": 1 },
  {
    name: "document_id_idx",
    background: true
  }
);