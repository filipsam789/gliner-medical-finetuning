from gliner import GLiNER
from .info_nce_loss import InfoNCELoss
from typing import Optional

import torch
import torch.nn.functional as F

from gliner.modeling.base import GLiNERModelOutput

class ContrastiveGLiNER(GLiNER):
    # Extends GLiNER to include contrastive learning with InfoNCE loss

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.infonce_loss = InfoNCELoss(temperature=0.1)

    def forward(self,
                input_ids: Optional[torch.FloatTensor] = None,
                attention_mask: Optional[torch.LongTensor] = None,
                decoder_input_ids: Optional[torch.FloatTensor] = None,
                decoder_attention_mask: Optional[torch.LongTensor] = None,
                decoder_labels_ids: Optional[torch.FloatTensor] = None,
                decoder_labels_mask: Optional[torch.LongTensor] = None,
                decoder_words_mask: Optional[torch.LongTensor] = None,
                labels_embeddings: Optional[torch.FloatTensor] = None,
                labels_input_ids: Optional[torch.FloatTensor] = None,
                labels_attention_mask: Optional[torch.LongTensor] = None,
                words_embedding: Optional[torch.FloatTensor] = None,
                mask: Optional[torch.LongTensor] = None,
                prompts_embedding: Optional[torch.FloatTensor] = None,
                prompts_embedding_mask: Optional[torch.LongTensor] = None,
                words_mask: Optional[torch.LongTensor] = None,
                text_lengths: Optional[torch.Tensor] = None,
                span_idx: Optional[torch.LongTensor] = None,
                span_mask: Optional[torch.LongTensor] = None,
                labels: Optional[torch.FloatTensor] = None,  # B,L*K, C
                decoder_labels:  Optional[torch.FloatTensor] = None,
                threshold: Optional[float] = 0.5,
                negative_input_ids = None,
                negative_token_type_ids = None,
                negative_attention_mask = None,
                negative_words_mask = None,
                negative_labels = None,
                negative_span_idx = None,
                negative_span_mask = None,
                negative_text_lengths = None,
                alpha=1e-1, # alpha is the weight for contrastive loss
                **kwargs
                ):

        positive_span_idx = span_idx
        positive_span_mask = span_mask

        # Original GLiNER forward method implementation in order to get original span representations
        # Having a hook on span_rep_layer caused problems with parallel execution

        prompts_embedding, prompts_embedding_mask, words_embedding, mask = self.model.get_representations(input_ids,
                                                                                                    attention_mask,
                                                                                                    labels_embeddings,
                                                                                                    labels_input_ids,
                                                                                                    labels_attention_mask,
                                                                                                    text_lengths,
                                                                                                    words_mask)
        target_W = span_idx.size(1) // self.config.max_width
        words_embedding, mask = self.model._fit_length(words_embedding, mask, target_W)

        span_idx = span_idx * span_mask.unsqueeze(-1)

        span_rep = self.model.span_rep_layer(words_embedding, span_idx)

        target_C = prompts_embedding.size(1)
        if labels is not None:
            target_C = max(target_C, labels.size(-1))

        prompts_embedding, prompts_embedding_mask = self.model._fit_length(
            prompts_embedding, prompts_embedding_mask, target_C
        )

        prompts_embedding = self.model.prompt_rep_layer(prompts_embedding)

        scores = torch.einsum("BLKD,BCD->BLKC", span_rep, prompts_embedding)

        decoder_embedding = decoder_mask = decoder_loss = decoder_span_idx = None
        if hasattr(self, "decoder"):
            if self.model.config.decoder_mode == 'span':
                decoder_text_embeds = self.model.decoder.ids_to_embeds(decoder_input_ids)
            else:
                decoder_text_embeds = None
            decoder_embedding, decoder_mask, decoder_span_idx = self.model.select_span_decoder_embedding(
                        prompts_embedding, prompts_embedding_mask, span_rep, scores, span_mask,
                                    decoder_text_embeds = decoder_text_embeds,
                                    decoder_words_mask = decoder_words_mask,
                                    span_labels=labels, threshold=threshold,
                                    decoder_input_ids=decoder_input_ids,
                                    decoder_labels_ids=decoder_labels_ids
            ) #(B, S, T, D)
            # decoder_embedding = self.span_attn_layer(decoder_embedding, decoder_mask)
            if decoder_labels is not None:
                decoder_loss, decoder_outputs = self.model.decode_labels(
                    decoder_embedding, decoder_mask, decoder_labels_ids,
                                        decoder_labels_mask, decoder_labels
                )

        loss = None
        if labels is not None:
            loss = self.model.loss(scores, labels, prompts_embedding_mask, span_mask, decoder_loss=decoder_loss, **kwargs)

        output = GLiNERModelOutput(
            logits=scores,
            loss=loss,
            decoder_loss=decoder_loss,
            prompts_embedding=prompts_embedding,
            prompts_embedding_mask=prompts_embedding_mask,
            decoder_embedding=decoder_embedding,
            decoder_embedding_mask=decoder_mask,
            decoder_span_idx=decoder_span_idx,
            words_embedding=words_embedding,
            mask=mask,
        )

        # Overridden implementation of forward method

        if negative_input_ids is None:
          return output

        # Extract span embeddings for contrastive learning
        try:
            # Get anchor span embeddings (from standard forward pass used for original loss)
            anchor_span_embeddings = span_rep

            # Get words embedding and mask for positive samples
            _, _, positive_words_embedding, positive_mask = \
            self.model.get_representations(
                input_ids, attention_mask, None, None, None, text_lengths, words_mask
            )

            # Get positive span embeddings using implementation from GLiNER's forward method
            positive_target_W = positive_span_idx.size(1) // self.config.max_width
            positive_words_embedding, positive_mask = self.model._fit_length(positive_words_embedding, positive_mask, positive_target_W)
            positive_span_idx = positive_span_idx * positive_span_mask.unsqueeze(-1)
            pos_span_embeddings = self.model.span_rep_layer(positive_words_embedding, positive_span_idx)

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
            total_loss = output.loss + alpha * contrastive_loss

            output.loss = total_loss

        except Exception as e:
            print(f"Contrastive learning failed: {e}")
            pass

        return output

    @classmethod
    def from_pretrained(cls, pretrained_model_name_or_path, **kwargs):
        model = super().from_pretrained(pretrained_model_name_or_path, **kwargs)
        return model
