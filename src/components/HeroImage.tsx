'use client';

import Image from 'next/image';

export default function HeroImage() {
  return (
    <div className="absolute inset-0 h-full w-full">
      <Image
        src="/images/pexels-eberhardgross-1287145.jpg"
        alt="Outdoor adventure background"
        fill
        sizes="100vw"
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gray-900/50" />
    </div>
  );
} 