
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ArrowBackRounded,
  DownloadRounded,
  DescriptionRounded,
  PictureAsPdfRounded,
  RefreshRounded,
  SearchRounded,
  VisibilityRounded,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import {api} from "../api/client";

interface FormResponse {
  id: number;
  form_id?: number;
  submitted_at?: string;
  created_at?: string;
  submitted_by?: string | null;
  user_id?: number | null;
  values?: Record<string, unknown>;
  details?: Array<{
    field_name?: string;
    value?: unknown;
  }>;
}

const getResponseValues = (
  response: FormResponse
): Record<string, unknown> => {
  if (response.values) return response.values;

  if (response.details) {
    return Object.fromEntries(
      response.details
        .filter((detail) => detail.field_name)
        .map((detail) => [
          detail.field_name as string,
          detail.value,
        ])
    );
  }

  return {};
};

const Responses = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [formTitle, setFormTitle] = useState("Form responses");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadResponses = useCallback(async () => {
    if (!id) {
      setError("A form ID is required to view responses.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [responsesResult, formResult] = await Promise.allSettled([
        api.get(`/forms/${id}/responses`),
        api.get(`/forms/${id}`),
      ]);

      if (responsesResult.status === "rejected") {
        throw responsesResult.reason;
      }

      const data = responsesResult.value.data;
      const list = Array.isArray(data)
        ? data
        : data.items ?? data.responses ?? [];

      setResponses(list);

      if (formResult.status === "fulfilled") {
        setFormTitle(formResult.value.data.title || "Form responses");
      }
    } catch (err: unknown) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "response" in err
          ? (
              err as {
                response?: { data?: { detail?: string } };
              }
            ).response?.data?.detail
          : undefined;

      setError(
        typeof message === "string"
          ? message
          : "Unable to load responses. Check your permissions and backend connection."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadResponses();
  }, [loadResponses]);

  const filteredResponses = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return responses;

    return responses.filter((response) => {
      const values = getResponseValues(response);

      return (
        String(response.id).includes(query) ||
        Object.entries(values).some(([key, value]) => {
          const text =
            typeof value === "object" && value !== null
              ? JSON.stringify(value)
              : String(value ?? "");

          return (
            key.toLowerCase().includes(query) ||
            text.toLowerCase().includes(query)
          );
        })
      );
    });
  }, [responses, search]);

  const visibleResponses = filteredResponses.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const exportFile = (format: "excel" | "pdf") => {
    if (!id) return;

    const baseURL =
      import.meta.env.VITE_API_URL || "http://localhost:8000/api";

    const token = localStorage.getItem("token") ||
      localStorage.getItem("access_token");

    const url = `${baseURL}/exports/${id}/${format}`;

    // Use the authenticated Axios client so the request includes
    // the same authorization configuration as other API requests.
    api
      .get(`/exports/${id}/${format}`, {
        responseType: "blob",
      })
      .then((response) => {
        const objectUrl = URL.createObjectURL(response.data);
        const link = document.createElement("a");

        link.href = objectUrl;
        link.download = `form-${id}-responses.${format === "excel" ? "xlsx" : "pdf"}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
      })
      .catch(() => {
        setError(
          `Unable to export ${format.toUpperCase()}. Check your permissions and export endpoint.`
        );
      });

    void url;
    void token;
  };

  const getDate = (response: FormResponse) => {
    const value = response.submitted_at ?? response.created_at;

    if (!value) return "—";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "—"
      : date.toLocaleString();
  };

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
      {/* Page header */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Back to forms">
            <IconButton
              onClick={() => navigate("/forms")}
              sx={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 2,
              }}
            >
              <ArrowBackRounded />
            </IconButton>
          </Tooltip>

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
              Responses
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                color: "#64748b",
                overflowWrap: "anywhere",
              }}
            >
              {formTitle} · Review submitted answers
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            variant="outlined"
            startIcon={<RefreshRounded />}
            onClick={loadResponses}
            disabled={loading}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Refresh
          </Button>

          <Button
            variant="outlined"
            startIcon={<PictureAsPdfRounded />}
            onClick={() => exportFile("pdf")}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Export PDF
          </Button>

          <Button
            variant="contained"
            startIcon={<DownloadRounded />}
            onClick={() => exportFile("excel")}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Export Excel
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={loadResponses}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Summary cards */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Card
          elevation={0}
          sx={{
            flex: 1,
            border: "1px solid #e8edf4",
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Total responses
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ mt: 1, fontWeight: 800, color: "#0f172a" }}
                >
                  {loading ? "—" : responses.length.toLocaleString()}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: 2.5,
                  display: "grid",
                  placeItems: "center",
                  color: "#2563eb",
                  backgroundColor: "#eff6ff",
                }}
              >
                <DescriptionRounded />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            flex: 1,
            border: "1px solid #e8edf4",
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Matching results
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ mt: 1, fontWeight: 800, color: "#0f172a" }}
                >
                  {loading ? "—" : filteredResponses.length.toLocaleString()}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: 2.5,
                  display: "grid",
                  placeItems: "center",
                  color: "#7c3aed",
                  backgroundColor: "#f5f3ff",
                }}
              >
                <SearchRounded />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Response table */}
      <Card
        elevation={0}
        sx={{
          border: "1px solid #e8edf4",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 2.5, pb: 2 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            spacing={2}
          >
            <Box>
              <Typography variant="h6" fontWeight={800}>
                All submissions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Search responses by answer or field name.
              </Typography>
            </Box>

            <TextField
              size="small"
              placeholder="Search responses..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              sx={{
                width: { xs: "100%", sm: 300 },
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded sx={{ color: "#94a3b8" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </CardContent>

        <TableContainer sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 750, color: "#475569" }}>
                  Response ID
                </TableCell>
                <TableCell sx={{ fontWeight: 750, color: "#475569" }}>
                  Submitted by
                </TableCell>
                <TableCell sx={{ fontWeight: 750, color: "#475569" }}>
                  Submitted at
                </TableCell>
                <TableCell sx={{ fontWeight: 750, color: "#475569" }}>
                  Answers
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 750, color: "#475569" }}>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={30} />
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                      Loading responses...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : visibleResponses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Box
                      sx={{
                        width: 58,
                        height: 58,
                        mx: "auto",
                        mb: 2,
                        borderRadius: 3,
                        backgroundColor: "#eff6ff",
                        color: "#2563eb",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <DescriptionRounded sx={{ fontSize: 30 }} />
                    </Box>

                    <Typography fontWeight={750}>
                      {responses.length === 0
                        ? "No responses yet"
                        : "No matching responses"}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.75 }}
                    >
                      {responses.length === 0
                        ? "Submitted answers will appear here."
                        : "Try another search term."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                visibleResponses.map((response) => {
                  const values = getResponseValues(response);
                  const answerCount = Object.keys(values).length;

                  return (
                    <TableRow
                      hover
                      key={response.id}
                      sx={{
                        "&:last-child td": { borderBottom: 0 },
                      }}
                    >
                      <TableCell>
                        <Typography
                          fontWeight={750}
                          sx={{ color: "#2563eb" }}
                        >
                          #{response.id}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {response.submitted_by ??
                          (response.user_id
                            ? `User #${response.user_id}`
                            : "Public respondent")}
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {getDate(response)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={`${answerCount} answer${answerCount === 1 ? "" : "s"}`}
                          sx={{
                            fontWeight: 650,
                            backgroundColor: "#f1f5f9",
                            color: "#475569",
                          }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Chip
                          size="small"
                          label="Submitted"
                          sx={{
                            backgroundColor: "#ecfdf5",
                            color: "#047857",
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredResponses.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>
    </Box>
  );
};

export default Responses;
