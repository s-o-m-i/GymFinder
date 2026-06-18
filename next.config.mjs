/** @type {import('next').NextConfig} */
const nextConfig = {
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
  experimental: {
    // Enable for better performance
  },
};

export default nextConfig;
