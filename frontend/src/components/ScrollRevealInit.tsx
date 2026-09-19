"use client";

import React, { useEffect } from "react";

/**
 * ScrollRevealInit
 * Initializes a high-performance IntersectionObserver to trigger smooth,
 * natural ease-out fade-in and upward glide animations on containers/cards
 * with staggered delays as they enter the viewport during scroll.
 */
export const ScrollRevealInit: React.FC = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // In Lite Mode or reduced-motion, instantly reveal all elements and skip observers
    const isLiteMode = document.documentElement.classList.contains("lite-mode") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isLiteMode || !("IntersectionObserver" in window)) {
      document.querySelectorAll(".scroll-reveal").forEach((el) => {
        el.classList.add("is-revealed");
      });
      return;
    }

    let batchQueue: HTMLElement[] = [];
    let batchTimeout: ReturnType<typeof setTimeout> | null = null;
    let mutationTimeout: ReturnType<typeof setTimeout> | null = null;

    // Flush intersecting elements in a batch with staggered delay
    const flushBatch = () => {
      batchQueue.forEach((el, index) => {
        const staggerDelay = Math.min(index * 60, 240);
        el.style.transitionDelay = `${staggerDelay}ms`;
        el.classList.add("is-revealed");
      });
      batchQueue = [];
      batchTimeout = null;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        let hasNew = false;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            if (!el.classList.contains("is-revealed")) {
              batchQueue.push(el);
              hasNew = true;
            }
            observer.unobserve(el);
          }
        });

        if (hasNew) {
          if (batchTimeout) clearTimeout(batchTimeout);
          batchTimeout = setTimeout(flushBatch, 30);
        }
      },
      {
        root: null,
        rootMargin: "0px 0px -40px 0px",
        threshold: 0.08,
      }
    );

    const observeElements = () => {
      const targets = document.querySelectorAll(".scroll-reveal:not(.is-revealed)");
      targets.forEach((el) => observer.observe(el));
    };

    observeElements();

    // Debounced MutationObserver (150ms) to avoid CPU spikes during rapid state changes
    const mutationObserver = new MutationObserver(() => {
      if (mutationTimeout) clearTimeout(mutationTimeout);
      mutationTimeout = setTimeout(observeElements, 150);
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      if (batchTimeout) clearTimeout(batchTimeout);
      if (mutationTimeout) clearTimeout(mutationTimeout);
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
};
