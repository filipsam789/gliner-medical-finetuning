# To be included in Dockerfile once we have the fine-tuned model uploaded on HF

from huggingface_hub import snapshot_download

hf_username = os.getenv("HF_USERNAME")
hf_finetuned_model_repo = os.getenv("HF_FINETUNED_MODEL_REPO")
repo_id = f"{hf_username}/{hf_finetuned_model_repo}"
snapshot_download(repo_id=repo_id, local_dir="model_finetuning", local_dir_use_symlinks=False)
