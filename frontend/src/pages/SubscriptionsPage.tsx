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
  Container,
  Chip,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useKeycloakAuth } from "@/contexts/useKeycloakContext";
import { createCheckoutSession, createPortalSession } from "@/api/apiCalls";
import { Check, Star, Zap } from "lucide-react";

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
      const checkoutData = await createCheckoutSession(token);
      window.location.href = checkoutData.checkout_url;
    } catch (error: any) {
      setError(
        error.message || "Failed to start payment process. Please try again."
      );
      setIsUpgrading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setIsUpgrading(true);
      setError("");
      const portalData = await createPortalSession(token);
      window.location.href = portalData.portal_url;
    } catch (error: any) {
      setError(
        error.message ||
          "Failed to open subscription management. Please try again."
      );
      setIsUpgrading(false);
    }
  };

  const handleCloseError = () => setError("");
  const handleCloseSuccess = () => setSuccess("");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, hsl(0 0% 98%), hsl(240 4.8% 95.9%))",
        backgroundAttachment: "fixed",
        py: 9,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h3"
            sx={{
              color: "primary.main",
              fontWeight: 700,
              mb: 2,
              mt: 7,
              fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
              textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            Choose Your Plan
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "text.secondary",
              fontWeight: 400,
              maxWidth: 600,
              mx: "auto",
              fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
              textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            Unlock the full potential of GLiNER Medical with our flexible
            pricing options
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 4,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Card
            sx={{
              width: 320,
              height: 600,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              borderRadius: 4,
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              position: "relative",
              overflow: "hidden",
              "&:hover": {
                transform: "translateY(-8px)",
                boxShadow: "0 30px 60px rgba(0, 0, 0, 0.15)",
              },
              transition: "all 0.3s ease",
            }}
          >
            <CardContent
              sx={{
                p: 4,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: "rgba(37, 150, 190)",
                    my: 1,
                    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
                  }}
                >
                  Free
                </Typography>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 800, color: "text.primary", mb: 1 }}
                >
                  $0
                  <Typography
                    component="span"
                    variant="h5"
                    sx={{
                      color: "text.secondary",
                      ml: 0.5,
                      fontFamily:
                        '"Inter", system-ui, -apple-system, sans-serif',
                    }}
                  >
                    /month
                  </Typography>
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
                  }}
                >
                  Perfect for getting started
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Stack spacing={2.5} sx={{ mb: 4, flexGrow: 1 }}>
                {features.map((f, i) => (
                  <Box
                    key={i}
                    sx={{ display: "flex", alignItems: "center", gap: 2 }}
                  >
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        backgroundColor: "rgba(37, 150, 190, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Check size={12} color="rgba(37, 150, 190)" />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          mb: 0.5,
                          fontFamily:
                            '"Inter", system-ui, -apple-system, sans-serif',
                        }}
                      >
                        {f.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontFamily:
                            '"Inter", system-ui, -apple-system, sans-serif',
                        }}
                      >
                        {f.free}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>

              {!isAuthenticated ? (
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: "rgba(37, 150, 190)",
                    color: "rgba(37, 150, 190)",
                    fontWeight: 600,
                    py: 1.5,
                    "&:hover": {
                      backgroundColor: "rgba(37, 150, 190, 0.08)",
                      borderColor: "rgba(37, 150, 190)",
                    },
                  }}
                  fullWidth
                  onClick={handleLogin}
                >
                  Login to Get Started
                </Button>
              ) : !isPremiumUser ? (
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: "rgba(37, 150, 190)",
                    color: "rgba(37, 150, 190)",
                    fontWeight: 600,
                    py: 1.5,
                  }}
                  fullWidth
                  disabled
                >
                  Current Plan
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: "#2e7d32",
                    color: "#2e7d32",
                    fontWeight: 600,
                    py: 1.5,
                  }}
                  fullWidth
                  disabled
                >
                  <Check size={16} style={{ marginRight: 8 }} />
                  Upgraded from Free
                </Button>
              )}
            </CardContent>
          </Card>
          <Card
            sx={{
              width: 320,
              height: 600,
              background:
                "linear-gradient(135deg, rgba(37, 150, 190, 0.95) 0%, rgba(45, 170, 210, 0.95) 100%)",
              backdropFilter: "blur(10px)",
              borderRadius: 4,
              boxShadow: "0 20px 40px rgba(37, 150, 190, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              position: "relative",
              overflow: "hidden",
              "&:hover": {
                transform: "translateY(-8px)",
                boxShadow: "0 30px 60px rgba(37, 150, 190, 0.4)",
              },
              transition: "all 0.3s ease",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
              }}
            >
              <Chip
                icon={<Star color="white" size={16} />}
                label="POPULAR"
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              />
            </Box>
            <CardContent
              sx={{
                p: 4,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: "white",
                    my: 1,
                    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
                  }}
                >
                  Premium
                </Typography>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 800, color: "white", mb: 1 }}
                >
                  $29.99
                  <Typography
                    component="span"
                    variant="h5"
                    sx={{
                      color: "rgba(255, 255, 255, 0.8)",
                      ml: 0.5,
                      fontFamily:
                        '"Inter", system-ui, -apple-system, sans-serif',
                    }}
                  >
                    /month
                  </Typography>
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
                  }}
                >
                  Everything you need for professional use
                </Typography>
              </Box>

              <Divider
                sx={{ mb: 3, borderColor: "rgba(255, 255, 255, 0.2)" }}
              />

              <Stack spacing={2.5} sx={{ mb: 4, flexGrow: 1 }}>
                {features.map((f, i) => (
                  <Box
                    key={i}
                    sx={{ display: "flex", alignItems: "center", gap: 2 }}
                  >
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Zap size={12} color="white" />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          mb: 0.5,
                          color: "white",
                          fontFamily:
                            '"Inter", system-ui, -apple-system, sans-serif',
                        }}
                      >
                        {f.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "rgba(255, 255, 255, 0.8)",
                          fontFamily:
                            '"Inter", system-ui, -apple-system, sans-serif',
                        }}
                      >
                        {f.premium}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>

              {!isAuthenticated ? (
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "white",
                    color: "rgba(37, 150, 190)",
                    fontWeight: 600,
                    py: 1.5,
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      transform: "translateY(-1px)",
                    },
                  }}
                  fullWidth
                  onClick={handleLogin}
                >
                  Login to Upgrade
                </Button>
              ) : isPremiumUser ? (
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    color: "white",
                    fontWeight: 600,
                    py: 1.5,
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.3)",
                    },
                  }}
                  fullWidth
                  onClick={handleManageSubscription}
                  disabled={isUpgrading}
                >
                  <Check size={16} style={{ marginRight: 8 }} />
                  {isUpgrading ? "Opening..." : "Manage Subscription"}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "white",
                    color: "rgba(37, 150, 190)",
                    fontWeight: 600,
                    py: 1.5,
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      transform: "translateY(-1px)",
                    },
                  }}
                  fullWidth
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                >
                  {isUpgrading ? "Upgrading..." : "Upgrade to Premium"}
                </Button>
              )}
            </CardContent>
          </Card>
        </Box>
      </Container>

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
