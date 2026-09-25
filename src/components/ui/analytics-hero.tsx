"use client";

import React from "react";
import { ArrowUpRight, Activity } from "lucide-react";

interface AnalyticsHeroProps {
  page: string;
  onExplore: () => void;
}

const chartValues = [58, 64, 61, 77, 70, 92, 83, 112, 99, 119, 108, 132];
const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function AnalyticsHero({ page, onExplore }: AnalyticsHeroProps) {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -5, y: x * 7 });
  };

  return (
    <section className="analytics-hero" aria-label="People analytics overview">
      <div className="analytics-hero-copy">
        <div className="analytics-hero-eyebrow"><Activity size={13} /> LIVE PEOPLE SIGNAL</div>
        <h1>{page === "Overview" ? "Good morning, Jordan" : page}</h1>
        <p>{page === "Overview" ? "Your people story, moving in the right direction." : "Explore your people data and discover what matters."}</p>
        <div className="analytics-hero-meta">
          <div><strong>6.85%</strong><span>attrition rate</span></div>
          <div><strong className="hero-positive">↓ 1.2%</strong><span>vs. last year</span></div>
        </div>
        <button type="button" className="hero-insight-button" onClick={onExplore}>View people insights <ArrowUpRight size={15} /></button>
      </div>
      <div ref={stageRef} className="hero-chart-stage" onPointerMove={handlePointerMove} onPointerLeave={() => setTilt({ x: 0, y: 0 })}>
        <div className="hero-chart-glow" />
        <div className="hero-chart-topline"><span>RETENTION SIGNAL</span><b>Healthy</b><i /></div>
        <div className="hero-chart-scene" style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}>
          <div className="hero-chart-grid" />
          <div className="hero-chart-floor" />
          <div className="hero-bars" aria-hidden="true">
            {chartValues.map((value, index) => <span key={monthLabels[index]} style={{ height: `${value / 1.7}px`, animationDelay: `${index * 80}ms` }}><i /></span>)}
          </div>
          <svg className="hero-chart-line" viewBox="0 0 620 210" preserveAspectRatio="none" aria-hidden="true">
            <defs><linearGradient id="hero-line" x1="0" x2="1"><stop stopColor="#4fd1a0" /><stop offset="1" stopColor="#91e8c5" /></linearGradient><linearGradient id="hero-area" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#4fd1a0" stopOpacity=".38" /><stop offset="1" stopColor="#4fd1a0" stopOpacity="0" /></linearGradient></defs>
            <path className="hero-area-path" d="M0 166 L56 150 L112 158 L168 116 L224 131 L280 82 L336 99 L392 50 L448 70 L504 30 L560 45 L620 10 L620 210 L0 210Z" fill="url(#hero-area)" />
            <path className="hero-line-path" d="M0 166 L56 150 L112 158 L168 116 L224 131 L280 82 L336 99 L392 50 L448 70 L504 30 L560 45 L620 10" fill="none" stroke="url(#hero-line)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle className="hero-line-dot" cx="504" cy="30" r="5" />
          </svg>
          <div className="hero-chart-tooltip"><span>OCTOBER</span><b>231 active</b><small>+8.2% this year</small></div>
        </div>
        <div className="hero-chart-axis">{monthLabels.map((month) => <span key={month}>{month}</span>)}</div>
      </div>
    </section>
  );
}
