
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AddRounded,
  ArticleRounded,
  DeleteOutlineRounded,
  EditRounded,
  OpenInNewRounded,
  PeopleAltRounded,
  SearchRounded,
  VisibilityRounded,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {api} from "../api/client";

interface FormItem {
  id: number;
  title: string;
  description?: string | null;
  is_public: boolean;
  is_enabled: boolean;
  fields?: Array<unknown>;
  created_at?: string;
  response_count?: number;
}

type StatusFilter = "all" | "active" | "disabled";

const Forms = () => {
  const navigate = useNavigate();

  const [forms, setForms] = useState<FormItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [deleteTarget, setDeleteTarget] = useState<FormItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState("");

  const loadForms = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/forms");
      const data = response.data;

      setForms(Array.isArray(data) ? data : data.items ?? []);
    } catch {
      setError(
        "Unable to load forms. Check your login and backend connection."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  const filteredForms = useMemo(() => {
    const query = search.trim().toLowerCase();

    return forms.filter((form) => {
      const matchesSearch =
        !query ||
        form.title.toLowerCase().includes(query) ||
        (form.description ?? "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && form.is_enabled) ||
        (statusFilter === "disabled" && !form.is_enabled);

      return matchesSearch && matchesStatus;
    });
  }, [forms, search, statusFilter]);

  const toggleForm = async (form: FormItem) => {
    try {
      setActionError("");
      await api.patch(`/forms/${form.id}/toggle`);
      await loadForms();
    } catch {
      setActionError(`Could not change the status of "${form.title}".`);
    }
  };

  const deleteForm = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      setActionError("");

      await api.delete(`/forms/${deleteTarget.id}`);

      setForms((current) =>
        current.filter((form) => form.id !== deleteTarget.id)
      );

      setDeleteTarget(null);
    } catch {
      setActionError(
        `Could not delete "${deleteTarget.title}". Check your permissions.`
      );
    } finally {
      setDeleting(false);
    }
  };

  const totalForms = forms.length;
  const activeForms = forms.filter((form) => form.is_enabled).length;
  const disabledForms = totalForms - activeForms;

  const statCards = [
    {
      label: "Total forms",
      value: totalForms,
      color: "#2563eb",
      background: "#eff6ff",
      icon: <ArticleRounded />,
    },
    {
      label: "Active forms",
      value: activeForms,
      color: "#059669",
      background: "#ecfdf5",
      icon: <VisibilityRounded />,
    },
    {
      label: "Disabled forms",
      value: disabledForms,
      color: "#d97706",
      background: "#fffbeb",
      icon: <PeopleAltRounded />,
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
      {/* Heading */}
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
            }}
          >
            Forms
          </Typography>

          <Typography sx={{ mt: 1, color: "#64748b" }}>
            Create, organize, and manage your forms in one place.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddRounded />}
          onClick={() => navigate("/forms/new")}
          sx={{
            alignSelf: { xs: "flex-start", sm: "center" },
            px: 2.5,
            py: 1.25,
            borderRadius: 2.5,
            textTransform: "none",
            fontWeight: 700,
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.18)",
          }}
        >
          Create new form
        </Button>
      </Stack>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={loadForms}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {actionError && (
        <Alert
          severity="error"
          onClose={() => setActionError("")}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {actionError}
        </Alert>
      )}

      {/* Summary cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {statCards.map((stat) => (
          <Grid item xs={12} sm={4} key={stat.label}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid #e8edf4",
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography
                      sx={{
                        color: "#64748b",
                        fontWeight: 600,
                        fontSize: "0.88rem",
                      }}
                    >
                      {stat.label}
                    </Typography>

                    <Typography
                      variant="h4"
                      sx={{
                        mt: 1,
                        fontWeight: 800,
                        color: "#0f172a",
                      }}
                    >
                      {loading ? "—" : stat.value}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      borderRadius: 2.5,
                      backgroundColor: stat.background,
                      color: stat.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      "& svg": { fontSize: 25 },
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Search and filters */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          border: "1px solid #e8edf4",
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Search forms by title or description..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded sx={{ color: "#94a3b8" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "#fff",
                },
              }}
            />

            <TextField
              select
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              sx={{
                minWidth: { xs: "100%", md: 180 },
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            >
              <MenuItem value="all">All forms</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="disabled">Disabled</MenuItem>
            </TextField>

            <Button
              variant="outlined"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              sx={{
                minWidth: 100,
                borderRadius: 2,
                textTransform: "none",
              }}
            >
              Reset
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Form list heading */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 750, color: "#0f172a" }}
        >
          Your forms
        </Typography>

        <Typography variant="body2" sx={{ color: "#64748b" }}>
          {filteredForms.length} result
          {filteredForms.length === 1 ? "" : "s"}
        </Typography>
      </Stack>

      {/* Form cards */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredForms.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            border: "1px dashed #cbd5e1",
            borderRadius: 3,
            textAlign: "center",
          }}
        >
          <CardContent sx={{ py: 7, px: 3 }}>
            <Box
              sx={{
                mx: "auto",
                mb: 2,
                width: 64,
                height: 64,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#2563eb",
                backgroundColor: "#eff6ff",
              }}
            >
              <ArticleRounded sx={{ fontSize: 34 }} />
            </Box>

            <Typography variant="h6" fontWeight={750}>
              {forms.length === 0
                ? "Create your first form"
                : "No matching forms"}
            </Typography>

            <Typography sx={{ color: "#64748b", mt: 1, mb: 3 }}>
              {forms.length === 0
                ? "Start collecting information by creating a dynamic form."
                : "Try a different search term or change the status filter."}
            </Typography>

            {forms.length === 0 ? (
              <Button
                variant="contained"
                startIcon={<AddRounded />}
                onClick={() => navigate("/forms/new")}
                sx={{ textTransform: "none", borderRadius: 2 }}
              >
                Create a form
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
                sx={{ textTransform: "none" }}
              >
                Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {filteredForms.map((form) => (
            <Grid item xs={12} md={6} xl={4} key={form.id}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  border: "1px solid #e8edf4",
                  borderRadius: 3,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 12px 28px rgba(15,23,42,0.07)",
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: 2.5,
                    "&:last-child": { pb: 2.5 },
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={1.5}
                  >
                    <Box
                      sx={{
                        width: 46,
                        height: 46,
                        borderRadius: 2.5,
                        backgroundColor: "#eff6ff",
                        color: "#2563eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <ArticleRounded sx={{ fontSize: 25 }} />
                    </Box>

                    <Chip
                      size="small"
                      label={form.is_enabled ? "Active" : "Disabled"}
                      sx={{
                        fontWeight: 700,
                        backgroundColor: form.is_enabled
                          ? "#ecfdf5"
                          : "#f1f5f9",
                        color: form.is_enabled ? "#047857" : "#64748b",
                      }}
                    />
                  </Stack>

                  <Typography
                    variant="h6"
                    sx={{
                      mt: 2.5,
                      fontWeight: 750,
                      color: "#0f172a",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {form.title}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 1,
                      minHeight: 44,
                      color: "#64748b",
                      fontSize: "0.88rem",
                      lineHeight: 1.6,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {form.description || "No description provided."}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                      mt: 2.5,
                      mb: 2.5,
                      py: 1.5,
                      borderTop: "1px solid #edf2f7",
                      borderBottom: "1px solid #edf2f7",
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{ fontSize: "0.75rem", color: "#94a3b8" }}
                      >
                        Fields
                      </Typography>
                      <Typography fontWeight={750} sx={{ mt: 0.3 }}>
                        {form.fields?.length ?? "—"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        sx={{ fontSize: "0.75rem", color: "#94a3b8" }}
                      >
                        Visibility
                      </Typography>
                      <Typography fontWeight={750} sx={{ mt: 0.3 }}>
                        {form.is_public ? "Public" : "Restricted"}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    flexWrap="wrap"
                    useFlexGap
                  >
                    <Button
                      size="small"
                      startIcon={<PeopleAltRounded />}
                      onClick={() => navigate(`/forms/${form.id}/responses`)}
                      sx={{ textTransform: "none", fontWeight: 650 }}
                    >
                      Responses
                    </Button>

                    <Box sx={{ flexGrow: 1 }} />

                    <Tooltip title="Preview form">
                      <IconButton
                        size="small"
                        aria-label="Preview form"
                        onClick={() => navigate(`/forms/${form.id}/fill`)}
                      >
                        <OpenInNewRounded fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Edit form">
                      <IconButton
                        size="small"
                        aria-label="Edit form"
                        onClick={() => navigate(`/forms/${form.id}/edit`)}
                      >
                        <EditRounded fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip
                      title={form.is_enabled ? "Disable form" : "Enable form"}
                    >
                      <Button
                        size="small"
                        color={form.is_enabled ? "warning" : "success"}
                        onClick={() => toggleForm(form)}
                        sx={{
                          textTransform: "none",
                          minWidth: 0,
                          fontWeight: 650,
                        }}
                      >
                        {form.is_enabled ? "Disable" : "Enable"}
                      </Button>
                    </Tooltip>

                    <Tooltip title="Delete form">
                      <IconButton
                        size="small"
                        color="error"
                        aria-label="Delete form"
                        onClick={() => setDeleteTarget(form)}
                      >
                        <DeleteOutlineRounded fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete confirmation */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Delete this form?
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{deleteTarget?.title}"? This
            action may also affect associated response data, depending on
            your database relationships.
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button
            disabled={deleting}
            onClick={() => setDeleteTarget(null)}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            disabled={deleting}
            onClick={deleteForm}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            {deleting ? "Deleting..." : "Delete form"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Forms;
