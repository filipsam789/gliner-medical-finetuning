from gliner.data_processing.collator import DataCollator

class ContrastiveDataCollator(DataCollator):
    # Extends the DataCollator to handle both positive and negative entities
    
    # returns positive and negative input_ids, token_type_ids, attention_mask, words_mask, labels, span_idx, span_mask, text_lengths
    def __call__(self, features):
        # features is a list of dicts with keys: "tokenized_text", "ner", "negative_ner"

        # Positive entities batching
        batch = super().__call__(features)  # negative_ner is ignored in the super call.

        if "negative_ner" not in features[0]:
          return batch
          
        # Prepare features for negative batching
        negative_features = []
        for item in features:
            neg_item = dict(item)
            if "negative_ner" in neg_item:
                # Rename key so collator treats negatives as spans (negative_ner is ignored)
                neg_item["ner"] = neg_item["negative_ner"]
            else:
                neg_item["ner"] = []
            negative_features.append(neg_item)

        # Negative entities batching
        negative_batch = super().__call__(negative_features)

        # Add negative keys with 'negative_' prefix
        for key, value in negative_batch.items():
            batch["negative_" + key] = value

        # Return the combined batch
        return batch