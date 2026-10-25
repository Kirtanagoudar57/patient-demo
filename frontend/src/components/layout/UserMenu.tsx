import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, LogOut, Settings, UserCircle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useClickOutside } from "../../hooks/useClickOutside";
import { Avatar } from "./Avatar";

export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close, open);

  if (!user) return null;

  const itemClass = "flex w-full items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-slate-100"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Avatar name={user.username} />
        <span className="hidden max-w-[10rem] truncate text-sm font-medium text-slate-700 sm:block">{user.username}</span>
        <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" aria-hidden />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-xs text-slate-500">Signed in as</p>
            <p className="truncate text-sm font-medium text-slate-900">{user.username}</p>
          </div>
          <div className="py-1">
            <Link to="/profile" role="menuitem" className={itemClass} onClick={close}>
              <UserCircle className="h-4 w-4 text-slate-400" aria-hidden /> Profile
            </Link>
            <Link to="/settings" role="menuitem" className={itemClass} onClick={close}>
              <Settings className="h-4 w-4 text-slate-400" aria-hidden /> Settings
            </Link>
          </div>
          <div className="border-t border-slate-100 py-1">
            <button type="button" role="menuitem" className={itemClass} onClick={() => logout("manual")}>
              <LogOut className="h-4 w-4 text-slate-400" aria-hidden /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
