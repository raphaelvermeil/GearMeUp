'use client'
import { useRouter } from 'next/navigation';

import { useState } from 'react'
import { useGearListings, type SortOption } from '@/hooks/useGearListings'
import type { TransformedGearListing } from '@/lib/directus'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { set } from 'react-hook-form'

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
  // Add a new state for the search input value
  const [searchInput, setSearchInput] = useState('')

  const [filters, setFilters] = useState({
    category: '',
    condition: '',
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    search: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [sort, setSort] = useState<SortOption>('date_created_desc')
  const { user } = useAuth()

  const { listings = [], loading, error, totalPages } = useGearListings({
    filters,
    page: currentPage,
    sort,
  })

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }

  // Add a new function to handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleFilterChange('search', searchInput)
  }

  // Add a new function to clear the search input
  const clearSearch = () => {
    setSearchInput('')
    handleFilterChange('search', '')
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
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gray-900 min-h-[300px]">
        <div className="absolute inset-0">
          <Image
            src="/images/equipment.jpg"
            alt="Gear listings background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gray-900/60" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Find Your Perfect Gear
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-3xl">
            Browse through our collection of high-quality outdoor equipment. From camping gear to climbing equipment, find what you need for your next adventure.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Bar with Create Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Available Gear</h2>
          {user && (
            <Link
              href="/gear/new"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              List Your Gear
            </Link>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search for gear by title or description..."
                className="text-black block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-4 pl-12"
                value={searchInput}
                onChange={handleSearchInputChange}
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {searchInput && (
                <button 
                  type="button"
                  className="p-1 mr-2 text-gray-400 hover:text-gray-600"
                  onClick={clearSearch}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button 
                type="submit"
                className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Filters and Sort */}
        <div className="mb-12 bg-gray-50 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter & Sort</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <select
              className="text-black block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              className="text-black block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
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
              className="text-black block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              value={filters.minPrice || ''}
              onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : '')}
            />

            <input
              type="number"
              placeholder="Max Price"
              className="text-black block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              value={filters.maxPrice || ''}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : '')}
            />

            <select
              className="text-black block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
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
        </div>

        {/* Listings Grid */}
        {listings && listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/gear/${listing.id}`}
                className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {listing.gear_images && listing.gear_images.length > 0 ? (
                  <div className="relative w-full h-64">
                    <Image
                      src={listing.gear_images[0].url}
                      alt={listing.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2 className="text-xl font-bold text-white mb-2">{listing.title}</h2>
                  <p className="text-gray-200 mb-4 line-clamp-2">{listing.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-white">${listing.price}</span>
                    <span className="text-sm text-gray-200 bg-gray-900/50 px-3 py-1 rounded-full">
                      {listing.condition}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-300">{listing.location}</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <h3 className="text-xl font-semibold text-gray-900">No gear listings found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-lg transition-colors ${currentPage === page
                    ? 'bg-green-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 