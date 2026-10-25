import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Clock } from "lucide-react";
import { AuthLayout } from "../layouts/AuthLayout";
import { TextField } from "../components/ui/FormField";
import { PasswordField } from "../components/forms/PasswordField";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../services/api";
import { loginSchema, type LoginValues } from "../lib/validation";

export default function Login() {
  const { login, logoutReason } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { username: "", password: "" } });

  const onSubmit = async (values: LoginValues) => {
    setFormError(null);
    try {
      // On success AuthContext stores the token and PublicOnlyRoute redirects.
      await login(values);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  };

  return (
    <AuthLayout
      title="Sign in to CarePoint"
      subtitle="Manage patient records securely."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-brand-600 hover:text-brand-700">
            Create one
          </Link>
        </>
      }
    >
      {logoutReason === "expired" && !formError && (
        <div className="mb-5 flex gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900" role="status">
          <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Your session has expired. Please sign in again.
        </div>
      )}
      {formError && (
        <div className="mb-5 flex gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <TextField
          label="Username"
          autoComplete="username"
          autoFocus
          error={errors.username?.message}
          {...register("username")}
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" className="w-full" loading={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
