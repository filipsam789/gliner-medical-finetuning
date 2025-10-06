# Adjust GLiNER model with contrastive learning (NCELoss)
from collections import Counter
import os
import json
import torch
import re
import wandb
from transformers import TrainerCallback
import random
import numpy as np

from gliner.training import Trainer, TrainingArguments
from gliner import GLiNER
from gliner.data_processing import DataCollator
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from data_generation.data_processing import extract_entities_with_negatives

os.environ["WANDB_PROJECT"] = "gliner-training-base"
os.environ["WANDB_RUN_GROUP"] = "exp-01"
os.environ["WANDB_LOG_MODEL"] = "checkpoint"

os.environ["TOKENIZERS_PARALLELISM"] = "true"
os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"

def setup_seed(seed):
    """Set random seed for reproducibility."""
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)

setup_seed(42)

class WandbLoggerCallback(TrainerCallback):
    def __init__(self, model, test_data, labels, batch_size):
        super().__init__()
        self.model = model
        self.test_data = test_data
        self.labels = labels
        self.batch_size = batch_size

    def on_epoch_begin(self, args, state, control, **kwargs):
        out, f1 = self.model.evaluate(
            self.test_data, batch_size=self.batch_size, entity_types=self.labels
        )
        match = re.findall(r"(\d+\.\d+)%", out)
        precision = float(match[0]) / 100
        recall = float(match[1]) / 100

        wandb.log({
            "eval/f1": f1,
            "eval/precision": precision,
            "eval/recall": recall,
            "step": state.global_step
        })

with open("../new_data/processed_output.json", "r", encoding="utf-8") as file:
    processed_output = json.load(file)

data_size = 1000
batch_size = 8

random.shuffle(processed_output)
processed_output = processed_output[:data_size]

print(f"Len medical: {len(processed_output)}")

gliner_model = GLiNER.from_pretrained("urchade/gliner_small-v2.1")

train_dataset = processed_output[:int(len(processed_output)*0.7)]
val_dataset = processed_output[int(len(processed_output)*0.7):int(len(processed_output)*0.8)]
test_dataset = processed_output[int(len(processed_output)*0.8):]

with open("../new_data/non70/train_processed_outputs_non70_1000_steps.json", "w", encoding="utf-8") as file:
    json.dump(train_dataset, file, ensure_ascii=False)

with open("../new_data/non70/val_processed_outputs_non70_1000_steps.json", "w", encoding="utf-8") as file:
    json.dump(val_dataset, file, ensure_ascii=False)

with open("../new_data/non70/test_processed_outputs_non70_1000_steps.json", "w", encoding="utf-8") as file:
    json.dump(test_dataset, file, ensure_ascii=False)

def get_entity_types(dataset):
    entity_types = []
    for output in dataset:
        for entity_list in output.get('ner', []):
            # safety check
            if len(entity_list) > 2:
                entity_types.append(entity_list[2])
    return entity_types

train_entity_types = list(set(get_entity_types(train_dataset)))
val_entity_types = list(set(get_entity_types(val_dataset)))
test_entity_types = list(set(get_entity_types(test_dataset)))

with open("../new_data/non70/train_entity_types_non70_1000_steps.json", "w", encoding="utf-8") as file:
    json.dump(train_entity_types, file, ensure_ascii=False)

with open("../new_data/non70/val_entity_types_non70_1000_steps.json", "w", encoding="utf-8") as file:
    json.dump(val_entity_types, file, ensure_ascii=False)

with open("../new_data/non70/test_entity_types_non70_1000_steps.json", "w", encoding="utf-8") as file:
    json.dump(test_entity_types, file, ensure_ascii=False)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

n_gpus = torch.cuda.device_count()
print(f"GPUs available: {n_gpus}")

gliner_model.to(device)

data_collator = DataCollator(gliner_model.config, data_processor=gliner_model.data_processor, prepare_labels=True)

num_steps = 18750
data_size = len(train_dataset)
print(f"Data size: {data_size}")
num_batches = data_size // batch_size
num_epochs = max(1, num_steps // num_batches)
print(f"Num epochs: {num_epochs}")

learning_rate = 5e-6

local_rank = int(os.environ.get("LOCAL_RANK", 0))

if local_rank == 0:
    wandb.init(
        project=os.environ.get("WANDB_PROJECT", "gliner-training-base"),
        config={"learning_rate": learning_rate, "batch_size": batch_size}
    )
else:
    wandb.init(mode="disabled")

training_args = TrainingArguments(
    output_dir="base_gliner_model",
    learning_rate=learning_rate,
    weight_decay=0.01,
    lr_scheduler_type="linear",
    warmup_ratio=0.1,
    others_lr=5e-5,
    others_weight_decay=0.01,
    gradient_accumulation_steps=4,
    per_device_train_batch_size=batch_size,
    per_device_eval_batch_size=batch_size,
    num_train_epochs=num_epochs,
    dataloader_num_workers=0,
    use_cpu=False,
    save_strategy="steps",
    eval_strategy="steps",
    eval_steps=100,
    save_steps=500,
    logging_steps=100,
    load_best_model_at_end=False,
    metric_for_best_model="eval_loss",
    greater_is_better=False,
    save_total_limit=None,
    ddp_find_unused_parameters=False,
    report_to="wandb",
)

trainer = Trainer(
    model=gliner_model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,
    tokenizer=gliner_model.data_processor.transformer_tokenizer,
    data_collator=data_collator,
    callbacks=[WandbLoggerCallback(gliner_model, val_dataset, val_entity_types, batch_size)])


trainer.train()
trainer.save_model("finetuned_gliner_model_non70_1000_steps")

print(f"Best checkpoint{trainer.state.best_model_checkpoint}")
if local_rank == 0:
    wandb.finish()
