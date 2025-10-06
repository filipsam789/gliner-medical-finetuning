import json
import os
import re
from gliner import GLiNER

# use finetuned_gliner_model_NCELoss when executing from terminal
# use model_finetuning/finetuned_gliner_model_NCELoss when executing from vscode

trained_model = GLiNER.from_pretrained("urchade/gliner_small-v2.1")

with open("../new_data/non70/test_processed_outputs_non70_1000_steps.json", "r", encoding="utf-8") as file:
    processed_output = json.load(file)

with open("../new_data/non70/test_entity_types_non70_1000_steps.json", "r", encoding="utf-8") as file:
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