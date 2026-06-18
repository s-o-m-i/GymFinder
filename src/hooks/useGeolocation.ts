"use client";

import { useState, useCallback } from "react";

export type GeolocationStatus = "idle" | "loading" | "success" | "denied" | "error";

export interface GeolocationState {
  status: GeolocationStatus;
  lat: number | null;
  lng: number | null;
  error: string | null;
}

export interface UseGeolocationReturn extends GeolocationState {
  request: () => void;
  clear: () => void;
}

const INITIAL_STATE: GeolocationState = {
  status: "idle",
  lat: null,
  lng: null,
  error: null,
};

export function useGeolocation(): UseGeolocationReturn {
  const [state, setState] = useState<GeolocationState>(INITIAL_STATE);

  const request = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setState({
        status: "error",
        lat: null,
        lng: null,
        error: "Geolocation is not supported by your browser.",
      });
      return;
    }

    setState((prev) => ({ ...prev, status: "loading", error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: "success",
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          error: null,
        });
      },
      (err) => {
        let message = "Unable to retrieve your location.";
        let status: GeolocationStatus = "error";

        switch (err.code) {
          case GeolocationPositionError.PERMISSION_DENIED:
            message = "Location access was denied. Please allow location access in your browser settings.";
            status = "denied";
            break;
          case GeolocationPositionError.POSITION_UNAVAILABLE:
            message = "Location information is currently unavailable.";
            break;
          case GeolocationPositionError.TIMEOUT:
            message = "Location request timed out. Please try again.";
            break;
        }

        setState({ status, lat: null, lng: null, error: message });
      },
      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 60_000, // cache position for 1 minute
      }
    );
  }, []);

  const clear = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return { ...state, request, clear };
}
