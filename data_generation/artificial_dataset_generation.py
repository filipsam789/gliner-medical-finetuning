from prompt_generation import *
from data_processing import *
from helper_functions import *
from datasets import load_dataset
from concurrent.futures import ThreadPoolExecutor, as_completed
import json
import math

def generate_from_prompts(prompts, client, data):
    outputs = generate(prompts, client, data)

    json_outputs = []

    for output in outputs:
        try:
            js = json.loads(output.strip())
        except:
            print(f"Problematic json: {output}\n")
            continue

        json_outputs.append(js)

    return outputs, json_outputs, extract_entities_with_negatives(json_outputs)

medical_data = load_dataset("Amirkid/MedQuad-dataset", download_mode="force_redownload")
train_dataset = medical_data['train']

# Eliminate questions from the dataset
data = [train_dataset[i]['text'] for i in range(len(train_dataset)) if i % 2 == 1]

api_keys = ['APIKey1', 'APIKey2', 'APIKey3', 'APIKey4', 'APIKey5', 'APIKey6']
chunk_size = 500
desired_dataset_size = 3000
num_chunks = math.ceil(desired_dataset_size / chunk_size)

processed_output_merged = []
json_outputs_merged = []

# Generate 500 samples per API key to prevent exceeding limits of free usage
results = []

with ThreadPoolExecutor(max_workers=min(len(api_keys), num_chunks)) as executor:
    futures = []
    for i in range(num_chunks):
        future = executor.submit(process_chunk, i, api_keys[i], data, chunk_size)
        futures.append(future)
    
    # Collect results as they complete
    for future in as_completed(futures):
        outputs, json_outputs = future.result()

        # Merge data chunks into one array
        processed_output_merged.extend(outputs)
        json_outputs_merged.extend(json_outputs)
        
# Save merged output
save_json(processed_output_merged, "../new_data/processed_output.json")
save_json(json_outputs_merged, "../new_data/json_outputs.json")


