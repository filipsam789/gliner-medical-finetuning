import json
import os
import re
from model import ContrastiveGLiNER

# use finetuned_gliner_model_NCELoss when executing from terminal
# use model_finetuning/finetuned_gliner_model_NCELoss when executing from vscode

trained_model = ContrastiveGLiNER.from_pretrained("finetuned_gliner_model_NCELoss", local_files_only=True)

with open("../new_data/test_processed_output.json", "r", encoding="utf-8") as file:
    processed_output = json.load(file)

with open("../new_data/top70_entity_types.json", "r", encoding="utf-8") as file:
    entity_types = json.load(file)

batch_size = 8
out, f1 = trained_model.evaluate(
   processed_output, batch_size=batch_size, entity_types=entity_types
)

match = re.findall(r"(\d+\.\d+)%", out)
precision = float(match[0]) / 100
recall = float(match[1]) / 100

print(f"F1: {f1}")
print(f"Precision: {precision}")
print(f"Recall: {recall}")