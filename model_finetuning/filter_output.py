import json
from collections import Counter

import matplotlib.pyplot as plt

def load_data_and_get_entity_types(path):
    with open(path, "r", encoding="utf-8") as file:
        processed_medical_data = json.load(file)

    all_entity_types = []
    for output in processed_medical_data:
        for entity_list in output.get('ner', []):
            # safety check
            if len(entity_list) > 2:
                all_entity_types.append(entity_list[2])
    return all_entity_types


def plot_entity_type_histogram(entity_types, top_n=30, figsize=(10, 6), log_scale=False):
    """
    entity_types: list of entity type labels (strings), possibly many repeats
    top_n: number of most frequent types to display
    figsize: size of the figure
    log_scale: whether to plot y-axis in log scale
    """
    counter = Counter(entity_types)
    most_common = counter.most_common(top_n)  # list of (entity_type, count)

    types, counts = zip(*most_common)

    plt.figure(figsize=figsize)
    bars = plt.bar(types, counts, color="skyblue", edgecolor="black")
    plt.xticks(rotation=45, ha="right", fontsize=10)
    plt.ylabel("Count (occurrences)")
    plt.xlabel("Entity Type")
    plt.title(f"Top {top_n} Entity Type Occurrences")

    if log_scale:
        plt.yscale("log")
        plt.ylabel("Count (log scale)")

    for bar, count in zip(bars, counts):
        height = bar.get_height()
        plt.annotate(f"{count}", 
                     xy=(bar.get_x() + bar.get_width() / 2, height),
                     xytext=(0, 3),
                     textcoords="offset points",
                     ha="center", va="bottom",
                     fontsize=8)

    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    data_path = "data/pilener_data.json"
    entity_list = load_data_and_get_entity_types(data_path)

    unique = set(entity_list)
    print(f"Total unique entity types: {len(unique)}")
    print("Some sample entity types:")
    for t in list(unique)[:20]:
        print("  ", t)

    plot_entity_type_histogram(entity_list, top_n=30, log_scale=False)
