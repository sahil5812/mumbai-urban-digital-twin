"use client";

import { useState, useEffect } from "react";
import { PerformanceManager, PerformanceMetrics } from "./PerformanceManager";

/**
 * useAdaptiveQuality Hook
 * Exposes engine-level rendering metrics (effectiveDpr, radarPulseFps, isTabVisible).
 * Never mutates any visual styling or CSS classes.
 */
export function useAdaptiveQuality(): PerformanceMetrics {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(() => PerformanceManager.getMetrics());

  useEffect(() => {
    const unsubscribe = PerformanceManager.subscribe((newMetrics) => {
      setMetrics((prev) => {
        // Only trigger React state update if key values changed
        if (
          prev.profile === newMetrics.profile &&
          prev.effectiveDpr === newMetrics.effectiveDpr &&
          prev.radarPulseFps === newMetrics.radarPulseFps &&
          prev.isTabVisible === newMetrics.isTabVisible
        ) {
          return prev;
        }
        return newMetrics;
      });
    });

    return unsubscribe;
  }, []);

  return metrics;
}
