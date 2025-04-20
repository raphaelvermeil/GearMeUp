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
  readMe,
  uploadFiles,
  auth,
} from "@directus/sdk";
import { get } from "http";

// Use the correct Directus URL directly
const DIRECTUS_URL = "https://creative-blini-b15912.netlify.app";

export interface DirectusUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DirectusFile {
  id: string;
  filename_download: string;
  url: string;
}

export interface DirectusClientUser {
  id: string;
  user: DirectusUser;
  first_name: string;
  last_name: string;
}

export interface DirectusGearListing {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  location: string;
  category: string;
  owner: DirectusClientUser;
  gear_images: Array<{
    id: string;
    gear_listings_id: string;
    directus_files_id: {
      id: string;
    };
  }>;
}

export interface TransformedGearListing {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  location: string;
  category: string;
  gear_images: {
    id: string;
    url: string;
  }[];
  owner?: DirectusClientUser;
}

export interface DirectusRentalRequest {
  id: string;
  gear_listing: DirectusGearListing;
  renter: DirectusClientUser;
  owner: DirectusClientUser;
  start_date: string;
  end_date: string;
  status: string;
}

export interface DirectusReview {
  id: string;
  rental_request_id: DirectusRentalRequest;
  reviewer: DirectusClientUser;
  reviewed: DirectusClientUser;
  rating: number;
  comment: string;
}

export interface DirectusConversation {
  id: string;
  user_1: DirectusClientUser;
  user_2: DirectusClientUser;
  gear_listing: DirectusGearListing;
  // created_at: string;
}

export interface DirectusMessage {
  id: string;
  conversation: DirectusConversation;
  sender: DirectusClientUser;
  message: string;
  date_created: string;
}

interface DirectusResponse<T> {
  data: T[];
  meta?: {
    total_count?: number;
    filter_count?: number;
  };
}

export interface AuthenticationData {
  access_token: string;
  refresh_token: string;
  expires: number;
}

// Initialize the Directus client
export const directus = createDirectus(DIRECTUS_URL)
  .with(authentication("json"))
  .with(rest());

// Create a public client instance for unauthenticated requests
export const publicClient = createDirectus(DIRECTUS_URL).with(rest());

// Auth functions
export const loginUser = async (email: string, password: string) => {
  try {
    // Use the SDK's login method directly
    const loginResult = await directus.request(login(email, password));

    // Store the token
    if (loginResult?.access_token) {
      await directus.setToken(loginResult.access_token);
    }

    return loginResult;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const register = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string
) => {
  try {
    // Create the user

    const userResponse = await directus.request(
      createUser({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        role: "5886bdc4-8845-49f5-9db7-9073390e1e77",
      })
    );

    // Login the user
    const loginResult = await loginUser(email, password);

    // Get the current user
    const currentUser = await directus.request(readMe());

    if (!currentUser?.id) {
      throw new Error("Failed to get current user after login");
    }

    // Create client for the user
    const clientResponse = await directus.request(
      createItem("clients", {
        user: currentUser.id,
      })
    );

    return {
      user: currentUser,
      client: clientResponse,
    };
  } catch (error) {
    console.error("Registration error:", error);
    throw new Error("Failed to register. Please try again.");
  }
};

export const logout = async () => {
  try {
    console.log("Logging out...");
    localStorage.removeItem("auth_token");
    directus.setToken(null);
    console.log("Logout successful");
  } catch (error) {
    console.error("Logout error:", error);
    throw new Error("Failed to logout");
  }
};

export async function getCurrentUser(): Promise<DirectusUser> {
  try {
    const response = await directus.request(readMe());
    return response as DirectusUser;
  } catch (error) {
    throw new Error("Failed to get current user");
  }
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
    search?: string;
    owner?: string;
  };
  page?: number;
  limit?: number;
  sort?: string;
} = {}) => {
  try {
    const filter: any = {};
    if (filters?.category) filter.category = filters.category;
    if (filters?.condition) filter.condition = filters.condition;
    if (filters?.minPrice) filter.price = { _gte: filters.minPrice };
    if (filters?.maxPrice)
      filter.price = { ...filter.price, _lte: filters.maxPrice };
    if (filters?.owner) filter.owner = filters.owner;

    // Add search filter if provided
    if (filters?.search && filters.search.trim() !== "") {
      filter._or = [
        { title: { _contains: filters.search } },
        { description: { _contains: filters.search } },
      ];
    }

    const response = (await directus.request(
      readItems("gear_listings", {
        fields: [
          "*",
          "owner.*",
          "gear_images.*",
          "gear_images.directus_files_id.*",
        ],
        filter,
        page,
        limit,
        sort:
          sort === "date_created_desc"
            ? "-date_created"
            : sort === "date_created_asc"
            ? "date_created"
            : sort === "price_asc"
            ? "price"
            : "-price",
      })
    )) as DirectusGearListing[];
    console.log("response hello 123", response);
    // Transform the response to match our TransformedGearListing interface
    const transformedListings = response.map((listing) => ({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      condition: listing.condition,
      location: listing.location,
      category: listing.category,
      gear_images: listing.gear_images.map((image) => ({
        id: image.id,
        url: getAssetURL(image.directus_files_id.id),
      })),
      owner: listing.owner
        ? {
            id: listing.owner.id,
            user: {
              id: listing.owner.user.id,
              first_name: listing.owner.user.first_name,
              last_name: listing.owner.user.last_name,
              email: listing.owner.user.email,
              role: listing.owner.user.role,
              status: listing.owner.user.status,
              created_at: listing.owner.user.created_at,
              updated_at: listing.owner.user.updated_at,
            },
            first_name: listing.owner.first_name,
            last_name: listing.owner.last_name,
          }
        : undefined,
    }));

    return transformedListings;
  } catch (error) {
    console.error("Error fetching gear listings:", error);
    throw error;
  }
};

