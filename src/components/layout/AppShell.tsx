import { ReactNode } from "react";
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
}) => (
  <div className="min-h-screen bg-bg-primary flex">
    <Sidebar />
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar breadcrumb={breadcrumb} wsConnected={wsConnected} />
      <div className="flex-1 p-4 overflow-auto">{children}</div>
    </div>
  </div>
);
