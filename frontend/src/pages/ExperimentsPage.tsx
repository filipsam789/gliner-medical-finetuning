import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Alert,
} from "@mui/material";
import { Plus, Trash2 } from "lucide-react";
import { useKeycloakAuth } from "@/contexts/useKeycloakContext";
import { useNavigate } from "react-router-dom";
import {
  getExperiments,
  createExperiment,
  deleteExperiment,
} from "@/api/apiCalls";

interface Experiment {
  id: number;
  name: string;
  image_url: string;
}

const ExperimentsPage: React.FC = () => {
  const { token, userProfile } = useKeycloakAuth();
  const navigate = useNavigate();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (
      !userProfile ||
      !Array.isArray(userProfile.roles) ||
      !userProfile.roles.includes("premium_user")
    ) {
      navigate("/not-found");
    }
  }, [userProfile, navigate]);

  const fetchExperiments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getExperiments(token);
      setExperiments(data);
    } catch (err: any) {
      setError(err.message || "Error loading experiments");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchExperiments();
  }, [fetchExperiments]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    setError("");
    try {
      await createExperiment(token, newName);
      setNewName("");
      setOpen(false);
      fetchExperiments();
    } catch (err: any) {
      setError(err.message || "Error creating experiment");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    setLoading(true);
    setError("");
    try {
      await deleteExperiment(token, deleteId);
      setConfirmOpen(false);
      setDeleteId(null);
      fetchExperiments();
    } catch (err: unknown) {
      setError((err as Error).message || "Error deleting experiment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, pt: 10 }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            mt: 4,
            fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
            color: "primary.main",
            mb: 3
          }}
        >
          Experiments
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={() => setOpen(true)}
        >
          Add experiment
        </Button>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
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
        {experiments.map((exp) => (
          <Card
            key={exp.id}
            sx={{ width: 280, position: "relative", cursor: "pointer" }}
            onClick={() => navigate(`/experiments/${exp.id}`)}
          >
            <CardMedia
              component="img"
              height="180"
              image={exp.image_url}
              alt={exp.name}
              sx={{ objectFit: "cover" }}
            />
            <CardContent sx={{ position: "relative" }}>
              <Typography variant="h6" noWrap>
                {exp.name}
              </Typography>
              <Button
                sx={{
                  position: "absolute",
                  right: 8,
                  top: 15,
                  minWidth: 0,
                  p: 1,
                }}
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteId(exp.id);
                  setConfirmOpen(true);
                }}
              >
                <Trash2 size={20} />
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add Experiment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Experiment Name"
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAdd} disabled={loading || !newName.trim()}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Delete Experiment</DialogTitle>
        <DialogContent>
          <Typography>
            Do you want to delete this experiment and all of its contents?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" disabled={loading}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExperimentsPage;
