
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import {
  AddRounded,
  ArticleRounded,
  AssessmentRounded,
  CheckCircleRounded,
  DescriptionRounded,
  EastRounded,
  TrendingUpRounded,
} from "@mui/icons-material";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useNavigate } from "react-router-dom";
import {api} from "../api/client";

interface DashboardStats {
  total_forms?: number;
  active_forms?: number;
  total_responses?: number;
  forms_count?: number;
  active_forms_count?: number;
  responses_count?: number;
}

const weeklyActivity = [
  { day: "Mon", responses: 8 },
  { day: "Tue", responses: 14 },
  { day: "Wed", responses: 11 },
  { day: "Thu", responses: 22 },
  { day: "Fri", responses: 17 },
  { day: "Sat", responses: 28 },
  { day: "Sun", responses: 24 },
];

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/analytics/dashboard");

        if (mounted) {
          setStats(response.data);
        }
      } catch {
        if (mounted) {
          setError(
            "Unable to load dashboard statistics. Check your backend connection and try again."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const totalForms =
    stats.total_forms ?? stats.forms_count ?? 0;

  const activeForms =
    stats.active_forms ?? stats.active_forms_count ?? 0;

  const totalResponses =
    stats.total_responses ?? stats.responses_count ?? 0;

  const statCards = [
    {
      title: "Total forms",
      value: totalForms,
      subtitle: "Forms created in your workspace",
      icon: <DescriptionRounded />,
      color: "#2563eb",
      background: "#eff6ff",
    },
    {
      title: "Active forms",
      value: activeForms,
      subtitle: "Forms currently enabled",
      icon: <CheckCircleRounded />,
      color: "#059669",
      background: "#ecfdf5",
    },
    {
      title: "Total responses",
      value: totalResponses,
      subtitle: "Responses received",
      icon: <AssessmentRounded />,
      color: "#7c3aed",
      background: "#f5f3ff",
    },
  ];

  return (
    <Box
      sx={{
        maxWidth: 1440,
        mx: "auto",
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 4 },
        backgroundColor: "#f8fafc",
        minHeight: "100%",
      }}
    >
      {/* Page heading */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-1px",
              fontSize: { xs: "1.8rem", md: "2.25rem" },
            }}
          >
            Dashboard
          </Typography>

          <Typography
            sx={{ mt: 1, color: "#64748b", fontSize: "0.95rem" }}
          >
            Monitor your forms and response activity in one place.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddRounded />}
          onClick={() => navigate("/forms")}
          sx={{
            alignSelf: { xs: "flex-start", sm: "center" },
            borderRadius: 2.5,
            px: 2.5,
            py: 1.3,
            textTransform: "none",
            fontWeight: 700,
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
          }}
        >
          Manage forms
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Statistics */}
      <Grid container spacing={2.5}>
        {statCards.map((item) => (
          <Grid item xs={12} sm={6} lg={4} key={item.title}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                border: "1px solid #e8edf4",
                borderRadius: 3,
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 12px 28px rgba(15, 23, 42, 0.07)",
                },
              }}
            >
              <CardContent sx={{ p: 2.8, "&:last-child": { pb: 2.8 } }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Box>
                    <Typography
                      sx={{
                        color: "#64748b",
                        fontWeight: 600,
                        fontSize: "0.88rem",
                      }}
                    >
                      {item.title}
                    </Typography>

                    <Typography
                      variant="h3"
                      sx={{
                        mt: 1.5,
                        fontWeight: 800,
                        letterSpacing: "-1px",
                        color: "#0f172a",
                      }}
                    >
                      {loading ? "—" : item.value.toLocaleString()}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2.5,
                      backgroundColor: item.background,
                      color: item.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      "& svg": { fontSize: 27 },
                    }}
                  >
                    {item.icon}
                  </Box>
                </Stack>

                <Typography
                  sx={{ mt: 2, color: "#94a3b8", fontSize: "0.82rem" }}
                >
                  {item.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main dashboard panels */}
      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid item xs={12} lg={8}>
          <Card
            elevation={0}
            sx={{
              height: "100%",
              border: "1px solid #e8edf4",
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={1}
                sx={{ mb: 3 }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 750, color: "#0f172a" }}
                  >
                    Response activity
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#64748b", mt: 0.5 }}
                  >
                    Illustrative weekly response trend
                  </Typography>
                </Box>

                <Chip
                  label="Sample data"
                  size="small"
                  sx={{
                    backgroundColor: "#eff6ff",
                    color: "#2563eb",
                    fontWeight: 700,
                  }}
                />
              </Stack>

              <Box sx={{ width: "100%", height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={weeklyActivity}
                    margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="responseGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#2563eb"
                          stopOpacity={0.22}
                        />
                        <stop
                          offset="95%"
                          stopColor="#2563eb"
                          stopOpacity={0.01}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      stroke="#edf2f7"
                      strokeDasharray="4 4"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      dy={10}
                    />

                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                    />

                    <Tooltip
                      contentStyle={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="responses"
                      name="Responses"
                      stroke="#2563eb"
                      strokeWidth={3}
                      fill="url(#responseGradient)"
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>

              <Alert
                severity="info"
                icon={<TrendingUpRounded />}
                sx={{ mt: 2, borderRadius: 2 }}
              >
                This chart uses demonstration data. It is not a live report
                from your database.
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card
            elevation={0}
            sx={{
              height: "100%",
              border: "1px solid #e8edf4",
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 750, color: "#0f172a" }}
              >
                Workspace overview
              </Typography>

              <Typography
                variant="body2"
                sx={{ color: "#64748b", mt: 0.5, mb: 3 }}
              >
                Your current form activity
              </Typography>

              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : (
                <>
                  <Stack spacing={2.5}>
                    <Box>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        sx={{ mb: 1 }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Enabled forms
                        </Typography>
                        <Typography variant="body2" fontWeight={700}>
                          {activeForms} / {totalForms}
                        </Typography>
                      </Stack>

                      <LinearProgress
                        variant="determinate"
                        value={
                          totalForms > 0
                            ? Math.min((activeForms / totalForms) * 100, 100)
                            : 0
                        }
                        sx={{
                          height: 8,
                          borderRadius: 10,
                          backgroundColor: "#e2e8f0",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 10,
                            backgroundColor: "#059669",
                          },
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        backgroundColor: "#f8fafc",
                        border: "1px solid #edf2f7",
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <ArticleRounded sx={{ color: "#2563eb", fontSize: 28 }} />
                        <Box>
                          <Typography fontWeight={700}>
                            {totalForms} forms created
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Manage your form definitions
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>

                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        backgroundColor: "#f8fafc",
                        border: "1px solid #edf2f7",
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <AssessmentRounded
                          sx={{ color: "#7c3aed", fontSize: 28 }}
                        />
                        <Box>
                          <Typography fontWeight={700}>
                            {totalResponses} responses received
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Review submitted answers
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Stack>

                  <Button
                    fullWidth
                    variant="outlined"
                    endIcon={<EastRounded />}
                    onClick={() => navigate("/forms")}
                    sx={{
                      mt: 3,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 700,
                      py: 1.2,
                    }}
                  >
                    View all forms
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
