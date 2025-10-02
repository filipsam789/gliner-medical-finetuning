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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

interface DocumentsSectionProps {
  documents: any[];
  onAddClick: () => void;
  onDeleteClick: (id: number) => void;
  navigate: (path: string) => void;
  experimentName?: string;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  documents,
  onAddClick,
  onDeleteClick,
  navigate,
  experimentName,
}) => {
  return (
    <Box>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            mt: 4,
            fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
            color: "primary.main",
            mb: 1
          }}
        >
          Documents
        </Typography>
        {experimentName && (
          <Typography 
            variant="h6"
            sx={{ 
              fontFamily: 'sans-serif',
              color: "text.secondary",
              fontStyle: "italic",
              mb: 3,
              opacity: 0.7,
              fontWeight: 300
            }}
          >
            for {experimentName}
          </Typography>
        )}
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={onAddClick}
        >
          Add document
        </Button>
      </Box>
      <Box 
        sx={{ 
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          justifyContent: "center",
          alignItems: "flex-start",
          maxWidth: "1200px",
          mx: "auto"
        }}
      >
        {documents.map((doc) => (
          <Card
            key={doc.id}
            sx={{
              width: 350,
              position: "relative",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: 420,
            }}
            onClick={() => navigate(`/documents/${doc.id}`)}
          >
            <CardMedia
              component="img"
              height="160"
              image={doc.image_url}
              alt={doc.title}
              sx={{ objectFit: "cover" }}
            />

            <Box
              sx={{
                flexGrow: 1,
                p: 2,
                display: "flex",
                flexDirection: "column",
                textAlign: "center",
              }}
            >
              <Typography 
                variant="caption" 
                color="textSecondary"
                sx={{
                  fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
                  mb: 1
                }}
              >
                Date added: {formatDate(doc.date_added)}
              </Typography>
              <Typography 
                variant="h6" 
                noWrap
                sx={{
                  fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
                  mb: 1
                }}
              >
                {doc.title}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 1, 
                  flexGrow: 1,
                  fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
                  lineHeight: 1.5
                }}
              >
                {truncateText(doc.text, 180)}
              </Typography>
            </Box>
            <Box sx={{ p: 2, pt: 0, position: "relative" }}>
              <Button size="small" variant="outlined">
                Read more
              </Button>
              <IconButton
                sx={{ position: "absolute", right: 8, bottom: 15 }}
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteClick(doc.id);
                }}
              >
                <Trash2 size={20} />
              </IconButton>
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default DocumentsSection;
