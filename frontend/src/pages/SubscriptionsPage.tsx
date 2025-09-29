import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Alert,
  Snackbar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useKeycloakAuth } from "@/contexts/useKeycloakContext";
import { subscribeUser } from "@/api/apiCalls";

const features = [
  {
    name: "Daily extractions (documents per day)",
    free: "5",
    premium: "Unlimited",
  },
  {
    name: "Create and run multi-document experiments (batch NER)",
    free: "No",
    premium: "Yes",
  },
  {
    name: "Supported models",
    free: "GLiNER only",
    premium: "GLiNER + various NER/LLM models",
  },
];

const SubscriptionsPage: React.FC = () => {
  const { userProfile, token, isAuthenticated } = useKeycloakAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isUpgrading, setIsUpgrading] = useState(false);

  const isPremiumUser = userProfile?.roles?.includes("premium_user") || false;

  const handleLogin = () => {
    navigate("/login");
  };

  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true);
      setError("");
      await subscribeUser(token);
      setSuccess(
        "Successfully upgraded to Premium! Welcome to unlimited features!"
      );
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setError("Failed to upgrade to premium. Please try again.");
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleCloseError = () => setError("");
  const handleCloseSuccess = () => setSuccess("");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f7fa",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box sx={{ display: "flex", gap: 6 }}>
        <Card sx={{ minWidth: 340, boxShadow: 4, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 2, color: "#1976d2" }}>
              Free
            </Typography>
            <Typography variant="h4" sx={{ mb: 2 }}>
              $0<span style={{ fontSize: 18 }}>/month</span>
            </Typography>
            <Stack spacing={2} sx={{ mb: 3 }}>
              {features.map((f, i) => (
                <Box
                  key={i}
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Typography variant="body1">{f.name}</Typography>
                  <Typography variant="body1" color="textSecondary">
                    {f.free}
                  </Typography>
                </Box>
              ))}
            </Stack>
            {!isAuthenticated ? (
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                onClick={handleLogin}
              >
                Login to Get Started
              </Button>
            ) : !isPremiumUser ? (
              <Button variant="outlined" color="primary" fullWidth disabled>
                Current Plan
              </Button>
            ) : (
              <Button variant="outlined" color="success" fullWidth disabled>
                ✓ Upgraded from Free
              </Button>
            )}
          </CardContent>
        </Card>
        {/* Premium Plan */}
        <Card
          sx={{
            minWidth: 340,
            boxShadow: 4,
            borderRadius: 3,
            border: isPremiumUser ? "2px solid #2e7d32" : "2px solid #d32f2f",
          }}
        >
          <CardContent>
            <Typography
              variant="h5"
              sx={{ mb: 2, color: isPremiumUser ? "#2e7d32" : "#d32f2f" }}
            >
              Premium
            </Typography>
            <Typography variant="h4" sx={{ mb: 2 }}>
              $29.99<span style={{ fontSize: 18 }}>/month</span>
            </Typography>
            <Stack spacing={2} sx={{ mb: 3 }}>
              {features.map((f, i) => (
                <Box
                  key={i}
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Typography variant="body1">{f.name}</Typography>
                  <Typography variant="body1" color="textSecondary">
                    {f.premium}
                  </Typography>
                </Box>
              ))}
            </Stack>
            {!isAuthenticated ? (
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={handleLogin}
              >
                Login to Upgrade
              </Button>
            ) : isPremiumUser ? (
              <Button variant="contained" color="success" fullWidth disabled>
                Current Plan
              </Button>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={handleUpgrade}
                disabled={isUpgrading}
              >
                {isUpgrading ? "Upgrading..." : "Upgrade"}
              </Button>
            )}
          </CardContent>
        </Card>
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSuccess}
          severity="success"
          sx={{ width: "100%" }}
        >
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SubscriptionsPage;
