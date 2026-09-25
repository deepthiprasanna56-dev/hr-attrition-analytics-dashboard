"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";

const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

interface AetherFlowHeroProps {
  onExplore?: () => void;
  onSignIn?: () => void;
  className?: string;
}

const AetherFlowHero = ({ onExplore, onSignIn, className }: AetherFlowHeroProps) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const drawingContext = context;
    const canvasElement = canvas;

    let animationFrameId = 0;
    let particles: Particle[] = [];
    const mouse = { x: null as number | null, y: null as number | null, radius: 200 };

    class Particle {
      x: number;
      y: number;
      directionX: number;
      directionY: number;
      size: number;
      color: string;

      constructor(x: number, y: number, directionX: number, directionY: number, size: number, color: string) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
      }

      draw() {
        drawingContext.beginPath();
        drawingContext.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        drawingContext.fillStyle = this.color;
        drawingContext.fill();
      }

      update() {
        if (this.x > canvasElement.width || this.x < 0) this.directionX = -this.directionX;
        if (this.y > canvasElement.height || this.y < 0) this.directionY = -this.directionY;

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 0 && distance < mouse.radius + this.size) {
            const force = (mouse.radius - distance) / mouse.radius;
            this.x -= (dx / distance) * force * 5;
            this.y -= (dy / distance) * force * 5;
          }
        }

        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
      }
    }

    const init = () => {
      particles = [];
      const particleCount = Math.min(180, Math.floor((canvas.clientWidth * canvas.clientHeight) / 11000));
      for (let index = 0; index < particleCount; index += 1) {
        const size = Math.random() * 2 + 1;
        particles.push(new Particle(
          Math.random() * canvas.clientWidth,
          Math.random() * canvas.clientHeight,
          Math.random() * 0.4 - 0.2,
          Math.random() * 0.4 - 0.2,
          size,
          "rgba(191, 128, 255, 0.8)",
        ));
      }
    };

    const resizeCanvas = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvasElement.width = Math.floor(window.innerWidth * ratio);
      canvasElement.height = Math.floor(window.innerHeight * ratio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      drawingContext.setTransform(ratio, 0, 0, ratio, 0, 0);
      init();
    };

    const connect = () => {
      const connectionDistance = Math.min(window.innerWidth, window.innerHeight) / 3;
      for (let first = 0; first < particles.length; first += 1) {
        for (let second = first + 1; second < particles.length; second += 1) {
          const dx = particles[first].x - particles[second].x;
          const dy = particles[first].y - particles[second].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < connectionDistance) {
            const opacity = Math.max(0, 0.45 - distance / connectionDistance * 0.45);
            drawingContext.strokeStyle = `rgba(200, 150, 255, ${opacity})`;
            drawingContext.lineWidth = 1;
            drawingContext.beginPath();
            drawingContext.moveTo(particles[first].x, particles[first].y);
            drawingContext.lineTo(particles[second].x, particles[second].y);
            drawingContext.stroke();
          }
        }
      }
    };

    const animate = () => {
      drawingContext.fillStyle = "#050208";
      drawingContext.fillRect(0, 0, window.innerWidth, window.innerHeight);
      particles.forEach((particle) => particle.update());
      connect();
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };
    const handleMouseOut = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseOut);
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseOut);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index: number) => ({ opacity: 1, y: 0, transition: { delay: index * 0.2 + 0.5, duration: 0.8, ease: "easeInOut" as const } }),
  };

  return (
    <main className={cn("relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#050208] text-white", className)}>
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(103,56,157,0.2),transparent_48%)]" />
      {!reduceMotion && <>
        <motion.div aria-hidden="true" className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-purple-600/10 blur-[100px]" animate={{ x: [0, 35, 0], y: [0, -20, 0], scale: [1, 1.12, 1] }} transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-1/4 h-80 w-80 rounded-full bg-fuchsia-500/8 blur-[110px]" animate={{ x: [0, -28, 0], y: [0, 24, 0] }} transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }} />
      </>}
      <div className="relative z-10 grid w-full max-w-375 items-center gap-12 px-8 py-24 lg:grid-cols-[minmax(0,1fr)_minmax(330px,0.72fr)] lg:gap-16 lg:px-16 xl:px-24">
      <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">
        <motion.div custom={0} variants={fadeUpVariants} initial="hidden" animate="visible" className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-4 py-1.5 backdrop-blur-sm">
          <Zap className="h-4 w-4 text-purple-300" />
          <span className="text-sm font-medium text-gray-200">HR ATTRITION ANALYTICS</span>
        </motion.div>
        <motion.h1 custom={1} variants={fadeUpVariants} initial="hidden" animate="visible" className="mb-6 bg-linear-to-b from-white to-gray-400 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-7xl xl:text-8xl">PeoplePulse</motion.h1>
        <motion.p custom={2} variants={fadeUpVariants} initial="hidden" animate="visible" className="mx-auto mb-10 max-w-2xl text-lg text-gray-400 lg:mx-0">See the people behind the numbers. Understand attrition trends, spot retention risks and make confident workforce decisions.</motion.p>
        <motion.div custom={3} variants={fadeUpVariants} initial="hidden" animate="visible" className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
          <button type="button" onClick={onExplore} className="flex items-center gap-2 rounded-lg bg-white px-8 py-4 font-semibold text-black shadow-lg transition-colors duration-300 hover:bg-gray-200">Explore the dashboard <ArrowRight className="h-5 w-5" /></button>
          <button type="button" onClick={onSignIn} className="text-sm text-gray-400 transition-colors hover:text-white">Already have an account? <span className="font-semibold text-purple-300">Sign in</span></button>
        </motion.div>
      </div>
      <motion.aside custom={4} variants={fadeUpVariants} initial="hidden" animate="visible" whileHover={reduceMotion ? undefined : { y: -4, borderColor: "rgba(216,180,254,0.28)", transition: { duration: 0.25 } }} aria-label="Workforce insights preview" className={cn("mx-auto w-full max-w-107.5 rounded-2xl border border-white/10 bg-[#100b19]/80 p-5 shadow-[0_24px_100px_rgba(99,49,150,0.22)] backdrop-blur-xl sm:p-6 lg:mx-0 lg:justify-self-end", !reduceMotion && "hero-insights-float")}>
        <div className="mb-6 flex items-start justify-between gap-3">
          <div><span className="font-mono text-[10px] uppercase tracking-[0.18em] text-purple-200/70">WORKFORCE PULSE</span><h2 className="mt-2 text-lg font-semibold text-white">Retention overview</h2></div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/15 bg-emerald-300/10 px-2.5 py-1 text-[10px] text-emerald-200"><i className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300"/>Live insights</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.035] p-4"><span className="text-[11px] text-gray-400">Attrition rate</span><div className="mt-2 flex items-end gap-2"><b className="text-3xl font-semibold tracking-tight">6.8%</b><small className="mb-1 text-[10px] text-emerald-300">−1.2%</small></div><span className="mt-1 block text-[9px] text-gray-500">vs. previous year</span></div>
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.035] p-4"><span className="text-[11px] text-gray-400">Employees at risk</span><div className="mt-2 flex items-end gap-2"><b className="text-3xl font-semibold tracking-tight">14</b><small className="mb-1 text-[10px] text-amber-300">Needs review</small></div><span className="mt-1 block text-[9px] text-gray-500">across 3 departments</span></div>
        </div>
        <div className="mt-5 rounded-xl border border-white/[0.07] bg-white/2.5 p-4">
          <div className="mb-4 flex items-center justify-between"><span className="text-xs font-medium text-gray-200">Attrition by department</span><span className="font-mono text-[9px] text-gray-500">LAST 12 MONTHS</span></div>
          <div className="space-y-3">{[["Sales", 68, "#c084fc"], ["Engineering", 42, "#818cf8"], ["Customer success", 31, "#34d399"]].map(([label, value, color], index) => <div key={label} className="grid grid-cols-[104px_1fr_32px] items-center gap-2"><span className="truncate text-[10px] text-gray-400">{label}</span><span className="h-1.5 overflow-hidden rounded-full bg-white/10"><motion.i initial={{width: reduceMotion ? `${value}%` : 0}} animate={{width: `${value}%`}} transition={{duration: 1, delay: reduceMotion ? 0 : 0.9 + index * 0.16, ease: "easeOut"}} className="block h-full rounded-full" style={{background: color}} /></span><b className="text-right text-[10px] font-medium text-gray-300">{Math.round(Number(value) / 6)}%</b></div>)}</div>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-purple-300/10 bg-purple-400/[0.07] px-4 py-3"><div><span className="block text-[10px] font-medium text-purple-100">Team satisfaction</span><span className="mt-1 block text-[9px] text-gray-400">People-first insights for HR teams</span></div><div className="text-right"><b className="text-lg text-white">4.2</b><span className="ml-1 text-[10px] text-gray-400">/ 5</span><span className="block text-[9px] text-emerald-300">Positive trend</span></div></div>
        <p className="mt-4 text-center font-mono text-[8px] uppercase tracking-[0.15em] text-gray-600">Sample workforce data · Interactive insights inside</p>
      </motion.aside>
      </div>
      <div className="absolute bottom-6 left-0 right-0 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-gray-600">People analytics · retention · team health</div>
    </main>
  );
};

export default AetherFlowHero;





