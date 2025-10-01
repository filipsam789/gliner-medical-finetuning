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
    
    def _create_ner_prompt(self, text: str, entity_types: List[str]) -> str:
        """Create a prompt for named entity recognition using Gemini."""
        entity_types_str = ", ".join(entity_types)
        
        prompt = f"""You are a medical named entity recognition expert. Extract the following entity types from the given text: {entity_types_str}.

Text: "{text}"

Please identify and extract all entities of the specified types. For each entity, provide:
1. The exact text of the entity
2. The entity type (one of: {entity_types_str})
3. The start and end character positions in the text
4. A confidence score between 0 and 1 for the classification of the entity

Format your response as a JSON array where each entity is an object with:
- "text": the entity text
- "label": the entity type
- "start": start position (one-based index)
- "end": end position (one-based index)
- "score": confidence score

You can classify one entity into multiple types, but make sure to put them as separate objects in the JSON array.

Example format:
[
  {{"text": "John Smith", "label": "PERSON", "start": 0, "end": 10, "score": 0.95}},
  {{"text": "New York", "label": "LOCATION", "start": 15, "end": 23, "score": 0.88}}
]

Only return the JSON array, no additional text."""
        
        return prompt
    
    def _parse_gemini_response(self, response_text: str) -> List[EntityResult]:
        """Parse Gemini's response and extract entities."""
        try:
            response_text = response_text.replace("```json", "").replace("```", "").strip()
            
            json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
            if not json_match:
                return []
            
            entities_data = json.loads(json_match.group())
            entities = []
            
            for entity_data in entities_data:
                if all(key in entity_data for key in ['text', 'label', 'start', 'end', 'score']):
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
    
    async def predict_entities(self, text: str, entity_types: List[str], threshold: float = 0.5, multi_label: bool = False) -> List[Dict[str, Any]]:
        """Predict entities using Gemini 2.5 Flash Lite with rate limiting."""
        await self.rate_limiter.acquire()
        
        try:
            prompt = self._create_ner_prompt(text, entity_types)
            
            response = self.client.models.generate_content(
                model="gemini-2.5-flash-lite",
                contents=prompt,
                config=types.GenerateContentConfig(
                    thinking_config=types.ThinkingConfig(thinking_budget=0)
                ),
            )
            
            entities = self._parse_gemini_response(response.text)
            
            filtered_entities = []
            for entity in entities:
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
