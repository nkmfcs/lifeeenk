import BottomNav from "@/components/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="shell">{children}</main>
      <BottomNav />
    </>
  );
}
