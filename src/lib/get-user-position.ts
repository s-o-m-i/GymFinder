export interface UserPosition {
  lat: number;
  lng: number;
  accuracy: number;
}

const DEFAULT_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 20_000,
};

/**
 * Collects GPS readings for a short window and returns the most accurate fix.
 * Desktop/Wi‑Fi positioning can be off by several km on the first reading.
 */
export function getBestUserPosition(
  maxWaitMs = 12_000,
  targetAccuracyM = 150
): Promise<UserPosition> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }

    let best: GeolocationPosition | null = null;
    let watchId: number | null = null;
    let settled = false;

    const toUserPosition = (pos: GeolocationPosition): UserPosition => ({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
    });

    const finish = (pos: GeolocationPosition) => {
      if (settled) return;
      settled = true;
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
      resolve(toUserPosition(pos));
    };

    const consider = (pos: GeolocationPosition) => {
      if (!best || pos.coords.accuracy < best.coords.accuracy) {
        best = pos;
      }
      if (pos.coords.accuracy <= targetAccuracyM) {
        finish(pos);
      }
    };

    watchId = navigator.geolocation.watchPosition(
      consider,
      (err) => {
        if (settled) return;
        if (best) {
          finish(best);
          return;
        }
        settled = true;
        if (watchId != null) navigator.geolocation.clearWatch(watchId);
        reject(err);
      },
      DEFAULT_OPTIONS
    );

    navigator.geolocation.getCurrentPosition(
      consider,
      () => {
        // watchPosition handles errors; ignore getCurrentPosition failure
      },
      DEFAULT_OPTIONS
    );

    window.setTimeout(() => {
      if (settled) return;
      if (best) finish(best);
      else {
        settled = true;
        if (watchId != null) navigator.geolocation.clearWatch(watchId);
        reject(new Error("Could not get your location in time. Please try again near a window or on mobile."));
      }
    }, maxWaitMs);
  });
}

export function geolocationErrorMessage(err: unknown): string {
  if (err instanceof GeolocationPositionError) {
    if (err.code === GeolocationPositionError.PERMISSION_DENIED) {
      return "Location access denied. Please allow location in your browser settings.";
    }
    if (err.code === GeolocationPositionError.TIMEOUT) {
      return "Location request timed out. Please try again.";
    }
    return "Could not get your location. Please try again.";
  }
  if (err instanceof Error) return err.message;
  return "Could not get your location. Please try again.";
}

export function formatAccuracyMeters(accuracy: number): string {
  if (accuracy >= 1000) return `~${(accuracy / 1000).toFixed(1)} km`;
  return `~${Math.round(accuracy)} m`;
}

export function isLowAccuracy(accuracy: number): boolean {
  return accuracy > 500;
}
