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

### Environment Variables

1. Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

2. Update the environment variables in `.env.local`:

   - `NEXT_PUBLIC_DIRECTUS_URL`: Your Directus instance URL
   - `NEXTAUTH_URL`: Your application URL (use http://localhost:3000 for development)
   - `NEXTAUTH_SECRET`: A random string for session encryption
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: (Optional) Google Maps API key for location features
   - `NEXT_PUBLIC_SOCKET_URL`: Socket.IO server URL
   - `NEXT_PUBLIC_ABLY_API_KEY`: Your Ably API key

   To get your Ably API key:

   1. Sign up at [Ably](https://ably.com/)
   2. Create a new app
   3. Go to "API Keys" section
   4. Create a new API key with the following capabilities:
      - publish
      - subscribe
      - presence
   5. Copy the API key and paste it in your `.env.local`

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

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

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

## Deployment

### Setting up Production Environment

1. Choose a deployment platform (Vercel, Netlify, etc.)

2. Set up environment variables in your deployment platform:

   - For Vercel:

     1. Go to your project settings
     2. Navigate to the "Environment Variables" section
     3. Add all variables from `.env.example`
     4. Vercel will automatically make these available to your application

   - For Netlify:
     1. Go to Site settings > Build & deploy > Environment
     2. Add all variables from `.env.example`
     3. Trigger a new deployment

3. Important Production Configurations:
   - Set `NEXTAUTH_URL` to your production domain (e.g., https://your-app.vercel.app)
   - Use production API keys (not development/test keys)
   - Configure CORS settings in your Directus instance
   - Set up proper Ably API key restrictions:
     1. Go to your Ably dashboard
     2. Navigate to your app's API Keys
     3. Create a new API key for production
     4. Set capability restrictions:
        - Only enable needed capabilities (publish, subscribe, presence)
        - Add domain restrictions to only allow your production domain
        - Set rate limits appropriate for your usage

### Automatic Deployments

1. Connect your repository to your deployment platform
2. Configure build settings:

   ```bash
   # Build command
   npm run build

   # Output directory
   .next
   ```

3. Enable automatic deployments for your main branch

### Post-Deployment Checklist

1. Verify environment variables are set correctly
2. Test real-time messaging functionality
3. Monitor Ably dashboard for usage and potential issues
4. Set up error monitoring (e.g., Sentry)
5. Configure proper SSL/TLS certificates

### Security Best Practices

1. API Keys:

   - Never commit API keys to the repository
   - Use different API keys for development and production
   - Regularly rotate production API keys
   - Set up key restrictions in Ably dashboard

2. Environment Variables:

   - Use platform-specific encryption for environment variables
   - Restrict access to environment variable configuration
   - Monitor for any unauthorized access attempts

3. Monitoring:
   - Set up alerts for unusual API usage
   - Monitor real-time connection metrics
   - Track error rates and performance metrics
