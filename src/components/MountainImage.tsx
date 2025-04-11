'use client';

import Image from 'next/image';

export default function MountainImage() {
  return (
    <div className="absolute inset-0 h-full w-full">
      <Image
        src="/images/mountain.jpg"
        alt="Outdoor adventure background"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover"
        priority
        quality={90}
      />
      <div className="absolute inset-0 bg-gray-900/50" />
    </div>
  );
} 