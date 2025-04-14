import { useState, useEffect } from "react";
import { getGearListings } from "../lib/directus";
import type { TransformedGearListing } from "../lib/directus";

export type SortOption =
  | "price_asc"
  | "price_desc"
  | "date_created_desc"
  | "date_created_asc";

interface UseGearListingsOptions {
  filters?: {
    category?: string;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string; // Added search parameter
  };
  page?: number;
  itemsPerPage?: number;
  sort?: SortOption;
}

export function useGearListings({
  filters,
  page = 1,
  itemsPerPage = 9,
  sort = "date_created_desc",
}: UseGearListingsOptions = {}) {
  const [listings, setListings] = useState<TransformedGearListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    async function fetchListings() {
      try {
        setLoading(true);
        const response = await getGearListings({
          filters,
          page,
          limit: itemsPerPage,
          sort,
        });


        // If we have a search term, filter the listings client-side
        let filteredListings = response;
        
        if (filters?.search && filters.search.trim() !== '') {
          const searchTerm = filters.search.toLowerCase().trim();
          filteredListings = response.filter(listing => 
            listing.title.toLowerCase().includes(searchTerm) || 
            listing.description.toLowerCase().includes(searchTerm)
          );  
        }





        setListings(response);
        setTotalItems(response.length);
        setTotalPages(Math.ceil(response.length / itemsPerPage));
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, [filters, page, itemsPerPage, sort]);

  return {
    listings,
    loading,
    error,
    totalPages,
    totalItems,
    currentPage: page,
  };
}
