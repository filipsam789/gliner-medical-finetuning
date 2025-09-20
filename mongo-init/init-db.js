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