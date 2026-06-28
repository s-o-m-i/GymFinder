export interface UserPosition {
  lat: number;
  lng: number;
  accuracy: number;
}

/** Accept a fix at or below this accuracy immediately (meters). */
const GOOD_ENOUGH_ACCURACY_M = 2_000;

/** After this delay, use the best fix collected so far. */
const EARLY_ACCEPT_MS = 2_500;

/** Hard stop — never leave the UI waiting longer than this. */
const MAX_WAIT_MS = 10_000;

/**
 * Resolves with the user's coordinates as quickly as practical.
 * Uses cached/network location first, then refines with GPS when available.
 */
export function getBestUserPosition(): Promise<UserPosition> {
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

    const cleanup = () => {
      if (watchId != null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
    };

    const finish = (pos: GeolocationPosition) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(toUserPosition(pos));
    };

    const fail = (err: GeolocationPositionError | Error) => {
      if (settled) return;
      if (best) {
        finish(best);
        return;
      }
      settled = true;
      cleanup();
      reject(err);
    };

    const consider = (pos: GeolocationPosition) => {
      if (!best || pos.coords.accuracy < best.coords.accuracy) {
        best = pos;
      }
      if (pos.coords.accuracy <= GOOD_ENOUGH_ACCURACY_M) {
        finish(pos);
      }
    };

    // Fast path: cached or network-based location (works well on desktop)
    navigator.geolocation.getCurrentPosition(
      consider,
      () => {
        // watchPosition / high-accuracy attempt continues below
      },
      {
        enableHighAccuracy: false,
        maximumAge: 300_000,
        timeout: 6_000,
      }
    );

    // Refine with GPS when the device supports it
    watchId = navigator.geolocation.watchPosition(
      consider,
      (err) => fail(err),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 8_000,
      }
    );

    window.setTimeout(() => {
      if (!settled && best) finish(best);
    }, EARLY_ACCEPT_MS);

    window.setTimeout(() => {
      if (settled) return;
      if (best) finish(best);
      else {
        fail(
          new Error(
            "Could not detect your location. Allow location access and try again."
          )
        );
      }
    }, MAX_WAIT_MS);
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
