"use client";

import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/logo";

/** Shared dashboard chrome: white header bar with breadcrumb + sign out. */
export function DashboardShell({
  section,
  initial,
  children,
}: {
  section: string;
  /** first letter of the signed-in user's name, once known */
  initial?: string;
  children: React.ReactNode;
}) {
  const t = useTranslations("dash");
  return (
    <div className="min-h-screen bg-[oklch(0.972_0.003_27.0)]">
      <header className="sticky top-0 z-20 border-b border-[oklch(0.916_0.004_27.0)] bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <a href="/">
              <Logo />
            </a>
            <span className="text-[14px] text-[oklch(0.840_0.004_27.0)]">/</span>
            <span className="text-[14px] text-[oklch(0.460_0.008_27.0)]">{section}</span>
          </div>
          <div className="flex items-center gap-2">
            {initial && (
              <div className="grid h-7 w-7 place-items-center rounded-full bg-[oklch(0.448_0.228_27.3)] text-[11px] font-bold text-white">
                {initial}
              </div>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg p-2 text-[12px] text-[oklch(0.500_0.006_27.0)] transition-colors hover:bg-[oklch(0.965_0.003_27.0)] hover:text-[oklch(0.200_0.010_27.0)]"
              title={t("signOut")}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-10">{children}</div>
    </div>
  );
}

/** Consistent empty / loading / error panel */
export function DashboardNotice({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[oklch(0.916_0.004_27.0)] bg-white px-6 py-14 text-center">
      <p className="text-[15px] font-semibold text-[oklch(0.150_0.012_27.0)]">{title}</p>
      {body && <p className="mx-auto mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-[oklch(0.560_0.006_27.0)]">{body}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
