'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRentalRequests } from '@/hooks/useRentalRequests'
import Link from 'next/link'
import Image from 'next/image'
import type { DirectusRentalRequest } from '@/lib/directus'

export default function ProfilePage() {
  const { user } = useAuth()
  const [role, setRole] = useState<'owner' | 'renter'>('renter')
  const { requests, loading: requestsLoading, error: requestsError } = useRentalRequests(
    user?.id || '',
    role
  )

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
              ) : requests.data.length === 0 ? (
                <div className="text-center text-gray-500">
                  No rental requests found
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.data.map((request: DirectusRentalRequest) => (
                    <div
                      key={request.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {request.gear_listing_id.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Status: {request.status}
                          </p>
                          <p className="text-sm text-gray-500">
                            Dates: {new Date(request.start_date).toLocaleDateString()} -{' '}
                            {new Date(request.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Link
                          href={`/rentals/requests/${request.id}`}
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