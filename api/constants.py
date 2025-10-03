import re
import os

DEFAULT_MODEL_NAME = "urchade/gliner_small"
DEFAULT_MODEL_NAME_FRONTEND = "regular-gliner"

FINETUNED_MODEL_NAME = "finetuned_gliner_model_NCELoss"
FINETUNED_MODEL_NAME_FRONTEND = "contrastive-gliner"

GEMINI_MODEL_NAME_FRONTEND = "gemini-2.5-flash-lite"
ALLOWED_MODELS = [DEFAULT_MODEL_NAME_FRONTEND, FINETUNED_MODEL_NAME_FRONTEND, GEMINI_MODEL_NAME_FRONTEND]

MAX_TEXT_CHARS = 5_000
MIN_TEXT_CHARS = 30
MAX_ENTITY_TYPES = 12
ALLOWED_LABEL_PATTERN = re.compile(r"^[A-Za-z0-9_\-\s]{1,64}$")
ALLOWED_FRONTEND_URLS = ["http://localhost:80", "http://localhost:8080", "http://gliner-medical.switzerlandnorth.cloudapp.azure.com"]

EXPERIMENT_IMAGE_URLS = [
	"https://plus.unsplash.com/premium_photo-1681995460558-738a8856313c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
	"https://images.unsplash.com/photo-1624957485502-cd76eb9ac7fe?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
	"https://plus.unsplash.com/premium_photo-1681995751324-462c07cf331d?q=80&w=1176&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
	"https://images.unsplash.com/photo-1625750998899-61a72bc58c80?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
	"https://plus.unsplash.com/premium_photo-1668605108578-2bcc8882817d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
	"https://images.unsplash.com/photo-1580281657529-557a6abb6387?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
]

DOCUMENT_IMAGE_URLS = [
    "https://plus.unsplash.com/premium_photo-1673953510197-0950d951c6d9?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1664902276790-90624a60ff47?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1666886573215-b59d8ad9970c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=1528&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1681911046068-79bd605f8663?q=80&w=1121&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
]