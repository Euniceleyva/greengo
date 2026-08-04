import { Toaster } from "@/components/ui/toast";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="operations-theme min-h-screen">
      {children}
      <Toaster />
    </div>
  );
}
