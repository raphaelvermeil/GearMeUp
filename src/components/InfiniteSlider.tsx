'use client';

import Image from 'next/image';

const items = [
  {
    name: 'Mountain Bikes',
    image: '/images/bike.jpg',
    description: 'Premium bikes for trail adventures'
  },
  {
    name: 'Kayaks & Canoes',
    image: '/images/kayak.jpg',
    description: 'Explore lakes and rivers'
  },
  {
    name: 'Ski & Snow Gear',
    image: '/images/ski.jpg',
    description: 'Winter sports equipment'
  },
  {
    name: 'Surfboards',
    image: '/images/surf.jpg',
    description: 'Catch the perfect wave'
  },
  {
    name: 'Photography & Drones',
    image: '/images/gopro.jpg',
    description: 'Capture outdoor moments'
  },
  {
    name: 'Camping',
    image: '/images/tent.jpg',
    description: 'Complete camping setups'
  }
];

export default function InfiniteSlider() {
  return (
    <div className="flex overflow-hidden bg-white py-10 group">
      <div className="flex animate-scroll-left group-hover:paused">
        {/* First set of items */}
        <div className="flex gap-8 items-center">
          {items.map((item, index) => (
            <div
              key={`${item.name}-1`}
              className={`flex-none w-64 h-48 relative rounded-lg overflow-hidden ${index === items.length - 1 ? 'mr-8' : ''}`} // Add margin to the last item

            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                className="object-cover"
                quality={90}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                <p className="text-sm text-gray-300">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex animate-scroll-left group-hover:paused" aria-hidden="true">
        {/* Second set of items */}
        <div className="flex gap-8 items-center">
          {items.map((item, index) => (
            <div
              key={`${item.name}-1`}
              className={`flex-none w-64 h-48 relative rounded-lg overflow-hidden ${index === items.length - 1 ? 'mr-8' : ''}`} // Add margin to the last item

            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                className="object-cover"
                quality={90}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                <p className="text-sm text-gray-300">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 