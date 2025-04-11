'use client';

import Image from 'next/image';

export default function MountainImage() {
  return (
    <div className="absolute inset-0 h-full w-full">
      <Image
        src="/images/mountain.jpg"
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