"use client";

import { useState, useEffect, useCallback } from "react";

const PERF_STORAGE_KEY = "mumbai_twin_perf_mode";

export type PerformanceMode = "auto" | "lite" | "high";

interface HardwareInfo {
  isLowEndHardware: boolean;
  concurrency: number;
  deviceMemory: number | null;
  prefersReducedMotion: boolean;
  isSaveData: boolean;
}

/**
 * Detects whether the current device is a low-end PC/laptop or mobile device.
 * Criteria:
 * - Logical CPU cores <= 4 (e.g. dual-core with hyperthreading or older quad-core)
 * - Device RAM <= 4 GB
 * - prefers-reduced-motion is active
 * - Save-Data header or low network
 */
export function detectLowEndHardware(): HardwareInfo {
  if (typeof window === "undefined") {
    return {
      isLowEndHardware: false,
      concurrency: 8,
      deviceMemory: null,
      prefersReducedMotion: false,
      isSaveData: false,
    };
  }

  const concurrency = typeof navigator.hardwareConcurrency === "number" ? navigator.hardwareConcurrency : 4;
  const navAny = navigator as any;
  const deviceMemory = typeof navAny.deviceMemory === "number" ? navAny.deviceMemory : null;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSaveData = Boolean(navAny.connection?.saveData);

  // Consider low-end if <= 4 CPU threads, <= 4GB RAM, prefers-reduced-motion, or SaveData
  const isLowEnd =
    concurrency <= 4 ||
    (deviceMemory !== null && deviceMemory <= 4) ||
    prefersReducedMotion ||
    isSaveData;

  return {
    isLowEndHardware: isLowEnd,
    concurrency,
    deviceMemory,
    prefersReducedMotion,
    isSaveData,
  };
}

/**
 * Global reactive hook for performance mode management.
 * Automatically synchronizes `.lite-mode` class on document.documentElement.
 */
export function usePerformanceMode() {
  const [mode, setModeState] = useState<PerformanceMode>("auto");
  const [isLite, setIsLite] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(PERF_STORAGE_KEY) as PerformanceMode | null;
    const initialMode: PerformanceMode = saved === "lite" || saved === "high" ? saved : "auto";
    setModeState(initialMode);

    const hw = detectLowEndHardware();
    const effectiveLite = initialMode === "lite" || (initialMode === "auto" && hw.isLowEndHardware);
    setIsLite(effectiveLite);

    if (effectiveLite) {
      document.documentElement.classList.add("lite-mode");
    } else {
      document.documentElement.classList.remove("lite-mode");
    }
  }, []);

  const setMode = useCallback((newMode: PerformanceMode) => {
    setModeState(newMode);
    localStorage.setItem(PERF_STORAGE_KEY, newMode);

    const hw = detectLowEndHardware();
    const effectiveLite = newMode === "lite" || (newMode === "auto" && hw.isLowEndHardware);
    setIsLite(effectiveLite);

    if (effectiveLite) {
      document.documentElement.classList.add("lite-mode");
    } else {
      document.documentElement.classList.remove("lite-mode");
    }
  }, []);

  const toggleMode = useCallback(() => {
    // Cycles: auto/high -> lite -> high
    setMode(isLite ? "high" : "lite");
  }, [isLite, setMode]);

  return {
    mode,
    isLite,
    mounted,
    setMode,
    toggleMode,
  };
}
