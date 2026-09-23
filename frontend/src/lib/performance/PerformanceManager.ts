/**
 * PerformanceManager.ts
 * Centralized, multi-signal adaptive quality and frame-budgeting engine.
 * 
 * Determines internal rendering parameters (DPR, animation tick rates, visibility)
 * based on sustained frame times, hardware concurrency, device memory, and tab visibility.
 * 
 * IMPORTANT: This module NEVER alters visual styling, CSS classes, or UI appearance.
 * It strictly optimizes internal rendering resolution and engine loop frequencies.
 */

export type PerformanceProfile = "HIGH" | "MEDIUM" | "LOW";

export interface PerformanceMetrics {
  profile: PerformanceProfile;
  effectiveDpr: number;
  radarPulseFps: number;
  isTabVisible: boolean;
  avgFrameTimeMs: number;
}

type PerformanceListener = (metrics: PerformanceMetrics) => void;

class PerformanceManagerClass {
  private profile: PerformanceProfile = "HIGH";
  private isTabVisible: boolean = true;
  private listeners: Set<PerformanceListener> = new Set();
  
  // Rolling frame-time sampling (sliding window of 60 frames)
  private frameTimes: number[] = [];
  private lastFrameTimestamp: number = 0;
  private animId: number | null = null;
  private sustainedDowngradeCount: number = 0;
  private sustainedUpgradeCount: number = 0;
  private isMonitoring: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.initInitialProfile();
      this.setupVisibilityListener();
      this.startFpsMonitoring();
    }
  }

  private initInitialProfile() {
    // Initial conservative baseline based on hardware signals
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as any).deviceMemory || 4;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (cores <= 2 || memory <= 2) {
      this.profile = "LOW";
    } else if (cores <= 4 || memory <= 4 || isMobile) {
      this.profile = "MEDIUM";
    } else {
      this.profile = "HIGH";
    }
  }

  private setupVisibilityListener() {
    if (typeof document === "undefined") return;
    document.addEventListener("visibilitychange", () => {
      this.isTabVisible = !document.hidden;
      this.notifyListeners();
    });
  }

  private startFpsMonitoring() {
    if (this.isMonitoring || typeof window === "undefined") return;
    this.isMonitoring = true;
    this.lastFrameTimestamp = performance.now();

    const sample = (now: number) => {
      if (!this.isTabVisible) {
        // Tab is hidden; pause monitoring until tab is active
        this.lastFrameTimestamp = now;
        this.animId = requestAnimationFrame(sample);
        return;
      }

      const delta = now - this.lastFrameTimestamp;
      this.lastFrameTimestamp = now;

      // Filter extreme outliers (e.g. tab switches, long locks)
      if (delta > 5 && delta < 120) {
        this.frameTimes.push(delta);
        if (this.frameTimes.length > 60) {
          this.frameTimes.shift();
        }

        // Evaluate every 60 frames (~1 second)
        if (this.frameTimes.length === 60) {
          this.evaluateFrameTimes();
        }
      }

      this.animId = requestAnimationFrame(sample);
    };

    this.animId = requestAnimationFrame(sample);
  }

  private evaluateFrameTimes() {
    const sum = this.frameTimes.reduce((acc, t) => acc + t, 0);
    const avg = sum / this.frameTimes.length;

    // Hysteresis thresholds:
    // avg > 30ms (< 33 FPS) sustained for 3 samples -> downgrade
    // avg < 19ms (> 52 FPS) sustained for 8 samples -> upgrade
    if (avg > 30) {
      this.sustainedDowngradeCount++;
      this.sustainedUpgradeCount = 0;
      if (this.sustainedDowngradeCount >= 3) {
        if (this.profile === "HIGH") {
          this.setProfile("MEDIUM");
        } else if (this.profile === "MEDIUM") {
          this.setProfile("LOW");
        }
        this.sustainedDowngradeCount = 0;
      }
    } else if (avg < 19) {
      this.sustainedUpgradeCount++;
      this.sustainedDowngradeCount = 0;
      if (this.sustainedUpgradeCount >= 8) {
        if (this.profile === "LOW") {
          this.setProfile("MEDIUM");
        } else if (this.profile === "MEDIUM") {
          this.setProfile("HIGH");
        }
        this.sustainedUpgradeCount = 0;
      }
    } else {
      this.sustainedDowngradeCount = 0;
      this.sustainedUpgradeCount = 0;
    }
  }

  private setProfile(newProfile: PerformanceProfile) {
    if (this.profile !== newProfile) {
      this.profile = newProfile;
      this.notifyListeners();
    }
  }

  public getMetrics(): PerformanceMetrics {
    const rawDpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    let effectiveDpr = 1.0;

    if (this.profile === "HIGH") {
      effectiveDpr = Math.min(rawDpr, 1.35);
    } else if (this.profile === "MEDIUM") {
      effectiveDpr = Math.min(rawDpr, 1.15);
    } else {
      effectiveDpr = 1.0;
    }

    const radarPulseFps = this.profile === "HIGH" ? 30 : this.profile === "MEDIUM" ? 24 : 18;

    const avgFrameTimeMs =
      this.frameTimes.length > 0
        ? this.frameTimes.reduce((acc, t) => acc + t, 0) / this.frameTimes.length
        : 16.6;

    return {
      profile: this.profile,
      effectiveDpr,
      radarPulseFps,
      isTabVisible: this.isTabVisible,
      avgFrameTimeMs,
    };
  }

  public subscribe(listener: PerformanceListener): () => void {
    this.listeners.add(listener);
    listener(this.getMetrics());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const metrics = this.getMetrics();
    this.listeners.forEach((listener) => {
      try {
        listener(metrics);
      } catch (err) {
        console.error("Error in performance listener:", err);
      }
    });
  }
}

export const PerformanceManager = new PerformanceManagerClass();
