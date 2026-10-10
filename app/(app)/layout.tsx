import BottomNav from "@/components/BottomNav";
import Fab from "@/components/Fab";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="shell">{children}</main>
      <Fab />
      <BottomNav />
    </>
  );
}
