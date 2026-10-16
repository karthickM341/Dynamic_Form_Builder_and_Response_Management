import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
} from "@mui/material";
import { api } from "../api/client";
import { useNavigate } from "react-router-dom";

interface RegisterForm {
  username: string;
  email: string;
  password: string;
}

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterForm>({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    field: keyof RegisterForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleRegister = async () => {
    if (
      !form.username ||
      !form.email ||
      !form.password
    ) {
      setError(
        "Please fill in all required fields."
      );
      return;
    }

    try {
      setError("");
      setLoading(true);

      await api.post(
        "/auth/register",
        form
      );

      navigate("/login");
    } catch (error: any) {
      setError(
        error?.response?.data?.detail ||
          "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      maxWidth={420}
      mx="auto"
      sx={{ mt: 8 }}
    >
      <Paper
        elevation={4}
        sx={{ p: 4 }}
      >
        <Typography
          variant="h4"
          mb={3}
          textAlign="center"
        >
          Register
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          margin="normal"
          label="Username"
          value={form.username}
          onChange={(event) =>
            handleChange(
              "username",
              event.target.value
            )
          }
        />

        <TextField
          fullWidth
          margin="normal"
          label="Email"
          type="email"
          value={form.email}
          onChange={(event) =>
            handleChange(
              "email",
              event.target.value
            )
          }
        />

        <TextField
          fullWidth
          margin="normal"
          label="Password"
          type="password"
          value={form.password}
          onChange={(event) =>
            handleChange(
              "password",
              event.target.value
            )
          }
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          sx={{ mt: 2 }}
          onClick={handleRegister}
          disabled={loading}
        >
          {loading
            ? "Creating account..."
            : "Create Account"}
        </Button>
      </Paper>
    </Box>
  );
}