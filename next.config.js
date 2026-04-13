/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'crafatar.com' },
      { protocol: 'https', hostname: 'mc-heads.net' },
      { protocol: 'https', hostname: 'minotar.net' },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ['*'] },
  },
}

module.exports = nextConfig
