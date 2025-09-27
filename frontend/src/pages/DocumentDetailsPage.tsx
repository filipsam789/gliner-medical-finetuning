
import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, CardMedia, CircularProgress, Alert } from "@mui/material";
import { useParams } from "react-router-dom";
import { getDocumentDetails } from "@/api/apiCalls";
import { useKeycloakAuth } from "@/contexts/useKeycloakContext";


const DocumentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useKeycloakAuth();
  const [document, setDocument] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getDocumentDetails(token, id!);
        setDocument(data.document || data); 
      } catch (err: unknown) {
        setError((err as Error).message || "Error loading document details");
      } finally {
        setLoading(false);
      }
    };
    if (id && token) fetchDocument();
  }, [id, token]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", bgcolor: "#f5f7fa" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !document) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", bgcolor: "#f5f7fa" }}>
        <Alert severity="error">{error || "Document not found."}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", bgcolor: "#f5f7fa" }}>
      <Card sx={{ maxWidth: 700, width: "100%", mx: "auto", boxShadow: 4, p: 3 }}>
        <CardMedia
          component="img"
          height="220"
          image={document.image_url || "https://via.placeholder.com/600x200?text=Document+Image"}
          alt={document.title}
          sx={{ objectFit: "cover", borderRadius: 2 }}
        />
        <CardContent sx={{ textAlign: "center" }}>
          <Typography variant="h4" sx={{ mb: 2 }}>{document.title}</Typography>
          <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>{document.date_added}</Typography>
          <Box sx={{ bgcolor: "#f0f2f5", borderRadius: 2, p: 4, mt: 2, display: "flex", justifyContent: "center" }}>
            <Typography variant="body1" sx={{ textAlign: "center" }}>{document.text}</Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DocumentDetailsPage;
