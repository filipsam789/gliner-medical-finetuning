from typing import List
from fastapi import HTTPException
from gliner import GLiNER
import constants


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
        MODEL_REGISTRY[name] = GLiNER.from_pretrained(path, local_files_only=True)
    return MODEL_REGISTRY[name]