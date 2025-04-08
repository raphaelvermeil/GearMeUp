import {
  createDirectus,
  rest,
  authentication,
  login,
  readItem,
  readItems,
  createItem,
  updateItem,
  deleteItem,
  readAssetRaw,
  createUser,
} from "@directus/sdk";

const DIRECTUS_URL = "https://creative-blini-b15912.netlify.app";

export interface DirectusUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface DirectusFile {
  id: string;
  filename_download: string;
  url: string;
}

export interface DirectusClient {
  id: string;
  user_id: DirectusUser;
}

export interface DirectusGearListing {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  location: string;
  category: string;
  client_id: DirectusClient;
  gear_images: Array<{
    id: string;
    gear_listings_id: string;
    directus_files_id: string;
  }>;
}

export interface TransformedGearListing
  extends Omit<DirectusGearListing, "gear_images" | "client_id"> {
  gear_images: DirectusFile[];
  user_id: DirectusUser | null;
}

export interface DirectusRentalRequest {
  id: string;
  gear_listing_id: DirectusGearListing;
  renter_id: DirectusUser;
  owner_id: DirectusUser;
  start_date: string;
  end_date: string;
  status: string;
}

export interface DirectusReview {
  id: string;
  rental_request_id: DirectusRentalRequest;
  reviewer_id: DirectusUser;
  reviewed_id: DirectusUser;
  rating: number;
  comment: string;
}

export const directus = createDirectus(DIRECTUS_URL)
  .with(authentication("cookie", { credentials: "include" }))
  .with(rest({ credentials: "include" }));

// Auth functions
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await directus.request(login(email, password));
    return response;
  } catch (error) {
    console.error("Login error:", error);
    throw new Error("Failed to login. Please check your credentials.");
  }
};

export const register = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string
) => {
  try {
    // First create the user
    const userResponse = await directus.request(
      createUser({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        role: "5886bdc4-8845-49f5-9db7-9073390e1e77", // Replace with your default role ID
      })
    );

    console.log("User created:", userResponse);

    // Then create a client for this user
    const clientResponse = await directus.request(
      createItem("clients", {
        user_id: userResponse.id,
      })
    );

    // Return both the user and client data
    return {
      user: userResponse,
      client: clientResponse,
    };
  } catch (error) {
    console.error("Registration error:", error);
    throw new Error("Failed to register. Please try again.");
  }
};

