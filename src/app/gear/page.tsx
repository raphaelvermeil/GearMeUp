'use client'

import { useState } from 'react'
import { useGearListings, type SortOption } from '@/hooks/useGearListings'
import type { TransformedGearListing } from '@/lib/directus'
import Link from 'next/link'

const categories = [
  'Camping',
  'Hiking',
  'Climbing',
  'Skiing',
  'Snowboarding',
  'Water Sports',
  'Other'
]

const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor']

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'date_created_desc', label: 'Newest First' },
  { value: 'date_created_asc', label: 'Oldest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
]

export default function GearPage() {
  const [filters, setFilters] = useState({
    category: '',
    condition: '',
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [sort, setSort] = useState<SortOption>('date_created_desc')

  const { listings = [], loading, error, totalPages } = useGearListings({
    filters,
    page: currentPage,
    sort,
  })

  // console.log('Current listings:', listings);
  
  // if (listings[0]?.gear_images) {
  //   console.log('Image details:', {
  //     id: listings[0].gear_images.id,
  //     filename: listings[0].gear_images.filename_download,
  //     url: listings[0].gear_images.url
  //   });
  // }

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Top Bar with Create Button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gear Listings</h1>
        <Link
          href="/gear/create"
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          List Your Gear
        </Link>
      </div>

      {/* Filters and Sort */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-5 gap-4">
        <select
          className="border rounded-lg p-2 text-gray-700 bg-white"
          value={filters.category || ''}
          onChange={(e) => handleFilterChange('category', e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select
          className="border rounded-lg p-2 text-gray-700 bg-white placeholder-gray-400"
          value={filters.condition || ''}
          onChange={(e) => handleFilterChange('condition', e.target.value)}
        >
          <option value="">All Conditions</option>
          {conditions.map(condition => (
            <option key={condition} value={condition}>{condition}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Min Price"
          className="border rounded-lg p-2 text-gray-700 placeholder-gray-400"
          value={filters.minPrice || ''}
          onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : '')}
        />

        <input
          type="number"
          placeholder="Max Price"
          className="border rounded-lg p-2 text-gray-700 bg-white placeholder-gray-400"
          value={filters.maxPrice || ''}
          onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : '')}
        />

        <select
          className="border rounded-lg p-2 text-gray-700 bg-white"
          style={{
            backgroundColor: 'white',
            color: 'black',
          }}
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Listings Grid */}
      {listings && listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Link
              key={listing.id}
              href={`/gear/${listing.id}`}
              className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              {listing.gear_images && listing.gear_images.length > 0 ? (
                <img
                  src={listing.gear_images[0].url}
                  alt={listing.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
              <div className="p-4">
                <h2 className="text-xl font-bold mb-2">{listing.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-2">{listing.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">${listing.price}</span>
                  <span className="text-sm text-gray-500">{listing.condition}</span>
                </div>
                <div className="mt-2 text-sm text-gray-500">{listing.location}</div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl text-gray-600">No gear listings found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your filters</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 border rounded-lg ${
                currentPage === page
                  ? 'bg-green-500 text-white'
                  : 'hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
} 