const publicApiRoutes = [
  "/api/gyms",
  "/api/gyms/:path*",
  "/api/trainers",
  "/api/trainers/:path*",
  "/api/events",
  "/api/events/:path*",
  "/api/success-stories",
  "/api/success-stories/:path*",
  "/api/search",
];

const publicApiCorsHeaders = [
  { key: "Access-Control-Allow-Origin", value: "*" },
  { key: "Access-Control-Allow-Methods", value: "GET,HEAD,OPTIONS,POST" },
  {
    key: "Access-Control-Allow-Headers",
    value: "Content-Type, Accept, X-FitnessAdda-Client",
  },
  { key: "Access-Control-Max-Age", value: "86400" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return publicApiRoutes.map((source) => ({
      source,
      headers: publicApiCorsHeaders,
    }));
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.vercel.app",
      },
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      // Allow any https images in development
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {},
};

export default nextConfig;