export const logout = async () => {
  try {
    await directus.request(login("", "")); // This will clear the auth token
  } catch (error) {
    console.error("Logout error:", error);
    throw new Error("Failed to logout.");
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await directus.request(readItem("users", "me"));
    return response;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
};

interface DirectusResponse<T> {
  data: T[];
  meta?: {
    total_count?: number;
    filter_count?: number;
  };
}

// Gear listing functions
export const getGearListings = async ({
  filters,
  page = 1,
  limit = 9,
  sort = "date_created_desc",
}: {
  filters?: {
    category?: string;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
  };
  page?: number;
  limit?: number;
  sort?: string;
} = {}) => {
  try {
    const query: any = {};
    if (filters?.category) query.category = filters.category;
    if (filters?.condition) query.condition = filters.condition;
    if (filters?.minPrice || filters?.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price._gte = filters.minPrice;
      if (filters.maxPrice) query.price._lte = filters.maxPrice;
    }

    let sortField: string[] = [];
    switch (sort) {
      case "price_asc":
        sortField = ["price"];
        break;
      case "price_desc":
        sortField = ["-price"];
        break;
      case "date_created_asc":
        sortField = ["date_created"];
        break;
      case "date_created_desc":
      default:
        sortField = ["-date_created"];
        break;
    }

    const requestConfig = {
      filter: query,
      fields: ["*", "client_id.user_id.*", "gear_images.directus_files_id"],
      sort: sortField,
      page,
      limit,
      meta: "total_count",
    };

    const response = (await directus.request(
      readItems("gear_listings", requestConfig)
    )) as unknown as
      | DirectusResponse<DirectusGearListing>
      | DirectusGearListing[];

    let data: DirectusGearListing[] = [];
    let totalCount = 0;

    if (Array.isArray(response)) {
      data = response;
      totalCount = response.length;
    } else if (response && "data" in response) {
      data = response.data || [];
      totalCount = response.meta?.total_count || 0;
    }

    const transformedData = data.map((listing) => ({
      ...listing,
      user_id: listing.client_id?.user_id || null,
      gear_images: (listing.gear_images || []).map((image) => ({
        id: image.directus_files_id,
        filename_download: image.directus_files_id,
        url: `${DIRECTUS_URL}/assets/${image.directus_files_id}?width=800&height=600&fit=cover&quality=80`,
      })),
    }));

    return {
      data: transformedData as TransformedGearListing[],
      totalItems: totalCount,
    };
  } catch (error) {
    console.error("Error fetching gear listings:", error);
    throw error;
  }
};

export const getGearListing = async (id: string) => {
  try {
    const response = (await directus.request(
      readItem("gear_listings", id, {
        fields: ["*", "client_id.user_id.*", "gear_images.directus_files_id"],
      })
    )) as DirectusGearListing;

    const transformedResponse = {
      ...response,
      user_id: response.client_id?.user_id || null,
      gear_images: (response.gear_images || []).map((image) => ({
        id: image.directus_files_id,
        filename_download: image.directus_files_id,
        url: `${DIRECTUS_URL}/assets/${image.directus_files_id}?width=800&height=600&fit=cover&quality=80`,
      })),
    };

    return transformedResponse as TransformedGearListing;
  } catch (error) {
    console.error("Error fetching gear listing:", error);
    throw error;
  }
};

export const uploadFile = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    // Upload the file using fetch directly to ensure proper multipart/form-data handling
    const uploadResponse = await fetch(`${DIRECTUS_URL}/files`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!uploadResponse.ok) {
      throw new Error(`File upload failed: ${uploadResponse.statusText}`);
    }

    const fileData = await uploadResponse.json();
    console.log("Uploaded file data:", fileData);
    return fileData;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

export const createGearListing = async (listingData: {
  title: string;
  description: string;
  category: string;
  price: number;
  condition: string;
  location: string;
  client_id: string;
  images: File[];
}) => {
  try {
    // First, upload the images
    const imageUploads = await Promise.all(
      listingData.images.map((image) => uploadFile(image))
    );

    // Create the gear listing with the client_id
    const createData = {
      ...listingData,
      gear_images: imageUploads.map((upload) => upload.id),
    };

    const response = await directus.request(
      createItem("gear_listings", createData)
    );

    return response as DirectusGearListing;
  } catch (error) {
    console.error("Error creating gear listing:", error);
    throw error;
  }
};

// Rental request functions
export const createRentalRequest = async (requestData: {
  gear_listing_id: string;
  renter_id: string;
  start_date: string;
  end_date: string;
}) => {
  try {
    const response = await directus.request(
      createItem("rental_requests", requestData)
    );
    return response as DirectusRentalRequest;
  } catch (error) {
    console.error("Error creating rental request:", error);
    throw error;
  }
};

export const getRentalRequests = async (
  userId: string,
  type: "owner" | "renter"
) => {
  try {
    const query =
      type === "owner" ? { owner_id: userId } : { renter_id: userId };
    const response = (await directus.request(
      readItems("rental_requests", {
        filter: query,
        fields: ["*", "gear_listing_id.*", "renter_id.*", "owner_id.*"],
        meta: "total_count",
      })
    )) as unknown as DirectusResponse<DirectusRentalRequest>;

    return {
      data: response.data,
      totalItems: response.meta?.total_count ?? 0,
    };
  } catch (error) {
    console.error("Error fetching rental requests:", error);
    throw error;
  }
};

// Review functions
export const createReview = async (reviewData: {
  rental_request_id: string;
  reviewer_id: string;
  reviewed_id: string;
  rating: number;
  comment: string;
}) => {
  try {
    const response = await directus.request(createItem("reviews", reviewData));
    return response as DirectusReview;
  } catch (error) {
    console.error("Error creating review:", error);
    throw error;
  }
};

export const getReviews = async (userId: string) => {
  try {
    const response = (await directus.request(
      readItems("reviews", {
        filter: { reviewed_id: userId },
        fields: ["*", "reviewer_id.*"],
        meta: "total_count",
      })
    )) as unknown as DirectusResponse<DirectusReview>;

    return {
      data: response.data,
      totalItems: response.meta?.total_count ?? 0,
    };
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw error;
  }
};

export const getAssetURL = (fileId: string) => {
  return `${DIRECTUS_URL}/assets/${fileId}?width=800&height=600&fit=cover&quality=80`;
};

export const getOrCreateClient = async (userId: string) => {
  try {
    // First try to find an existing client
    const existingClients = await directus.request(
      readItems("clients", {
        filter: { user_id: userId },
        limit: 1,
      })
    );

    if (existingClients && existingClients.length > 0) {
      return existingClients[0];
    }

    // If no client exists, create one
    const newClient = await directus.request(
      createItem("clients", {
        user_id: userId,
      })
    );

    return newClient;
  } catch (error) {
    console.error("Error getting or creating client:", error);
    throw error;
  }
};

export const getCurrentClient = async () => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return null;

    const client = await getOrCreateClient(currentUser.id);
    return client;
  } catch (error) {
    console.error("Error getting current client:", error);
    return null;
  }
};
