import { useState, useEffect } from "react";
import { getRentalRequests } from "@/lib/directus";
import type { DirectusRentalRequest } from "@/lib/directus";

interface UseRentalRequestsOptions {
  userId: string;
  role: "owner" | "renter";
}

export function useRentalRequests({ userId, role }: UseRentalRequestsOptions) {
  const [requests, setRequests] = useState<DirectusRentalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchRequests() {
      try {
        setLoading(true);
        const data = await getRentalRequests(userId, role);
        setRequests(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchRequests();
  }, [userId, role]);

  return {
    requests,
    loading,
    error,
  };
}
