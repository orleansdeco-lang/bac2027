/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/errors",
        destination: "/error-lab",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
