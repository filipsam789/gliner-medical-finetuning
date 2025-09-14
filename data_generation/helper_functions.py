import json

def save_json(data, filename, pretty=True):
    """
    Save Python object as JSON file.

    Args:
        data (Any): The Python object to save
        filename (str): Path to the output file
        pretty (bool): If True, indent formatting is used
    """
    options = {
        "ensure_ascii": False
    }

    if pretty:
        options["indent"] = 2
    else:
        options["separators"] = (",", ":")

    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, **options)

    print(f"Data successfully written to {filename}")

def load_json(filename):
    """
    Load JSON data from a file.

    Args:
        filename (str): Path to the output file
    """
    with open(filename, "r", encoding="utf-8") as f:
        return json.load(f)