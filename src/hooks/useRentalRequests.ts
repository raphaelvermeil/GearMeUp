import { useState, useEffect } from "react";
import { getRentalRequests, DirectusRentalRequest } from "@/lib/directus";

export const useRentalRequests = (userId: string, role: "owner" | "renter") => {
  const [requests, setRequests] = useState<DirectusRentalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await getRentalRequests(userId, role);
        console.log("Response in hook:", response);
        setRequests(response || []);
      } catch (err) {
        console.error("Error in useRentalRequests:", err);
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
