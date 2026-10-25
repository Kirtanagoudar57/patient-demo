import { useCallback, useRef, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { useClickOutside } from "../../hooks/useClickOutside";

// The backend has no notifications endpoint, so the panel explains that
// instead of showing invented alerts.
export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close, open);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
          </div>
          <div className="flex flex-col items-center px-6 py-8 text-center">
            <BellOff className="mb-2 h-6 w-6 text-slate-400" aria-hidden />
            <p className="text-sm font-medium text-slate-900">No notifications</p>
            <p className="mt-1 text-xs text-slate-500">
              The backend doesn't provide a notifications API yet. Action results appear as pop-up messages.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
