import torch
import torch.nn as nn
import torch.nn.functional as F

class InfoNCELoss(nn.Module):
    def __init__(self, temperature: float = 0.1, reduction: str = "mean"):
        # InfoNCE loss for multi-dimensional span embeddings.

        super().__init__()
        self.temperature = temperature
        self.reduction = reduction

    def forward(self, anchor_span_embeddings: torch.Tensor, pos_span_embeddings: torch.Tensor, neg_span_embeddings: torch.Tensor) -> torch.Tensor:
        """
        InfoNCE contrastive loss.

        Args:
            anchor_span_embeddings: [batch_size, num_anchors, span_width, embedding_dim]
            pos_span_embeddings: [batch_size, num_positives, span_width, embedding_dim]
            neg_span_embeddings: [batch_size, num_negatives, span_width, embedding_dim]
        """
        _, _, _, embedding_dim = pos_span_embeddings.shape

        # Pool over width dimension (mean pooling over words in each span)
        anchor_span_embeddings = anchor_span_embeddings.mean(dim=2)  # [batch_size, num_anchors, embedding_dim]
        pos_span_embeddings = pos_span_embeddings.mean(dim=2)  # [batch_size, num_positives, embedding_dim]
        neg_span_embeddings = neg_span_embeddings.mean(dim=2)  # [batch_size, num_negatives, embedding_dim]

        # Normalize embeddings
        anchor_span_embeddings = F.normalize(anchor_span_embeddings, dim=-1)
        pos_span_embeddings = F.normalize(pos_span_embeddings, dim=-1)
        neg_span_embeddings = F.normalize(neg_span_embeddings, dim=-1)

        # Flatten for similarity calculations
        anchors = anchor_span_embeddings.reshape(-1, embedding_dim)      # [batch_size * num_anchors, embedding_dim]
        positives = pos_span_embeddings.reshape(-1, embedding_dim)       # [batch_size * num_positives, embedding_dim]
        negatives = neg_span_embeddings.reshape(-1, embedding_dim)        # [batch_size * num_negatives, embedding_dim]

        # Dot products for similarities. Can be changed to other similarity metrics if needed.
        pos_logits = (anchors * positives).sum(-1, keepdim=True)         # [batch_size * num_anchors, 1]
        neg_logits = anchors @ negatives.t()                              # [batch_size * num_anchors, batch_size * num_negatives]

        # Combine positive and negative logits
        logits = torch.cat([pos_logits, neg_logits], dim=1) / self.temperature

        # Get the labels
        labels = torch.zeros(logits.size(0), dtype=torch.long, device=logits.device)

        # Compute the cross-entropy loss (minimizing the distance between anchor-positive, maximizing anchor-negative)
        loss = F.cross_entropy(logits, labels, reduction=self.reduction)
        
        return loss
