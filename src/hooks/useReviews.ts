import { useState, useEffect } from "react";
import { getReviews, DirectusReview } from "@/lib/directus";

interface UseReviewsOptions {
  userId?: string;
}

export function useReviews(options: UseReviewsOptions = {}) {
  const [reviews, setReviews] = useState<DirectusReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchReviews() {
      if (!options.userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getReviews(options.userId);
        setReviews(response.data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [options.userId]);

  return {
    reviews,
    loading,
    error,
  };
}
