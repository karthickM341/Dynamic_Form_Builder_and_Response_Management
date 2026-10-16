
import { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  AnalyticsRounded,
  AssessmentRounded,
  DashboardRounded,
  DescriptionRounded,
  ExitToAppRounded,
  MenuRounded,
  PersonRounded,
  SettingsRounded,
} from "@mui/icons-material";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

const DRAWER_WIDTH = 260;

const navigationItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <DashboardRounded />,
  },
  {
    label: "My Forms",
    path: "/forms",
    icon: <DescriptionRounded />,
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: <AnalyticsRounded />,
  },
];

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const currentPage =
    navigationItems.find((item) => {
      if (item.path === "/forms") {
        return location.pathname.startsWith("/forms");
      }

      return location.pathname === item.path;
    })?.label ?? "Workspace";

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
      }}
    >
      <Box sx={{ px: 3, py: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              display: "grid",
              placeItems: "center",
              borderRadius: 2.5,
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              color: "#ffffff",
            }}
          >
            <DescriptionRounded />
          </Box>

          <Box>
            <Typography fontWeight={800} fontSize="0.95rem">
              FormFlow
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Form Management
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      <Typography
        variant="caption"
        sx={{
          px: 3,
          pt: 3,
          pb: 1.5,
          color: "#94a3b8",
          fontWeight: 750,
          letterSpacing: 1,
        }}
      >
        WORKSPACE
      </Typography>

      <List sx={{ px: 1.5, py: 0, flexGrow: 1 }}>
        {navigationItems.map((item) => {
          const active =
            item.path === "/forms"
              ? location.pathname.startsWith("/forms")
              : location.pathname === item.path;

          return (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              sx={{
                mb: 0.75,
                minHeight: 48,
                borderRadius: 2,
                color: active ? "#2563eb" : "#64748b",
                backgroundColor: active ? "#eff6ff" : "transparent",
                "&:hover": {
                  backgroundColor: active ? "#eff6ff" : "#f8fafc",
                },
                "& .MuiListItemIcon-root": {
                  color: active ? "#2563eb" : "#94a3b8",
                  minWidth: 40,
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: active ? 750 : 550,
                  fontSize: "0.9rem",
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ p: 1.5 }}>
        <Divider sx={{ mb: 1.5 }} />

        <ListItemButton
          onClick={handleLogout}
          sx={{
            minHeight: 46,
            borderRadius: 2,
            color: "#dc2626",
            "&:hover": { backgroundColor: "#fef2f2" },
          }}
        >
          <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
            <ExitToAppRounded />
          </ListItemIcon>
          <ListItemText
            primary="Sign out"
            primaryTypographyProps={{ fontWeight: 650, fontSize: "0.9rem" }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          backgroundColor: "#ffffff",
          color: "#0f172a",
          borderBottom: "1px solid #e8edf4",
          zIndex: theme.zIndex.drawer - 1,
        }}
      >
        <Toolbar sx={{ minHeight: "72px !important", px: { xs: 2, md: 3 } }}>
          {isMobile && (
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 1.5 }}
              aria-label="Open navigation"
            >
              <MenuRounded />
            </IconButton>
          )}

          <Box sx={{ flexGrow: 1 }}>
            <Typography fontWeight={800} fontSize="1rem">
              {currentPage}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Manage your forms and responses
            </Typography>
          </Box>

          <IconButton
            onClick={() => navigate("/profile")}
            aria-label="Open profile"
            sx={{
              border: "1px solid #e2e8f0",
              backgroundColor: "#f8fafc",
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: "#dbeafe",
                color: "#1d4ed8",
              }}
            >
              <PersonRounded fontSize="small" />
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
            },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              borderRight: "1px solid #e8edf4",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          minHeight: "100vh",
          pt: "72px",
        }}
      >
        <Box sx={{ p: { xs: 0, md: 1 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
