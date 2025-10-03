import asyncio
import time
from typing import List, Dict, Any
from dataclasses import dataclass
import os
import json
import re
from google import genai
from google.genai import types
import constants
from gliner.data_processing import WordsSplitter

@dataclass
class EntityResult:
    text: str
    label: str
    start: int
    end: int
    score: float
 
class RateLimiter:
    def __init__(self, max_requests: int = 15, time_window: int = 60):
        self.max_requests = max_requests
        self.time_window = time_window
        self.requests = []
   
    async def acquire(self):
        now = time.time()
        self.requests = [req_time for req_time in self.requests if now - req_time < self.time_window]
       
        if len(self.requests) >= self.max_requests:
            wait_time = self.time_window - (now - self.requests[0]) + 1
            await asyncio.sleep(wait_time)
            now = time.time()
            self.requests = [req_time for req_time in self.requests if now - req_time < self.time_window]
       
        self.requests.append(now)
 
class GeminiClient:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
       
        self.client = genai.Client(api_key=self.api_key)
        self.rate_limiter = RateLimiter(max_requests=15, time_window=60)
        self.words_splitter = WordsSplitter("whitespace")
   
    def _create_ner_prompt(self, text: str, entity_types: List[str], threshold: float = 0.5, multi_label: bool = False) -> str:
        """Create a prompt for named entity recognition using Gemini."""
        entity_types_str = ", ".join(entity_types)
       
        threshold_instruction = f"Only return entities with a confidence score of {threshold} or higher."
       
        multi_label_instruction = ""
        if multi_label:
            multi_label_instruction = "Assign multiple labels to an entity if it fits multiple entity types - create separate entries for each label."
        else:
            multi_label_instruction = "Assign only one label per entity - choose the most appropriate single entity type."
       
        prompt = f"""You are a medical named entity recognition expert. Extract the following entity types from the given text: {entity_types_str}.
  
  Text: "{text}"
  
  Please identify and extract all entities of the specified types. For each entity, provide:
  1. The exact text of the entity
  2. The entity type (one of: {entity_types_str})
  3. The start and end character positions in the text
  4. A confidence score between 0 and 1 for the classification of the entity
  
  {threshold_instruction}
  
  {multi_label_instruction}
  
  IMPORTANT: Do not return entities that are parts of other entities at the same position. If you find overlapping entities, only return the longest/most complete one. For example, if you find both "Cristiano Ronaldo dos Santos Aveiro" and "Cristiano Ronaldo" at the same starting position, only return the longer, more complete entity.
  
  Format your response as a JSON array where each entity is an object with:
  - "text": the entity text
  - "label": the entity type
  - "start": start position (one-based index)
  - "end": end position (one-based index)
  - "score": confidence score
  
  Example format:
  [
    {{"text": "John Smith", "label": "PERSON", "start": 0, "end": 10, "score": 0.95}},
    {{"text": "New York", "label": "LOCATION", "start": 15, "end": 23, "score": 0.88}}
  ]
  
  Only return the JSON array, no additional text."""
        print(f"Prompt: {prompt}")
        return prompt
   
    def _parse_gemini_response(self, response_text: str) -> List[EntityResult]:
        """Parse Gemini's response and extract entities."""
        print(f"Response Text: {response_text}")
        try:
            response_text = response_text.replace("```json", "").replace("```", "").strip()
           
            json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
            if not json_match:
                return []
           
            entities_data = json.loads(json_match.group())
            entities = []
           
            for entity_data in entities_data:
                if all(key in entity_data for key in ['text', 'label', 'start', 'end', 'score']):
                    print(f"Confidence Score:{entity_data['score']}")
                    entities.append(EntityResult(
                        text=entity_data['text'],
                        label=entity_data['label'],
                        start=entity_data['start'],
                        end=entity_data['end'],
                        score=entity_data['score']
                    ))
           
            return entities
           
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            print(f"Error parsing Gemini response: {e}")
            return []
   
    def _fix_entity_positions(self, entities: List[EntityResult], input_text: str) -> List[EntityResult]:
        """Fix entity positions by finding correct character indices in the input text."""
        processed_entities = []
        used_positions = set()
       
        start_pos = 0
        for i, entity in enumerate(entities):
            next_entity = entities[i+1] if i+1 < len(entities) else None

            entity_text = entity.text
            entity_label = entity.label
           
            while True:
                found_index = input_text.find(entity_text, start_pos)
                if found_index == -1:
                    break
               
                start_idx = found_index + 1
                end_idx = found_index + len(entity_text)

                position_key = f"{entity_text}|{entity_label}|{start_idx}|{end_idx}"
                
                if position_key not in used_positions:
                    if next_entity is not None and next_entity.text != entity_text:
                        start_pos = found_index + 1

                    used_positions.add(position_key)
                    processed_entities.append(EntityResult(
                        text=entity_text,
                        label=entity_label,
                        start=start_idx,
                        end=end_idx,
                        score=entity.score
                    ))
                    break
                    
        return processed_entities
   
    async def predict_entities(self, text: str, entity_types: List[str], threshold: float = 0.5, multi_label: bool = False) -> List[Dict[str, Any]]:
        """Predict entities using Gemini 2.5 Flash Lite with rate limiting."""
        await self.rate_limiter.acquire()
       
        try:
            prompt = self._create_ner_prompt(text, entity_types, threshold, multi_label)
           
            response = self.client.models.generate_content(
                model="gemini-2.5-flash-lite",
                contents=prompt,
                config=types.GenerateContentConfig(
                    thinking_config=types.ThinkingConfig(thinking_budget=0)
                ),
            )
           
            entities = self._parse_gemini_response(response.text)
           
            # Fix entity positions using the input text
            corrected_entities = self._fix_entity_positions(entities, text)
           
            filtered_entities = []
            for entity in corrected_entities:
                if entity.score >= threshold:
                    filtered_entities.append({
                        "text": entity.text,
                        "label": entity.label,
                        "start": entity.start,
                        "end": entity.end,
                        "score": entity.score
                    })
           
            return filtered_entities
           
        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            return []
 
gemini_client = None
 
def get_gemini_client() -> GeminiClient:
    global gemini_client
    if gemini_client is None:
        gemini_client = GeminiClient()
    return gemini_client
 