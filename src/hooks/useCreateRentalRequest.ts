import { useState } from "react";
import { createRentalRequest, createConversation, sendMessage } from "@/lib/directus";

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
    owner_id: string;
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
        owner_id: data.owner_id,
        start_date: data.start_date,
        end_date: data.end_date,
      });
      // Create or get conversation
      if(data.renter_id === data.owner_id) {
        throw new Error('Renter and owner cannot be the same user');}
      const conversationData = {
        user_1: data.renter_id,
        user_2: data.owner_id,
        gear_listing_id: data.gear_listing_id,
      }
      const conversation = await createConversation(conversationData);
      console.log('Conversation created:', conversation);
  
      // If initial message is provided, send it
      if (data.message?.trim()) {
        const messageCreated = await sendMessage({
          conversation: conversation.id,
          sender: data.renter_id,
          message: data.message?.trim()
        });
        console.log('Message sent:', messageCreated);
      }
      
  
      // alert('Rental request submitted successfully!');
      // router.push('/rentals/requests');
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
