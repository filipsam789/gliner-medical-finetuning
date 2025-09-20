from pydantic import BaseModel, Field, validator
import constants


class EntityRequest(BaseModel):
    text: str = Field(..., description="Raw input text to analyze")
    entity_types: str = Field(..., description="Comma-separated list of entity type strings")
    threshold: float = Field(0.5, ge=0.0, le=1.0, description="Score threshold in range [0,1]")
    allow_multi_label: bool = Field(False, description="Allow multiple entity labels per entity")
    model: str = Field("default", description="Model selector")
    allowTrainingUse: bool = Field(False, description="Allow text to be used for future model training")

    @validator("text")
    def validate_text(cls, v: str) -> str:
        if v is None:
            raise ValueError("Text is required")
        v = v.strip()
        if not v:
            raise ValueError("Text cannot be empty")
        if len(v) > constants.MAX_TEXT_CHARS:
            raise ValueError(f"Text exceeds maximum allowed length of {constants.MAX_TEXT_CHARS} characters")
        if len(v) < constants.MIN_TEXT_CHARS:
            raise ValueError(f"Text length is below minimum allowed length of {constants.MIN_TEXT_CHARS} characters")
        return v

    @validator("entity_types")
    def validate_entity_types(cls, v: str) -> str:
        if v is None:
            raise ValueError("entity_types is required")
        if not v.strip():
            raise ValueError("entity_types cannot be empty")
        return v

