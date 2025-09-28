import React, { useEffect, useState } from "react";
import { Box, Alert } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import {
  getExperimentDetails,
  addDocument,
  deleteDocument,
  getExperimentRuns,
  ExperimentRun,
} from "@/api/apiCalls";
import { useKeycloakAuth } from "@/contexts/useKeycloakContext";

import Sidebar from "../components/Sidebar";
import RunsTable from "../components/RunsTable";
import DocumentsSection from "../components/DocumentsSection";
import AddDocumentDialog from "../components/AddDocumentDialog";
import DeleteDocumentDialog from "../components/DeleteDocumentDialog";
import RunExperimentDialog from "../components/RunExperimentDialog";

const ExperimentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useKeycloakAuth();

  const [experiment, setExperiment] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [runs, setRuns] = useState<ExperimentRun[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"documents" | "runs">("documents");

  const [addOpen, setAddOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [runOpen, setRunOpen] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getExperimentDetails(token, id);
        setExperiment(data.experiment);
        setDocuments(data.documents);

        const runsData = await getExperimentRuns(token, id);
        setRuns(runsData);
      } catch (err: unknown) {
        setError((err as Error).message || "Error loading experiment details");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, token]);

  const handleAddDocument = async (title: string, text: string) => {
    if (!title.trim() || !text.trim()) return;
    setLoading(true);
    setError("");
    try {
      await addDocument(token, id, title, text);
      setAddOpen(false);
      const data = await getExperimentDetails(token, id);
      setDocuments(data.documents);
    } catch (err: unknown) {
      setError((err as Error).message || "Error adding document");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (deleteId === null) return;
    setLoading(true);
    setError("");
    try {
      await deleteDocument(token, deleteId);
      setConfirmOpen(false);
      setDeleteId(null);
      const data = await getExperimentDetails(token, id);
      setDocuments(data.documents);
    } catch (err: unknown) {
      setError((err as Error).message || "Error deleting document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Sidebar
        experimentName={experiment?.name}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRunClick={() => setRunOpen(true)}
      />

      <Box sx={{ flex: 1, p: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {activeTab === "runs" ? (
          <RunsTable runs={runs} />
        ) : (
          <DocumentsSection
            documents={documents}
            onAddClick={() => setAddOpen(true)}
            onDeleteClick={(id) => {
              setDeleteId(id);
              setConfirmOpen(true);
            }}
            navigate={navigate}
          />
        )}
      </Box>

      <AddDocumentDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAddDocument}
        loading={loading}
      />

      <DeleteDocumentDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onDelete={handleDeleteDocument}
        loading={loading}
      />

      <RunExperimentDialog
        open={runOpen}
        onClose={() => setRunOpen(false)}
        experimentId={id}
        onRunSuccess={async () => {
          const runsData = await getExperimentRuns(token, id);
          setRuns(runsData);
        }}
      />
    </Box>
  );
};

export default ExperimentDetailsPage;