export const getGearListing = async (id: string) => {
  try {
    const response = (await directus.request(
      readItem("gear_listings", id, {
        fields: [
          "*",
          "owner.*",
          "gear_images.*",
          "gear_images.directus_files_id.*",
        ],
      })
    )) as DirectusGearListing;

    console.log("Gear listing response backend", response);

    // Transform the response to match our interface
    const transformedListing: TransformedGearListing = {
      id: response.id,
      title: response.title,
      description: response.description,
      price: response.price,
      condition: response.condition,
      location: response.location,
      category: response.category,
      gear_images: response.gear_images.map((image) => ({
        id: image.id,
        url: getAssetURL(image.directus_files_id.id),
      })),
      owner: response.owner
        ? {
            id: response.owner.id,
            user: {
              id: response.owner.user.id,
              first_name: response.owner.user.first_name,
              last_name: response.owner.user.last_name,
              email: response.owner.user.email,
              role: response.owner.user.role,
              status: response.owner.user.status,
              created_at: response.owner.user.created_at,
              updated_at: response.owner.user.updated_at,
            },
            first_name: response.owner.first_name,
            last_name: response.owner.last_name,
          }
        : undefined,
    };

    return transformedListing;
  } catch (error) {
    console.error("Error getting gear listing:", error);
    throw error;
  }
};

export const uploadFile = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await directus.request(uploadFiles(formData));
    return response[0]; // Return the first uploaded file
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

