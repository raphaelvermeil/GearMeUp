'use client'

import { useState } from 'react'
// import { useRentalRequests } from '@/hooks/useRentalRequests'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function RentalRequestsPage() {
  const [role, setRole] = useState<'owner' | 'renter'>('renter')
  const { user } = useAuth()
  // const { requests, loading, error } = useRentalRequests(
  //   user?.id || '',
  //   role
  // )

  // if (loading) return (
  //   <div className="flex items-center justify-center min-h-screen">
  //     <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  //   </div>
  // )

  // if (error) return (
  //   <div className="flex items-center justify-center min-h-screen">
  //     <div className="text-red-500">Error: {error.message}</div>
  //   </div>
  // )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        {/* <h1 className="text-3xl font-bold">Rental Requests</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setRole('renter')}
            className={`px-4 py-2 rounded ${
              role === 'renter'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            As Renter
          </button>
          <button
            onClick={() => setRole('owner')}
            className={`px-4 py-2 rounded ${
              role === 'owner'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            As Owner
          </button>
        </div>
      </div>

      {requests.data.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No rental requests found.</p>
          <Link href="/gear" className="text-blue-500 hover:underline mt-4 block">
            Browse available gear
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.data.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">
                {request.gear_listing.title}
              </h2>
              <p className="text-gray-600 mb-4">
                {request.gear_listing.description}
              </p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">
                    {new Date(request.start_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="font-medium">
                    {new Date(request.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    request.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : request.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {request.status}
                </span>
                <Link
                  href={`/rentals/requests/${request.id}`}
                  className="text-blue-500 hover:underline"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))} */}
        </div>
      {/* )} */}
    </div>
  )
} 