import React from "react";
import { Box, Typography, Card, CardContent, Button, Stack } from "@mui/material";

const features = [
  {
    name: "Daily extractions (documents per day)",
    free: "5",
    premium: "Unlimited"
  },
  {
    name: "Create and run multi-document experiments (batch NER)",
    free: "No",
    premium: "Yes"
  },
  {
    name: "Supported models",
    free: "GLiNER only",
    premium: "GLiNER + various NER/LLM models"
  }
];

const SubscriptionsPage: React.FC = () => {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Box sx={{ display: "flex", gap: 6 }}>
=        <Card sx={{ minWidth: 340, boxShadow: 4, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 2, color: "#1976d2" }}>Free</Typography>
            <Typography variant="h4" sx={{ mb: 2 }}>$0<span style={{ fontSize: 18 }}>/month</span></Typography>
            <Stack spacing={2} sx={{ mb: 3 }}>
              {features.map((f, i) => (
                <Box key={i} sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1">{f.name}</Typography>
                  <Typography variant="body1" color="textSecondary">{f.free}</Typography>
                </Box>
              ))}
            </Stack>
            <Button variant="outlined" color="primary" fullWidth disabled>Current Plan</Button>
          </CardContent>
        </Card>
        {/* Premium Plan */}
        <Card sx={{ minWidth: 340, boxShadow: 4, borderRadius: 3, border: "2px solid #d32f2f" }}>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 2, color: "#d32f2f" }}>Premium</Typography>
            <Typography variant="h4" sx={{ mb: 2 }}>$29.99<span style={{ fontSize: 18 }}>/month</span></Typography>
            <Stack spacing={2} sx={{ mb: 3 }}>
              {features.map((f, i) => (
                <Box key={i} sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1">{f.name}</Typography>
                  <Typography variant="body1" color="textSecondary">{f.premium}</Typography>
                </Box>
              ))}
            </Stack>
            <Button variant="contained" color="secondary" fullWidth>Upgrade</Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default SubscriptionsPage;
