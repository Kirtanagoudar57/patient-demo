import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { SEGMENT_LABELS } from "../../lib/navigation";

// Builds "Home > Patients > #12" from the current URL.
export function Breadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((segment, index) => ({
    to: "/" + segments.slice(0, index + 1).join("/"),
    label: SEGMENT_LABELS[segment] ?? (/^\d+$/.test(segment) ? `#${segment}` : decodeURIComponent(segment)),
  }));

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex items-center gap-1.5 text-sm">
        <li className="flex items-center">
          <Link to="/dashboard" className="text-slate-400 hover:text-slate-600" aria-label="Home">
            <Home className="h-4 w-4" />
          </Link>
        </li>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={crumb.to} className="flex min-w-0 items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" aria-hidden />
              {isLast ? (
                <span className="truncate font-medium text-slate-900" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link to={crumb.to} className="truncate text-slate-500 hover:text-slate-700">
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
