import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useKeycloakAuth } from "@/contexts/useKeycloakContext";
import { getCheckoutSession } from "@/api/apiCalls";
import { Check } from "lucide-react";

const SubscriptionSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useKeycloakAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setError("No session ID provided");
      setLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        const sessionData = await getCheckoutSession(token, sessionId);

        if (sessionData.payment_status === "paid") {
          setSuccess(true);
          setTimeout(() => {
            navigate("/experiments");
          }, 5000);
        } else {
          setError("Payment was not successful");
        }
      } catch (err: any) {
        setError(err.message || "Failed to verify payment");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, token]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, hsl(0 0% 98%), hsl(240 4.8% 95.9%))",
        }}
      >
        <CircularProgress size={60} sx={{ color: "primary.main", mb: 2 }} />
        <Typography variant="h6" sx={{ color: "text.primary" }}>
          Verifying your payment...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, hsl(0 0% 98%), hsl(240 4.8% 95.9%))",
          p: 4,
        }}
      >
        <Alert severity="error" sx={{ mb: 3, maxWidth: 500 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate("/subscriptions")}
          sx={{
            backgroundColor: "primary.main",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
          }}
        >
          Back to Subscriptions
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, hsl(0 0% 98%), hsl(240 4.8% 95.9%))",
        p: 4,
      }}
    >
      <Box
        sx={{
          backgroundColor: "white",
          borderRadius: 4,
          p: 6,
          textAlign: "center",
          maxWidth: 500,
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            backgroundColor: "#4caf50",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
          }}
        >
          <Check size={40} color="white" />
        </Box>

        <Typography
          variant="h4"
          sx={{ fontWeight: 700, mb: 2, color: "text.primary" }}
        >
          Payment Successful!
        </Typography>

        <Typography variant="h6" sx={{ mb: 3, color: "text.secondary" }}>
          Welcome to Premium! Your subscription is now active.
        </Typography>

        <Typography variant="body1" sx={{ mb: 4, color: "text.secondary" }}>
          You now have access to unlimited extractions, multi-document
          experiments, and all premium features. Redirecting you to the
          dashboard...
        </Typography>

        <Button
          variant="contained"
          onClick={() => navigate("/experiments")}
          sx={{
            backgroundColor: "primary.main",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
          }}
        >
          Create an Experiment
        </Button>
      </Box>
    </Box>
  );
};

export default SubscriptionSuccessPage;
