import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { Play } from "lucide-react";

interface SidebarProps {
  experimentName?: string;
  activeTab: "documents" | "runs";
  setActiveTab: (tab: "documents" | "runs") => void;
  onRunClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  experimentName,
  activeTab,
  setActiveTab,
  onRunClick,
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
        sx={{ mb: 2, width: "100%" }}
        onClick={onRunClick}
      >
        Run experiment
      </Button>
      <Stack spacing={2}>
        <Button variant="outlined" sx={{ justifyContent: "flex-start" }}>
          Overview
        </Button>
        <Button
          variant={activeTab === "documents" ? "contained" : "outlined"}
          sx={{
            justifyContent: "flex-start",
            bgcolor: activeTab === "documents" ? "#e3eafc" : undefined,
          }}
          onClick={() => setActiveTab("documents")}
        >
          Documents
        </Button>
        <Button
          variant={activeTab === "runs" ? "contained" : "outlined"}
          sx={{
            justifyContent: "flex-start",
            bgcolor: activeTab === "runs" ? "#e3eafc" : undefined,
          }}
          onClick={() => setActiveTab("runs")}
        >
          History of runs
        </Button>
        <Button variant="outlined" sx={{ justifyContent: "flex-start" }}>
          Members
        </Button>
        <Button variant="outlined" sx={{ justifyContent: "flex-start" }}>
          Relations
        </Button>
      </Stack>
    </Box>
  );
};

export default Sidebar;
