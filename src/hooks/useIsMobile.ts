"use client";

import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768; // md breakpoint in Tailwind

/**
 * Hook to detect if the current viewport is mobile-sized.
 * Uses matchMedia for efficient, reactive detection.
 *
 * @param breakpoint - The pixel width below which is considered mobile (default: 768)
 * @returns boolean indicating if viewport is mobile-sized
 */
export function useIsMobile(breakpoint: number = MOBILE_BREAKPOINT): boolean {
  // Initialize with correct value to prevent flash of desktop layout
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < breakpoint;
    }
    return false; // SSR fallback
  });

  useEffect(() => {
    // Create media query for the breakpoint
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

    // Sync state in case it changed between SSR and hydration
    setIsMobile(mediaQuery.matches);

    // Handler for media query changes
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    // Add listener for changes
    mediaQuery.addEventListener("change", handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [breakpoint]);

  return isMobile;
}

/**
 * Hook to detect touch capability of the device.
 * Useful for showing touch-specific hints.
 *
 * @returns boolean indicating if device supports touch
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        "ontouchstart" in window ||
          navigator.maxTouchPoints > 0 ||
          // @ts-expect-error - legacy IE/Edge property
          navigator.msMaxTouchPoints > 0
      );
    };

    checkTouch();
  }, []);

  return isTouch;
}

export default useIsMobile;
