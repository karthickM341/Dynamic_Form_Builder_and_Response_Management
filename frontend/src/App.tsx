import { ReactNode } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Layout from "./components/Layout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Forms from "./pages/Forms";
import FormBuilder from "./pages/FormBuilder";
import FormFill from "./pages/FormFill";
import Responses from "./pages/Responses";

import { useAuth } from "./context/AuthContext";

interface ProtectedProps {
  children: ReactNode;
}

function Protected({
  children,
}: ProtectedProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      
        <Routes>

          {/* Authentication */}
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* Public Form */}
          <Route
            path="/forms/:id/fill"
            element={<FormFill />}
          />

          {/* Protected Dashboard */}
          <Route
            path="/dashboard"
            element={
              <Protected>
                <Dashboard />
              </Protected>
            }
          />

          {/* Forms */}
          <Route
            path="/forms"
            element={
              <Protected>
                <Forms />
              </Protected>
            }
          />

          {/* Create Form */}
          <Route
            path="/forms/new"
            element={
              <Protected>
                <FormBuilder />
              </Protected>
            }
          />

          {/* Edit Form */}
          <Route
            path="/forms/:id/edit"
            element={
              <Protected>
                <FormBuilder />
              </Protected>
            }
          />

          {/* Responses */}
          <Route
            path="/forms/:id/responses"
            element={
              <Protected>
                <Responses />
              </Protected>
            }
          />

          {/* Unknown route */}
          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

        </Routes>
      
    </BrowserRouter>
  );
}