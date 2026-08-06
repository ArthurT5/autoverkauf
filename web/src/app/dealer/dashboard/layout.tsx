import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DealerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (role !== "DEALER" && role !== "ADMIN") redirect("/buyer/dashboard");
  return <>{children}</>;
}
