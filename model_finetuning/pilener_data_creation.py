import json 
import random

with open("../data/pilener_data.json", "r", encoding="utf-8") as file:
    pilener_data = json.load(file)

data_size = 100

random.shuffle(pilener_data)
pilener_data = pilener_data[:data_size]

def get_entity_types(dataset):
    entity_types = []
    for output in dataset:
        for entity_list in output.get('ner', []):
            # safety check
            if len(entity_list) > 2:
                entity_types.append(entity_list[2])
    return entity_types

entity_types = list(set(get_entity_types(pilener_data)))

with open("../data/pilener_unlimited_labels/test_100.json", "w", encoding="utf-8") as file:
    json.dump(pilener_data, file, ensure_ascii=False)

with open("../data/pilener_unlimited_labels/test_entity_types_100.json", "w", encoding="utf-8") as file:
    json.dump(entity_types, file, ensure_ascii=False)