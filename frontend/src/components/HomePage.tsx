import React from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Stethoscope,
  Activity,
  Calendar,
  Pencil,
  Users,
} from "lucide-react";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/extract-entities");
  };

  const handleViewPlans = () => {
    navigate("/subscriptions");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: "url('/ai-medicine.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)",
          zIndex: 1,
        },
      }}
    >
      <Container
        maxWidth="lg"
        sx={{ position: "relative", zIndex: 2, pt: 25, pb: 8 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", minHeight: "60vh" }}>
          <Box sx={{ maxWidth: "700px", mb: 4 }}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 600,
                color: "white",
                textShadow: "3px 3px 4px rgba(0, 0, 0, 0.4)",
                mb: 2,
                fontSize: { xs: "3rem", md: "3.8rem" },
              }}
            >
              Empowering Healthcare with Advanced AI Extraction
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: "rgba(255, 255, 255, 0.9)",
                textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                mb: 4,
                fontWeight: 400,
              }}
            >
              Unlock clinical insights, automate documentation, and streamline
              medical research—powered by various models.
            </Typography>

            <Stack direction="row" spacing={3} sx={{ mb: 4 }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  backgroundColor: "rgba(22, 150, 170, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid rgba(49, 164, 201)",
                }}
              >
                <Heart size={24} color="white" />
              </Box>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  backgroundColor: "rgba(22, 150, 170, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid rgba(49, 164, 201)",
                }}
              >
                <Stethoscope size={24} color="white" />
              </Box>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  backgroundColor: "rgba(22, 150, 170, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid rgba(49, 164, 201)",
                }}
              >
                <Activity size={24} color="white" />
              </Box>
            </Stack>

            <Stack
              direction="row"
              spacing={2}
              sx={{ flexWrap: "wrap", gap: 2 }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={handleGetStarted}
                sx={{
                  backgroundColor: "rgba(37, 150, 190)",
                  color: "white",
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: "none",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.16)",
                  "&:hover": {
                    backgroundColor: "rgba(45, 170, 210, 0.3)",
                    transform: "translateY(-2px)",
                    backdropFilter: "blur(15px)",
                    boxShadow: "0 8px 32px rgba(25, 118, 210, 0.2)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={handleViewPlans}
                sx={{
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  color: "white",
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: "none",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    borderColor: "rgba(255, 255, 255, 0.4)",
                    transform: "translateY(-2px)",
                    backdropFilter: "blur(15px)",
                    boxShadow: "0 8px 32px rgba(255, 255, 255, 0.1)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                View Plans
              </Button>
            </Stack>
          </Box>
        </Box>
      </Container>

      <Box sx={{ position: "relative", zIndex: 2, pb: 8 }}>
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={4}
            sx={{ justifyContent: "center" }}
          >
            <Box sx={{ flex: 1, maxWidth: { md: "400px" } }}>
              <Card
                sx={{
                  background:
                    "linear-gradient(135deg, rgba(37, 150, 190, 0.8) 0%, rgba(45, 170, 210, 0.8) 100%)",
                  color: "white",
                  borderRadius: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <CardContent
                  sx={{
                    p: 4,
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mb: 2 }}
                  >
                    <Pencil size={48} color="white" />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: "rgba(255, 255, 255, 0.9)",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      textAlign: "center",
                    }}
                  >
                    Have a Feature Request?
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "rgba(255, 255, 255, 0.8)",
                      mb: 3,
                      flexGrow: 1,
                      textAlign: "center",
                    }}
                  >
                    Help us improve MedLexica by sharing your feature ideas and
                    suggestions. We value input from our users and continuously
                    enhance the platform based on your feedback.
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "white",
                      color: "rgba(37, 150, 190, 1)",
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: "none",
                      alignSelf: "center",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        transform: "translateY(-1px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Submit Request
                  </Button>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: 1, maxWidth: { md: "400px" } }}>
              <Card
                sx={{
                  background:
                    "linear-gradient(135deg, rgba(37, 150, 190, 0.8) 0%, rgba(45, 170, 210, 0.8) 100%)",
                  color: "white",
                  borderRadius: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <CardContent
                  sx={{
                    p: 4,
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mb: 2 }}
                  >
                    <Calendar size={48} color="white" />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: "rgba(255, 255, 255, 0.9)",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      textAlign: "center",
                    }}
                  >
                    Get a Guided Demo or Start Processing
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "rgba(255, 255, 255, 0.8)",
                      mb: 3,
                      flexGrow: 1,
                      textAlign: "center",
                    }}
                  >
                    Schedule a walkthrough to see how MedLexica can accelerate
                    your clinical or research workflow with AI-powered medical
                    entity extraction and smart document analysis.
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "white",
                      color: "rgba(37, 150, 190, 1)",
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: "none",
                      alignSelf: "center",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        transform: "translateY(-1px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: 1, maxWidth: { md: "400px" } }}>
              <Card
                sx={{
                  background:
                    "linear-gradient(135deg, rgba(37, 150, 190, 0.8) 0%, rgba(45, 170, 210, 0.8) 100%)",
                  color: "white",
                  borderRadius: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <CardContent
                  sx={{
                    p: 4,
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mb: 2 }}
                  >
                    <Users size={48} color="white" />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: "rgba(255, 255, 255, 0.9)",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      textAlign: "center",
                    }}
                  >
                    Need Support or Assistance?
                  </Typography>
                  <Box sx={{ mb: 3, flexGrow: 1, textAlign: "center" }}>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "rgba(255, 255, 255, 0.9)",
                        mb: 1,
                      }}
                    >
                      Our support team is ready to help you with any technical
                      issues, integration questions, or account management
                      needs. For urgent requests or onboarding help, please use
                      our contact form or email support@gliner-medical.com.
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "white",
                      color: "rgba(37, 150, 190, 1)",
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: "none",
                      alignSelf: "center",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        transform: "translateY(-1px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Contact Us
                  </Button>
                </CardContent>
              </Card>
            </Box>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
