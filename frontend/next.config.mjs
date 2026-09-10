const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 
  (process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : 'https://mumbai-urban-digital-twin.onrender.com');

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};


export default nextConfig;
