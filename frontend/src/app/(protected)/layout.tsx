import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ToastProvider } from "@/contexts/toast-context";
import { GradientBackground } from "@/components/effects";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login?error=session_expired");
  }

  return (
    <ToastProvider>
      {/* Aurora gradient background */}
      <GradientBackground />

      {/* Main content */}
      <main className="min-h-screen">
        {children}
      </main>
    </ToastProvider>
  );
}