export const createGearListing = async (data: {
  title: string;
  description: string;
  category: string;
  price: number;
  condition: string;
  location: string;
  ownerID: string;
  images: File[];
}) => {
  try {
    // Check if we have a token
    const token = await directus.getToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    // First upload the images
    const uploadedImages = await Promise.all(
      data.images.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${DIRECTUS_URL}/files`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload image");
        }

        const fileData = await response.json();
        return fileData.data.id;
      })
    );

    // Then create the gear listing with the uploaded image IDs
    const response = await directus.request(
      createItem("gear_listings", {
        title: data.title,
        description: data.description,
        category: data.category,
        price: data.price,
        condition: data.condition,
        location: data.location,
        owner: data.ownerID, // Use the client ID directly
        gear_images: uploadedImages.map((fileId) => ({
          directus_files_id: fileId,
        })),
      })
    );

    return response;
  } catch (error) {
    console.error("Error creating gear listing:", error);
    if (error instanceof Error) {
      if (error.message === "Not authenticated") {
        throw new Error("You must be logged in to create a gear listing");
      }
    }
    throw error;
  }
};

// Rental request functions
export const createRentalRequest = async (requestData: {
  gear_listing: string;
  renter: string;
  owner: string;
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
  clientId: string,
  type: "owner" | "renter"
) => {
  try {
    console.log("type", type);
    console.log("clientId", clientId);

    const query = type === "owner" ? { owner: clientId } : { renter: clientId };

    console.log("query", query);

    const response = (await directus.request(
      readItems("rental_requests", {
        filter: query,
        fields: ["*", "gear_listing.*", "renter.*", "owner.*"],
        meta: "total_count",
      })
    )) as unknown as DirectusRentalRequest[];

    console.log("Rental requests backend response: ", response);
    return response;
  } catch (error) {
    console.error("Error fetching rental requests:", error);
    throw error;
  }
};

// Review functions
export const createReview = async (data: {
  rental_request: string;
  reviewer: string;
  reviewed: string;
  rating: number;
  comment: string;
}) => {
  try {
    const response = await directus.request(createItem("reviews", data));
    return response as DirectusReview;
  } catch (error) {
    console.error("Error creating review:", error);
    throw error;
  }
};

export const getReviews = async (clientId: string) => {
  try {
    const response = (await directus.request(
      readItems("reviews", {
        filter: { reviewed: clientId },
        fields: ["*", "reviewer.*"],
      })
    )) as unknown as DirectusReview[];

    return {
      response,
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
    // Check if we have a token
    const token = await directus.getToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    // First try to find an existing client
    const existingClients = await directus.request(
      readItems("clients", {
        filter: { user: userId },
        fields: ["*", "user.*"],
        limit: 1,
      })
    );

    if (existingClients && existingClients.length > 0) {
      return existingClients[0] as DirectusClientUser;
    }

    // If no client exists, create one
    const newClient = await directus.request(
      createItem("clients", {
        user: userId,
      })
    );

    return newClient as DirectusClientUser;
  } catch (error) {
    console.error("Error getting or creating client:", error);
    if (error instanceof Error) {
      if (error.message === "Not authenticated") {
        throw new Error("You must be logged in to create a gear listing");
      }
    }
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

export const getUser = async (userId: string) => {
  try {
    const response = await directus.request(
      readItem("directus_users", userId, {
        fields: [
          "id",
          "email",
          "first_name",
          "last_name",
          "role",
          "status",
          "created_at",
          "updated_at",
        ],
      })
    );
    console.log("user fetched on the getUser function", response);
    return response as DirectusUser;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("User not found");
  }
};

export const updateRentalRequestStatus = async (
  requestId: string,
  status: "approved" | "rejected" | "completed"
) => {
  try {
    const response = await directus.request(
      updateItem("rental_requests", requestId, {
        status,
      })
    );
    return response as DirectusRentalRequest;
  } catch (error) {
    console.error("Error updating rental request status:", error);
    throw error;
  }
};

// Create a conversation
export const createConversation = async (data: {
  user_1: string;
  user_2: string;
  gear_listing: string;
}) => {
  try {
    const response = await directus.request(createItem("conversations", data));
    return response as DirectusConversation;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
};

// Get conversations for a user
export const getUserConversations = async (userID: string) => {
  try {
    console.log("userID from backend", userID);
    const client = await getOrCreateClient(userID);
    console.log("client", client);
    const response = (await directus.request(
      readItems("conversations", {
        filter: {
          _or: [{ user_1: { id: client.id } }, { user_2: { id: client.id } }],
        },
        fields: [
          "*",
          "user_1.*",
          "user_2.*",
          "user_1.user.*",
          "user_2.user.*",
          "gear_listing.*",
        ],
        sort: ["-gear_listing.id"],
      })
    )) as DirectusConversation[];

    console.log("User conversations response:", response);
    return response;
  } catch (error) {
    console.error("Error getting user conversations:", error);
    throw error;
  }
};

// Get a specific conversation
export const getConversation = async (conversationId: string) => {
  try {
    const response = await directus.request(
      readItem("conversations", conversationId, {
        fields: [
          "*",
          "user_1.*",
          "user_2.*",
          "user_1.user.*",
          "user_2.user.*",
          "gear_listing.*",
        ],
      })
    );
    return response as DirectusConversation;
  } catch (error) {
    console.error("Error getting conversation:", error);
    throw error;
  }
};

// Get conversation messages
export const getConversationMessages = async (conversationID: string) => {
  try {
    const response = (await directus.request(
      readItems("messages", {
        filter: {
          conversation: conversationID,
        },
        fields: [
          "id", // Message ID
          "conversation.id", // Conversation ID
          "sender.id", // Sender ID
          "sender.user.id", // Sender's user ID
          "sender.user.first_name", // Sender's first name
          "sender.user.last_name", // Sender's last name
          "sender.user.email", // Sender's email
          "message", // Message content
          "date_created", // Message creation timestamp
        ],
        sort: ["date_created"],
      })
    )) as DirectusMessage[];
    console.log("Conversation messages response:", response);
    return response as DirectusMessage[];
  } catch (error) {
    console.error("Error getting conversation messages:", error);
    throw error;
  }
};

// Send a message
export const sendMessage = async (data: {
  conversation: string;
  sender: string;
  message: string;
}) => {
  try {
    const response = await directus.request(createItem("messages", data));
    return response as DirectusMessage;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Find existing conversation between users for a specific gear listing
export const findConversation = async (
  user1Id: string,
  user2Id: string,
  gearListingId: string
) => {
  try {
    const response = await directus.request(
      readItems("conversations", {
        filter: {
          _and: [
            {
              _or: [
                { user_1: user1Id, user_2: user2Id },
                { user_1: user2Id, user_2: user1Id },
              ],
            },
            { gear_listing: gearListingId },
          ],
        },
        limit: 1,
      })
    );

    return response && response.length > 0
      ? (response[0] as DirectusConversation)
      : null;
  } catch (error) {
    console.error("Error finding conversation:", error);
    throw error;
  }
};
