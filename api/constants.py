
import re

DEFAULT_MODEL_NAME = "urchade/gliner_small"
DEFAULT_MODEL_NAME_FRONTEND = "regular-gliner"

FINETUNED_MODEL_NAME = "finetuned_gliner_model_NCELoss"
FINETUNED_MODEL_NAME_FRONTEND = "contrastive-gliner"

ALLOWED_MODELS = [DEFAULT_MODEL_NAME_FRONTEND, FINETUNED_MODEL_NAME_FRONTEND]

MAX_TEXT_CHARS = 5_000
MIN_TEXT_CHARS = 30
MAX_ENTITY_TYPES = 12
ALLOWED_LABEL_PATTERN = re.compile(r"^[A-Za-z0-9_\-\s]{1,64}$")
ALLOWED_FRONTEND_URLS = ["http://localhost:80", "http://localhost:8080", "http://gliner-medical.switzerlandnorth.cloudapp.azure.com"]