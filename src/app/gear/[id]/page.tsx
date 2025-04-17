'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getGearListing, getAssetURL, getOrCreateClient, createConversation, sendMessage } from '@/lib/directus'
import { useAuth } from '@/contexts/AuthContext'
import type { TransformedGearListing } from '@/lib/directus'
import Link from 'next/link'
import Image from 'next/image'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useRentalRequest } from '@/hooks/useCreateRentalRequest'


export default function GearDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { id } = useParams()
  const [listing, setListing] = useState<TransformedGearListing | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [message, setMessage] = useState('')

  const { submitRequest, loading: submitting, error: submitError } = useRentalRequest({
    onSuccess: () => {
      alert('Rental request submitted successfully!')
      router.push('/rentals/requests')
    },
  })

  useEffect(() => {
    async function fetchListing() {
      try {
        setLoading(true)
        const data = await getGearListing(id as string)
        setListing(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchListing()
    }
  }, [id])

  const handleSubmit = async () => {
    if (!startDate || !endDate || !listing) return

    if (!user) {
      alert('You must be logged in to submit a rental request')
      return
    }

    const clientRenter = await getOrCreateClient(user.id)
    if (!clientRenter) {
      throw new Error('Failed to get or create client renter')
    }

    if (!listing.user_id) {
      throw new Error('Gear listing has no owner')
    }


    const rentalRequest = await submitRequest({
      gear_listing_id: listing.id,
      renter_id: clientRenter.id,
      owner_id: listing.user_id.id,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      message: message?.trim(),
    })
  }

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

  if (!listing) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/gear"
        className="inline-flex items-center text-green-600 hover:text-green-700 mb-6"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Listings
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          {/* Main Image */}
          {listing.gear_images && listing.gear_images.length > 0 && (
            <div className="relative w-full aspect-video">
              <Image
                src={listing.gear_images[selectedImageIndex].url}
                alt={`${listing.title} - Image ${selectedImageIndex + 1}`}
                fill
                className="rounded-lg shadow-md object-cover"
              />
            </div>
          )}

          {/* Thumbnails */}
          {listing.gear_images && listing.gear_images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {listing.gear_images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative rounded-lg overflow-hidden aspect-square ${selectedImageIndex === index ? 'ring-2 ring-green-500' : ''
                    }`}
                >
                  <Image
                    src={image.url}
                    alt={`${listing.title} - Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{listing.title}</h1>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold text-green-600">${listing.price}/day</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-600">
              {listing.condition}
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{listing.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Location</h2>
            <p className="text-gray-600">{listing.location}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Category</h2>
            <p className="text-gray-600">{listing.category}</p>
          </div>

          {/* Owner Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Owner</h2>
            {listing.user_id?.user ? (
              <div className="mt-4">
                <Link 
                  href={`/users/${listing.user_id.user.id}`}
                  className="text-green-600 hover:text-green-700 flex items-center space-x-2"
                >
                  <span>{listing.user_id.user.first_name} {listing.user_id.user.last_name}</span>
                  <span className="text-sm">View Profile →</span>
                </Link>
              </div>
            ) : (
              <p className="text-gray-600">Unknown user</p>
            )}
          </div>

          {/* Rental Request Form */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Request to Rent</h2>

            {submitError && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{submitError.message}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  minDate={new Date()}
                  className="text-blue-500 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholderText="Select start date"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate || new Date()}
                  className="text-blue-500 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholderText="Select end date"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="text-blue-500 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="Add a message to the owner..."
              />
            </div>

            <button
              className="w-full bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={!startDate || !endDate || submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 