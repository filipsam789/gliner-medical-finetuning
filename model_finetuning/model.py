from gliner import GLiNER
from .info_nce_loss import InfoNCELoss

class ContrastiveGLiNER(GLiNER):
    # Extends GLiNER to include contrastive learning with InfoNCE loss

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._span_rep = None  # Placeholder to store span representations

        # Register the forward hook on the span_rep_layer function used in the forward method to capture span representations
        self.model.span_rep_layer.register_forward_hook(self._save_span_rep_hook)
        self.infonce_loss = InfoNCELoss(temperature=0.1)

    def _save_span_rep_hook(self, module, input, output):
        # Save the output tensor of span_rep_layer (span_rep) for later use
        self._span_rep = output

    def forward(self, input_ids, token_type_ids, attention_mask, words_mask, labels, span_idx, span_mask,
                text_lengths, negative_input_ids = None, negative_token_type_ids = None, negative_attention_mask = None,
                negative_words_mask = None, negative_labels = None, negative_span_idx = None, negative_span_mask = None,
                negative_text_lengths = None, alpha=1e-1, # alpha is the weight for contrastive loss
                *args, **kwargs):

        # Reset span representation before each forward pass
        self._span_rep = None

        # Standard forward pass to compute original loss
        outputs = super().forward(
            input_ids=input_ids,
            token_type_ids=token_type_ids,
            attention_mask=attention_mask,
            words_mask=words_mask,
            labels=labels,
            span_idx=span_idx,
            span_mask=span_mask,
            text_lengths=text_lengths,
            *args, **kwargs
        )
        original_loss = outputs.loss

        # If batch doesn't contain negative entities
        if negative_input_ids is None:
          return outputs

        # Extract span embeddings for contrastive learning
        try:
            # Get anchor span embeddings (from standard forward pass used for original loss)
            anchor_span_embeddings = self._span_rep
            
            # Reset span representation after each forward pass
            self._span_rep = None

            # Get words embedding and mask for positive samples
            _, _, positive_words_embedding, positive_mask = \
            self.model.get_representations(
                input_ids, attention_mask, None, None, None, text_lengths, words_mask
            )

            # Get positive span embeddings using implementation from GLiNER's forward method
            positive_target_W = span_idx.size(1) // self.config.max_width
            positive_words_embedding, positive_mask = self.model._fit_length(positive_words_embedding, positive_mask, positive_target_W)
            span_idx = span_idx * span_mask.unsqueeze(-1)
            pos_span_embeddings = self.model.span_rep_layer(positive_words_embedding, span_idx)

            # Get words embedding and mask for negative samples
            _, _, negative_words_embedding, negative_mask = \
            self.model.get_representations(
                negative_input_ids, negative_attention_mask, None, None, None, negative_text_lengths, negative_words_mask
            )

            # Get negative span embeddings using implementation from GLiNER's forward method
            negative_target_W = negative_span_idx.size(1) // self.config.max_width
            negative_words_embedding, negative_mask = self.model._fit_length(negative_words_embedding, negative_mask, negative_target_W)
            negative_span_idx = negative_span_idx * negative_span_mask.unsqueeze(-1)
            neg_span_embeddings = self.model.span_rep_layer(negative_words_embedding, negative_span_idx)

            # Compute contrastive loss
            contrastive_loss = self.infonce_loss(anchor_span_embeddings, pos_span_embeddings, neg_span_embeddings)

            # Calculate total loss
            total_loss = original_loss + alpha * contrastive_loss

            outputs.loss = total_loss

        except Exception as e:
            print(f"Contrastive learning failed: {e}")
            pass

        return outputs

    @classmethod
    def from_pretrained(cls, pretrained_model_name_or_path, **kwargs):
        model = super().from_pretrained(pretrained_model_name_or_path, **kwargs)
        return model
