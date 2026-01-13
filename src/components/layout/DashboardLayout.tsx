import { Menubar } from './Menubar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Menubar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
