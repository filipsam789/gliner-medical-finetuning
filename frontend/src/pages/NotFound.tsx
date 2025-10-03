import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { Frown } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Paper elevation={4} sx={{ p: 6, textAlign: "center", maxWidth: 400 }}>
  <Frown color="#d32f2f" size={64} style={{ marginBottom: 16 }} />
        <Typography variant="h2" component="h1" gutterBottom color="error">
          404
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Oops! Page not found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          The page you are looking for does not exist or has been moved.
        </Typography>
        <Button
          component={Link}
          to="/"
          variant="contained"
          color="primary"
          size="large"
        >
          Return to Home
        </Button>
      </Paper>
    </Box>
  );
};

export default NotFound;
