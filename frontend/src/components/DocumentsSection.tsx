import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { Plus, Trash2 } from "lucide-react";

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

interface DocumentsSectionProps {
  documents: any[];
  onAddClick: () => void;
  onDeleteClick: (id: number) => void;
  navigate: (path: string) => void;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  documents,
  onAddClick,
  onDeleteClick,
  navigate,
}) => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Documents
      </Typography>
      <Button
        variant="contained"
        startIcon={<Plus />}
        sx={{ mb: 3, float: "right" }}
        onClick={onAddClick}
      >
        Add document
      </Button>
      <Box sx={{ clear: "both" }} />
      <Stack direction="row" spacing={3} flexWrap="wrap">
        {documents.map((doc) => (
          <Card
            key={doc.id}
            sx={{
              width: 320,
              mb: 2,
              position: "relative",
              cursor: "pointer",
            }}
            onClick={() => navigate(`/documents/${doc.id}`)}
          >
            <CardMedia
              component="img"
              height="140"
              image={doc.image_url}
              alt={doc.title}
              sx={{ objectFit: "cover" }}
            />
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">
                {doc.date_added}
              </Typography>
              <Typography variant="h6" noWrap>
                {doc.title}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {truncateText(doc.text, 120)}
              </Typography>
              <Button size="small" variant="outlined">
                Read more
              </Button>
            </CardContent>
            <IconButton
              sx={{ position: "absolute", right: 8, bottom: 8 }}
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClick(doc.id);
              }}
            >
              <Trash2 size={20} />
            </IconButton>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default DocumentsSection;
