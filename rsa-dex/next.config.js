/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    CUSTOM_KEY: 'rsa-dex-frontend', // Changed from 'rsa-dex'
  },
  // Disable CSP in development to avoid eval issues
  async headers() {
    if (process.env.NODE_ENV === 'development') {
      return []
    }
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https:; object-src 'none'; base-uri 'self';"
          }
        ]
      }
    ]
  },
  // Enable experimental features for better development experience
  experimental: {
    esmExternals: 'loose',
  },
  // Configure webpack for better compatibility
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    return config
  },
  // Configure session to avoid conflicts with admin
  serverRuntimeConfig: {
    sessionName: 'rsa-dex-frontend-session', // Unique session name
  },
  publicRuntimeConfig: {
    sessionName: 'rsa-dex-frontend-session',
  },
}

module.exports = nextConfig 