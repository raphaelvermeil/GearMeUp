'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getOrCreateClient, DirectusUser, DirectusClientUser } from '@/lib/directus'
import { useGearListings } from '@/hooks/useGearListings'
import { useReviews } from '@/hooks/useReviews'
import Link from 'next/link'
import Image from 'next/image'

export default function UserProfilePage() {
  const { id } = useParams()
  const [user, setUser] = useState<DirectusUser | null>(null)
  const [clientId, setClientId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch user's gear listings
  const { 
    listings: allListings, 
    loading: listingsLoading, 
    error: listingsError 
  } = useGearListings()

  // Filter listings client-side for the specific user
  const listings = allListings.filter(listing => listing.user_id?.user?.id === id)

  console.log("listings in the user profile page", listings)

  // Fetch user's reviews using the client ID
  const {
    reviews,
    loading: reviewsLoading,
    error: reviewsError
  } = useReviews({
    userId: clientId || ''  // Only fetch reviews once we have the client ID
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const clientData = await getOrCreateClient(id as string)
        console.log("clientData in the user profile page", clientData)
        setUser(clientData.user as DirectusUser)
        setClientId(clientData.id)  // Store the client ID for reviews
      } catch (err) {
        console.error("Error fetching user:", err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchUser()
    }
  }, [id])

  // Effect to monitor user state changes
  useEffect(() => {
    console.log("Current user state:", user)
  }, [user])

  if (loading || listingsLoading || (clientId && reviewsLoading)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (error || listingsError || reviewsError || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">
          Error loading profile: {error?.message || listingsError?.message || reviewsError?.message || 'User not found'}
        </div>
      </div>
    )
  }

  // Calculate average rating
  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0

  return (
    <div className="container mx-auto px-4 py-8">
      {/* User Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-2xl text-gray-500">
              {user.first_name[0]}
              {user.last_name[0]}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {user.first_name} {user.last_name}
            </h1>
            <div className="flex items-center mt-2">
              <span className="text-yellow-400 mr-1">★</span>
              <span>{averageRating.toFixed(1)}</span>
              <span className="text-gray-500 ml-1">({reviews?.length || 0} reviews)</span>
            </div>
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

      {/* Reviews Section */}
      <div>
        <h2 className="text-xl font-bold mb-4">Reviews</h2>
        {reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Link href={`/users/${review.reviewer_id.id}`}>
                      <span className="font-medium hover:text-green-600">
                        {review.reviewer_id.first_name} {review.reviewer_id.last_name}
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
    </div>
  )
} 