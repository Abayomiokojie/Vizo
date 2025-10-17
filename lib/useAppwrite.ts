import { Alert } from "react-native";
import { useEffect, useState } from "react";

type AsyncFn<T> = () => Promise<T>;

function useAppwrite<T>(fn: AsyncFn<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fn();
      setData(res);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refetch = () => fetchData();

  return { data, loading, refetch };
}

export default useAppwrite;
