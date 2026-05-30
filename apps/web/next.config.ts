import type { NextConfig } from "next";

const nextConfig: NextConfig = {
<<<<<<< HEAD
  output: 'standalone',
=======
  allowedDevOrigins: ["127.0.0.1", "localhost"],
>>>>>>> 35b2c63239f8d44c0b7efbe1b11b1926199b82e9
  turbopack: {
    root: "../../",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  experimental: {},
};

export default nextConfig;
