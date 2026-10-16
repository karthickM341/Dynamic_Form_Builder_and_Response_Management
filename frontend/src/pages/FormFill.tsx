import { useEffect, useState } from "react";
import {
  Button,
  Paper,
  Stack,
  Typography,
  Alert,
  CircularProgress,
  Box,
} from "@mui/material";
import { api } from "../api/client";
import { useParams, useNavigate } from "react-router-dom";
import FieldRenderer from "../components/FieldRenderer";
import { FormField } from "../types";

interface FormData {
  id?: number;
  title: string;
  description?: string;
  fields: FormField[];
}

export default function FormFill() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData | null>(null);
  const [values, setValues] = useState<Record<string, any>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadForm = async () => {
      if (!id) {
        setError("Form ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        try {
          const response = await api.get(
            `/public/forms/${id}`
          );

          setForm(response.data);
        } catch {
          const response = await api.get(
            `/forms/${id}`
          );

          setForm(response.data);
        }
      } catch (err: any) {
        console.error(err);

        setError(
          err.response?.data?.detail ||
            "Unable to load this form."
        );
      } finally {
        setLoading(false);
      }
    };

    loadForm();
  }, [id]);

  const handleFieldChange = (
    fieldName: string,
    value: any
  ) => {
    setValues((previous) => ({
      ...previous,
      [fieldName]: value,
    }));
  };

  const isFieldVisible = (field: FormField) => {
    const rule = field.conditional_rules;

    if (!rule?.field) {
      return true;
    }

    return values[rule.field] === rule.equals;
  };

  const submitForm = async () => {
    if (!id) {
      setError("Form ID is missing.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");
      setError("");

      const payload = {
        values,
      };

      try {
        await api.post(
          `/public/forms/${id}/responses`,
          payload
        );
      } catch {
        await api.post(
          `/forms/${id}/responses`,
          payload
        );
      }

      setMessage(
        "Response submitted successfully."
      );

      setTimeout(() => {
        navigate("/forms");
      }, 1000);
    } catch (err: any) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Submission failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error && !form) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  if (!form) {
    return (
      <Alert severity="warning">
        Form not found.
      </Alert>
    );
  }

  return (
    <Paper
      sx={{
        p: 4,
        maxWidth: 900,
        mx: "auto",
      }}
    >
      <Typography
        variant="h3"
        gutterBottom
      >
        {form.title}
      </Typography>

      {form.description && (
        <Typography
          mb={3}
          color="text.secondary"
        >
          {form.description}
        </Typography>
      )}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      {message && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
        >
          {message}
        </Alert>
      )}

      <Stack spacing={3}>
        {form.fields.map((field) => {
          if (!isFieldVisible(field)) {
            return null;
          }

          return (
            <FieldRenderer
              key={
                field.id ||
                field.field_name
              }
              field={field}
              value={
                values[field.field_name]
              }
              onChange={(value) =>
                handleFieldChange(
                  field.field_name,
                  value
                )
              }
            />
          );
        })}

        <Button
          variant="contained"
          size="large"
          onClick={submitForm}
          disabled={submitting}
        >
          {submitting
            ? "Submitting..."
            : "Submit"}
        </Button>
      </Stack>
    </Paper>
  );
}