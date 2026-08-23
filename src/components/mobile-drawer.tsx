"use client";

import { useEffect, useState } from "react";
import { NavIcons } from "@/components/icons";

/**
 * The slide-over navigation for phones and small tablets. The nav itself is
 * rendered on the server and handed in as children, so the drawer and the
 * desktop sidebar can never drift apart.
 */
export function MobileDrawer({
  children,
  openLabel,
  closeLabel,
}: {
  children: React.ReactNode;
  openLabel: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);

  // Close on Escape, and stop the page behind scrolling while it is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={openLabel}
        className="rounded-lg p-2 text-navy-100 transition hover:bg-white/10 lg:hidden"
      >
        <NavIcons.menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label={closeLabel}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-navy-900 shadow-2xl">
            <div className="flex items-center justify-end px-3 py-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={closeLabel}
                className="rounded-lg p-2 text-navy-200 transition hover:bg-white/10"
              >
                <NavIcons.close className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto pb-6" onClick={() => setOpen(false)}>
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
