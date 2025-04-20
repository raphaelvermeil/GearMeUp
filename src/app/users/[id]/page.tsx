'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getOrCreateClient, DirectusUser, DirectusClientUser, DirectusRentalRequest, directus } from '@/lib/directus'
import { readItem } from '@directus/sdk'
import { useGearListings } from '@/hooks/useGearListings'
import { useReviews } from '@/hooks/useReviews'
import { useRentalRequests } from '@/hooks/useRentalRequests'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import Image from 'next/image'
import { useClient } from '@/hooks/useClient'
import { useUpdateRentalStatus } from '@/hooks/useUpdateRentalStatus'
import { useCreateReview } from '@/hooks/useCreateReview'

// Reviews component that only renders when we have a clientId
function ReviewsSection({ clientId }: { clientId: string }) {
  const {
    reviews,
    loading: reviewsLoading,
    error: reviewsError
  } = useReviews({
    clientId: clientId
  })

  
  if (reviewsLoading) {
    return <div>Loading reviews...</div>
  }

  if (reviewsError) {
    return <div className="text-red-500">Error loading reviews: {reviewsError.message}</div>
  }

  // Calculate average rating
  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0

  return (
    <>
      <div className="flex items-center mt-2">
        <span className="text-yellow-400 mr-1">★</span>
        <span>{averageRating.toFixed(1)}</span>
        <span className="text-gray-500 ml-1">({reviews?.length || 0} reviews)</span>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Reviews</h2>
        {reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Link href={`/users/${review.reviewer.id}`}>
                      <span className="font-medium hover:text-green-600">
                        {review.reviewer.first_name} {review.reviewer.last_name}
                      </span>
                    </Link>
                    <div className="flex items-center">
                      <span className="text-yellow-400">{'★'.repeat(review.rating)}</span>
                      <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
                    </div>
                  </div>
                  <span className="text-gray-500 text-sm">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No reviews yet</p>
        )}
      </div>
    </>
  )
}

