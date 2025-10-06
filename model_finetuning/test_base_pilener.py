from collections import Counter
from gliner import GLiNER
import json
import os
import re
import torch
# use finetuned_gliner_model_NCELoss when executing from terminal
# use model_finetuning/finetuned_gliner_model_NCELoss when executing from vscode

trained_model = GLiNER.from_pretrained("artifacts/model-h7lg0uh7:v3", local_files_only=True)
torch.manual_seed(42)

if torch.cuda.is_available():
    torch.cuda.manual_seed_all(42)
    
with open("../data/pilener_unlimited_labels/test_200.json", "r", encoding="utf-8") as file:
    processed_output = json.load(file)

with open("../data/pilener_unlimited_labels/test_entity_types_200.json", "r", encoding="utf-8") as file:
    entity_types = json.load(file)

print(f"Len data: {len(processed_output)}")
print(f"Len entity types: {len(entity_types)}")

batch_size = 4
out, f1 = trained_model.evaluate(
   processed_output, batch_size=batch_size, entity_types=entity_types
)

match = re.findall(r"(\d+\.\d+)%", out)
precision = float(match[0]) / 100
recall = float(match[1]) / 100

print(f"F1: {f1}")
print(f"Precision: {precision}")
print(f"Recall: {recall}")