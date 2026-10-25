import { useCallback, useEffect, useRef, useState, type DependencyList } from "react";
import { getErrorMessage } from "../services/api";

interface AsyncState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  /** Runs the request again (e.g. after a create/delete or a "Try again" click). */
  reload: () => void;
}

/**
 * Runs `fn` whenever `deps` change and tracks loading/error/data.
 * Responses from outdated requests are ignored, so fast typing in a search box
 * never shows stale results.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: DependencyList): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const latestCall = useRef(0);

  useEffect(() => {
    const callId = ++latestCall.current;
    setLoading(true);
    setError(null);
    fn()
      .then((result) => {
        if (callId === latestCall.current) setData(result);
      })
      .catch((err) => {
        if (callId === latestCall.current) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (callId === latestCall.current) setLoading(false);
      });
    // `fn` is intentionally not a dependency: callers list what it depends on in `deps`.
  }, [...deps, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);
  return { data, error, loading, reload };
}
