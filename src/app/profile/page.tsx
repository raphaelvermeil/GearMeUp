'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRentalRequests } from '@/hooks/useRentalRequests'
import { useUserListings } from '@/hooks/useUserListings'
import Link from 'next/link'
import Image from 'next/image'
import type { DirectusRentalRequest } from '@/lib/directus'
import { getUser } from '@/lib/directus'

export default function ProfilePage() {
  const { user } = useAuth()
  const [role, setRole] = useState<'owner' | 'renter'>('renter')
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null)
  const { requests, loading: requestsLoading, error: requestsError } = useRentalRequests(
    user?.id || '',
    role
  )
  const { listings, loading: listingsLoading, error: listingsError } = useUserListings(user?.id || '')

  console.log('Current user:', user)
  console.log('Listings:', listings)
  console.log('Listings error:', listingsError)

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view your profile</h2>
          <Link
            href="/auth"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  const getUserName = (clientRef: any) => {
    if (!clientRef?.user) return 'Unknown User';
    const userInfo = typeof clientRef.user === 'string' 
      ? { first_name: 'gouou', last_name: 'User' }  // Handle case where user is just an ID
      : clientRef.user;
    return `${userInfo.first_name} ${userInfo.last_name}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-500">
                    {user.first_name[0]}{user.last_name[0]}
                  </span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.first_name} {user.last_name}
                </h1>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rental Requests Section */}
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
              {requestsLoading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : requestsError ? (
                <div className="text-red-500">Error: {requestsError.message}</div>
              ) : !requests?.length ? (
                <div className="text-center text-gray-500">
                  No rental requests found
                </div>
              ) : (
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
                            {request.gear_listing_id?.title || 'Untitled Gear'}
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
                            <span className="font-medium">
                              {role === 'owner' 
                                ? `${request.renter_id.user.first_name} ${request.renter_id.user.last_name}`
                                : `${request.owner_id.user.first_name} ${request.owner_id.user.last_name}`
                              }
                            </span>
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
                              <p className="text-sm text-gray-500">Category: {request.gear_listing_id?.category}</p>
                              <p className="text-sm text-gray-500">Condition: {request.gear_listing_id?.condition}</p>
                              <p className="text-sm text-gray-500">Location: {request.gear_listing_id?.location}</p>
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
                                  ) * request.gear_listing_id?.price
                                }
                              </p>
                            </div>
                          </div>
                          {request.gear_listing_id?.description && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-gray-900">Description</h4>
                              <p className="text-sm text-gray-500 mt-1">{request.gear_listing_id.description}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Listings Section */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">My Listings</h2>
                <Link
                  href="/gear/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  Add Listing
                </Link>
              </div>
            </div>

            <div className="px-4 py-5 sm:p-6">
              {listingsLoading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : listingsError ? (
                <div className="text-red-500">Error: {listingsError.message}</div>
              ) : !listings?.length ? (
                <div className="text-center text-gray-500">
                  No listings found. Create your first listing!
                </div>
              ) : (
                <div className="space-y-4">
                  {listings.map((listing) => (
                    <div
                      key={listing.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {listing.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Price: ${listing.price}/day
                          </p>
                          <p className="text-sm text-gray-500">
                            Condition: {listing.condition}
                          </p>
                          <p className="text-sm text-gray-500">
                            Location: {listing.location}
                          </p>
                        </div>
                        <Link
                          href={`/gear/${listing.id}`}
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 