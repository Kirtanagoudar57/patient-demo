import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout";
import { RegisterForm } from "../components/forms/RegisterForm";
import { useToast } from "../hooks/useToast";

export default function Signup() {
  const navigate = useNavigate();
  const toast = useToast();

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Register to start managing patient records."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm
        submitLabel="Create account"
        onSuccess={(username) => {
          // /auth/register doesn't return a token, so the user signs in next.
          toast.success("Account created", `You can now sign in as ${username}.`);
          navigate("/login", { replace: true });
        }}
      />
    </AuthLayout>
  );
}
