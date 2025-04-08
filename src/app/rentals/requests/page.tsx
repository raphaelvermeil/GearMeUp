'use client'

import { useState } from 'react'
import { useRentalRequests } from '@/hooks/useRentalRequests'
import Link from 'next/link'

export default function RentalRequestsPage() {
  const [role, setRole] = useState<'owner' | 'renter'>('renter')
  const { requests, loading, error } = useRentalRequests({
    userId: 'current-user-id', // TODO: Get from auth context
    role,
  })

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  )

  if (error) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error.message}</span>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Rental Requests</h1>
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-lg ${
              role === 'renter'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setRole('renter')}
          >
            My Requests
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              role === 'owner'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setRole('owner')}
          >
            Received Requests
          </button>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {role === 'renter'
              ? "You haven't made any rental requests yet."
              : "You haven't received any rental requests yet."}
          </p>
          {role === 'renter' && (
            <Link
              href="/gear"
              className="inline-block mt-4 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Browse Gear
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    <Link
                      href={`/gear/${request.gear_listing_id.id}`}
                      className="text-green-600 hover:text-green-700"
                    >
                      {request.gear_listing_id.title}
                    </Link>
                  </h2>
                  <div className="text-gray-600">
                    <p>
                      {role === 'owner'
                        ? `Requested by: ${request.renter_id.first_name} ${request.renter_id.last_name}`
                        : `Owner: ${request.gear_listing_id.user_id.first_name} ${request.gear_listing_id.user_id.last_name}`}
                    </p>
                    <p>
                      Dates: {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                    </p>
                    <p>Status: {request.status}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {role === 'owner' && request.status === 'pending' && (
                    <>
                      <button
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        onClick={() => {
                          // TODO: Implement approve request
                          alert('Approve functionality coming soon!')
                        }}
                      >
                        Approve
                      </button>
                      <button
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        onClick={() => {
                          // TODO: Implement reject request
                          alert('Reject functionality coming soon!')
                        }}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {role === 'renter' && request.status === 'pending' && (
                    <button
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      onClick={() => {
                        // TODO: Implement cancel request
                        alert('Cancel functionality coming soon!')
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 