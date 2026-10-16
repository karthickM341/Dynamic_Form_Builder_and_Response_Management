
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AddRounded,
  ArrowDownwardRounded,
  ArrowUpwardRounded,
  DeleteOutlineRounded,
  DragIndicatorRounded,
  EditRounded,
  SaveRounded,
  VisibilityRounded,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import {api} from "../api/client";
import type { FormData, FormField, FieldType } from "../types";

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "Short text" },
  { value: "number", label: "Number" },
  { value: "email", label: "Email" },
  { value: "date", label: "Date" },
  { value: "dropdown", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
  { value: "radio", label: "Radio buttons" },
  { value: "file", label: "File upload" },
  { value: "rating", label: "Rating" },
];

const createField = (order: number): FormField => ({
  field_name: `field_${Date.now()}`,
  label: "Untitled question",
  placeholder: "",
  field_type: "text",
  is_required: false,
  display_order: order,
  options: [],
});

const FormBuilder = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [form, setForm] = useState<FormData>({
    title: "",
    description: "",
    is_public: false,
    is_enabled: true,
    fields: [],
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!id) return;

    let mounted = true;

    const loadForm = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/forms/${id}`);

        if (mounted) {
          setForm({
            ...response.data,
            fields: [...(response.data.fields ?? [])].sort(
              (a: FormField, b: FormField) =>
                a.display_order - b.display_order
            ),
          });
        }
      } catch {
        if (mounted) {
          setError("Unable to load this form. Check your permissions.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadForm();

    return () => {
      mounted = false;
    };
  }, [id]);

  const selectedField = form.fields[selectedIndex];

  const updateForm = (changes: Partial<FormData>) => {
    setForm((current) => ({ ...current, ...changes }));
    setSuccess("");
  };

  const updateField = (index: number, changes: Partial<FormField>) => {
    setForm((current) => ({
      ...current,
      fields: current.fields.map((field, i) =>
        i === index ? { ...field, ...changes } : field
      ),
    }));
    setSuccess("");
  };

  const addField = (type: FieldType = "text") => {
    const field = createField(form.fields.length + 1);
    field.field_type = type;

    if (type === "dropdown" || type === "radio") {
      field.options = [
        { label: "Option 1", value: "option_1" },
        { label: "Option 2", value: "option_2" },
      ];
    }

    setForm((current) => ({
      ...current,
      fields: [...current.fields, field],
    }));

    setSelectedIndex(form.fields.length);
    setSuccess("");
  };

  const removeField = (index: number) => {
    const remaining = form.fields
      .filter((_, i) => i !== index)
      .map((field, i) => ({ ...field, display_order: i + 1 }));

    setForm((current) => ({ ...current, fields: remaining }));
    setSelectedIndex(Math.max(0, Math.min(index, remaining.length - 1)));
    setSuccess("");
  };

  const moveField = (index: number, direction: -1 | 1) => {
    const target = index + direction;

    if (target < 0 || target >= form.fields.length) return;

    const fields = [...form.fields];
    [fields[index], fields[target]] = [fields[target], fields[index]];

    setForm((current) => ({
      ...current,
      fields: fields.map((field, i) => ({
        ...field,
        display_order: i + 1,
      })),
    }));

    setSelectedIndex(target);
    setSuccess("");
  };

  const saveForm = async () => {
    if (!form.title.trim()) {
      setError("Please enter a form title.");
      return;
    }

    if (
      form.fields.some(
        (field) =>
          !field.label.trim() ||
          !field.field_name.trim()
      )
    ) {
      setError("Every field needs a label and field name.");
      return;
    }

    const names = form.fields.map((field) => field.field_name);

    if (new Set(names).size !== names.length) {
      setError("Each field must have a unique field name.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        title: form.title.trim(),
        description: form.description,
        is_public: form.is_public,
        is_enabled: form.is_enabled,
        fields: form.fields.map((field, index) => ({
          ...field,
          display_order: index + 1,
          options: field.options ?? [],
        })),
      };

      if (id) {
        await api.put(`/forms/${id}`, payload);
      } else {
        const response = await api.post("/forms", payload);

        if (response.data?.id) {
          navigate(`/forms/${response.data.id}/edit`, {
            replace: true,
          });
          return;
        }
      }

      setSuccess("Your form has been saved successfully.");
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
          : "Unable to save the form. Check your permissions and API configuration."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Loading form...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 1500,
        mx: "auto",
        px: { xs: 2, md: 4 },
        py: 3,
        minHeight: "100%",
        backgroundColor: "#f8fafc",
      }}
    >
      {/* Header */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
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
            {isEditing ? "Edit form" : "Form builder"}
          </Typography>

          <Typography sx={{ color: "#64748b", mt: 0.75 }}>
            Design your questions, configure settings, and preview your form.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            variant="outlined"
            startIcon={<VisibilityRounded />}
            onClick={() => {
              if (id) navigate(`/forms/${id}/fill`);
              else setSuccess("Preview the form after saving it.");
            }}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Preview
          </Button>

          <Button
            variant="contained"
            startIcon={<SaveRounded />}
            onClick={saveForm}
            disabled={saving}
            sx={{
              borderRadius: 2,
              px: 2.5,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            {saving ? "Saving..." : "Save form"}
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess("")}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          {success}
        </Alert>
      )}

      <Grid container spacing={2.5} alignItems="flex-start">
        {/* Main editor */}
        <Grid item xs={12} lg={8}>
          <Stack spacing={2.5}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid #e8edf4",
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Chip
                  label="FORM DETAILS"
                  size="small"
                  sx={{
                    mb: 2,
                    backgroundColor: "#eff6ff",
                    color: "#2563eb",
                    fontWeight: 800,
                    letterSpacing: 0.5,
                  }}
                />

                <TextField
                  fullWidth
                  label="Form title"
                  placeholder="e.g. Employee Registration"
                  value={form.title}
                  onChange={(event) =>
                    updateForm({ title: event.target.value })
                  }
                  sx={{ mb: 2.5 }}
                />

                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Description"
                  placeholder="Explain the purpose of this form"
                  value={form.description ?? ""}
                  onChange={(event) =>
                    updateForm({ description: event.target.value })
                  }
                />
              </CardContent>
            </Card>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              spacing={1.5}
            >
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Form questions
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {form.fields.length} question
                  {form.fields.length === 1 ? "" : "s"} · Select a question to edit
                </Typography>
              </Box>

              <Button
                variant="contained"
                startIcon={<AddRounded />}
                onClick={() => addField()}
                sx={{ borderRadius: 2, textTransform: "none" }}
              >
                Add question
              </Button>
            </Stack>

            {form.fields.length === 0 && (
              <Paper
                variant="outlined"
                sx={{
                  py: 7,
                  px: 3,
                  textAlign: "center",
                  borderStyle: "dashed",
                  borderRadius: 3,
                  backgroundColor: "#fff",
                }}
              >
                <AddRounded sx={{ fontSize: 40, color: "#2563eb", mb: 1 }} />
                <Typography variant="h6" fontWeight={750}>
                  Start building your form
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                  Add your first question and configure its settings.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => addField()}
                  sx={{ textTransform: "none" }}
                >
                  Add your first question
                </Button>
              </Paper>
            )}

            {form.fields.map((field, index) => (
              <Card
                key={field.id ?? field.field_name}
                elevation={0}
                onClick={() => setSelectedIndex(index)}
                sx={{
                  borderRadius: 3,
                  border:
                    selectedIndex === index
                      ? "2px solid #2563eb"
                      : "1px solid #e8edf4",
                  cursor: "pointer",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  boxShadow:
                    selectedIndex === index
                      ? "0 4px 16px rgba(37,99,235,0.08)"
                      : "none",
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Stack
                    direction="row"
                    alignItems="flex-start"
                    spacing={1.5}
                  >
                    <DragIndicatorRounded
                      sx={{ color: "#94a3b8", mt: 0.75 }}
                    />

                    <Box flex={1} minWidth={0}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={1}
                      >
                        <Typography
                          fontWeight={750}
                          sx={{ overflowWrap: "anywhere" }}
                        >
                          {index + 1}. {field.label || "Untitled question"}
                        </Typography>

                        <Chip
                          size="small"
                          label={field.field_type}
                          sx={{
                            backgroundColor: "#f1f5f9",
                            fontWeight: 650,
                          }}
                        />
                      </Stack>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        {field.placeholder || "No placeholder"}
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        sx={{ mt: 1.5 }}
                      >
                        {field.is_required && (
                          <Chip
                            size="small"
                            label="Required"
                            color="error"
                            variant="outlined"
                          />
                        )}

                        <Box flex={1} />

                        <Tooltip title="Move up">
                          <span>
                            <IconButton
                              size="small"
                              disabled={index === 0}
                              onClick={(event) => {
                                event.stopPropagation();
                                moveField(index, -1);
                              }}
                            >
                              <ArrowUpwardRounded fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title="Move down">
                          <span>
                            <IconButton
                              size="small"
                              disabled={index === form.fields.length - 1}
                              onClick={(event) => {
                                event.stopPropagation();
                                moveField(index, 1);
                              }}
                            >
                              <ArrowDownwardRounded fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title="Edit question">
                          <IconButton
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedIndex(index);
                            }}
                          >
                            <EditRounded fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete question">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(event) => {
                              event.stopPropagation();
                              removeField(index);
                            }}
                          >
                            <DeleteOutlineRounded fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Grid>

        {/* Settings panel */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={2.5}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid #e8edf4",
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" fontWeight={800}>
                  Question settings
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5, mb: 2.5 }}
                >
                  {selectedField
                    ? "Customize the selected question."
                    : "Select a question to configure its properties."}
                </Typography>

                {selectedField ? (
                  <Stack spacing={2.5}>
                    <TextField
                      fullWidth
                      label="Question label"
                      value={selectedField.label}
                      onChange={(event) =>
                        updateField(selectedIndex, {
                          label: event.target.value,
                        })
                      }
                    />

                    <TextField
                      fullWidth
                      label="Field name"
                      helperText="Unique key used in submitted answers"
                      value={selectedField.field_name}
                      onChange={(event) =>
                        updateField(selectedIndex, {
                          field_name: event.target.value
                            .trim()
                            .toLowerCase()
                            .replace(/[^a-z0-9_]/g, "_"),
                        })
                      }
                    />

                    <TextField
                      select
                      fullWidth
                      label="Field type"
                      value={selectedField.field_type}
                      onChange={(event) =>
                        updateField(selectedIndex, {
                          field_type: event.target.value as FieldType,
                          options:
                            event.target.value === "dropdown" ||
                            event.target.value === "radio"
                              ? selectedField.options?.length
                                ? selectedField.options
                                : [
                                    { label: "Option 1", value: "option_1" },
                                    { label: "Option 2", value: "option_2" },
                                  ]
                              : [],
                        })
                      }
                    >
                      {FIELD_TYPES.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      fullWidth
                      label="Placeholder"
                      value={selectedField.placeholder ?? ""}
                      onChange={(event) =>
                        updateField(selectedIndex, {
                          placeholder: event.target.value,
                        })
                      }
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedField.is_required}
                          onChange={(event) =>
                            updateField(selectedIndex, {
                              is_required: event.target.checked,
                            })
                          }
                        />
                      }
                      label="Required question"
                    />

                    {(selectedField.field_type === "dropdown" ||
                      selectedField.field_type === "radio") && (
                      <TextField
                        fullWidth
                        multiline
                        minRows={4}
                        label="Options"
                        helperText="Enter one option per line."
                        value={(selectedField.options ?? [])
                          .map((option) => option.label)
                          .join("\n")}
                        onChange={(event) => {
                          const options = event.target.value
                            .split("\n")
                            .map((label) => label.trim())
                            .filter(Boolean)
                            .map((label) => ({
                              label,
                              value: label
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "_")
                                .replace(/^_|_$/g, ""),
                            }));

                          updateField(selectedIndex, { options });
                        }}
                      />
                    )}
                  </Stack>
                ) : (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AddRounded />}
                    onClick={() => addField()}
                    sx={{ textTransform: "none" }}
                  >
                    Add a question
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card
              elevation={0}
              sx={{
                border: "1px solid #e8edf4",
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" fontWeight={800}>
                  Publishing settings
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={2}>
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.is_public}
                          onChange={(event) =>
                            updateForm({ is_public: event.target.checked })
                          }
                        />
                      }
                      label={
                        <Box>
                          <Typography fontWeight={650}>
                            Public form
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Allow access without logging in
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>

                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.is_enabled}
                          onChange={(event) =>
                            updateForm({ is_enabled: event.target.checked })
                          }
                        />
                      }
                      label={
                        <Box>
                          <Typography fontWeight={650}>
                            Form enabled
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Allow users to access the form
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Preview */}
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
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Typography variant="h6" fontWeight={800}>
                    Live preview
                  </Typography>
                  <VisibilityRounded sx={{ color: "#64748b" }} />
                </Stack>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "#fff",
                  }}
                >
                  <Typography fontWeight={800} sx={{ overflowWrap: "anywhere" }}>
                    {form.title || "Untitled form"}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.75, mb: 2 }}
                  >
                    {form.description || "Your form description appears here."}
                  </Typography>

                  <Divider sx={{ mb: 2 }} />

                  {form.fields.map((field, index) => (
                    <Box key={field.field_name || index} sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        fontWeight={650}
                        sx={{ mb: 0.75 }}
                      >
                        {field.label || "Untitled question"}
                        {field.is_required && (
                          <Box component="span" sx={{ color: "#dc2626" }}>
                            {" "}*
                          </Box>
                        )}
                      </Typography>

                      {field.field_type === "dropdown" ||
                      field.field_type === "radio" ? (
                        <TextField
                          select
                          fullWidth
                          size="small"
                          disabled
                          value=""
                          SelectProps={{ displayEmpty: true }}
                        >
                          <MenuItem value="">
                            {field.placeholder || "Choose an option"}
                          </MenuItem>
                          {(field.options ?? []).map((option) => (
                            <MenuItem
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      ) : (
                        <TextField
                          fullWidth
                          size="small"
                          disabled
                          placeholder={
                            field.placeholder || "Your answer"
                          }
                          type={
                            field.field_type === "email" ||
                            field.field_type === "number" ||
                            field.field_type === "date"
                              ? field.field_type
                              : "text"
                          }
                        />
                      )}
                    </Box>
                  ))}

                  {form.fields.length === 0 && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textAlign: "center", py: 2 }}
                    >
                      Add questions to preview your form.
                    </Typography>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    disabled
                    sx={{ mt: 1, textTransform: "none" }}
                  >
                    Submit response
                  </Button>
                </Paper>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FormBuilder;
