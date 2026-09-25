"use client";

import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const MOTIQ_TOKENS = '@layer motiq{\n:root{--motiq-accent:#315fea;--motiq-accent-text:#244fd1;--motiq-bg:#f7f9fc;--motiq-bg-elevated:#f0f4f9;--motiq-border:#dce4ef;--motiq-border-strong:#c5d1e1;--motiq-fg:#101828;--motiq-fg-secondary:#344054;--motiq-muted:#667085;--motiq-signature:#e9564a;--motiq-surface:#fff;--motiq-surface-2:#f8fafd}\n.dark,[data-theme="dark"]{--motiq-accent:#4f7cff;--motiq-accent-text:#7f9fff;--motiq-bg:#080c14;--motiq-bg-elevated:#0d1420;--motiq-border:#263449;--motiq-border-strong:#354863;--motiq-fg:#f8fafc;--motiq-fg-secondary:#cbd5e1;--motiq-muted:#9caabd;--motiq-signature:#ff6b5e;--motiq-surface:#111827;--motiq-surface-2:#192337}}}';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
function clamp(value: number, min: number, max: number) { return Math.min(max, Math.max(min, value)); }
function useReducedMotion() {
  const [reduced, setReduced] = React.useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}
function useVisibilityPause(ref: React.RefObject<Element | null>) {
  const [visible, setVisible] = React.useState(true);
  React.useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  React.useEffect(() => {
    const update = () => setVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  return visible;
}

export type CompareRevealSource = React.ReactNode | { src: string; alt?: string };
export interface CompareRevealProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  before: CompareRevealSource;
  after: CompareRevealSource;
  defaultPosition?: number;
  position?: number;
  onPositionChange?: (pct: number) => void;
  introSweep?: boolean;
  stiffness?: number;
  damping?: number;
  labels?: [string, string];
  snapOnDoubleClick?: number;
  reducedMotion?: boolean;
  pauseWhenHidden?: boolean;
}

function isImageSource(source: CompareRevealSource): source is { src: string; alt?: string } {
  return typeof source === "object" && source !== null && !React.isValidElement(source) && "src" in source;
}
function renderSide(source: CompareRevealSource) {
  return isImageSource(source) ? <img src={source.src} alt={source.alt ?? ""} draggable={false} className="h-full w-full object-cover" /> : source;
}

export function CompareReveal({
  before, after, defaultPosition = 50, position, onPositionChange, introSweep = true,
  stiffness = 140, damping = 18, labels = ["Before", "After"], snapOnDoubleClick = 50,
  reducedMotion, pauseWhenHidden = true, className, ...props
}: CompareRevealProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const topRef = React.useRef<HTMLDivElement | null>(null);
  const dividerRef = React.useRef<HTMLDivElement | null>(null);
  const handleRef = React.useRef<HTMLButtonElement | null>(null);
  const reducedSystem = useReducedMotion();
  const visible = useVisibilityPause(rootRef);
  const still = reducedMotion === true || reducedSystem;
  const [pct, setPct] = React.useState(() => clamp(position ?? defaultPosition, 0, 100));
  const sim = React.useRef({ x: pct, target: pct, velocity: 0, dragging: false, pointerId: null as number | null, introDone: !introSweep, introStart: 0 });
  const pctRef = React.useRef(pct); pctRef.current = pct;

  const paint = React.useCallback((value: number) => {
    const x = clamp(value, 0, 100);
    if (topRef.current) topRef.current.style.clipPath = `inset(0 ${(100 - x).toFixed(3)}% 0 0)`;
    if (dividerRef.current) dividerRef.current.style.left = `${x.toFixed(3)}%`;
    handleRef.current?.setAttribute("aria-valuenow", String(Math.round(x)));
  }, []);

  React.useEffect(() => {
    if (position !== undefined) { setPct(clamp(position, 0, 100)); sim.current.target = clamp(position, 0, 100); }
  }, [position]);
  React.useEffect(() => {
    const active = !still && (!pauseWhenHidden || visible);
    if (!active) { sim.current.x = pct; sim.current.target = pct; sim.current.velocity = 0; paint(pct); return; }
    if (!sim.current.introDone) sim.current.introStart = performance.now();
    let raf = 0; let previous = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - previous) / 1000)); previous = now;
      const state = sim.current;
      if (!state.introDone) {
        const progress = Math.min(1, (now - state.introStart) / 2600);
        const wave = progress < 0.38 ? 50 + 46 * progress / 0.38 : progress < 0.78 ? 96 - 92 * (progress - 0.38) / 0.4 : 4 + 46 * (progress - 0.78) / 0.22;
        state.target = wave;
        if (progress >= 1) { state.introDone = true; state.target = pctRef.current; }
      }
      state.velocity += ((state.target - state.x) * stiffness - state.velocity * damping) * dt;
      state.x = clamp(state.x + state.velocity * dt, 0, 100);
      paint(state.x); raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [damping, paint, pauseWhenHidden, pct, stiffness, still, visible]);

  const commit = (next: number) => {
    const value = clamp(next, 0, 100); sim.current.introDone = true; sim.current.target = value; setPct(value); onPositionChange?.(value);
  };
  const positionFromX = (clientX: number) => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (rect) commit(((clientX - rect.left) / Math.max(1, rect.width)) * 100);
  };
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    sim.current.dragging = true; sim.current.pointerId = event.pointerId; event.currentTarget.setPointerCapture?.(event.pointerId); positionFromX(event.clientX);
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (sim.current.dragging && event.pointerId === sim.current.pointerId) positionFromX(event.clientX);
  };
  const endDrag = () => { sim.current.dragging = false; sim.current.pointerId = null; };
  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const step = event.shiftKey ? 10 : 2; const current = sim.current.target;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") { event.preventDefault(); commit(current + step); }
    else if (event.key === "ArrowLeft" || event.key === "ArrowDown") { event.preventDefault(); commit(current - step); }
    else if (event.key === "Home") { event.preventDefault(); commit(0); }
    else if (event.key === "End") { event.preventDefault(); commit(100); }
  };
  const shown = Math.round(clamp(pct, 0, 100));

  return <>
    <style dangerouslySetInnerHTML={{ __html: MOTIQ_TOKENS }} />
    <div ref={rootRef} role="group" aria-label={props["aria-label"] ?? `Comparison: ${labels[0]} versus ${labels[1]}`} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag} onDoubleClick={() => commit(snapOnDoubleClick)} data-motion={still ? "static" : "animated"} className={cn("relative aspect-16/10 w-full touch-pan-y select-none overflow-hidden rounded-2xl border border-(--motiq-border) bg-(--motiq-bg-elevated) cursor-ew-resize", className)} {...props}>
      <div className="absolute inset-0">{renderSide(after)}</div>
      <div ref={topRef} className="absolute inset-0 will-change-[clip-path]" style={{ clipPath: `inset(0 ${100 - shown}% 0 0)` }}>{renderSide(before)}</div>
      {labels.map((label, index) => <span key={`${label}-${index}`} className={cn("pointer-events-none absolute top-4 z-8 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white backdrop-blur-md", index === 0 ? "left-4" : "right-4")}>{label}</span>)}
      <div ref={dividerRef} className="pointer-events-none absolute bottom-0 top-0 z-10 -ml-px w-0.5 bg-(--motiq-signature)" style={{ left: `${shown}%` }}>
        <button ref={handleRef} type="button" role="slider" aria-label={`Reveal divider, ${labels[0]} to ${labels[1]}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={shown} aria-valuetext={`${shown}% ${labels[0]}`} onKeyDown={onKeyDown} className="pointer-events-auto absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-(--motiq-signature) bg-(--motiq-bg-elevated) text-(--motiq-signature) shadow-[0_0_0_6px_color-mix(in_oklab,var(--motiq-signature)_18%,transparent),0_0_26px_color-mix(in_oklab,var(--motiq-signature)_45%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--motiq-signature)">
          <span aria-hidden="true" className="text-xl leading-none">‹›</span>
        </button>
      </div>
    </div>
  </>;
}

export default CompareReveal;

