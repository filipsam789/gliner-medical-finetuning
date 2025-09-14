
def create_prompt(text):
    prompt = """**Objective:**
    You are given a text passage. Extract named entities AND generate plausible hard negative entities for entity types found in the text.

    **Format Requirements:**
    - The output should be formatted in JSON, containing both positive and negative entities.
    - Each positive entity should be accurately marked in the 'entities' list.
    - Each negative entity should be included in the 'negative_entities' list.

    **Entity Annotation Details:**
    - All entity types must be in lowercase.
    - Entity types can be multiwords separated by space.
    - Entities might belong to multiple entity types depending on the context.
    - Negative entities should be assigned **incorrect but plausible types**.
    - These incorrect types should be semantically similar to the correct type to create hard negatives.
    - Only use types that appear somewhere in the text for both positive and negative entities.
    - Each negative entity should be assigned an entity type that is **different** from its positive counterpart’s type(s).
    - Negative entities should be actual entities in the text. Do not generate negative entities which are not present in the text.

    **Please follow this output schema:**

    <start>
    {
      "entities": [
        {"entity": "entity name", "types": ["type 1", "type 2", ...]},
        {"entity": "entity name2", "types": ["type 2", "type 3", ...]},
        ...
      ],
      "negative_entities": [
        {"entity": "negative entity", "types": ["type 1", "type 2", ...]},
        {"entity": "negative entity2", "types": ["type 2", "type 3", ...]},
        ...
      ]
    }
    <end>
    """

    prompt += '**In your answer include the output schema only. Do not add any additional examples, notes or explanations.**\n'
    prompt += f'**The text passage is: "{text}"**'

    return prompt