
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  AssessmentRounded,
  CheckCircleRounded,
  DescriptionRounded,
  RefreshRounded,
  TrendingUpRounded,
  PeopleAltRounded,
} from "@mui/icons-material";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {api} from "../api/client";

interface DashboardAnalytics {
  total_forms?: number;
  forms_count?: number;
  active_forms?: number;
  active_forms_count?: number;
  total_responses?: number;
  responses_count?: number;
  total_users?: number;
  users_count?: number;
  response_trend?: Array<{
    date?: string;
    day?: string;
    responses?: number;
    count?: number;
  }>;
  forms_by_status?: Array<{
    status?: string;
    count?: number;
  }>;
}

interface TrendItem {
  date: string;
  responses: number;
}

const Analytics = () => {
  const [analytics, setAnalytics] = useState<DashboardAnalytics>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("7");

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/analytics/dashboard");
      setAnalytics(response.data ?? {});
    } catch (err: unknown) {
      const detail =
        typeof err === "object" && err !== null && "response" in err
          ? (
              err as {
                response?: { data?: { detail?: string } };
              }
            ).response?.data?.detail
          : undefined;

      setError(
        typeof detail === "string"
          ? detail
          : "Unable to load analytics. Please check your API connection and permissions."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const totalForms =
    analytics.total_forms ?? analytics.forms_count ?? 0;

  const activeForms =
    analytics.active_forms ?? analytics.active_forms_count ?? 0;

  const totalResponses =
    analytics.total_responses ?? analytics.responses_count ?? 0;

  const totalUsers =
    analytics.total_users ?? analytics.users_count ?? 0;

  const trendData = useMemo<TrendItem[]>(() => {
    if (analytics.response_trend?.length) {
      return analytics.response_trend.map((item) => ({
        date: item.date ?? item.day ?? "",
        responses: item.responses ?? item.count ?? 0,
      }));
    }

    // No fabricated analytics: show an empty chart until the API
    // provides response_trend data.
    return [];
  }, [analytics.response_trend]);

  const visibleTrend = useMemo(() => {
    return trendData.slice(-Number(period));
  }, [trendData, period]);

  const metrics = [
    {
      title: "Total forms",
      value: totalForms,
      description: "Forms created",
      icon: <DescriptionRounded />,
      color: "#2563eb",
      background: "#eff6ff",
    },
    {
      title: "Active forms",
      value: activeForms,
      description: "Forms enabled",
      icon: <CheckCircleRounded />,
      color: "#059669",
      background: "#ecfdf5",
    },
    {
      title: "Total responses",
      value: totalResponses,
      description: "Responses recorded",
      icon: <AssessmentRounded />,
      color: "#7c3aed",
      background: "#f5f3ff",
    },
    {
      title: "Registered users",
      value: totalUsers,
      description: "Platform users",
      icon: <PeopleAltRounded />,
      color: "#d97706",
      background: "#fffbeb",
    },
  ];

  return (
    <Box
      sx={{
        maxWidth: 1440,
        mx: "auto",
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 4 },
        minHeight: "100%",
        backgroundColor: "#f8fafc",
      }}
    >
      {/* Header */}
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
              fontSize: { xs: "1.7rem", md: "2.1rem" },
            }}
          >
            Analytics & Insights
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            Understand form activity and submission performance.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshRounded />}
          onClick={loadAnalytics}
          disabled={loading}
          sx={{
            alignSelf: { xs: "flex-start", sm: "center" },
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 650,
          }}
        >
          Refresh data
        </Button>
      </Stack>

      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {error}
        </Alert>
      )}

      {/* Metric cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {metrics.map((metric) => (
          <Grid item xs={12} sm={6} lg={3} key={metric.title}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                border: "1px solid #e8edf4",
                borderRadius: 3,
                transition: "transform 180ms ease, box-shadow 180ms ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 12px 28px rgba(15,23,42,0.06)",
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack
                  direction="row"
                  alignItems="flex-start"
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      {metric.title}
                    </Typography>

                    <Typography
                      variant="h4"
                      sx={{
                        mt: 1.5,
                        fontWeight: 800,
                        color: "#0f172a",
                      }}
                    >
                      {loading
                        ? "—"
                        : metric.value.toLocaleString()}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mt: 1 }}
                    >
                      {metric.description}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      flexShrink: 0,
                      borderRadius: 2.5,
                      display: "grid",
                      placeItems: "center",
                      color: metric.color,
                      backgroundColor: metric.background,
                    }}
                  >
                    {metric.icon}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Response trend */}
      <Card
        elevation={0}
        sx={{
          border: "1px solid #e8edf4",
          borderRadius: 3,
          mb: 3,
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <TrendingUpRounded sx={{ color: "#2563eb" }} />
                <Typography variant="h6" fontWeight={800}>
                  Response activity
                </Typography>
              </Stack>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.75 }}
              >
                Submission trends returned by your analytics API.
              </Typography>
            </Box>

            <TextField
              select
              size="small"
              label="Display period"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              sx={{
                minWidth: 150,
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            >
              <MenuItem value="7">Last 7 records</MenuItem>
              <MenuItem value="14">Last 14 records</MenuItem>
              <MenuItem value="30">Last 30 records</MenuItem>
            </TextField>
          </Stack>

          {loading ? (
            <Box
              sx={{
                height: 320,
                display: "grid",
                placeItems: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : visibleTrend.length > 0 ? (
            <Box sx={{ width: "100%", height: 340 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={visibleTrend}
                  margin={{ top: 10, right: 12, left: -15, bottom: 5 }}
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
                        stopOpacity={0.24}
                      />
                      <stop
                        offset="95%"
                        stopColor="#2563eb"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke="#e9eef5"
                    strokeDasharray="4 4"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <ChartTooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                    }}
                  />

                  <Legend />

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
          ) : (
            <Box
              sx={{
                minHeight: 280,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                px: 2,
              }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: 3,
                  backgroundColor: "#eff6ff",
                  color: "#2563eb",
                  display: "grid",
                  placeItems: "center",
                  mb: 2,
                }}
              >
                <AssessmentRounded sx={{ fontSize: 32 }} />
              </Box>

              <Typography fontWeight={750}>
                No response trend data available
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.75, maxWidth: 420 }}
              >
                The summary metrics are displayed above. To populate this chart,
                your dashboard endpoint must return a response_trend array.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Data note */}
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        Analytics reflect the data returned by your backend. The chart remains
        empty until trend data is available; no sample statistics are invented.
      </Alert>
    </Box>
  );
};

export default Analytics;
