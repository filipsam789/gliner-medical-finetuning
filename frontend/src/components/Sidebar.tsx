import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { Play, FileText, History, LayoutDashboard } from "lucide-react";

interface SidebarProps {
  experimentName?: string;
  activeTab: "documents" | "runs" | "entity-summary";
  setActiveTab: (tab: "documents" | "runs" | "entity-summary") => void;
  onRunClick: () => void;
  documentsCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  experimentName,
  activeTab,
  setActiveTab,
  onRunClick,
  documentsCount,
}) => {
  return (
    <Box sx={{ 
      width: 240, 
      bgcolor: "rgba(37, 150, 190, 0.8)", 
      p: 3,
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
    }}>
      <Button
        type="button"
        variant="outlined"
        startIcon={<Play />}
        disabled={documentsCount === 0}
        sx={{
          mb: 2,
          width: "100%",
          bgcolor: "rgba(248, 250, 252, 0.9)",
          color: "rgba(37, 150, 190)",
          borderColor: "rgba(37, 150, 190, 0.3)",
          fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
          fontWeight: 500,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          "&:hover": {
            bgcolor: "white",
            borderColor: "rgba(37, 150, 190, 0.5)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          },
          "&:disabled": {
            bgcolor: "rgba(248, 250, 252, 0.5)",
            color: "rgba(37, 150, 190, 0.5)",
            borderColor: "rgba(37, 150, 190, 0.2)",
            boxShadow: "0 1px 4px rgba(0, 0, 0, 0.05)",
          },
        }}
        onClick={onRunClick}
      >
        Run experiment
      </Button>
      <Stack spacing={2}>
        <Button
          variant="outlined"
          startIcon={<FileText size={18} />}
          sx={{
            bgcolor: activeTab === "documents" ? "white" : "rgba(248, 250, 252, 0.9)",
            color: "rgba(37, 150, 190)",
            borderColor: "rgba(37, 150, 190, 0.3)",
            border: "1px solid rgba(0, 0, 0, 0.1)",
            fontWeight: activeTab === "documents" ? 600 : 400,
            fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            "&:hover": {
              bgcolor: "white",
              borderColor: "rgba(37, 150, 190, 0.5)",
              border: "1px solid rgba(0, 0, 0, 0.15)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            },
          }}
          onClick={() => setActiveTab("documents")}
        >
          Documents
        </Button>
        <Button
          variant="outlined"
          startIcon={<History size={18} />}
          sx={{
            bgcolor: activeTab === "runs" ? "white" : "rgba(248, 250, 252, 0.9)",
            color: "rgba(37, 150, 190)",
            borderColor: "rgba(37, 150, 190, 0.3)",
            border: "1px solid rgba(0, 0, 0, 0.1)",
            fontWeight: activeTab === "runs" ? 600 : 400,
            fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            "&:hover": {
              bgcolor: "white",
              borderColor: "rgba(37, 150, 190, 0.5)",
              border: "1px solid rgba(0, 0, 0, 0.15)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            },
          }}
          onClick={() => setActiveTab("runs")}
        >
          History of runs
        </Button>
        <Button
          variant="outlined"
          startIcon={<LayoutDashboard size={18} />}
          sx={{
            bgcolor: activeTab === "entity-summary" ? "white" : "rgba(248, 250, 252, 0.9)",
            color: "rgba(37, 150, 190)",
            borderColor: "rgba(37, 150, 190, 0.3)",
            border: "1px solid rgba(0, 0, 0, 0.1)",
            fontWeight: activeTab === "entity-summary" ? 600 : 400,
            fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            "&:hover": {
              bgcolor: "white",
              borderColor: "rgba(37, 150, 190, 0.5)",
              border: "1px solid rgba(0, 0, 0, 0.15)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            },
          }}
          onClick={() => setActiveTab("entity-summary")}
        >
          Entity Summary
        </Button>
      </Stack>
    </Box>
  );
};

export default Sidebar;
