import { useState, useEffect } from "react";
import { getRentalRequests, DirectusRentalRequest } from "@/lib/directus";

interface RentalRequestsState {
  data: DirectusRentalRequest[];
  totalItems: number;
}

export const useRentalRequests = (userId: string, role: "owner" | "renter") => {
  const [requests, setRequests] = useState<RentalRequestsState>({
    data: [],
    totalItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const data = await getRentalRequests(userId, role);
        setRequests(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchRequests();
    }
  }, [userId, role]);

  return { requests, loading, error };
};
