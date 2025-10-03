import React, { useState, useEffect, useRef } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Stack,
  Button,
  ThemeProvider,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Link as MuiLink,
  Collapse,
} from "@mui/material";
import {
  UserCircle,
  LogOut,
  ChevronDown,
  ChevronRight,
  FileText,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useKeycloakAuth } from "@/contexts/useKeycloakContext";
import { useAuth } from "@/contexts/useAuth";
import { subscribeUser } from "@/api/apiCalls";
import { mainTheme } from "@/theme/mainTheme";
import { Link } from "react-router-dom";

const NavBar: React.FC = () => {
  const { userProfile, isAuthenticated, token } = useKeycloakAuth();
  const { setRoles, handleLogoutRedirect } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string>("");
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [experimentsMenuOpen, setExperimentsMenuOpen] = useState(false);
  const experimentsMenuRef = useRef<HTMLDivElement>(null);

  const publicRoutes = ["/subscriptions", "/"];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  const logout = () => {
    handleLogoutRedirect();
    setRoles(undefined);
    setProfileAnchorEl(null);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleExperimentsMenuToggle = () => {
    setExperimentsMenuOpen(!experimentsMenuOpen);
  };

  const isExperimentsPage =
    location.pathname.startsWith("/experiments") ||
    location.pathname.startsWith("/documents");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        experimentsMenuRef.current &&
        !experimentsMenuRef.current.contains(event.target as Node)
      ) {
        setExperimentsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isAuthenticated && !isPublicRoute) {
    return null;
  }

  return (
    <ThemeProvider theme={mainTheme}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(15px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
          height: "64px",
          maxHeight: "64px",
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            px: { xs: 2, md: 4 },
            py: 0,
            minHeight: "64px !important",
            height: "64px",
            maxHeight: "64px",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Link
              to="/"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Box
                component="img"
                src="/logo.png"
                alt="MedLexica"
                sx={{
                  height: 56,
                  width: "auto",
                  mr: 1,
                }}
              />
            </Link>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            {isAuthenticated ? (
              <>
                <MuiLink
                  component={Link}
                  to="/extract-entities"
                  sx={{
                    color:
                      location.pathname === "/extract-entities"
                        ? "rgba(37, 150, 190)"
                        : "#666",
                    textDecoration: "none",
                    fontWeight:
                      location.pathname === "/extract-entities" ? 600 : 400,
                    fontSize: "0.9rem",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "rgba(37, 150, 190, 0.08)",
                      color: "rgba(37, 150, 190)",
                    },
                  }}
                >
                  Extract Entities
                </MuiLink>
                <MuiLink
                  component={Link}
                  to="/subscriptions"
                  sx={{
                    color:
                      location.pathname === "/subscriptions"
                        ? "rgba(37, 150, 190)"
                        : "#666",
                    textDecoration: "none",
                    fontWeight:
                      location.pathname === "/subscriptions" ? 600 : 400,
                    fontSize: "0.9rem",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "rgba(37, 150, 190, 0.08)",
                      color: "rgba(37, 150, 190)",
                    },
                  }}
                >
                  Plans
                </MuiLink>
                {userProfile &&
                  Array.isArray(userProfile.roles) &&
                  userProfile.roles.includes("premium_user") && (
                    <MuiLink
                      component={Link}
                      to="/experiments"
                      sx={{
                        color: isExperimentsPage
                          ? "rgba(37, 150, 190)"
                          : "#666",
                        textDecoration: "none",
                        fontWeight: isExperimentsPage ? 600 : 400,
                        fontSize: "0.9rem",
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: "rgba(37, 150, 190, 0.08)",
                          color: "rgba(37, 150, 190)",
                        },
                      }}
                    >
                      Experiments
                    </MuiLink>
                  )}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <IconButton
                    onClick={handleProfileMenuOpen}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "rgba(37, 150, 190, 0.08)",
                      },
                    }}
                  >
                    <UserCircle size={20} color="#666" />
                    <ChevronDown size={14} color="#666" />
                  </IconButton>

                  <Menu
                    anchorEl={profileAnchorEl}
                    open={Boolean(profileAnchorEl)}
                    onClose={handleProfileMenuClose}
                    disableScrollLock={true}
                    PaperProps={{
                      elevation: 8,
                      sx: {
                        mt: 1,
                        minWidth: 200,
                        borderRadius: 2,
                        border: "1px solid rgba(0, 0, 0, 0.1)",
                      },
                    }}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  >
                    <MenuItem
                      sx={{
                        pointerEvents: "none",
                        "&:hover": {
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      <ListItemIcon>
                        <UserCircle size={20} />
                      </ListItemIcon>
                      <ListItemText
                        primary={userProfile?.name || "User"}
                        secondary={userProfile?.email || ""}
                        primaryTypographyProps={{
                          fontWeight: 600,
                          fontSize: "0.8rem",
                          color: "#222",
                        }}
                        secondaryTypographyProps={{
                          fontSize: "0.8rem",
                          color: "#444",
                        }}
                      />
                    </MenuItem>
                    <Divider />
                    <MenuItem
                      onClick={logout}
                      sx={{
                        fontSize: "0.8rem",
                        "& .MuiListItemText-primary": {
                          fontSize: "0.8rem",
                        },
                      }}
                    >
                      <ListItemIcon>
                        <LogOut size={20} />
                      </ListItemIcon>
                      <ListItemText primary="Logout" />
                    </MenuItem>
                  </Menu>
                </Box>
              </>
            ) : (
              <MuiLink
                component={Link}
                to="/login"
                sx={{
                  color: "white",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  px: 2.5,
                  py: 0.75,
                  borderRadius: 3,
                  background:
                    "linear-gradient(135deg, rgba(37, 150, 190) 0%, rgba(45, 170, 210, 0.9) 100%)",
                  boxShadow: "0 4px 15px rgba(37, 150, 190, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(10px)",
                  transition: "all 0.3s ease",
                  textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, rgba(37, 150, 190, 0.9) 0%, rgba(45, 170, 210, 0.8) 100%)",
                    boxShadow: "0 6px 20px rgba(37, 150, 190, 0.4)",
                    transform: "translateY(-2px)",
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  },
                  "&:active": {
                    transform: "translateY(0px)",
                    boxShadow: "0 2px 10px rgba(37, 150, 190, 0.3)",
                  },
                }}
              >
                Login
              </MuiLink>
            )}
          </Box>
        </Toolbar>
        {error && (
          <Box
            sx={{ position: "fixed", top: 80, left: 0, right: 0, zIndex: 1300 }}
          >
            <Alert severity="error" onClose={() => setError("")}>
              {error}
            </Alert>
          </Box>
        )}
      </AppBar>
    </ThemeProvider>
  );
};

export default NavBar;
