/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: "/errors",
        destination: "/error-lab",
        permanent: true,
      },
      {
        source: "/table",
        destination: "/diwan?tab=majlis",
        permanent: false,
      },
      {
        source: "/ypt/table",
        destination: "/diwan?tab=majlis",
        permanent: false,
      },
      {
        source: "/ypt",
        destination: "/diwan?tab=majlis",
        permanent: false,
      },
      {
        source: "/campus/tables",
        destination: "/diwan?tab=majlis",
        permanent: false,
      },
      {
        source: "/campus/feed",
        destination: "/diwan?tab=experiences",
        permanent: false,
      },
      {
        source: "/campus",
        destination: "/diwan?tab=experiences",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
