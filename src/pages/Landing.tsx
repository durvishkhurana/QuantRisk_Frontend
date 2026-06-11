import { Link } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";

const features = [
  { title: "Historical Simulation VaR", icon: "◈" },
  { title: "SHAP Attribution", icon: "◆" },
  { title: "Real-time Breach Alerts", icon: "◇" },
];

export const LandingPage = () => (
  <main className="min-h-screen bg-bg-primary">
    <Navbar />
    <section
      className="min-h-[calc(100vh-3rem)] relative flex flex-col items-center justify-center px-6 py-16"
      style={{
        backgroundImage:
          "linear-gradient(#0D1117, #0D1117), repeating-linear-gradient(0deg, transparent, transparent 39px, #1E2D40 39px, #1E2D40 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, #1E2D40 39px, #1E2D40 40px)",
        backgroundSize: "auto, 40px 40px, 40px 40px",
      }}
    >
      <div className="max-w-3xl text-center relative z-10">
        <p className="text-accent-cyan text-xs tracking-[0.25em] uppercase mb-4">Institutional risk infrastructure</p>
        <h1 className="text-white text-5xl md:text-6xl font-semibold leading-tight mb-5">
          Know your risk. Before the market does.
        </h1>
        <p className="text-text-secondary text-lg mb-8">
          VaR, CVaR, stress testing, and SHAP attribution — running every 60 seconds on your portfolio.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            to="/dashboard"
            className="px-6 py-3 rounded-terminal bg-accent-green text-bg-primary font-semibold text-sm hover:opacity-90"
          >
            Launch Dashboard
          </Link>
          <Link
            to="/docs"
            className="px-6 py-3 rounded-terminal border border-border text-text-primary text-sm hover:border-accent-cyan"
          >
            View API Docs
          </Link>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4 w-full max-w-5xl mt-16 relative z-10">
        {features.map((f) => (
          <div key={f.title} className="terminal-panel p-5">
            <p className="text-accent-green text-xl mb-3">{f.icon}</p>
            <p className="text-text-primary text-sm font-medium">{f.title}</p>
          </div>
        ))}
      </div>
    </section>
  </main>
);
