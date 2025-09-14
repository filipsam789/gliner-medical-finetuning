from prompt_generation import *
from data_processing import *
from helper_functions import *
from datasets import load_dataset
from google import genai
import os
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
for i in range(num_chunks):
    os.environ['GEMINI_API_KEY'] = api_keys[i]
    client = genai.Client()

    # Create prompts for the suitable 500 passages
    all_prompts = []
    for j in range(i * chunk_size, (i + 1) * chunk_size):
        prompt = create_prompt(data[j])
        all_prompts.append(prompt)

    outputs, json_outputs, processed_output = generate_from_prompts(all_prompts, client, data[(i * num_chunks) : ((i + 1) * num_chunks)])
    print(outputs)
    print(json_outputs)
    print(processed_output)

    # Save all formats of the responses to files
    save_json(outputs, f".\data_chunks\outputs{i}.json", pretty=True) # Raw
    save_json(json_outputs, f".\data_chunks\json_outputs{i}.json", pretty=True) # Converted to json
    save_json(processed_output, f".\data_chunks\processed_output{i}.json", pretty=False) # Processed into specific GLiNER format

    # Merge data chunks into one array
    processed_output_merged.extend(outputs)
    processed_output_merged.extend(json_outputs)

# Save merged output
save_json(processed_output_merged, "../data/processed_output.json")
save_json(json_outputs_merged, "../data/json_outputs.json")


