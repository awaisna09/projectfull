import { useEffect, useRef, useCallback } from "react";

interface UsePageTimerOptions {
  userId: string | undefined;
  pageType: string;
}

export function usePageTimer({ userId, pageType }: UsePageTimerOptions) {
  const trackingIdRef = useRef<string | null>(null);
  const hasStoppedRef = useRef<boolean>(false);

  // Function to stop tracking manually
  const stopTracking = useCallback(async () => {
    if (hasStoppedRef.current || !trackingIdRef.current) {
      return;
    }

    try {
      hasStoppedRef.current = true;
      const trackingId = trackingIdRef.current;
      trackingIdRef.current = null; // Clear immediately to prevent double stops

      const envUrl = import.meta.env.VITE_API_BASE_URL;
      const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const baseUrl = isLocalDev 
        ? 'http://localhost:8000' 
        : (envUrl || 'http://localhost:8000');
      const API_BASE_URL = baseUrl.replace(/\/+$/, '');

      const res = await fetch(`${API_BASE_URL}/analytics/stop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracking_id: trackingId })
      });

      if (!res.ok) {
        throw new Error(`Failed to stop tracking: ${res.statusText}`);
      }

      const data = await res.json();
      console.log(`✅ Time tracking stopped: ${data.duration || 0} seconds`);
    } catch (e) {
      console.error("Failed to stop tracking:", e);
    }
  }, []);

  // START timer when component mounts
  useEffect(() => {
    if (!userId) return;

    hasStoppedRef.current = false;

    async function start() {
      try {
        const envUrl = import.meta.env.VITE_API_BASE_URL;
        const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const baseUrl = isLocalDev 
          ? 'http://localhost:8000' 
          : (envUrl || 'http://localhost:8000');
        const API_BASE_URL = baseUrl.replace(/\/+$/, '');

        const res = await fetch(`${API_BASE_URL}/analytics/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, page_type: pageType })
        });

        if (!res.ok) {
          throw new Error(`Failed to start tracking: ${res.statusText}`);
        }

        const data = await res.json();
        if (data.tracking_id) {
          trackingIdRef.current = data.tracking_id;
          console.log(`✅ Time tracking started for ${pageType}`);
        }
      } catch (e) {
        console.error("Failed to start tracking:", e);
      }
    }

    start();

    // STOP timer when component unmounts (automatic stopping)
    return () => {
      stopTracking();
    };
  }, [userId, pageType, stopTracking]);

  // Return stop function for manual stopping
  return { stopTracking };
}

