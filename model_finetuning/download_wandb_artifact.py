import wandb
import os

run = wandb.init(project=os.environ.get("WANDB_PROJECT", "gliner-training-base"))
artifact = run.use_artifact("faculty-of-computer-science-and-engineering/gliner-training-base/model-h7lg0uh7:v3", type="model")
artifact_dir = artifact.download()

print("Artifact downloaded to:", artifact_dir)