// Rental Requests component that only shows for the logged-in user's own profile
function RentalRequestsSection({ clientId }: { clientId: string }) {
  const [role, setRole] = useState<'owner' | 'renter'>('renter')
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null)
  const [reviewData, setReviewData] = useState<{
    rating: number;
    comment: string;
  }>({
    rating: 5,
    comment: '',
  })

  const { 
    requests, 
    loading: requestsLoading, 
    error: requestsError,
    updateRequestStatus,
    refetchRequests 
  } = useRentalRequests(clientId, role)

  const { updateStatus, loading: updateLoading } = useUpdateRentalStatus({
    onSuccess: () => {
      refetchRequests();
    }
  });

  const { submitReview, loading: reviewLoading } = useCreateReview({
    onSuccess: () => {
      alert('Review submitted successfully!');
      setReviewData({ rating: 5, comment: '' });
      refetchRequests();
    }
  });

  const handleStatusChange = async (requestId: string, newStatus: 'approved' | 'rejected' | 'completed') => {
    if (confirm(`Are you sure you want to mark this request as ${newStatus}?`)) {
      try {
        await updateStatus(requestId, newStatus);
        updateRequestStatus(requestId, newStatus);
      } catch (error) {
        console.error('Error updating status:', error);
        alert('Failed to update request status. Please try again.');
      }
    }
  };

  const handleReviewSubmit = async (request: DirectusRentalRequest) => {
    if (!reviewData.comment) {
      alert('Please enter a comment for your review.');
      return;
    }

    try {
      
      let reviewed;
      if(role === 'renter') {
        reviewed = request.owner.id;
      } else if(role === 'owner') {
        reviewed = request.renter.id;
      } else {
        throw new Error('Invalid role');
      }

      await submitReview({
        rental_request: request.id,
        reviewer: clientId,
        reviewed: reviewed,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  if (requestsLoading) {
    return <div>Loading rental requests...</div>
  }

  if (requestsError) {
    return <div className="text-red-500">Error loading rental requests: {requestsError.message}</div>
  }

  return (
    <div className="mt-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Rental Requests</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => setRole('renter')}
                className={`px-4 py-2 rounded ${
                  role === 'renter'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                As Renter
              </button>
              <button
                onClick={() => setRole('owner')}
                className={`px-4 py-2 rounded ${
                  role === 'owner'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                As Owner
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 py-5 sm:p-6">
          {requests && requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request: DirectusRentalRequest) => (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setExpandedRequestId(expandedRequestId === request.id ? null : request.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {request.gear_listing?.title || 'Untitled Gear'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Status: <span className={`font-medium ${
                          request.status === 'approved' ? 'text-green-600' :
                          request.status === 'rejected' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>{request.status}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        {role === 'owner' ? 'Requested by: ' : 'Owner: '}
                        <Link
                          href={`/users/${role === 'owner' 
                            ? request.renter.id
                            : request.owner.id}`}
                          className="font-medium hover:text-green-600"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {role === 'owner' 
                            ? `${request.renter.first_name} ${request.renter.last_name}`
                            : `${request.owner.first_name} ${request.owner.last_name}`
                          }
                        </Link>
                      </p>
                      <p className="text-sm text-gray-500">
                        Dates: {new Date(request.start_date).toLocaleDateString()} -{' '}
                        {new Date(request.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/rentals/requests/${request.id}`}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Details
                      </Link>
                      <svg 
                        className={`w-5 h-5 text-gray-500 transition-transform ${expandedRequestId === request.id ? 'transform rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Expanded Content */}
                  {expandedRequestId === request.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Gear Details</h4>
                          <p className="text-sm text-gray-500">Category: {request.gear_listing?.category}</p>
                          <p className="text-sm text-gray-500">Condition: {request.gear_listing?.condition}</p>
                          <p className="text-sm text-gray-500">Location: {request.gear_listing?.location}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Rental Details</h4>
                          <p className="text-sm text-gray-500">
                            Duration: {
                              Math.ceil(
                                (new Date(request.end_date).getTime() - new Date(request.start_date).getTime()) / 
                                (1000 * 60 * 60 * 24)
                              )
                            } days
                          </p>
                          <p className="text-sm text-gray-500">
                            Total Price: ${
                              Math.ceil(
                                (new Date(request.end_date).getTime() - new Date(request.start_date).getTime()) / 
                                (1000 * 60 * 60 * 24)
                              ) * request.gear_listing?.price
                            }
                          </p>
                        </div>
                      </div>
                      {request.gear_listing?.description && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900">Description</h4>
                          <p className="text-sm text-gray-500 mt-1">{request.gear_listing.description}</p>
                        </div>
                      )}
                      
                      {/* Status Update Section for Owners */}
                      {role === 'owner' && request.status === 'pending' && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Update Request Status</h4>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(request.id, 'approved');
                              }}
                              disabled={updateLoading}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(request.id, 'rejected');
                              }}
                              disabled={updateLoading}
                              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Mark as Completed Section for Renters */}
                      {role === 'renter' && request.status === 'approved' && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Complete Rental</h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(request.id, 'completed');
                            }}
                            disabled={updateLoading}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                          >
                            Mark as Completed
                          </button>
                        </div>
                      )}

                      {/* Review Section */}
                      {role === 'renter' && request.status === 'completed' && (
                        <div 
                          className="mt-4 pt-4 border-t border-gray-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Write a Review</h4>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Rating</label>
                              <select
                                value={reviewData.rating}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  setReviewData(prev => ({ ...prev, rating: parseInt(e.target.value) }));
                                }}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                              >
                                {[1, 2, 3, 4, 5].map((num) => (
                                  <option key={num} value={num}>{num} Star{num !== 1 ? 's' : ''}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Comment</label>
                              <textarea
                                value={reviewData.comment}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  setReviewData(prev => ({ ...prev, comment: e.target.value }));
                                }}
                                onClick={(e) => e.stopPropagation()}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                placeholder="Write your review here..."
                              />
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReviewSubmit(request);
                              }}
                              disabled={reviewLoading}
                              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                            >
                              Submit Review
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No rental requests</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function UserProfilePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [client, setClient] = useState<DirectusClientUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch user's gear listings
  const { 
    listings: allListings, 
    loading: listingsLoading, 
    error: listingsError 
  } = useGearListings()




  // Filter listings client-side for the specific user
  const listings = allListings.filter(listing => listing.owner?.id == id)


  console.log(`listings: ${listings}`)

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true)
        // Get client by ID directly
        console.log(`id: ${id}`)
        const response = await directus.request(
          readItem("clients", id as string, {
            fields: ["*", "user.*"],
          })
        );
        console.log(`gougou`)
        setClient(response as DirectusClientUser)
      } catch (err) {
        console.error("Error fetching client:", err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

      if (id) {
      fetchClient()
    }
  }, [id])

  if (loading || listingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (error || listingsError || !client) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-red-500">
            Error loading profile: {error?.message || listingsError?.message || 'User not found'}
          </div>
        </div>
      </div>
    )
  }

  const isOwnProfile = (user?.id === client?.user.id) && (user?.id !== undefined)


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* User Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-2xl text-gray-500">
                {client.first_name[0]}
                {client.last_name[0]}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {client.first_name} {client.last_name}
              </h1>
              {client?.id && <ReviewsSection clientId={client.id} />}
            </div>
          </div>
        </div>

        {/* Listings Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Gear Listings</h2>
          {listings && listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <Link href={`/gear/${listing.id}`} key={listing.id}>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    {listing.gear_images && listing.gear_images[0] && (
                      <div className="relative h-48">
                        <Image
                          src={listing.gear_images[0].url}
                          alt={listing.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{listing.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{listing.description}</p>
                      <p className="text-green-600 font-semibold">${listing.price}/day</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No listings available</p>
          )}
        </div>

        {/* Rental Requests Section - Only show for own profile */}
        {isOwnProfile && client?.id && (
          <RentalRequestsSection clientId={client.id} />
        )}
      </div>
    </div>
  )
} 