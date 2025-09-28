import React from "react";
import { Box, Typography } from "@mui/material";
import { ExperimentRun } from "@/api/apiCalls";

interface RunsTableProps {
  runs: ExperimentRun[];
}

const RunsTable: React.FC<RunsTableProps> = ({ runs }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        History of Runs
      </Typography>
      <Box sx={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f5f7fa" }}>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>
                Date Ran
              </th>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>
                Model
              </th>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>
                Threshold
              </th>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>
                Labels to Extract
              </th>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>
                Allow Multilabeling
              </th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.id}>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {new Date(run.date_ran).toLocaleString()}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {run.model}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {run.threshold !== undefined && run.threshold !== null
                    ? run.threshold
                    : "-"}
                </td>
                <td
                  style={{
                    padding: "8px",
                    border: "1px solid #ddd",
                    maxWidth: 200,
                    wordBreak: "break-word",
                  }}
                >
                  {run.labels_to_extract}
                </td>
                <td
                  style={{
                    padding: "8px",
                    border: "1px solid #ddd",
                    textAlign: "center",
                  }}
                >
                  {run.allow_multilabeling ? (
                    <span >Yes</span>
                  ) : (
                    <span>No</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Box>
  );
};

export default RunsTable;
