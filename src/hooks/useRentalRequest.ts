import { useState } from "react";
import { createRentalRequest } from "@/lib/directus";

interface UseRentalRequestOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useRentalRequest(options: UseRentalRequestOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submitRequest = async (data: {
    gear_listing_id: string;
    renter_id: string;
    start_date: string;
    end_date: string;
    message?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      await createRentalRequest({
        gear_listing_id: data.gear_listing_id,
        renter_id: data.renter_id,
        start_date: data.start_date,
        end_date: data.end_date,
      });
      options.onSuccess?.();
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    submitRequest,
    loading,
    error,
  };
}
