import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { Play } from "lucide-react";

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
    <Box sx={{ width: 240, bgcolor: "#f5f7fa", p: 3 }}>
      <Typography variant="h6" gutterBottom>
        For {experimentName || "..."}
      </Typography>
      <Button
        type="button"
        variant="contained"
        startIcon={<Play />}
        disabled={documentsCount === 0}
        sx={{
          mb: 2,
          width: "100%",
        }}
        onClick={onRunClick}
      >
        Run experiment
      </Button>
      <Stack spacing={2}>
        <Button
          variant={activeTab === "documents" ? "contained" : "outlined"}
          sx={{
            justifyContent: "flex-start",
            bgcolor:
              activeTab === "documents"
                ? "rgba(23, 131, 239, 0.15)"
                : undefined,
            color: activeTab === "documents" ? "rgb(23, 131, 239)" : undefined,
            fontWeight: activeTab === "documents" ? 600 : 400,
            "&:hover": {
              bgcolor:
                activeTab === "documents"
                  ? "rgba(23, 131, 239, 0.2)"
                  : "rgba(23, 131, 239, 0.08)",
            },
          }}
          onClick={() => setActiveTab("documents")}
        >
          Documents
        </Button>
        <Button
          variant={activeTab === "runs" ? "contained" : "outlined"}
          sx={{
            justifyContent: "flex-start",
            bgcolor:
              activeTab === "runs" ? "rgba(23, 131, 239, 0.15)" : undefined,
            color: activeTab === "runs" ? "rgb(23, 131, 239)" : undefined,
            fontWeight: activeTab === "runs" ? 600 : 400,
            "&:hover": {
              bgcolor:
                activeTab === "runs"
                  ? "rgba(23, 131, 239, 0.2)"
                  : "rgba(23, 131, 239, 0.08)",
            },
          }}
          onClick={() => setActiveTab("runs")}
        >
          History of runs
        </Button>
        <Button
          variant={activeTab === "entity-summary" ? "contained" : "outlined"}
          sx={{
            justifyContent: "flex-start",
            bgcolor:
              activeTab === "entity-summary"
                ? "rgba(23, 131, 239, 0.15)"
                : undefined,
            color:
              activeTab === "entity-summary" ? "rgb(23, 131, 239)" : undefined,
            fontWeight: activeTab === "entity-summary" ? 600 : 400,
            "&:hover": {
              bgcolor:
                activeTab === "entity-summary"
                  ? "rgba(23, 131, 239, 0.2)"
                  : "rgba(23, 131, 239, 0.08)",
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
