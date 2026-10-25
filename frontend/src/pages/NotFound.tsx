import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";
import { Button, buttonStyles } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";

export default function NotFound() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
          <Compass className="h-7 w-7 text-brand-600" aria-hidden />
        </div>
        <p className="text-sm font-semibold text-brand-600">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Page not found</h1>
        <p className="mt-3 text-sm text-slate-500">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" aria-hidden /> Go back
          </Button>
          <Link to={isAuthenticated ? "/dashboard" : "/login"} className={buttonStyles("primary")}>
            {isAuthenticated ? "Go to dashboard" : "Go to sign in"}
          </Link>
        </div>
      </div>
    </div>
  );
}
