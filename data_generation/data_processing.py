import json
import re
import time
from google.genai import types
from google import genai
import os

from helper_functions import save_json
from prompt_generation import create_prompt


def generate(prompts, client, data):
  responses = []

  for i, prompt in enumerate(prompts):
    if i > 0 and i % 15 == 0:
        time.sleep(60) # Sleep for one minute after sending 15 request to prevent exceeding limits of free usage

    generated_text = None

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt,
            config=types.GenerateContentConfig(
                thinking_config=types.ThinkingConfig(thinking_budget=0)
            ),
        )
        generated_text = response.text
    except Exception as e:
        print("An error occurred:", e)
        continue

    print(generated_text)
    if generated_text is None:
        continue

    generated_text = process_response(generated_text, data[i])
    responses.append(generated_text)

  return responses


def tokenize_text(tokenizer, text):
    encoding = tokenizer(
        text,
        add_special_tokens=False,
        return_attention_mask=False,
        return_offsets_mapping=False,
        truncation=True,
    )
    try:
        tokens = encoding.tokens()
    except:
        tokens = tokenizer.tokenize(text)
    stripped_tokens = [tok.lstrip("▁") for tok in tokens]
    return stripped_tokens


def process_response(response, text_content):
    response = response.replace("```json", "").replace("```", "").strip()
    match = re.search(r"<start>(.*?)<end>", response, re.DOTALL)
    if match:
        response = match.group(1).strip()

    try:
        json_data = json.loads(response)
        json_data = {
            "text": text_content,
            "entities": json_data.get("entities", []),
            "negative_entities": json_data.get("negative_entities", [])
        }
        json_data_dumped = json.dumps(json_data)
        return json_data_dumped

    except json.JSONDecodeError as e:
        print("Error parsing JSON from response:", e)
        return None


def extract_entities_with_negatives(tokenizer, data):
    all_examples = []

    for i, dt in enumerate(data):
        try:
            tokens = tokenize_text(tokenizer, dt['text'])
            positive_ents = [(k["entity"], k["types"]) for k in dt['entities']]
            negative_ents = [(k["entity"], k["types"]) for k in dt.get('negative_entities', [])]
        except:
            print(f"Problematic nested json: {i}, {dt}\n")
            continue

        positive_spans = []
        for entity in positive_ents:
            entity_tokens = tokenize_text(tokenizer, str(entity[0]))
            for j in range(len(tokens) - len(entity_tokens) + 1):
                if " ".join(tokens[j:j + len(entity_tokens)]).lower() == " ".join(entity_tokens).lower():
                    for el in entity[1]:
                        positive_spans.append((j, j + len(entity_tokens) - 1, el.lower().replace('_', ' ')))

        negative_spans = []
        for entity in negative_ents:
            entity_tokens = tokenize_text(tokenizer, str(entity[0]))
            for j in range(len(tokens) - len(entity_tokens) + 1):
                if " ".join(tokens[j:j + len(entity_tokens)]).lower() == " ".join(entity_tokens).lower():
                    for el in entity[1]:
                        negative_spans.append((j, j + len(entity_tokens) - 1, el.lower().replace('_', ' ')))

        all_examples.append({
            "tokenized_text": tokens,
            "ner": positive_spans,
            "negative_ner": negative_spans
        })

    return all_examples


def process_chunk(i, api_key, data, chunk_size, tokenizer):
    os.environ['GEMINI_API_KEY'] = api_key
    client = genai.Client()

    # Create prompts for the suitable 500 passages
    all_prompts = []
    for j in range(i * chunk_size, (i + 1) * chunk_size):
        prompt = create_prompt(data[j])
        all_prompts.append(prompt)

    outputs, json_outputs, processed_output = generate_from_prompts(all_prompts, client, data[(i * chunk_size) : ((i + 1) * chunk_size)], tokenizer)
    
    # Save all formats of the responses to files
    save_json(outputs, f"outputs{i}.json", pretty=True) # Raw
    save_json(json_outputs, f"json_outputs{i}.json", pretty=True) # Converted to json
    save_json(processed_output, f"processed_output{i}.json", pretty=False) # Processed into specific GLiNER format
        
    return outputs, json_outputs

def generate_from_prompts(prompts, client, data, tokenizer):
    outputs = generate(prompts, client, data)

    json_outputs = []

    for output in outputs:
        try:
            js = json.loads(output.strip())
        except:
            print(f"Problematic json: {output}\n")
            continue

        json_outputs.append(js)

    return outputs, json_outputs, extract_entities_with_negatives(tokenizer, json_outputs)