import { DashNav, DashSider } from "./_components";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="drawer lg:drawer-open text-black mx-auto max-w-screen-2xl 2xl:border">
      <label htmlFor="my-drawer-2" className="sr-only">
        Toggle Drawer
      </label>
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content bg-white">
        <DashNav />
        <div className="p-5 lg:p-6">{children}</div>
      </div>
      <DashSider />
    </div>
  );
}
