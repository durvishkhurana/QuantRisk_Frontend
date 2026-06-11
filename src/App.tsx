import { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "./store";
import { AlertsPage } from "./pages/Alerts";
import { AuthPage } from "./pages/Auth";
import { DashboardPage } from "./pages/Dashboard";
import { DocsPage } from "./pages/Docs";
import { LandingPage } from "./pages/Landing";
import { AggregateViewPage } from "./pages/AggregateView";
import { PortfolioPage } from "./pages/PortfolioDetail";

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
      <Route path="/aggregate" element={<Protected><AggregateViewPage /></Protected>} />
      <Route path="/portfolio/:portfolioId" element={<Protected><PortfolioPage /></Protected>} />
      <Route path="/alerts" element={<Protected><AlertsPage /></Protected>} />
      <Route path="/docs" element={<DocsPage />} />
    </Routes>
  );
};

const Protected = ({ children }: { children: ReactNode }) => {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/auth" replace />;
  return children;
};
