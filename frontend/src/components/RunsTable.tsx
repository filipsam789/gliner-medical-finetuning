import React, { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Chip,
} from "@mui/material";
import { ExperimentRun } from "@/api/apiCalls";

interface RunsTableProps {
  runs: ExperimentRun[];
}

const RunsTable: React.FC<RunsTableProps> = ({ runs }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedRuns = runs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        History of Runs
      </Typography>

      <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
              <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                Date Ran
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                Model
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                Threshold
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                Labels to Extract
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                  textAlign: "center",
                }}
              >
                Allow Multilabeling
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRuns.length > 0 ? (
              paginatedRuns.map((run) => (
                <TableRow
                  key={run.id}
                  sx={{
                    "&:hover": { backgroundColor: "rgba(23, 131, 239, 0.04)" },
                    "&:nth-of-type(even)": {
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                    },
                  }}
                >
                  <TableCell>
                    {new Date(run.date_ran).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={run.model}
                      size="small"
                      sx={{
                        backgroundColor: "rgba(23, 131, 239, 0.1)",
                        color: "rgb(23, 131, 239)",
                        fontWeight: 500,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {run.threshold !== undefined && run.threshold !== null
                      ? run.threshold
                      : "-"}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200, wordBreak: "break-word" }}>
                    {run.labels_to_extract}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Chip
                      label={run.allow_multilabeling ? "Yes" : "No"}
                      size="small"
                      color={run.allow_multilabeling ? "success" : "default"}
                      sx={{
                        fontWeight: 500,
                        ...(run.allow_multilabeling
                          ? {
                              backgroundColor: "rgba(76, 175, 80, 0.1)",
                              color: "#2e7d32",
                            }
                          : {
                              backgroundColor: "rgba(158, 158, 158, 0.1)",
                              color: "#616161",
                            }),
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No runs found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={runs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: "1px solid #e0e0e0",
            "& .MuiTablePagination-toolbar": {
              paddingLeft: 2,
              paddingRight: 2,
            },
            "& .MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
              {
                fontWeight: 500,
              },
          }}
        />
      </TableContainer>
    </Box>
  );
};

export default RunsTable;
