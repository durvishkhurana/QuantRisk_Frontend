import { ReactNode, useState } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export const AppShell = ({
  children,
  breadcrumb,
  wsConnected,
}: {
  children: ReactNode;
  breadcrumb?: string;
  wsConnected?: boolean;
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-bg-primary flex">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((v) => !v)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar breadcrumb={breadcrumb} wsConnected={wsConnected} sidebarCollapsed={sidebarCollapsed} />
        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </div>
    </div>
  );
};
