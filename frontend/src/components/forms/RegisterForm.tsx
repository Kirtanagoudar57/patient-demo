import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { TextField } from "../ui/FormField";
import { PasswordField } from "./PasswordField";
import { Button } from "../ui/Button";
import { authService } from "../../services/authService";
import { ApiError, getErrorMessage } from "../../services/api";
import { registerSchema, type RegisterValues } from "../../lib/validation";

interface RegisterFormProps {
  submitLabel: string;
  onSuccess: (username: string) => void;
}

// Shared by the Signup page and the "Create user" dialog. Calls POST /auth/register.
export function RegisterForm({ submitLabel, onSuccess }: RegisterFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async ({ username, email, password }: RegisterValues) => {
    setFormError(null);
    try {
      await authService.register({ username, email, password });
      reset();
      onSuccess(username);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        // The backend doesn't say which of the two is taken.
        setFormError("That username or email is already registered.");
        return;
      }
      if (error instanceof ApiError) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          if (field === "username" || field === "email" || field === "password") setError(field, { message });
        }
      }
      setFormError(getErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {formError && (
        <div className="flex gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {formError}
        </div>
      )}
      <TextField
        label="Username"
        autoComplete="username"
        required
        error={errors.username?.message}
        {...register("username")}
      />
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        required
        error={errors.email?.message}
        {...register("email")}
      />
      <PasswordField
        label="Password"
        autoComplete="new-password"
        required
        hint="At least 8 characters."
        error={errors.password?.message}
        {...register("password")}
      />
      <PasswordField
        label="Confirm password"
        autoComplete="new-password"
        required
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      <Button type="submit" className="w-full" loading={isSubmitting}>
        {submitLabel}
      </Button>
    </form>
  );
}
