import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative bg-gray-900">
        <div className="absolute inset-0">
          <Image
            src="/hero-bg.jpg"
            alt="Outdoor adventure background"
            fill
            className="object-cover opacity-50"
            priority
          />
          <div className="absolute inset-0 bg-gray-900 mix-blend-multiply" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Share Your Outdoor Gear
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-3xl">
            Rent high-quality outdoor equipment from local adventurers. From camping gear to climbing equipment, find what you need for your next adventure.
          </p>
          <div className="mt-10">
            <Link
              href="/gear"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Browse Gear
            </Link>
          </div>
        </div>
      </div>

      {/* Featured categories */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900">Popular Categories</h2>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: 'Camping',
              description: 'Tents, sleeping bags, and cooking equipment',
              image: '/categories/camping.jpg',
              href: '/gear?category=camping',
            },
            {
              name: 'Hiking',
              description: 'Backpacks, trekking poles, and navigation gear',
              image: '/categories/hiking.jpg',
              href: '/gear?category=hiking',
            },
            {
              name: 'Climbing',
              description: 'Harnesses, ropes, and climbing shoes',
              image: '/categories/climbing.jpg',
              href: '/gear?category=climbing',
            },
          ].map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group relative rounded-lg overflow-hidden bg-gray-100"
            >
              <div className="aspect-w-3 aspect-h-2">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:opacity-75"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60" />
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                <p className="mt-1 text-sm text-gray-300">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* How it works section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center">
            How It Works
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                name: 'Find Gear',
                description: 'Browse through our collection of outdoor equipment from local adventurers.',
                icon: (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                ),
              },
              {
                name: 'Request to Rent',
                description: 'Send a rental request to the owner with your desired dates.',
                icon: (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                ),
              },
              {
                name: 'Meet & Rent',
                description: 'Arrange a meetup with the owner to pick up the gear and start your adventure.',
                icon: (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                    />
                  </svg>
                ),
              },
            ].map((step) => (
              <div
                key={step.name}
                className="relative bg-white p-6 rounded-lg shadow-sm"
              >
                <div className="absolute top-0 right-0 p-4 text-green-600">
                  {step.icon}
                </div>
                <h3 className="text-lg font-medium text-gray-900">{step.name}</h3>
                <p className="mt-2 text-base text-gray-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
