"use client";
import { useEffect, useRef, useState } from "react";

// Scroll progress bar that fills as you scroll
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? scrolled / max : 0;
      setProgress(p);
      document.documentElement.style.setProperty("--scroll-progress", String(p));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className="scroll-progress"
      style={{ transform: `scaleX(${progress})` } as React.CSSProperties}
      aria-hidden
    />
  );
}

// Global animations: keypress pulse on inputs + auto ripple on buttons/cards + scroll reveal + parallax
export function GlobalAnimations() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: (() => void)[] = [];

    // Parallax for blobs (subtle)
    if (!prefersReduced) {
      let ticking = false;
      const onScrollParallax = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = window.scrollY;
          document.querySelectorAll<HTMLElement>(".blob-purple, .blob-purple-soft").forEach((el, i) => {
            const speed = 0.025 + (i % 3) * 0.015;
            el.style.transform = `translateY(${y * speed}px)`;
          });
          ticking = false;
        });
      };
      window.addEventListener("scroll", onScrollParallax, { passive: true });
      cleanups.push(() => window.removeEventListener("scroll", onScrollParallax));
    }

    // Keypress pulse: typing-active on input/textarea
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (!target || !(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
      if (e.key.length !== 1 && e.key !== "Backspace" && e.key !== "Enter" && e.key !== "Delete" && e.key !== " ") return;
      target.classList.add("typing-active");
      target.style.transform = "scale(1.005)";
      window.setTimeout(() => {
        target.style.transform = "";
      }, 120);
      window.setTimeout(() => {
        target.classList.remove("typing-active");
      }, 400);
    };
    document.addEventListener("keydown", onKeyDown, true);
    cleanups.push(() => document.removeEventListener("keydown", onKeyDown, true));

    // Ripple on click/touch for buttons and cards
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = (e.target as HTMLElement)?.closest?.(".btn, .card, .card-compact, [data-ripple]") as HTMLElement | null;
      if (!target) return;
      if ((target as HTMLButtonElement).disabled) return;
      const rect = target.getBoundingClientRect();
      const clientX = (e as MouseEvent).clientX ?? (e as TouchEvent).touches?.[0]?.clientX ?? rect.left + rect.width / 2;
      const clientY = (e as MouseEvent).clientY ?? (e as TouchEvent).touches?.[0]?.clientY ?? rect.top + rect.height / 2;
      const size = Math.max(rect.width, rect.height) * 1.1;
      const x = clientX - rect.left - size / 2;
      const y = clientY - rect.top - size / 2;
      const ripple = document.createElement("span");
      ripple.className = "key-ripple";
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.position = "absolute";
      const prevPos = getComputedStyle(target).position;
      if (prevPos === "static") target.style.position = "relative";
      target.style.overflow = "hidden";
      target.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
      if (!prefersReduced) {
        target.style.transform = "scale(0.98)";
        setTimeout(() => (target.style.transform = ""), 150);
      }
    };
    document.addEventListener("mousedown", onPointerDown as any, { passive: true });
    document.addEventListener("touchstart", onPointerDown as any, { passive: true });
    cleanups.push(() => document.removeEventListener("mousedown", onPointerDown as any));
    cleanups.push(() => document.removeEventListener("touchstart", onPointerDown as any));

    // Scroll reveal for cards and sections (auto)
    let observer: IntersectionObserver | null = null;
    let mo: MutationObserver | null = null;
    if (!prefersReduced && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement;
              el.classList.add("revealed");
              const stagger = el.getAttribute("data-stagger");
              if (stagger) {
                const children = el.querySelectorAll<HTMLElement>("[data-stagger-item]");
                children.forEach((child, idx) => {
                  child.style.transitionDelay = `${idx * 60}ms`;
                  child.classList.add("revealed");
                });
              }
              observer!.unobserve(el);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
      );
      const observeCards = () => {
        document.querySelectorAll<HTMLElement>(".card, .card-compact, [data-reveal]").forEach((el) => {
          if (!el.classList.contains("scroll-reveal") && !el.classList.contains("scroll-reveal-stagger")) {
            el.classList.add("scroll-reveal");
          }
          observer!.observe(el);
        });
      };
      observeCards();
      mo = new MutationObserver(observeCards);
      mo.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      cleanups.forEach((fn) => fn());
      observer?.disconnect();
      mo?.disconnect();
    };
  }, []);

  return null;
}

// Hook: reveal element when it enters viewport
export function useScrollReveal<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          obs.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px", ...options }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [options]);

  return { ref, isVisible };
}

// Wrapper: fades/slides in on scroll
export function Reveal({
  children,
  delay = 0,
  stagger = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  stagger?: number;
  className?: string;
}) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`${className} ${isVisible ? "revealed" : ""}`}
      style={{
        transitionDelay: `${delay + stagger}ms`,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

// Hook: adds typing pulse on key press
export function useKeyPressPulse() {
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.length !== 1 && e.key !== "Backspace" && e.key !== "Enter" && e.key !== "Delete") return;
      el.classList.add("typing-active");
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        el.classList.remove("typing-active");
      }, 400) as unknown as number;
      el.style.transform = "scale(1.005)";
      window.setTimeout(() => {
        el.style.transform = "";
      }, 120);
    };
    el.addEventListener("keydown", onKeyDown);
    return () => {
      el.removeEventListener("keydown", onKeyDown);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  return ref;
}

// Ripple on click/touch
export function addRipple(e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) {
  const target = e.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const clientX = (e as React.MouseEvent).clientX ?? (e as React.TouchEvent).touches?.[0]?.clientX ?? rect.left + rect.width / 2;
  const clientY = (e as React.MouseEvent).clientY ?? (e as React.TouchEvent).touches?.[0]?.clientY ?? rect.top + rect.height / 2;
  const size = Math.max(rect.width, rect.height) * 1.2;
  const x = clientX - rect.left - size / 2;
  const y = clientY - rect.top - size / 2;
  const ripple = document.createElement("span");
  ripple.className = "key-ripple";
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  target.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

// Parallax for blobs on scroll
export function useParallax() {
  useEffect(() => {
    if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        document.querySelectorAll<HTMLElement>(".blob-purple, .blob-purple-soft").forEach((el, i) => {
          const speed = 0.03 + (i % 3) * 0.015;
          el.style.transform = `translateY(${y * speed}px)`;
        });
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}
