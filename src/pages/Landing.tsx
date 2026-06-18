import { Link } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { Button } from "../components/ui/button";

const features = [
  { 
    title: "Historical Simulation VaR", 
    desc: "Calculate value at risk using actual historical joint returns at 95% and 99% confidence intervals.",
    icon: (
      <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
      </svg>
    )
  },
  { 
    title: "SHAP Risk Attribution", 
    desc: "Quantify position-level risk contributions using cooperative game-theoretic attribution.",
    icon: (
      <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a2 2 0 01-2 2H3m2 0h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2z" />
      </svg>
    )
  },
  { 
    title: "Real-time Limit Monitoring", 
    desc: "Active WebSockets trigger instantaneous visual alerts if portfolio VaR breaches user-defined limits.",
    icon: (
      <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    )
  },
];

export const LandingPage = () => (
  <main className="min-h-screen bg-bg-primary">
    <Navbar />
    <section className="min-h-[calc(100vh-3.5rem)] relative flex flex-col items-center justify-center px-6 py-20 bg-gradient-to-b from-[#060a12] via-bg-primary to-bg-primary">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.04),_transparent_60%)] pointer-events-none" />
      
      <div className="max-w-4xl text-center relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-gold/15 bg-accent-gold/5 text-accent-gold text-[10px] tracking-[0.2em] uppercase font-semibold">
          Institutional Risk Analytics Platform
        </div>
        <h1 className="text-text-primary text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] max-w-3xl mx-auto">
          Understand Portfolio Risk. <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-gold via-amber-200 to-white">
            Before the Market Moves.
          </span>
        </h1>
        <p className="text-text-secondary text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          A high-density quantitative analytics suite offering real-time Value-at-Risk (VaR), correlation regime monitoring, LSTM volatility forecasting, and game-theoretic risk attribution.
        </p>
        <div className="flex flex-wrap gap-4 justify-center pt-4">
          <Link to="/dashboard">
            <Button className="px-6 py-2.5">Launch Terminal</Button>
          </Link>
          <Link to="/docs">
            <Button variant="outline" className="px-6 py-2.5">
              API Specifications
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 w-full max-w-5xl mt-20 relative z-10">
        {features.map((f) => (
          <div key={f.title} className="terminal-panel p-6 border border-white/[0.04] bg-[#070b12]/50 hover:border-accent-gold/15 transition-all duration-200">
            <div className="p-2 w-fit rounded bg-accent-gold/5 border border-accent-gold/10 mb-4">
              {f.icon}
            </div>
            <h3 className="text-text-primary text-sm font-semibold tracking-tight mb-2">{f.title}</h3>
            <p className="text-text-muted text-xs leading-relaxed font-sans">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  </main>
);
