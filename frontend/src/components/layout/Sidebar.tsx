import { NavLink } from "react-router-dom";
import { ChevronsLeft, ChevronsRight, Plus, X } from "lucide-react";
import { NAV_SECTIONS } from "../../lib/navigation";
import { cn } from "../../lib/cn";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

function Logo({ compact }: { compact: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
        <Plus className="h-5 w-5" strokeWidth={3} aria-hidden />
      </div>
      {!compact && <span className="text-[15px] font-semibold tracking-tight text-slate-900">CarePoint</span>}
    </div>
  );
}

function NavList({ compact, onNavigate }: { compact: boolean; onNavigate?: () => void }) {
  return (
    <nav aria-label="Main" className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
      {NAV_SECTIONS.map((section) => (
        <div key={section.title}>
          {compact ? (
            <div className="mx-2 mb-2 border-t border-slate-200" aria-hidden />
          ) : (
            <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-slate-400">{section.title}</p>
          )}
          <ul className="space-y-1">
            {section.items.map(({ label, to, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={onNavigate}
                  title={compact ? label : undefined}
                  className={({ isActive }) =>
                    cn(
                      "flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                      compact && "justify-center px-0",
                      isActive
                        ? "bg-brand-50 text-brand-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    )
                  }
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
                  {compact ? <span className="sr-only">{label}</span> : label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function Sidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  return (
    <>
      {/* Desktop / tablet: fixed, collapsible */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-slate-200 bg-white transition-[width] duration-200 lg:flex",
          collapsed ? "w-[72px]" : "w-64",
        )}
      >
        <div className={cn("flex h-16 items-center border-b border-slate-200 px-5", collapsed && "justify-center px-0")}>
          <Logo compact={collapsed} />
        </div>
        <NavList compact={collapsed} />
        <div className="border-t border-slate-200 p-3">
          <button
            type="button"
            onClick={onToggleCollapsed}
            className={cn(
              "flex h-9 w-full items-center gap-3 rounded-lg px-3 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900",
              collapsed && "justify-center px-0",
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            {!collapsed && "Collapse"}
          </button>
        </div>
      </aside>

      {/* Mobile: off-canvas drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 transition-[visibility] duration-200 lg:hidden",
          mobileOpen ? "visible" : "invisible",
        )}
      >
        <div
          className={cn("absolute inset-0 bg-slate-900/40 transition-opacity", mobileOpen ? "opacity-100" : "opacity-0")}
          onClick={onCloseMobile}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl transition-transform duration-200",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
            <Logo compact={false} />
            <button
              type="button"
              onClick={onCloseMobile}
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <NavList compact={false} onNavigate={onCloseMobile} />
        </aside>
      </div>
    </>
  );
}
