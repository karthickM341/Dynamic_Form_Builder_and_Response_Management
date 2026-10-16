
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Rating,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  CheckCircleOutlineRounded,
  SendRounded,
} from "@mui/icons-material";
import { useParams } from "react-router-dom";
import {api} from "../api/client";
import type { FormData, FormField } from "../types";

const FormPreview = () => {
  const { id } = useParams<{ id: string }>();

  const [form, setForm] = useState<FormData | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadForm = async () => {
      if (!id) {
        setError("Form ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`/forms/${id}`);
        const data = response.data;

        setForm({
          ...data,
          fields: [...(data.fields ?? [])].sort(
            (a: FormField, b: FormField) =>
              a.display_order - b.display_order
          ),
        });
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
            : "Unable to load this form. It may be unavailable or disabled."
        );
      } finally {
        setLoading(false);
      }
    };

    loadForm();
  }, [id]);

  const updateAnswer = (fieldName: string, value: unknown) => {
    setAnswers((previous) => ({
      ...previous,
      [fieldName]: value,
    }));
  };

  const isVisible = (field: FormField) => {
    const rule = field.conditional_rules;

    if (!rule?.field) return true;

    return String(answers[rule.field] ?? "") === String(rule.equals ?? "");
  };

  const submitForm = async () => {
    if (!form || !id) return;

    setError("");

    const missing = form.fields.find((field) => {
      if (!field.is_required || !isVisible(field)) return false;

      const value = answers[field.field_name];

      if (Array.isArray(value)) return value.length === 0;
      if (typeof value === "number") return false;

      return value === undefined || value === null || String(value).trim() === "";
    });

    if (missing) {
      setError(`Please complete the required field: ${missing.label}`);
      return;
    }

    try {
      setSubmitting(true);

      await api.post(`/forms/${id}/responses`, {
        answers,
        values: answers,
      });

      setSuccess(true);
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
          : "Unable to submit your response. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (success) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "grid",
          placeItems: "center",
          p: 3,
          backgroundColor: "#f8fafc",
        }}
      >
        <Card sx={{ maxWidth: 480, width: "100%", borderRadius: 4 }}>
          <CardContent sx={{ p: 5, textAlign: "center" }}>
            <CheckCircleOutlineRounded
              sx={{ fontSize: 64, color: "#059669", mb: 2 }}
            />
            <Typography variant="h5" fontWeight={800}>
              Response submitted!
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Thank you. Your response has been recorded.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!form) {
    return (
      <Box sx={{ maxWidth: 700, mx: "auto", p: 3 }}>
        <Alert severity="error">
          {error || "This form could not be found."}
        </Alert>
      </Box>
    );
  }

  const renderField = (field: FormField) => {
    const value = answers[field.field_name];

    const common = {
      fullWidth: true,
      required: field.is_required,
      label: field.label,
      placeholder: field.placeholder || "",
      value: typeof value === "string" || typeof value === "number" ? value : "",
      onChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => updateAnswer(field.field_name, event.target.value),
    };

    switch (field.field_type) {
      case "number":
        return (
          <TextField
            {...common}
            type="number"
            slotProps={{ htmlInput: { min: 0 } }}
          />
        );

      case "email":
        return <TextField {...common} type="email" />;

      case "date":
        return (
          <TextField
            {...common}
            type="date"
            slotProps={{ inputLabel: { shrink: true } }}
          />
        );

      case "dropdown":
        return (
          <TextField {...common} select>
            {(field.options ?? []).map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        );

      case "checkbox": {
        const selected = Array.isArray(value) ? value : [];

        return (
          <FormControl required={field.is_required}>
            <FormLabel>{field.label}</FormLabel>
            <FormGroup>
              {(field.options ?? []).map((option) => (
                <FormControlLabel
                  key={option.value}
                  label={option.label}
                  control={
                    <Checkbox
                      checked={selected.includes(option.value)}
                      onChange={(event) => {
                        const next = event.target.checked
                          ? [...selected, option.value]
                          : selected.filter(
                              (item) => item !== option.value
                            );

                        updateAnswer(field.field_name, next);
                      }}
                    />
                  }
                />
              ))}
            </FormGroup>
          </FormControl>
        );
      }

      case "radio":
        return (
          <FormControl required={field.is_required}>
            <FormLabel>{field.label}</FormLabel>
            <RadioGroup
              value={typeof value === "string" ? value : ""}
              onChange={(event) =>
                updateAnswer(field.field_name, event.target.value)
              }
            >
              {(field.options ?? []).map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  control={<Radio />}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );

      case "rating":
        return (
          <Box>
            <FormLabel required={field.is_required}>
              {field.label}
            </FormLabel>
            <Rating
              size="large"
              value={typeof value === "number" ? value : 0}
              onChange={(_, next) =>
                updateAnswer(field.field_name, next ?? 0)
              }
            />
          </Box>
        );

      case "file":
        return (
          <TextField
            fullWidth
            type="file"
            required={field.is_required}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const file = event.target.files?.[0];
              updateAnswer(field.field_name, file?.name ?? "");
            }}
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="This version records the selected filename, not the uploaded file."
          />
        );

      default:
        return <TextField {...common} multiline minRows={2} />;
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f1f5f9",
        py: { xs: 3, md: 6 },
        px: 2,
      }}
    >
      <Box sx={{ maxWidth: 760, mx: "auto" }}>
        <Box
          sx={{
            height: 8,
            backgroundColor: "#2563eb",
            borderRadius: "12px 12px 0 0",
          }}
        />

        <Card
          elevation={0}
          sx={{
            border: "1px solid #e2e8f0",
            borderRadius: "0 0 12px 12px",
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 5 } }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: "#0f172a",
                letterSpacing: "-0.7px",
                overflowWrap: "anywhere",
              }}
            >
              {form.title}
            </Typography>

            {form.description && (
              <Typography color="text.secondary" sx={{ mt: 1.5, mb: 3 }}>
                {form.description}
              </Typography>
            )}

            <Typography variant="caption" color="text.secondary">
              * Indicates a required field
            </Typography>

            <Stack spacing={3.5} sx={{ mt: 4 }}>
              {form.fields.filter(isVisible).map((field) => (
                <Box key={field.id ?? field.field_name}>
                  {field.field_type !== "checkbox" &&
                    field.field_type !== "radio" &&
                    field.field_type !== "rating" &&
                    field.field_type !== "file" && (
                      <Typography
                        variant="body2"
                        fontWeight={650}
                        sx={{ mb: 1 }}
                      >
                        {field.label}
                        {field.is_required ? " *" : ""}
                      </Typography>
                    )}

                  {renderField(field)}
                </Box>
              ))}

              {error && <Alert severity="error">{error}</Alert>}

              <Button
                variant="contained"
                size="large"
                endIcon={<SendRounded />}
                onClick={submitForm}
                disabled={submitting}
                sx={{
                  alignSelf: "flex-start",
                  px: 4,
                  py: 1.4,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 750,
                  boxShadow: "none",
                }}
              >
                {submitting ? "Submitting..." : "Submit response"}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", textAlign: "center", mt: 3 }}
        >
          Powered by Dynamic Form Builder
        </Typography>
      </Box>
    </Box>
  );
};

export default FormPreview;
