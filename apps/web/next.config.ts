import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@internalize/shared', '@internalize/api-client'],
};

export default nextConfig;
