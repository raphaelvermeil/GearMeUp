# GearShare - Outdoor Gear Rental Marketplace

GearShare is a sharing economy platform that allows people to rent their outdoor gear to others in their community. It's similar to Facebook Marketplace but specifically focused on outdoor equipment rental.

## Features

- User registration and authentication
- Create and manage gear listings
- Browse and search for gear by category, condition, and price
- Request to rent gear with specific dates
- Manage rental requests (both as owner and renter)
- Review system for both renters and owners
- Responsive design for mobile and desktop

## Tech Stack

- Frontend: Next.js 14 with TypeScript
- Styling: Tailwind CSS
- Backend: Directus (Headless CMS)
- Authentication: NextAuth.js
- Deployment: Netlify

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Directus instance (local or hosted)
- Netlify account (for deployment)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/gearshare.git
   cd gearshare
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:

   ```
   NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8055
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Directus Setup

1. Install and set up Directus following their [documentation](https://docs.directus.io/getting-started/installation/).

2. Create the following collections in Directus:

   - users
   - gear_listings
   - gear_images
   - rental_requests
   - reviews
   - messages

3. Configure the collections with the fields specified in `directus-schema.md`.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── gear/              # Gear listing pages
│   ├── rentals/           # Rental management pages
│   └── auth/              # Authentication pages
├── components/            # Reusable components
├── lib/                   # Utility functions and API calls
└── styles/               # Global styles
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Directus](https://directus.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [NextAuth.js](https://next-auth.js.org/)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
