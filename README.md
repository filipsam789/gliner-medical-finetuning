# MedLexica — fine-tuned GLiNER for medical NER

Zero-shot named-entity recognition for medical text, built as a joint project
behind two companion BSc theses at FCSE Skopje (October 2025, mentor
Prof. Dr. Gjorgji Madjarov):

- Filip Samardjiski — *Fine-tuning GLiNER for named entity recognition through
  synthetic data and contrastive learning* (the model)
- Tamara Stojanova — *Development and implementation of a system for named
  entity recognition in medical texts* (the application)

The repository holds both halves:

1. **Research** — fine-tuning [GLiNER](https://github.com/urchade/GLiNER)
   (`urchade/gliner_small`, DeBERTa-v3-small backbone) on LLM-generated medical
   data, with an added InfoNCE contrastive loss over hard-negative spans.
2. **MedLexica** — a web application that serves the base model, the
   fine-tuned model and Gemini side by side, so entity extraction can be run
   and compared on single texts or on whole document sets.

## Repository layout

| Path | What it holds |
|------|---------------|
| `data_generation/` | Synthetic dataset generation: Gemini annotates raw medical texts with entities **and** hard negatives |
| `data/`, `new_data/` | Raw texts, LLM outputs and the processed, GLiNER-ready training sets |
| `model_finetuning/` | `ContrastiveGLiNER`, the InfoNCE loss, the contrastive data collator, and the two training notebooks |
| `api/` | FastAPI backend: inference, experiments, usage limits, subscriptions |
| `frontend/` | React + TypeScript (Vite, MUI) single-page app |
| `postgres-init/`, `mongo-init/` | Database bootstrap scripts run by the containers on first start |
| `docker-compose.yml` | The full stack: backend, frontend, PostgreSQL, Keycloak, MongoDB |
| `.github/workflows/cicd.yml` | Build, push to Docker Hub, deploy to the Azure VM |

## Research

### Synthetic data

`data_generation/artificial_dataset_generation.py` splits the source passages
into chunks of 500 and sends each chunk to `gemini-2.5-flash-lite` in parallel,
one API key per chunk, throttled to stay inside the free tier. The medical set
was generated from the answer passages of MedQuAD (the commented-out
`load_dataset` line). The script now points at raw PileNER text
(`data/raw_pilener_texts.json`), which produced the general-domain set in
`new_data/pilener_contrastive_*`. The prompt (`prompt_generation.py`) asks for:

- **entities** — every named entity with one or more lowercase types, and
- **negative entities** — real spans from the same text labelled with a
  *wrong but plausible* type that is semantically close to the right one.

`data_processing.py` tokenizes the output with GLiNER's tokenizer and maps both
lists onto token spans (`ner` and `negative_ner`), and drops samples with no
entities. Of 3,000 generated medical samples, 2,810 remain
(`new_data/processed_output.json`), averaging ~250 tokens, ~15 entities and
~8 hard negatives each, over ~500 distinct entity types.

### Models

| Notebook | Model | Training data |
|----------|-------|---------------|
| `finetuning_GLiNER_base.ipynb` | GLiNER fine-tuned with its standard span loss | medical synthetic set, 90/10 split |
| `finetuning_GLiNER_NCELoss.ipynb` | `ContrastiveGLiNER`, standard loss + α·InfoNCE (α = 0.1, τ = 0.1) | 2,250 medical samples interleaved batch-by-batch with 4,500 general PileNER samples, 80/10/10 split |

`ContrastiveGLiNER` (`model_finetuning/model.py`) reproduces GLiNER's forward
pass to get the span representations, then runs the negative spans through the
same encoder. `InfoNCELoss` mean-pools each span, normalizes it, and pulls the
anchor towards its positive span while pushing it away from the hard negatives.
Mixing in PileNER keeps the model from forgetting general-domain entities.

The notebooks hold the training code with α = 0.1 and τ = 0.1 as defaults. The
thesis experiments swept those values (see *Results*) on two NVIDIA RTX 3090s,
tracked in Weights & Biases. The contrastive model the app serves is published
on Hugging Face as `tamarastojanova2002/gliner_finetuned`.

### Results

All results are micro-averaged, entity-level F1 (boundaries and type must both
match) on a held-out test split (70/10/20, seed 42). The baseline is
`gliner-small-v2.1`.

| Setup | Baseline F1 | Fine-tuned F1 | Contrastive F1 |
|-------|-------------|---------------|----------------|
| 500 samples, all entity types | 0.348 | 0.469 | 0.491 |
| 2,500 samples, all entity types | 0.038 | 0.225 | 0.227 |
| 2,500 samples, 70 most frequent types, α = 0.4 | 0.252 | 0.465 | 0.466 |
| same, τ = 0.2, mean pooling (best) | 0.252 | 0.465 | **0.471** |

- **Fine-tuning is what matters.** It lifts F1 by 35–543 % over the baseline,
  depending on dataset size, with fewer than 3,000 synthetic samples.
- **Contrastive learning adds a little.** It averages about +1 % F1 over plain
  fine-tuning, with a best of +1.34 % (τ = 0.2, mean pooling, α = 0.4), and
  hurts at some mid-sized datasets (1,000 and 1,500 samples).
- **Pooling trades precision for recall.** Mean pooling favours recall; max
  pooling favours precision at low temperatures.
- **Forgetting is small.** On general-domain PileNER, plain fine-tuning
  improves F1 by 4 %. The contrastive model at α = 0.4 drops 2.6–3.2 % against
  plain fine-tuning; at α = 0.8 it gains 5 %.

## MedLexica — the application

### Features

- **Entity extraction** on a pasted text (30–5,000 characters, up to 12 entity
  types), with a threshold and optional multi-label output, against one of
  three models: `regular-gliner` (base), `contrastive-gliner` (fine-tuned) or
  `gemini-2.5-flash-lite`.
- **Experiments** (premium) — group documents, run any model over all of them,
  keep every run and its results, and compare entity summaries across runs.
- **Plans** — free users get 5 extractions a day; premium removes the limit.
  Billing goes through Stripe Checkout, the customer portal and webhooks.
- **Opt-in training data** — users can allow a submitted text to be stored
  (de-duplicated by SHA-256) for future training.

### Architecture

```
React SPA ──► FastAPI ──► GLiNER models (loaded once, cached in memory)
   │             ├──────► Gemini API
   │             ├──────► PostgreSQL  experiments, documents, runs, daily usage, subscriptions
   │             ├──────► MongoDB     run results, opted-in training texts
   │             └──────► Stripe
   └──── Keycloak (OIDC login; realm roles regular_user / premium_user)
```

Keycloak stores its own data in the same PostgreSQL instance. The backend
reads the user and their role from the Keycloak JWT on every request, and
grants `premium_user` through the Keycloak admin API once a subscription is
paid.

### API

| Method | Path | Notes |
|--------|------|-------|
| `POST` | `/predict_entities` | Daily limit for non-premium users |
| `GET` | `/get_user`, `/usage-status`, `/subscription-status` | |
| `GET` `POST` `DELETE` | `/experiments`, `/experiments/{id}` | Premium |
| `GET` `POST` | `/experiments/{id}/documents`, `/documents/{id}` | Premium |
| `GET` `POST` | `/experiments/{id}/runs`, `/experiment-runs/{id}/results` | Premium |
| `POST` | `/create-checkout-session`, `/create-portal-session`, `/webhook` | Stripe |
| `GET` | `/` | Health check |

FastAPI serves interactive documentation at `/docs`.

## Running locally

Requirements: Docker with Compose, and a `.env` file in the repository root.

```env
# PostgreSQL (shared by the backend and Keycloak)
POSTGRES_DEFAULT_DB=
POSTGRES_USER=
POSTGRES_PASSWORD=

# MongoDB
MONGO_URL=mongodb://mongo:27017
MONGO_DB_NAME=gliner_training
MONGO_COLLECTION_NAME=ClientTexts

# Keycloak
KEYCLOAK_ADMIN_USER=
KEYCLOAK_ADMIN_PASSWORD=
KEYCLOAK_SERVER_URL=http://keycloak:8080
KEYCLOAK_REALM=

# Frontend build
VITE_API_URL=http://localhost:8000
VITE_KEYCLOAK_URL=http://localhost:8090
VITE_KEYCLOAK_REALM=
VITE_KEYCLOAK_CLIENT_ID=

PYTHONUNBUFFERED=1
```

The backend also reads `GEMINI_API_KEY`, `STRIPE_SECRET_KEY`,
`STRIPE_PREMIUM_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`, `FRONTEND_URL` and
`KEYCLOAK_CLIENT_ID`, plus the Keycloak admin credentials it uses to assign
roles. `docker-compose.yml` does not pass these to the `backend` service yet,
so add them under its `environment:` before relying on Gemini, billing or
upgrades. Then:

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:8080 |
| Backend | http://localhost:8000 (docs at `/docs`) |
| Keycloak admin console | http://localhost:8090 |

On first start, create the realm, the frontend client and the `regular_user` /
`premium_user` realm roles in Keycloak. The first request to a GLiNER model
downloads it from Hugging Face.

To rerun the research, install `requirements.txt` and open the notebooks in
`model_finetuning/`; they expect a CUDA GPU.

## Deployment

Every push to `main` runs `.github/workflows/cicd.yml`:

1. builds the backend and frontend images and pushes them to Docker Hub as
   `gliner-backend:latest` and `gliner-frontend:latest`;
2. connects to the Azure VM over SSH and runs `docker compose pull` and
   `docker compose up -d` there.

The VM is an Azure Standard B2s (Ubuntu 24.04, Switzerland North). Nginx in
front of the containers routes the frontend, the API and Keycloak (under
`/keycloak`) on one host, terminates HTTPS with Let's Encrypt (Certbot)
certificates, and exposes the Stripe webhook. Its configuration lives on the
VM, not in this repository. Stripe still runs in test mode.

The workflow needs these GitHub secrets: `DOCKERHUB_USERNAME`,
`DOCKERHUB_TOKEN`, `VM_SSH_KEY`, `VM_IP`, `VM_USER`, and the `VITE_*` build
values listed above plus `VITE_APP_REDIRECT_URL`.
