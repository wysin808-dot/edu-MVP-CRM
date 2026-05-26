import AuthProvider from "@/components/providers/AuthProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { AuthGate } from "@/components/layout/AuthGate";

// All authenticated pages require runtime context (auth session),
// so disable static pre-rendering at build time.
export const dynamic = "force-dynamic";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <AuthProvider>
        <AuthGate>
          <div className="min-h-screen flex">
            <Sidebar />
            <div
              className="flex-1 flex flex-col min-h-screen"
              style={{ marginLeft: "var(--sidebar-width)" }}
            >
              <TopBar />
              <main className="flex-1 p-6 overflow-auto">{children}</main>
            </div>
          </div>
        </AuthGate>
      </AuthProvider>
    </QueryProvider>
  );
}
