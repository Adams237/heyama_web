/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://51.75.123.172:5005/:path*", // ton backend HTTP
      },
    ];
  },
};

module.exports = nextConfig;
