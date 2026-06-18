import { Link } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { Button } from "../components/ui/button";

const features = [
  { title: "Historical Simulation VaR", icon: "◈" },
  { title: "SHAP Attribution", icon: "◆" },
  { title: "Real-time Breach Alerts", icon: "◇" },
];

export const LandingPage = () => (
  <main className="min-h-screen bg-bg-primary">
    <Navbar />
    <section className="min-h-[calc(100vh-3rem)] relative flex flex-col items-center justify-center px-6 py-16 bg-gradient-to-b from-slate-900 via-bg-primary to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(14,165,233,0.08),_transparent_55%)] pointer-events-none" />
      <div className="max-w-3xl text-center relative z-10">
        <p className="text-accent-cyan text-xs tracking-widest uppercase mb-4">Institutional risk infrastructure</p>
        <h1 className="text-slate-50 text-3xl md:text-5xl font-semibold leading-tight mb-6 tracking-tight">
          Know your risk. Before the market does.
        </h1>
        <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">
          VaR, CVaR, stress testing, and SHAP attribution — running every 60 seconds on your portfolio.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/dashboard">
            <Button className="px-6 py-3">Launch Dashboard</Button>
          </Link>
          <Link to="/docs">
            <Button variant="outline" className="px-6 py-3">
              View API Docs
            </Button>
          </Link>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4 w-full max-w-5xl mt-16 relative z-10">
        {features.map((f) => (
          <div key={f.title} className="terminal-panel p-6">
            <p className="text-accent-green text-xl mb-3">{f.icon}</p>
            <p className="text-text-primary text-base font-semibold">{f.title}</p>
          </div>
        ))}
      </div>
    </section>
  </main>
);
