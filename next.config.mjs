/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.ignoreWarnings = [
      { module: /@supabase/ },
    ];
    return config;
  },
  serverExternalPackages: ['@supabase/supabase-js'],
};

export default nextConfig;
