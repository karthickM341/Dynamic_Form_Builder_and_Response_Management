
import { useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  AutoAwesomeRounded,
  DescriptionRounded,
  VisibilityRounded,
  VisibilityOffRounded,
  LockRounded,
  ArrowForwardRounded,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import {api} from "../api/client";

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Enter your username and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        username: username.trim(),
        password,
      });

      const data = response.data;
      const token = data.access_token ?? data.token;

      if (!token) {
        throw new Error("The login response did not include an access token.");
      }

      localStorage.setItem("access_token", token);
      localStorage.setItem("token", token);

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      navigate("/dashboard", { replace: true });
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
          : err instanceof Error
            ? err.message
            : "Login failed. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        backgroundColor: "#f8fafc",
      }}
    >
      {/* Branding panel */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          width: "48%",
          minHeight: "100vh",
          p: 6,
          flexDirection: "column",
          justifyContent: "space-between",
          color: "#ffffff",
          background:
            "radial-gradient(circle at 15% 20%, #334fba 0%, transparent 35%), linear-gradient(145deg, #101c3e 0%, #1e3a8a 55%, #4338ca 100%)",
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              backgroundColor: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <DescriptionRounded fontSize="large" />
          </Box>

          <Box>
            <Typography fontWeight={800} fontSize="1.15rem">
              FormFlow
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.7)" }}
            >
              Dynamic Form Management
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ maxWidth: 500, py: 5 }}>
          <Box
            sx={{
              width: 58,
              height: 58,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              backgroundColor: "rgba(255,255,255,0.12)",
              mb: 4,
            }}
          >
            <AutoAwesomeRounded sx={{ fontSize: 32 }} />
          </Box>

          <Typography
            variant="h2"
            sx={{
              fontWeight: 850,
              fontSize: { md: "2.6rem", lg: "3.4rem" },
              lineHeight: 1.15,
              letterSpacing: "-1.5px",
            }}
          >
            Better forms.
            <br />
            Smarter insights.
          </Typography>

          <Typography
            sx={{
              mt: 3,
              color: "rgba(255,255,255,0.76)",
              fontSize: "1.05rem",
              lineHeight: 1.9,
            }}
          >
            Create dynamic forms, collect responses, and understand your data
            through one streamlined workspace.
          </Typography>

          <Stack spacing={2} sx={{ mt: 5 }}>
            {[
              "Build forms without changing application code",
              "Manage submissions in one place",
              "Explore response analytics",
            ].map((feature) => (
              <Stack
                key={feature}
                direction="row"
                spacing={1.5}
                alignItems="center"
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "#93c5fd",
                  }}
                />
                <Typography
                  sx={{ color: "rgba(255,255,255,0.9)", fontSize: "0.94rem" }}
                >
                  {feature}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Typography
          variant="caption"
          sx={{ color: "rgba(255,255,255,0.6)" }}
        >
          Dynamic Form Builder & Response Management System
        </Typography>
      </Box>

      {/* Login panel */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2.5, sm: 5 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 440 }}>
          <Box sx={{ display: { xs: "block", md: "none" }, mb: 5 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <DescriptionRounded sx={{ color: "#2563eb", fontSize: 36 }} />
              <Typography fontWeight={850} fontSize="1.2rem">
                FormFlow
              </Typography>
            </Stack>
          </Box>

          <Card
            elevation={0}
            sx={{
              border: { xs: "none", md: "1px solid #e8edf4" },
              borderRadius: 4,
              backgroundColor: "transparent",
              boxShadow: { xs: "none", md: "0 18px 55px rgba(15,23,42,0.045)" },
            }}
          >
            <Box sx={{ p: { xs: 0, sm: 1, md: 4 } }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 850,
                  color: "#0f172a",
                  letterSpacing: "-1px",
                }}
              >
                Welcome back
              </Typography>

              <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
                Sign in to continue to your workspace.
              </Typography>

              {error && (
                <Alert
                  severity="error"
                  onClose={() => setError("")}
                  sx={{ mb: 3, borderRadius: 2 }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={2.5}>
                  <TextField
                    label="Username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    autoComplete="username"
                    fullWidth
                    required
                    autoFocus
                    disabled={loading}
                    placeholder="Enter your username"
                  />

                  <TextField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    fullWidth
                    required
                    disabled={loading}
                    placeholder="Enter your password"
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockRounded
                              sx={{ color: "#94a3b8", fontSize: 20 }}
                            />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword((value) => !value)}
                              edge="end"
                              aria-label={
                                showPassword ? "Hide password" : "Show password"
                              }
                            >
                              {showPassword ? (
                                <VisibilityOffRounded />
                              ) : (
                                <VisibilityRounded />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Typography
                      component={Link}
                      to="/forgot-password"
                      sx={{
                        color: "#2563eb",
                        fontWeight: 650,
                        fontSize: "0.875rem",
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      Forgot password?
                    </Typography>
                  </Box>

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={loading}
                    endIcon={
                      loading ? (
                        <CircularProgress size={19} color="inherit" />
                      ) : (
                        <ArrowForwardRounded />
                      )
                    }
                    sx={{
                      py: 1.5,
                      borderRadius: 2.5,
                      textTransform: "none",
                      fontWeight: 750,
                      fontSize: "1rem",
                      background:
                        "linear-gradient(100deg, #2563eb, #4f46e5)",
                      boxShadow: "0 8px 18px rgba(37,99,235,0.2)",
                      "&:hover": {
                        background:
                          "linear-gradient(100deg, #1d4ed8, #4338ca)",
                        boxShadow: "0 10px 22px rgba(37,99,235,0.25)",
                      },
                    }}
                  >
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>
                </Stack>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography
                textAlign="center"
                variant="body2"
                color="text.secondary"
              >
                Don't have an account?{" "}
                <Box
                  component={Link}
                  to="/register"
                  sx={{
                    color: "#2563eb",
                    fontWeight: 750,
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Create account
                </Box>
              </Typography>
            </Box>
          </Card>

          <Typography
            variant="caption"
            color="text.secondary"
            textAlign="center"
            display="block"
            sx={{ mt: 4 }}
          >
            Secure access to your form management workspace
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
