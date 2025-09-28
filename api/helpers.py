from typing import List, Optional
from fastapi import HTTPException
from gliner import GLiNER
import constants
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.errors import ConnectionFailure
from datetime import datetime
import os
import hashlib


def parse_entity_types(raw: str) -> List[str]:
    items = [t.strip() for t in raw.split(",")]

    seen = set()
    unique = []
    for t in items:
        if t.lower() not in seen:
            seen.add(t.lower())
            unique.append(t)

    if not unique:
        raise HTTPException(status_code=400, detail="No valid entity types provided")
    if len(unique) > constants.MAX_ENTITY_TYPES:
        raise HTTPException(status_code=400, detail=f"Too many entity types (>{constants.MAX_ENTITY_TYPES})")

    invalid = [t for t in unique if not constants.ALLOWED_LABEL_PATTERN.match(t)]
    if invalid:
        raise HTTPException(status_code=400, detail=f"Invalid entity type names: {invalid}")
    return unique

MODEL_REGISTRY = {}
def get_model(name: str) -> GLiNER:
    if name not in MODEL_REGISTRY:
        if name == constants.DEFAULT_MODEL_NAME_FRONTEND:
            path = constants.DEFAULT_MODEL_NAME
        elif name == constants.FINETUNED_MODEL_NAME_FRONTEND:
            path = constants.DEFAULT_MODEL_NAME  # TODO replace
        else:
            raise HTTPException(status_code=400, detail=f"Model '{name}' not available")
        MODEL_REGISTRY[name] = GLiNER.from_pretrained(path, local_files_only=(name == constants.FINETUNED_MODEL_NAME_FRONTEND))
    return MODEL_REGISTRY[name]

client_texts_collection: Optional[Collection] = None
def initialize_mongodb() -> Optional[Collection]:
    global client_texts_collection

    if client_texts_collection is not None:
        return client_texts_collection

    try:
        mongo_url = os.getenv("MONGO_URL")
        mongo_db_name = os.getenv("MONGO_DB_NAME")
        mongo_collection_name = os.getenv("MONGO_COLLECTION_NAME")
        
        mongo_client = MongoClient(mongo_url)
        db = mongo_client[mongo_db_name]
        client_texts_collection = db[mongo_collection_name]
                
        return client_texts_collection
    except Exception as e:
        raise HTTPException(
            status_code=503, 
            detail="Database connection failed."
        )


def get_text_hash(text: str) -> str:
    return hashlib.sha256(text.encode('utf-8')).hexdigest()


def store_training_text(text: str) -> bool:
    collection = initialize_mongodb()
    
    try:
        text_hash = get_text_hash(text)
        
        existing = collection.find_one({"text_hash": text_hash})
        if existing:
            return False
        
        training_document = {
            "text": text,
            "text_hash": text_hash,
        }
        
        result = collection.insert_one(training_document)
        return True
        
    except Exception as e:
        raise HTTPException(
            status_code=503, 
            detail="Failed to store text for training."
        )

def predict_entities_batch(model_name: str, entity_types_raw: str, texts: list, threshold: float, allow_multi_label: bool):
    entity_types = parse_entity_types(entity_types_raw)
    model = get_model(model_name)
    results = []
    for text in texts:
        try:
            entities = model.predict_entities(
                text,
                entity_types,
                threshold=threshold,
                allow_multi_label=allow_multi_label,
            )
            results.append(entities)
        except Exception as e:
            results.append([]) 
    return results